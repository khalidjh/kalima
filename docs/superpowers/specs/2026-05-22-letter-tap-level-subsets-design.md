# Letter Tap Level Subsets per Age — Design

**Date:** 2026-05-22
**Status:** Approved, ready for implementation plan
**Builds on:** Age-Segmented Hub Grid (`2026-05-22-age-segmented-hub-grid-design.md`)

## Problem

The age-segmented Hub grid (shipped earlier today) curates which **games** a child sees per age bucket, but the games themselves are still age-agnostic. A 3-year-old who taps Letter Tap is shown all 28 Arabic / 26 English letters with the same 4-choice difficulty as a 9-year-old. The Hub's age picker becomes a half-promise: the parent picks "3-4" and the catalog updates, but the actual gameplay underneath is unchanged.

This defeats the pedagogical purpose of age buckets. A 3-year-old gets overwhelmed by 28 letters and 4-tile rounds that include emphatics (ض، ظ) they have no exposure to. An 8-year-old gets a level grid that's identical to a kindergartner's and rounds that are trivially easy.

## Goals

1. Letter Tap's level grid and gameplay both differ meaningfully across the three age buckets.
2. The letter pool a child sees matches their developmental literacy stage.
3. Difficulty scales via the simplest possible knob (choice count) — no new content authoring required for v1.
4. Progress is shared across age switches (no data migration, no progress loss).
5. The current behavior is preserved as the fallback for users without an age set (guest mode, edge cases).

## Non-goals

- **Letter forms** (initial/medial/final shapes for Arabic 8-10). Deferred to v2 — needs new audio + render logic.
- **Minimal-pair distractor weighting** (ب/ت/ث, ص/س, ض/د for AR; b/d/p for EN). Deferred to v2 — needs an authored confusion-pairs table per language.
- **Per-age timers or round-count changes.** Tune one knob at a time; revisit only if metrics show kids breezing.
- **Locked / aspirational tiles** in LevelSelect (showing letters outside the bucket as greyed-out previews). Deferred — revisit if v2 metrics show kids ceiling out and not realizing there's more.
- **"Bucket complete!" celebration** when all in-age letters hit 3 stars. Nice-to-have, not blocking.
- **Reordering `LETTERS_AR` / `LETTERS_EN`.** The arrays stay in alphabetical order. The age filter is a *set of indices*, not a re-ordering.
- **Migrating `game_progress` rows.** `level_index` keeps its current meaning (position in the full alphabetical array).

## Decisions

### Difficulty axis

Both **letter pool** and **gameplay difficulty (choice count)** vary per age. Either alone is too weak: pool-only makes 5-7 and 8-10 indistinguishable, difficulty-only makes the LevelSelect grid look identical across ages and undercuts the Hub's age picker.

### Letter pool per age (`(lang, age) → number[]`)

The 3-4 starter pool is 8 letters chosen for high frequency, easy articulation, and forming common early words. Pool order in `LEVEL_INDICES_FOR_AGE` is **alphabetical (the underlying array order)**, not Jolly Phonics teaching order — the data structure indexes into the alphabet-sorted arrays.

| Age | Arabic (8) | English (8) | Source |
|---|---|---|---|
| **3-4** | ا ب ت د س ل م ن | A D I M N P S T | MENA KG1 high-frequency + Jolly Phonics Groups 1+2 |
| **5-7** | full 28 | full 26 | — |
| **8-10** | full 28 | full 26 | — (8-10 differs from 5-7 only by difficulty until forms ship in v2) |

Rationale for the 3-4 set:
- **Arabic:** Forms toddler-vocabulary words (مَامَا، بَابَا، سَلَام). Avoids emphatics (ص ض ط ظ), gutturals (ع ح خ غ), and rare letters (ث ذ ؤ ئ).
- **English:** Industry-standard Jolly Phonics order — these 8 letters form ~30 simple 3-letter words (sat, mat, pin, tap, mad, dim, pit, tan).
- **8 letters** specifically: enough variety for 8 short levels, fits a 4-column grid as a clean 2-row block, matches first-term KG1 scope in most programs.

### Difficulty per age (`age → choiceCount`)

| Age | Choices per round | Distractors | Prompts per level | Notes |
|---|---|---|---|---|
| **3-4** | 2 | 1 | 3 | Lower cognitive load, faster wins |
| **5-7** | 4 | 3 | 3 | Current behavior — no change |
| **8-10** | 6 | 5 | 3 | More options = harder discrimination |

Prompts per level stays at **3** across all ages — tuning two knobs at once would be hard to reason about. Adjusting round length is a future lever.

### Fallback when `ageGroup === null`

Render full alphabet, 4 choices per round. Matches current shipped behavior and mirrors the Hub's `hub-all-games-section` fallback. Avoids breaking guest mode and any pre-onboarding state.

### Distractor source

Distractors come from the **user's current pool**, not the full alphabet. A 3-4 player tapping ا will only see other letters from their 8 (ب ت د س ل م ن). Otherwise they'd be shown ض as a wrong option and have no chance — they've never been exposed to it.

Math sanity: smallest pool = 8 (3-4), largest choice count = 6 (8-10). `pool.length > choiceCount` always — distractor selection never starves.

### Progress data model

Progress storage is **unchanged**. `game_progress.level_index` keeps its current meaning: position in `LETTERS_AR` / `LETTERS_EN` (alphabetical, frozen).

- **Stable across age switches.** A 3-4 child earns 3 stars on ا (full-array index 0). Parent bumps to 5-7. The 28-letter grid still shows 3 stars on ا.
- **No migration.** Zero rows touched in `game_progress`.
- **Cross-bucket completion is fine.** A 5-7 user who downgrades to 3-4 (e.g., shared device with younger sibling under same account) sees their already-earned stars on the 8 starter letters.

### Age switch behavior

- **Render filter only.** Switching age in Hub never resets progress, never deletes data, never re-keys anything.
- **Mid-session switch on Hub → Letter Tap** is the typical flow. New `LevelSelect` mounts on entry → reads new ageGroup → filters appropriately.
- **Mid-level switch is ignored.** The active game state (`State` discriminated union in `LetterTapSound.tsx`) is local and doesn't subscribe to ageGroup beyond the initial render. If a parent toggles age while the child is mid-prompt, the level finishes under the old config. New config applies on the next `startLevel`. Acceptable — the alternative (snapping mid-game) is jarring.

## Architecture

### Single source of truth

`LETTERS_AR` and `LETTERS_EN` remain the canonical alphabet, in alphabetical order. Every other piece of data references positions in these arrays.

### New module: `src/games/letter-tap-sound/config.ts`

Pure data + thin helpers. No React. No imports from `useUserStore` — takes age/lang as arguments.

```ts
import type { AgeGroup, Lang } from '../../stores/userStore';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';

export const LEVEL_INDICES_FOR_AGE: Record<Lang, Record<AgeGroup, number[]>> = {
  ar: {
    '3-4':  [0, 1, 2, 7, 11, 22, 23, 24], // ا ب ت د س ل م ن
    '5-7':  Array.from({ length: LETTERS_AR.length }, (_, i) => i),
    '8-10': Array.from({ length: LETTERS_AR.length }, (_, i) => i),
  },
  en: {
    '3-4':  [0, 3, 8, 12, 13, 15, 18, 19], // A D I M N P S T
    '5-7':  Array.from({ length: LETTERS_EN.length }, (_, i) => i),
    '8-10': Array.from({ length: LETTERS_EN.length }, (_, i) => i),
  },
};

export const CHOICES_FOR_AGE: Record<AgeGroup, number> = {
  '3-4':  2,
  '5-7':  4,
  '8-10': 6,
};

export const DEFAULT_CHOICE_COUNT = 4;

export function getLevelIndicesForAge(lang: Lang, age: AgeGroup | null): number[] {
  if (age === null) {
    return Array.from(
      { length: lang === 'ar' ? LETTERS_AR.length : LETTERS_EN.length },
      (_, i) => i,
    );
  }
  return LEVEL_INDICES_FOR_AGE[lang][age];
}

export function getChoiceCountForAge(age: AgeGroup | null): number {
  return age === null ? DEFAULT_CHOICE_COUNT : CHOICES_FOR_AGE[age];
}
```

### Components touched

| File | Change |
|---|---|
| `src/games/letter-tap-sound/LetterTapSound.tsx` | Read `ageGroup` from `useUserStore`. Derive `levelIndices` + `choiceCount` via config helpers. Pass `levelIndices` to `LevelSelect`. Pass `choiceCount` into `buildChoices`. Restrict the source pool for `pickDistractors` to `levelIndices`-restricted letters. |
| `src/games/letter-tap-sound/LevelSelect.tsx` | New `levelIndices: number[]` prop. Iterate `levelIndices.map(i => letters[i])` instead of `letters.map`. Tile testid stays `letter-tile-{fullArrayIndex}` (stable across age switches). |
| `src/games/letter-tap-sound/LetterTapSound.test.tsx` | Update existing tests to set ageGroup explicitly (default test path becomes "no age, full alphabet"). Add tests: 3-4 AR renders 8 tiles; 8-10 round has 6 choices; null ageGroup renders all. |

### Untouched

- `LETTERS_AR`, `LETTERS_EN` — frozen.
- `game_progress` table schema — frozen.
- `useGameProgress` hook — frozen.
- `Quiz.tsx`, `LevelResult.tsx` — agnostic to letter count.
- `src/games/registry.ts` — Letter Tap's `primaryAge` and `alsoGoodFor` already cover 3-10.
- i18n strings — no new copy.

## Behavior matrix

| Age | Lang | Tiles shown | Choices/round | Prompts/level | Distractor source |
|---|---|---|---|---|---|
| `null` | ar | 28 | 4 | 3 | Full alphabet |
| `null` | en | 26 | 4 | 3 | Full alphabet |
| `3-4` | ar | 8 — ا ب ت د س ل م ن | 2 | 3 | The 8 letters only |
| `3-4` | en | 8 — A D I M N P S T | 2 | 3 | The 8 letters only |
| `5-7` | ar | 28 | 4 | 3 | Full alphabet |
| `5-7` | en | 26 | 4 | 3 | Full alphabet |
| `8-10` | ar | 28 | 6 | 3 | Full alphabet |
| `8-10` | en | 26 | 6 | 3 | Full alphabet |

## Edge cases

1. **Pool size = choice count corner.** Smallest pool is 8, largest choice count is 6 → always 2+ extra letters available for distractors. Invariant the tests assert.
2. **Language switch mid-session.** Already supported. Letter pool re-derives from the new `(lang, age)` pair. Progress is keyed `(game_id, lang, level_index)` so AR/EN progress is independent — no interaction with the new age filter.
3. **Cross-bucket stars.** A 5-7 user downgraded to 3-4 sees their accumulated stars on the 8 starter letters. Treated as feature, not bug.
4. **Mid-level age switch.** Active level continues under old config. New config takes effect on the next `startLevel`.

## Testing strategy

Unit tests on `config.ts`:
- `getLevelIndicesForAge('ar', '3-4')` returns exactly `[0, 1, 2, 7, 11, 22, 23, 24]`.
- The Arabic 3-4 indices map to `['ا','ب','ت','د','س','ل','م','ن']` via `LETTERS_AR[i].char`.
- The English 3-4 indices map to `['A','D','I','M','N','P','S','T']`.
- `getLevelIndicesForAge('ar', '5-7').length === 28` and matches `[0..27]`.
- `getLevelIndicesForAge('en', '8-10').length === 26` and matches `[0..25]`.
- `getLevelIndicesForAge('ar', null)` returns all 28 indices.
- `getChoiceCountForAge('3-4') === 2`, `'5-7' === 4`, `'8-10' === 6`.
- `getChoiceCountForAge(null) === 4`.
- **Invariant:** for every (lang, age) combo, `levelIndices.length >= getChoiceCountForAge(age)`.

Component tests on `LetterTapSound.tsx` (extend existing file):
- With ageGroup `3-4` and lang `ar`, `LevelSelect` renders exactly 8 tiles.
- With ageGroup `3-4`, starting a level shows exactly 2 choice tiles in `Quiz`.
- With ageGroup `8-10`, starting a level shows exactly 6 choice tiles.
- With `ageGroup === null` (and onboarded language set), `LevelSelect` renders all 28 AR tiles and `Quiz` shows 4 choices — confirms backward-compat fallback.
- Stars earned at one ageGroup persist when switching to another (covered indirectly by `useGameProgress`'s existing test, but assert here too).

## Rollout

Single change set, no flag. Letter Tap is the only playable game; the change affects all active users immediately. Risks are low because:

- Default-path users (age set during onboarding) experience meaningful improvement.
- No-age fallback preserves current behavior bit-for-bit.
- No schema change, no data migration.
- Existing star records remain valid under unchanged `level_index` semantics.

## Open questions

None blocking. Listed for future consideration:

- Should ageGroup-derived `LEVEL_INDICES_FOR_AGE` be loaded from JSON for easier curriculum updates? — Defer until we have a real reason (e.g., A/B testing pool composition).
- Should the 8-10 bucket get longer levels (5 prompts) once we have forms? — Re-evaluate after v2 forms ship.
- Should LevelSelect surface a hint like "8 letters today — more when you grow up"? — Cute but not requested. Skip.
