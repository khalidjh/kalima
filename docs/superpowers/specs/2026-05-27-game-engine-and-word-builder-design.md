# Game Engine + Word Builder v1 — Design

**Date:** 2026-05-27
**Status:** Draft for review

## Goal

Extract the reusable parts of Letter Tap into a shared game engine at `src/games/_engine/`, then build **Word Builder v1** (English-only, tap-to-spell) on top of it.

## Architecture

Two phases, shipped sequentially:

- **Phase 1 — Engine extraction.** Pull tap primitives, prompt orchestration, level grid, and the result screen out of Letter Tap into `src/games/_engine/`. Refactor Letter Tap to consume the engine. All 62 existing letter-tap tests pass unchanged. Behavior is bit-for-bit identical to today.
- **Phase 2 — Word Builder.** Build the second engine consumer. New module at `src/games/word-builder/`. Engine learns nothing in this phase that wasn't already proven by Letter Tap; if Word Builder reveals a gap, we add to the engine then.

Order is deliberate: Letter Tap is the only currently-shipped game and the only revenue-relevant code path, so we touch it in isolation with its full test suite as a safety net before adding a second consumer.

## Tech stack

No additions. Vite + React 19 + TS + Vitest + Tailwind + Zustand + Supabase + Howler + canvas-confetti. Same as today.

---

## Engine surface (`src/games/_engine/`)

### Files

| File | Owns |
|------|------|
| `types.ts` | `LevelDef`, `Tile`, `TapResult`, `GameShellConfig<TLevel, TPlayConfig>` |
| `useGameShell.ts` | `select → playing → result` state machine, progress integration, level navigation |
| `Tile.tsx` | Tappable choice tile: feedback states, multi-touch `lockedRef`, reduced-motion data attrs |
| `LevelGrid.tsx` | Level select grid with star indicators; accepts per-game `renderCard` |
| `LevelResult.tsx` | Result screen with star cascade, mascot, confetti, fanfare. Moved from `letter-tap-sound/` unchanged. |
| `timings.ts` | `TAP_FEEDBACK_MS`, `STAR_CASCADE_MS`, `CONFETTI_PARTICLES`. Moved from `letter-tap-sound/`. |
| `index.ts` | Public exports |

### Contract

A game consumes the engine by providing:

```ts
interface GameShellConfig<TLevel, TPlayConfig> {
  gameId: string;
  lang: Lang;
  ageGroup: AgeGroup | null;
  levels: TLevel[];                                  // full level array
  poolForAge: (age: AgeGroup | null) => number[];    // level indices visible at age
  playConfigForAge: (age: AgeGroup | null) => TPlayConfig;
  renderCard: (level: TLevel, stars: number) => ReactNode;
  renderPlay: (props: {
    level: TLevel;
    config: TPlayConfig;
    onCorrect: () => void;
    onWrong: () => void;
    onComplete: () => void;
  }) => ReactNode;
}
```

The engine handles select/playing/result transitions, mistake counting, star calculation (0→3, 1→2, ≥2→1), progress upsert, fanfare, and level navigation. Each game writes only its play screen and its data.

---

## Phase 1 — Letter Tap refactor

**Goal:** zero behavior change. Same DOM, same testids, same tests pass.

### Moves
- `letter-tap-sound/timings.ts` → `_engine/timings.ts`
- `letter-tap-sound/LevelResult.tsx` → `_engine/LevelResult.tsx`
- Extract grid bones from `letter-tap-sound/LevelSelect.tsx` → `_engine/LevelGrid.tsx`. LevelSelect keeps its Arabic/English character renderer as the `renderCard` prop.
- Extract tile bones from `letter-tap-sound/Quiz.tsx` → `_engine/Tile.tsx`. Quiz consumes Tile.
- Extract state machine from `LetterTapSound.tsx` → `_engine/useGameShell.ts`. LetterTapSound becomes a thin wrapper that supplies the Quiz play screen.

### Invariants verified per step
- `npm run test` passes the entire suite (currently 249).
- `npx tsc --noEmit` clean.
- `npm run lint` clean.

### Risks
- **Refactor breaks Letter Tap.** Mitigated by running tests after every move. Each extraction is its own commit so we can bisect cleanly.
- **Hidden coupling surfaces.** If state machine extraction leaks Letter-Tap-specific assumptions (e.g., "exactly 3 prompts per level"), surface that as a generic engine parameter, don't paper over it.

---

## Phase 2 — Word Builder

### Module layout (`src/games/word-builder/`)

| File | Owns |
|------|------|
| `WordBuilder.tsx` | Engine consumer entry. Wires word-builder config to `useGameShell`. |
| `SpellPad.tsx` | Play screen: word display, slot row, tile rack. |
| `config.ts` | Per-age mode, max length, distractor count, word pool. |
| `data/words-en.ts` | Curated word list. |
| `WordBuilder.test.tsx` | Integration tests, modeled on `LetterTapSound.test.tsx`. |

### Data shape

```ts
export interface Word {
  id: string;     // 'cat'
  text: string;   // 'CAT'
}
export const WORDS_EN: Word[] = [
  { id: 'cat', text: 'CAT' },
  // ...
];
```

### Modes by age

| Age | Mode | What the child sees | Tile pool |
|-----|------|----------------------|-----------|
| 3-4 | `word-shown-no-distractors` | Word shown as `_ _ _` outline with letter ghosts. Slots fill as letters are tapped. | Word's letters, scrambled. No extras. |
| 5-7 | `word-shown-with-distractors` | Word shown as `_ _ _` outline. Slots fill as letters are tapped. | Word's letters + 2 distractor letters drawn from the rest of the alphabet. |
| 8-10 | `audio-only-with-distractors` | "🔊 Play" button. Slots show count of letters only. | Word's letters + 2 distractors. |
| null (fallback) | `word-shown-with-distractors` | Same as 5-7. | Same as 5-7. |

`maxLen` per age caps which words from the pool are eligible:

```ts
interface PlayConfig {
  mode: 'word-shown-no-distractors' | 'word-shown-with-distractors' | 'audio-only-with-distractors';
  maxLen: number;
  extraDistractors: number;
}
```

### Tap logic

- Tap correct next letter → tile flips to "used" (faded, untappable), slot fills, correct-ping sound.
- Tap wrong letter → shake animation, wrong sound, `mistakes++`. Tile stays available.
- All slots filled → engine `onComplete` → stars computed → fanfare + result screen.
- Stars: 0 mistakes = 3, 1 = 2, ≥2 = 1. Same rule as Letter Tap.
- The tile rack reshuffles per level (not per attempt).

### Curated word lists (initial draft)

**Ages 3-4 — 8 words, CVC, 3 letters each (mirrors Letter Tap's 8-letter starter pool):**
`CAT, DOG, SUN, BED, HAT, BUS, PIG, CUP`

**Ages 5-7 — 20 words, 3-4 letters, mix of CVC and sight words:**
`THE, AND, BIG, RUN, RED, FOX, BOOK, FISH, MILK, TREE, BIRD, MOON, STAR, FROG, KING, BALL, SHIP, FARM, NEST, RAIN`

**Ages 8-10 — 20 words, 4-6 letters, broader vocab:**
`LION, ZEBRA, TIGER, HORSE, APPLE, BREAD, GREEN, WATER, HOUSE, MOUSE, BLACK, WHITE, NIGHT, LIGHT, PLANT, CLOUD, SMILE, MUSIC, OCEAN, TRAIN`

Total: 48 words. Lists ship in code; expanding the list is a code change.

### Hub flip

In `src/games/registry.ts`:
- `word-builder` → `status: 'playable'`, `route: '/game/word-builder'`.
- Badge stays `soon` until ship, then flips to `free`.
- Add the route in the dynamic-loader router.

---

## Audio

Reuse the existing SFX pack from Letter Tap (`correct`, `wrong`, `star_ping_1/2/3`, `level_up`). No new files required.

For mode C (audio-only), Word Builder triggers `useSpeech.speak(word.text)` on level start and on the "🔊 Play" button. Letter Tap already uses `useSpeech`, so this is a pattern reuse.

---

## Testing strategy

- **Engine units.** New tests in `src/games/_engine/`: `Tile.test.tsx` (feedback states, lock), `LevelGrid.test.tsx` (renders, stars), `useGameShell.test.tsx` (state machine transitions, progress upsert).
- **Letter Tap regression.** Existing 62 tests stay at `letter-tap-sound/LetterTapSound.test.tsx`. They MUST pass without modification.
- **Word Builder integration.** Model on `LetterTapSound.test.tsx`:
  - Shows level select initially.
  - Starts a level when card tapped.
  - Awards 3 / 2 / 1 stars for 0 / 1 / 2+ mistakes.
  - Mode A (3-4): exact letters in pool, word visible.
  - Mode B (5-7): correct count of distractors, word visible.
  - Mode C (8-10): word not visible, audio invoked, distractors present.
  - Back button returns to select.
  - Stars persist across age-group switch (same as Letter Tap test).

---

## Non-goals (explicit)

- Arabic Word Builder. Letter joining is a separate research project; will be its own design doc and game.
- A general plugin framework. Engine extracts what Letter Tap proved is reusable. Nothing speculative.
- New audio assets.
- `locked-1` / `locked-2` hub slots.
- Word list expansion UI / external content store.
- Theming customization beyond what Letter Tap has.

---

## Open questions

None currently. Decisions locked during brainstorming:

| Decision | Choice |
|----------|--------|
| Word Builder play loop | Tap-to-spell |
| Engine scope | Shell + tap primitives + prompt orchestrator |
| Level structure | One word = one level |
| Age difficulty | Progressive (mode A / B / C) |
| Arabic in v1 | English-only; Arabic deferred |
| Build order | Letter Tap refactor → engine → Word Builder |
| Word source | Curated lists in code, ~48 words total |

---

## Success criteria

- All 249 existing tests pass after phase 1. No flake.
- Word Builder integration tests pass.
- Bundle does not regress meaningfully (engine module is shared, not duplicated).
- Hub shows Word Builder as playable for ages 5-7 and 8-10; 3-4 sees it if the easy mode ships.
- `/game/word-builder` route loads and plays through end-to-end.
- Letter Tap behavior unchanged from user's perspective.
