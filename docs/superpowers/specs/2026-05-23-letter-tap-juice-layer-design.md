# Letter Tap Juice Layer — Design Spec

## Problem

Letter Tap ships the right answer mechanically but lands flat emotionally. A child taps the correct letter and the screen jumps to the next prompt with no feedback. They complete a level and see a static screen with a still mascot and emoji stars. The plumbing works; the *feel* doesn't. Kids' learning games live or die on the dopamine hit between action and reward — without it, engagement decays after the novelty wears off.

This spec covers a **juice layer** for Letter Tap: per-tap visual + audio feedback during quiz play, and a staged celebration on level completion (cascading stars, fanfare, confetti).

## Goals

- **Tap feedback:** every tile press produces an immediate visual + audio response that distinguishes correct from wrong, without hiding the letter itself.
- **Level-complete celebration:** the result screen builds anticipation (star-by-star cascade with rising pings) and climaxes (confetti + fanfare on the 3rd star + mascot bounce).
- **Accessibility:** respect `prefers-reduced-motion` by downgrading animations (but keeping audio); offer a persistent in-app mute for SFX.
- **Reusable infrastructure:** the reduced-motion hook is a leaf utility usable across all current and future games; the sound infra is already shared (existing `lib/sound.ts` + `useSound`).

## Non-goals

- Background music or ambient soundscapes — too much for a quick session.
- Animated mascot beyond the existing `success`/`fail` moods — out of scope until we have artwork for an animated rig.
- Voice acting beyond the existing TTS letter prompts — the fanfare is non-verbal.
- Tap feedback on the speaker button, age picker, or LevelSelect cards — those tiles already have `shadow-pop` press states; juicing them is a future ambient-effects pass.
- Per-age tuning of celebration intensity — every age gets the same celebration. (A future pass could dial confetti density down for 3-4s if it overwhelms.)

## Design decisions

### Scope tier

**B — tap feedback + level-complete celebration.** No mascot reactions beyond the existing `animate-bounce`, no ambient sparkles, no idle wiggle. Two moments matter: "I got it right" and "I finished the level." Polish those first; revisit ambient juice once we have field data on whether kids respond to v1.

### Audio strategy

**All-files via existing infra.** During implementation planning, we discovered the codebase already ships a Howler-based sound system: `src/lib/sound.ts` (cache + player), `src/stores/soundStore.ts` (persisted `muted` flag), and `src/hooks/useSound.ts` (React wrapper). The `SoundKey` type already includes `correct`, `wrong`, and `level_up`. Original plans for a synth-based hybrid were dropped in favor of reusing this infrastructure — building parallel synth code would be duplication.

**Assets** (placed under `public/sounds/`, ~10-30KB each, ~100KB total):
- `correct.mp3` — short positive ding (~150ms)
- `wrong.mp3` — short negative blip (~200ms), gentle (this is a learning game)
- `star_ping_1.mp3`, `star_ping_2.mp3`, `star_ping_3.mp3` — rising-pitch chimes (~250ms each)
- `level_up.mp3` — fanfare (~1.5-2.5s, ≤80KB)

All sources are CC0 from freesound.org with attribution in `public/sounds/README.md`. Howler is already configured with `preload: false` and `volume: 0.6` in `lib/sound.ts`, so first-play has a brief load; subsequent plays from cache are ~10ms — imperceptible for kids' game feel.

If any asset 404s or fails to decode, Howler silently no-ops the play — degrades gracefully without throwing.

### Visual feedback

**Correct tap (style B):** tapped tile scales to 1.15× and emits a green border pulse for ~300ms. The letter remains visible — this is a learning game; covering the letter with a checkmark icon hides the thing the child just learned. After 300ms the Quiz advances to the next prompt.

**Wrong tap (style X):** tapped tile shakes horizontally (4 cycles, ~400ms) with a red border flash. After 400ms the tile returns to neutral — the child can immediately retap. No greying-out, no forced-different-tile rule, no hints. Mistake mechanics stay non-punitive (consistent with the Letter Tap design principle: kids try again, no shame).

The Quiz holds a local `feedback` state keyed by the tapped tile's char so animations apply only to the tapped tile (not the whole grid). Other tiles remain interactive during the brief animation window so a child mid-tap-burst isn't blocked.

### Celebration choreography

**Stars-first stagger (style C)** — table shows the full 3-star case. For 1- or 2-star results, see the edge-cases section.

| t (ms from mount) | Event |
|---|---|
| 0 (synchronous render) | Star 1 appears with spring scale (0 → 1.2 → 1), `play('star_ping_1')` |
| 350 (`setTimeout`) | Star 2 appears, `play('star_ping_2')` |
| 700 (`setTimeout`) | Star 3 appears + confetti burst + mascot bounce, `play('star_ping_3')` + `play('level_up')` |

t=0 means "on the first paint after `LevelResult` mounts" — star 1 is part of the initial render, not deferred via a 0ms timer. Stars 2 and 3 are scheduled with `setTimeout(350)` and `setTimeout(700)` from a single `useEffect` that fires once on mount.

The kid watches their score count up, gets the dopamine hit on the third ping, then the screen explodes. This pattern is the de facto standard in mobile kids' games (Khan Kids, Endless Alphabet) because it builds anticipation each step.

Empty stars (when score < 3) are rendered immediately as gray placeholders — the cascade fills them in. Only the *filled* stars are revealed on stagger.

After t=700, the existing result buttons (Next / Replay / Back) remain interactive. No celebration replays on Replay/Back navigation — the buttons fire immediately.

### Confetti

**`canvas-confetti` npm package**, lazy-imported inside `LevelResult` so the bundle cost (~14KB gzipped) doesn't hit the Hub or LevelSelect. One `confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })` call at t=700.

Hand-rolling with framer-motion divs was considered (one fewer dep) but rejected: `canvas-confetti` renders outside the React tree onto a separate canvas, so it can't cause re-renders or interfere with the result buttons; hand-rolled motion divs would.

### Accessibility — reduced motion

**Respect `prefers-reduced-motion: reduce`.** When active:

- Tap feedback: correct tile dims green (no scale), wrong tile dims red (no shake). 200ms tint, same advance delays.
- Star cascade: stars fade in serially at the same timings. No spring, no scale.
- Confetti: **disabled entirely** (canvas-confetti not called).
- Mascot: stays static (no `animate-bounce`).
- Audio: **unchanged** — `prefers-reduced-motion` is about motion, not sound. Fanfare + tap SFX + star pings all play.

Implemented via `useReducedMotion()` hook (wraps `matchMedia('(prefers-reduced-motion: reduce)')` with a state subscription). Hook returns a boolean; components branch on it.

### SFX mute toggle

**Reuse the existing `soundStore.muted` flag** (already persisted via zustand persist as `kalima.sound`, defaults to `false` = unmuted). Expose a toggle row on the existing Settings page labeled "Sound effects" that flips `muted` via `useSoundStore.getState().toggle()`.

The gating is already implemented inside `lib/sound.ts`: `playSound(key, muted)` no-ops when `muted=true`. Components call `useSound().play(key)` and don't need to think about the mute state — it's handled internally.

TTS letter audio (the speaker-button playback in Quiz) is **separate** from SFX and **unaffected** by this toggle — that's instructional audio, not juice. A future "TTS mute" toggle could live next to it but is out of scope here.

### Browser autoplay handling

Howler handles the user-gesture unlock internally. The first sound call in a session may be delayed until a gesture occurs; in Letter Tap the first plays happen in response to taps, so the gesture requirement is satisfied by construction. Pre-existing TTS audio (via `useSpeech`) also already triggers gesture unlock by the time juice SFX fire.

## Architecture

```
src/lib/sound.ts                ← MODIFY: extend SoundKey with star_ping_1/2/3;
                                  add asset entries
src/hooks/useReducedMotion.ts   ← CREATE: matchMedia wrapper with subscription
src/hooks/useReducedMotion.test.tsx

src/pages/Settings.tsx          ← MODIFY: add "Sound effects" toggle row
                                  (reads soundStore.muted, calls toggle())

src/games/letter-tap-sound/
├── timings.ts                  ← CREATE: TAP_FEEDBACK_MS, STAR_CASCADE_MS,
│                                 CONFETTI_PARTICLES constants
├── Quiz.tsx                    ← MODIFY: feedback state, animation classes,
│                                 useSound().play, delay before onCorrect/onWrong
└── LevelResult.tsx             ← MODIFY: staggered cascade + confetti + fanfare effect

public/sounds/                  ← CREATE directory + assets
├── correct.mp3                 (~150ms ding)
├── wrong.mp3                   (~200ms gentle blip)
├── star_ping_1.mp3             (~250ms, low pitch)
├── star_ping_2.mp3             (~250ms, mid pitch)
├── star_ping_3.mp3             (~250ms, high pitch)
├── level_up.mp3                (~1.5-2.5s fanfare, ≤80KB)
└── README.md                   ← attribution + source URLs

package.json                    ← + canvas-confetti, + @types/canvas-confetti
```

### Module boundaries

- **`src/lib/sound.ts` (existing)** knows about Howler. Owns the asset registry and the muted gate.
- **`src/hooks/useSound.ts` (existing)** wraps `lib/sound.ts` with React + soundStore. Returns `{ play, muted }`.
- **`src/hooks/useReducedMotion.ts` (new)** wraps `matchMedia` with React state. Returns boolean.
- **`Quiz` and `LevelResult`** know about choreography (timings, which sound for which event). They use `useSound()` and `useReducedMotion()`. They don't know how sound is produced or gated.

This split keeps the sound system unified for all future games (Word Builder, etc.). `useReducedMotion` is a leaf utility usable anywhere in the app.

### State during tap feedback

`Quiz` holds local state:

```ts
type Feedback = { char: string; kind: 'correct' | 'wrong' } | null;
```

On tile click:
1. Set feedback to `{ char, kind }`.
2. Call `play('correct')` or `play('wrong')` via `useSound()`.
3. After 300ms (correct) or 400ms (wrong), clear feedback and fire `onCorrect`/`onWrong`.

The delay is implemented with `setTimeout` inside an effect keyed on `feedback`. Cleanup cancels the pending timer if the component unmounts mid-animation (e.g., user backs out).

The tile receives `data-feedback={feedback?.char === c.char ? feedback.kind : undefined}` for animation targeting and test assertions. Tailwind classes branch on the attribute via `data-[feedback=correct]:...` selectors (or via a className conditional — implementation choice).

### Timing constants

All animation/SFX timings live as named exports in a small file `src/games/letter-tap-sound/timings.ts` so tests can import the same constants the components use. No magic numbers in JSX.

```ts
export const TAP_FEEDBACK_MS = { correct: 300, wrong: 400 };
export const STAR_CASCADE_MS = [0, 350, 700];
export const CONFETTI_PARTICLES = 60;
```

## Behavior matrix

| Event | Visual (default) | Visual (reduced-motion) | Audio (SoundKey) |
|---|---|---|---|
| Correct tap | tile scale 1.15× + green border pulse, 300ms | tile dims green, 200ms | `correct` |
| Wrong tap | tile shake 4 cycles + red border flash, 400ms | tile dims red, 200ms | `wrong` |
| Star 1 (t=0) | spring scale-in | fade-in | `star_ping_1` |
| Star 2 (t=350) | spring scale-in | fade-in | `star_ping_2` |
| Star 3 (t=700) | spring scale-in + confetti burst + mascot bounce | fade-in (no confetti, no bounce) | `star_ping_3` + `level_up` |
| Muted (`soundStore.muted=true`) | (visual unchanged) | (visual unchanged) | silent across all events |
| Asset 404 / decode error | (unchanged) | (unchanged) | Howler silently no-ops that key; other keys unaffected |
| Pre-gesture call | (unchanged) | (unchanged) | Howler queues; plays after first user gesture |

## Edge cases

- **Component unmount mid-feedback:** if the user navigates away (Back button, route change) while the 300ms tap-feedback timer is pending, the cleanup cancels the timer. `onCorrect`/`onWrong` is NOT fired post-unmount.
- **Rapid double-tap on same tile:** second tap during the feedback window is ignored (the component is in feedback state, click handler short-circuits).
- **Rapid tap on different tile during feedback window:** also ignored, same reason. The feedback window is a brief "lock."
- **Replay button on result screen:** fires immediately, no celebration replay. Starts a new level normally.
- **Level reaches result with 1-2 stars** (mistakes): the cascade reveals N stars where N = stars earned. The unearned positions are gray placeholders rendered immediately on mount. Each earned star plays its ping at the slot timing (0, 350, 700ms). The climax — confetti + fanfare + mascot bounce — fires at the **last earned star's slot**, not always at t=700. So 1-star → climax at t=0; 2-star → climax at t=350; 3-star → climax at t=700. The minimum earned is 1 star (`starsFor(mistakes)` never returns 0). *Open: should 1-star skip the confetti? Held as default-on for now; revisit after observing kid reactions.*
- **System volume muted vs `soundStore.muted=true`:** independent. App can be unmuted while OS is muted (no sound). App can be muted while OS has volume (no SFX, but TTS letter audio still plays — TTS is not gated by the sound store).
- **`prefers-reduced-motion` changes mid-session:** the hook subscribes to media query changes, so live OS-level toggling (e.g., parent enables it during play) takes effect immediately on the next render.
- **`canvas-confetti` lazy-load fails** (offline, CSP, etc.): wrap the import in a try/catch; on failure, skip confetti, log in dev. Other celebration elements unaffected.
- **Mid-quiz mute toggle:** if the user opens settings mid-level, mutes SFX, and returns, the next tile-tap is silent. No replays of in-flight sounds, no re-rendering of Quiz.
- **Howler initialization fails** (very old browsers, exotic cases): `play()` is a no-op; UI behavior is unaffected.

## Testing strategy

### Unit tests (infra)

- **`sound.test.ts`** (extend existing if present, otherwise new) — assert the three new keys (`star_ping_1/2/3`) appear in `SOURCES` with paths under `/sounds/`. The existing test pattern for `useSound` (mocking Howler) covers the play path.
- **`useReducedMotion.test.tsx`** — mock `matchMedia`; hook returns `true` when the media query matches; subscribes via `addEventListener('change', ...)` and updates on `MediaQueryListEvent`; cleans up on unmount.
- **`Settings.test.tsx`** (extended) — toggle row renders with current `muted` value, click flips `soundStore.muted`.

### Integration tests (Letter Tap)

- **`Quiz.test.tsx`** (extended) — with `vi.useFakeTimers()`:
  - Click correct tile → tile gets `data-feedback="correct"`, `onCorrect` NOT called yet.
  - Advance 300ms → `data-feedback` cleared, `onCorrect` called once.
  - Click wrong tile → `data-feedback="wrong"`, advance 400ms → `onWrong` called.
  - Second click during feedback window → handler short-circuits, no extra calls.
  - Reduced-motion variant: `data-feedback` still set, but a `data-reduced-motion` attr is on the tile (test asserts presence; CSS proves the visual rule).
- **`LevelResult.test.tsx`** (extended) — with `vi.useFakeTimers()`, rendered with `stars={3}` unless noted:
  - On initial render: 1 revealed star (`data-revealed="true"` on first star — synchronous), `play('star_ping_1')` called.
  - Advance 350ms → 2 revealed, `play('star_ping_2')` called.
  - Advance another 350ms (total 700ms) → 3 revealed, `play('star_ping_3')` called, `play('level_up')` called, lazy import of `canvas-confetti` resolved + confetti dispatched.
  - `stars={2}`: on render, 1 revealed; advance 350ms → 2 revealed + fanfare + confetti dispatched at this slot (not at t=700).
  - `stars={1}`: on render, 1 revealed + fanfare + confetti dispatched synchronously (climax at the only star's slot).
  - Reduced-motion variant (`stars={3}`): confetti NOT dispatched; fanfare + pings still play.
  - Muted (`soundStore.muted=true`, `stars={3}`): stars still cascade visually; `play('star_ping_*')` and `play('level_up')` are called from the component but the underlying Howler `play()` is NOT invoked (assert on the Howler mock).

### What we don't test

- Actual audio playback (jsdom has no audio engine — we mock).
- Visual style correctness (Tailwind class strings — out of unit-test scope).
- Confetti particle motion (the library is trusted; we assert call only).

## Rollout

1. Extend `lib/sound.ts` with the 3 new `star_ping_*` keys and update `SOURCES` paths. Add `useReducedMotion` hook. Verifiable: unit tests.
2. Add "Sound effects" toggle to Settings page wiring `soundStore.muted`. Verifiable: settings tests + manual click.
3. Wire Quiz tap feedback. Verifiable: open in browser, tap tiles, hear/see feedback.
4. Wire LevelResult cascade + confetti + fanfare. Verifiable: finish a level, watch the choreography.
5. Commit asset files (CC0 from freesound, attribution in `public/sounds/README.md`).

Steps 1-4 ship cleanly without assets — Howler silently no-ops missing files, so the game functions (silently for any unjuiced event) until assets land. Step 5 can ship in the same PR or as a follow-up.

## Open questions

- **1-star confetti:** does a 1-star finish (lots of mistakes) feel celebratory or hollow? Default-on for v1; reassess from kid reactions.
- **Confetti color palette:** default `canvas-confetti` colors are bright primary; should they match the Pop Cartoon brand (`sunny`, `accent`, etc.)? Defer to implementation — easy to pass `colors: [...]` into the call.
- **Asset sourcing:** specific freesound CC0 candidates for each of the 6 sounds — proposed during implementation, picked by Khalid before the asset-commit step.

## Out of scope (future work)

- Mascot animation rig (idle wiggle, success dance choreography beyond `animate-bounce`).
- Ambient juice on LevelSelect cards (sparkles on previously-completed cards, etc.).
- Per-age celebration intensity tuning.
- Background music or theme songs.
- Haptic feedback on touch devices (`navigator.vibrate`) — controversial for kids; deferred.
- TTS mute toggle (separate concern, separate decision).
- Word Builder integration — that game doesn't exist yet; the shared `useSound`/`useReducedMotion` infra will be ready when it does.
