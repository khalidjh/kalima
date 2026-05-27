# Game Engine + Word Builder v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Letter Tap's reusable parts into a shared engine at `src/games/_engine/`, then ship Word Builder v1 (English tap-to-spell) on top.

**Architecture:** Two phases. Phase 1 (Tasks 1–6): refactor Letter Tap onto a new engine without changing its behavior — all existing tests must pass unchanged. Phase 2 (Tasks 7–12): build Word Builder as the engine's second consumer, English-only, mode A/B/C by age, one word per level.

**Tech Stack:** Vite + React 19 + TypeScript + Vitest + Tailwind + Zustand + Supabase + Howler + canvas-confetti. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-27-game-engine-and-word-builder-design.md`

---

## File Map

### New (engine)
- `src/games/_engine/types.ts` — `LevelDef`, shell state types
- `src/games/_engine/timings.ts` — moved from `letter-tap-sound/timings.ts`
- `src/games/_engine/stars.ts` — `starsFor(mistakes)` extracted
- `src/games/_engine/Tile.tsx` — generic tappable choice tile
- `src/games/_engine/LevelGrid.tsx` — generic level select grid
- `src/games/_engine/LevelResult.tsx` — moved from `letter-tap-sound/LevelResult.tsx`
- `src/games/_engine/useGameShell.ts` — select/playing/result state machine
- `src/games/_engine/index.ts` — public exports

### New (Word Builder)
- `src/games/word-builder/index.ts` — game registration
- `src/games/word-builder/WordBuilder.tsx` — engine consumer entry
- `src/games/word-builder/SpellPad.tsx` — play screen
- `src/games/word-builder/config.ts` — per-age mode + pool
- `src/games/word-builder/data/words-en.ts` — curated word list
- `src/games/word-builder/WordBuilder.test.tsx` — integration tests
- `src/games/word-builder/SpellPad.test.tsx` — unit tests

### Modified
- `src/games/letter-tap-sound/Quiz.tsx` — consume `Tile` from engine
- `src/games/letter-tap-sound/LevelSelect.tsx` — consume `LevelGrid` from engine
- `src/games/letter-tap-sound/LetterTapSound.tsx` — consume `useGameShell` from engine
- `src/games/registry.ts` — flip `word-builder` to `playable`, add `route`
- `src/i18n/en.json`, `src/i18n/ar.json` — Word Builder translation keys

---

## Phase 1 — Engine extraction (zero behavior change)

### Task 1: Scaffold engine + move timings.ts

**Files:**
- Create: `src/games/_engine/timings.ts`
- Create: `src/games/_engine/index.ts`
- Delete: `src/games/letter-tap-sound/timings.ts`
- Modify: `src/games/letter-tap-sound/Quiz.tsx` (import path)
- Modify: `src/games/letter-tap-sound/LevelResult.tsx` (import path)
- Modify: `src/games/letter-tap-sound/Quiz.test.tsx` (import path)
- Modify: `src/games/letter-tap-sound/LetterTapSound.test.tsx` (import path)

- [ ] **Step 1: Create `src/games/_engine/timings.ts` with the existing content**

```ts
// All juice-layer timings live here so tests and components share the same
// numbers. Tweak values here — never sprinkle magic numbers in JSX.

export const TAP_FEEDBACK_MS = {
  correct: 300,
  wrong: 400,
} as const;

// Each entry is the offset (ms) at which the corresponding star reveals,
// keyed by star index (0..2). Index 0 fires synchronously on mount.
export const STAR_CASCADE_MS = [0, 350, 700] as const;

export const CONFETTI_PARTICLES = 60;
```

- [ ] **Step 2: Create `src/games/_engine/index.ts`**

```ts
export { TAP_FEEDBACK_MS, STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
```

- [ ] **Step 3: Delete `src/games/letter-tap-sound/timings.ts`**

```bash
rm src/games/letter-tap-sound/timings.ts
```

- [ ] **Step 4: Update Quiz.tsx import**

Find line 7 in `src/games/letter-tap-sound/Quiz.tsx`:
```ts
import { TAP_FEEDBACK_MS } from './timings';
```
Replace with:
```ts
import { TAP_FEEDBACK_MS } from '../_engine/timings';
```

- [ ] **Step 5: Update LevelResult.tsx import**

Find line 6 in `src/games/letter-tap-sound/LevelResult.tsx`:
```ts
import { STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
```
Replace with:
```ts
import { STAR_CASCADE_MS, CONFETTI_PARTICLES } from '../_engine/timings';
```

- [ ] **Step 6: Update Quiz.test.tsx import**

Find line 3:
```ts
import { TAP_FEEDBACK_MS } from './timings';
```
Replace with:
```ts
import { TAP_FEEDBACK_MS } from '../_engine/timings';
```

- [ ] **Step 7: Update LetterTapSound.test.tsx import**

Find line 3:
```ts
import { TAP_FEEDBACK_MS } from './timings';
```
Replace with:
```ts
import { TAP_FEEDBACK_MS } from '../_engine/timings';
```

- [ ] **Step 8: Run the full test suite**

Run: `npm run test`
Expected: PASS (all tests — should be same count as before, around 249).

- [ ] **Step 9: Run typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 10: Commit**

```bash
git add src/games/_engine/ src/games/letter-tap-sound/Quiz.tsx src/games/letter-tap-sound/LevelResult.tsx src/games/letter-tap-sound/Quiz.test.tsx src/games/letter-tap-sound/LetterTapSound.test.tsx
git rm src/games/letter-tap-sound/timings.ts 2>/dev/null || true
git commit -m "refactor(engine): move timings.ts into shared _engine module"
```

---

### Task 2: Extract starsFor into engine

**Files:**
- Create: `src/games/_engine/stars.ts`
- Create: `src/games/_engine/stars.test.ts`
- Modify: `src/games/_engine/index.ts`
- Modify: `src/games/letter-tap-sound/LetterTapSound.tsx` (remove local `starsFor`, import from engine)

- [ ] **Step 1: Write the test first**

Create `src/games/_engine/stars.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { starsFor } from './stars';

describe('starsFor', () => {
  it('returns 3 for 0 mistakes', () => {
    expect(starsFor(0)).toBe(3);
  });
  it('returns 2 for 1 mistake', () => {
    expect(starsFor(1)).toBe(2);
  });
  it('returns 1 for 2 mistakes', () => {
    expect(starsFor(2)).toBe(1);
  });
  it('returns 1 for 5 mistakes (floor at 1)', () => {
    expect(starsFor(5)).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/_engine/stars.test.ts`
Expected: FAIL with "Cannot find module './stars'".

- [ ] **Step 3: Create `src/games/_engine/stars.ts`**

```ts
// Stars by mistakes — same rule across every tap-based game in the engine.
// 0 mistakes = 3 stars, 1 = 2, 2+ = 1.
export function starsFor(mistakes: number): number {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}
```

- [ ] **Step 4: Re-export from engine index**

Edit `src/games/_engine/index.ts`:
```ts
export { TAP_FEEDBACK_MS, STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
export { starsFor } from './stars';
```

- [ ] **Step 5: Run the new test**

Run: `npx vitest run src/games/_engine/stars.test.ts`
Expected: PASS (4/4).

- [ ] **Step 6: Replace local `starsFor` in LetterTapSound.tsx**

In `src/games/letter-tap-sound/LetterTapSound.tsx`:
- Delete lines 51–55 (the local `starsFor` function).
- Add to the imports section near line 9:
```ts
import { starsFor } from '../_engine/stars';
```

- [ ] **Step 7: Run full suite + typecheck**

Run: `npm run test && npx tsc --noEmit`
Expected: PASS (no regression).

- [ ] **Step 8: Commit**

```bash
git add src/games/_engine/stars.ts src/games/_engine/stars.test.ts src/games/_engine/index.ts src/games/letter-tap-sound/LetterTapSound.tsx
git commit -m "refactor(engine): extract starsFor into shared module"
```

---

### Task 3: Move LevelResult.tsx into engine

**Files:**
- Create: `src/games/_engine/LevelResult.tsx`
- Delete: `src/games/letter-tap-sound/LevelResult.tsx`
- Modify: `src/games/_engine/index.ts`
- Modify: `src/games/letter-tap-sound/LetterTapSound.tsx` (import path)

LevelResult is already game-agnostic — it takes `stars`, `hasNext`, and three callbacks. Just relocate.

- [ ] **Step 1: Copy LevelResult to `src/games/_engine/LevelResult.tsx`**

Paste the full current content of `src/games/letter-tap-sound/LevelResult.tsx` into the new path, but change the `Mascot` import to remain `../../components/Mascot` (still two `..` from `_engine/`) and update the timings import:

```ts
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../../components/Mascot';
import { useSound } from '../../hooks/useSound';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';

interface LevelResultProps {
  stars: number;
  hasNext: boolean;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
}

async function burstConfetti(particleCount: number): Promise<void> {
  try {
    const mod = await import('canvas-confetti');
    mod.default({ particleCount, spread: 70, origin: { y: 0.6 } });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('canvas-confetti failed to load:', err);
    }
  }
}

export function LevelResult({ stars, hasNext, onNext, onReplay, onBack }: LevelResultProps) {
  const { t } = useTranslation();
  const { play } = useSound();
  const reducedMotion = useReducedMotion();

  const [revealed, setRevealed] = useState<number>(stars > 0 ? 1 : 0);
  const [climaxed, setClimaxed] = useState<boolean>(false);

  useEffect(() => {
    const earned = Math.max(0, Math.min(3, stars));
    if (earned === 0) return;

    const lastIdx = earned - 1;
    const pingKeys: ReadonlyArray<'star_ping_1' | 'star_ping_2' | 'star_ping_3'> = [
      'star_ping_1',
      'star_ping_2',
      'star_ping_3',
    ];

    const fireSlot = (i: number) => {
      play(pingKeys[i]);
      if (i === lastIdx) {
        play('level_up');
        setClimaxed(true);
        if (!reducedMotion) {
          void burstConfetti(CONFETTI_PARTICLES);
        }
      }
    };

    fireSlot(0);

    const timers: number[] = [];
    for (let i = 1; i < earned; i++) {
      const id = window.setTimeout(() => {
        setRevealed(i + 1);
        fireSlot(i);
      }, STAR_CASCADE_MS[i]);
      timers.push(id);
    }
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars]);

  const earned = Math.max(0, Math.min(3, stars));
  const bounceMascot = climaxed && !reducedMotion;

  return (
    <section data-testid="level-result" className="flex flex-col items-center gap-6 px-6 py-8">
      <Mascot mood={bounceMascot ? 'success' : 'idle'} />
      <h2 className="font-display text-3xl text-ink">{t('game.level_complete')}</h2>
      <div className="flex gap-2 text-4xl" aria-label={t('game.stars_earned', { stars })}>
        {[0, 1, 2].map((i) => {
          const isFilled = i < earned;
          const isRevealed = i < revealed;
          if (isFilled) {
            return (
              <span
                key={i}
                data-testid="star-filled"
                data-revealed={isRevealed ? 'true' : 'false'}
                className={[
                  'inline-block transition-all duration-300',
                  isRevealed ? 'opacity-100' : 'opacity-0',
                  !reducedMotion && isRevealed ? 'scale-100' : '',
                  !reducedMotion && !isRevealed ? 'scale-0' : '',
                ].filter(Boolean).join(' ')}
              >
                ⭐
              </span>
            );
          }
          return (
            <span key={i} data-testid="star-empty" className="opacity-60">
              ☆
            </span>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {hasNext && (
          <button
            type="button"
            data-testid="result-next"
            onClick={onNext}
            className="bg-accent text-white rounded-2xl py-3 font-display text-lg"
          >
            {t('game.next_level')}
          </button>
        )}
        <button
          type="button"
          data-testid="result-replay"
          onClick={onReplay}
          className="bg-surface text-ink rounded-2xl py-3 font-display text-lg shadow-card"
        >
          {t('game.replay')}
        </button>
        <button
          type="button"
          data-testid="result-back"
          onClick={onBack}
          className="bg-surface text-ink rounded-2xl py-3 font-display text-lg shadow-card"
        >
          {t('game.back_to_levels')}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete old LevelResult**

```bash
rm src/games/letter-tap-sound/LevelResult.tsx
```

- [ ] **Step 3: Re-export from engine index**

Edit `src/games/_engine/index.ts`:
```ts
export { TAP_FEEDBACK_MS, STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
export { starsFor } from './stars';
export { LevelResult } from './LevelResult';
```

- [ ] **Step 4: Update LetterTapSound.tsx import**

In `src/games/letter-tap-sound/LetterTapSound.tsx`, replace:
```ts
import { LevelResult } from './LevelResult';
```
with:
```ts
import { LevelResult } from '../_engine/LevelResult';
```

- [ ] **Step 5: Run full suite**

Run: `npm run test && npx tsc --noEmit && npm run lint`
Expected: PASS (no regression; same Letter Tap test count).

- [ ] **Step 6: Commit**

```bash
git add src/games/_engine/LevelResult.tsx src/games/_engine/index.ts src/games/letter-tap-sound/LetterTapSound.tsx
git rm src/games/letter-tap-sound/LevelResult.tsx 2>/dev/null || true
git commit -m "refactor(engine): move LevelResult into shared module"
```

---

### Task 4: Extract Tile into engine

**Files:**
- Create: `src/games/_engine/Tile.tsx`
- Create: `src/games/_engine/Tile.test.tsx`
- Modify: `src/games/_engine/index.ts`
- Modify: `src/games/letter-tap-sound/Quiz.tsx` (consume Tile)

Tile owns: feedback states, multi-touch lockedRef, reduced-motion attrs, the SFX-on-tap sound, the `TAP_FEEDBACK_MS` delay. Quiz becomes a layout + audio-prompt component that maps choices to Tiles.

- [ ] **Step 1: Write the failing Tile test**

Create `src/games/_engine/Tile.test.tsx`:
```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TAP_FEEDBACK_MS } from './timings';

const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  useReducedMotion: vi.fn(() => false),
}));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));

import { Tile } from './Tile';

beforeEach(() => {
  mocks.play.mockClear();
  mocks.useReducedMotion.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Tile', () => {
  it('renders the label and aria-label', () => {
    render(<Tile label="A" ariaLabel="alif" isCorrect={false} onCorrect={() => {}} onWrong={() => {}} />);
    const tile = screen.getByTestId('engine-tile');
    expect(tile).toHaveAttribute('aria-label', 'alif');
    expect(tile.textContent).toBe('A');
  });

  it('marks correct tap with data-feedback="correct" and plays the correct SFX', () => {
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(screen.getByTestId('engine-tile')).toHaveAttribute('data-feedback', 'correct');
    expect(mocks.play).toHaveBeenCalledWith('correct');
  });

  it('marks wrong tap with data-feedback="wrong" and plays the wrong SFX', () => {
    render(<Tile label="A" ariaLabel="alif" isCorrect={false} onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(screen.getByTestId('engine-tile')).toHaveAttribute('data-feedback', 'wrong');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });

  it('delays onCorrect by TAP_FEEDBACK_MS.correct', () => {
    const onCorrect = vi.fn();
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(onCorrect).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct); });
    expect(onCorrect).toHaveBeenCalledOnce();
  });

  it('ignores a second tap during the feedback window', () => {
    const onCorrect = vi.fn();
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it('sets data-reduced-motion="true" when reduced motion is active', () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(screen.getByTestId('engine-tile')).toHaveAttribute('data-reduced-motion', 'true');
  });

  it('does not fire onCorrect if unmounted mid-feedback', () => {
    const onCorrect = vi.fn();
    const { unmount } = render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    unmount();
    act(() => { vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct + 50); });
    expect(onCorrect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/_engine/Tile.test.tsx`
Expected: FAIL with "Cannot find module './Tile'".

- [ ] **Step 3: Implement Tile**

Create `src/games/_engine/Tile.tsx`:
```tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSound } from '../../hooks/useSound';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TAP_FEEDBACK_MS } from './timings';

interface TileProps {
  label: ReactNode;       // what the child sees on the tile face (letter, etc.)
  ariaLabel: string;      // screen-reader label
  isCorrect: boolean;     // does this tile, if tapped, count as correct?
  onCorrect: () => void;  // fired after the correct-feedback window
  onWrong: () => void;    // fired after the wrong-feedback window
  disabled?: boolean;     // tap is a no-op (e.g., this letter already placed)
  className?: string;     // extra classes for per-game styling (size, etc.)
}

type Feedback = 'correct' | 'wrong' | null;

export function Tile({ label, ariaLabel, isCorrect, onCorrect, onWrong, disabled, className }: TileProps) {
  const { play } = useSound();
  const reducedMotion = useReducedMotion();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleClick = () => {
    if (disabled || lockedRef.current) return;
    lockedRef.current = true;
    const kind: 'correct' | 'wrong' = isCorrect ? 'correct' : 'wrong';
    setFeedback(kind);
    play(kind);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      lockedRef.current = false;
      setFeedback(null);
      if (kind === 'correct') onCorrect();
      else onWrong();
    }, TAP_FEEDBACK_MS[kind]);
  };

  return (
    <button
      type="button"
      data-testid="engine-tile"
      data-feedback={feedback ?? undefined}
      data-reduced-motion={feedback && reducedMotion ? 'true' : undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={[
        'font-display font-black text-5xl text-ink bg-white border-4 border-ink rounded-2xl shadow-pop w-24 h-24 flex items-center justify-center transition-all',
        'data-[feedback=correct]:scale-110 data-[feedback=correct]:border-success',
        'data-[feedback=wrong]:animate-shake data-[feedback=wrong]:border-tomato',
        'data-[reduced-motion=true]:scale-100 data-[reduced-motion=true]:animate-none',
        'data-[reduced-motion=true]:data-[feedback=correct]:bg-success/40',
        'data-[reduced-motion=true]:data-[feedback=wrong]:bg-tomato/40',
        'active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0',
        className ?? '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 4: Re-export from engine index**

Edit `src/games/_engine/index.ts`:
```ts
export { TAP_FEEDBACK_MS, STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
export { starsFor } from './stars';
export { LevelResult } from './LevelResult';
export { Tile } from './Tile';
```

- [ ] **Step 5: Run Tile test**

Run: `npx vitest run src/games/_engine/Tile.test.tsx`
Expected: PASS (7/7).

- [ ] **Step 6: Refactor Quiz.tsx to consume Tile**

Replace the entire content of `src/games/letter-tap-sound/Quiz.tsx` with:

```tsx
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dispatchSpeak } from './audio/speak';
import { useSpeech } from '../../hooks/useSpeech';
import { Tile } from '../_engine/Tile';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

interface QuizProps {
  target: Letter;
  choices: Letter[];
  lang: Lang;
  onCorrect: () => void;
  onWrong: () => void;
}

export function Quiz({ target, choices, lang, onCorrect, onWrong }: QuizProps) {
  const { t } = useTranslation();
  const { speak } = useSpeech();

  const playPrompt = useCallback(() => {
    void dispatchSpeak(target.audio_key, lang, speak);
  }, [target, lang, speak]);

  useEffect(() => {
    playPrompt();
  }, [playPrompt]);

  return (
    <div data-testid="quiz" className="flex flex-col items-center gap-6 px-4 py-6">
      <button
        type="button"
        data-testid="quiz-speaker"
        onClick={playPrompt}
        aria-label={t('game.tap_speaker')}
        className="text-4xl rounded-full bg-sunny border-4 border-ink shadow-pop w-20 h-20 flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
      >
        🔊
      </button>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((c) => (
          <Tile
            key={c.char}
            label={c.char}
            ariaLabel={c.name}
            isCorrect={c.char === target.char}
            onCorrect={onCorrect}
            onWrong={onWrong}
          />
        ))}
      </div>
    </div>
  );
}
```

Note: the existing `quiz-tile` testid becomes `engine-tile` (Tile sets that). The existing Quiz.test.tsx asserts on `quiz-tile`. We need to update those assertions to `engine-tile`.

- [ ] **Step 7: Update Quiz.test.tsx test-id references**

In `src/games/letter-tap-sound/Quiz.test.tsx`, replace all instances of `'quiz-tile'` with `'engine-tile'`:

```bash
sed -i "s/'quiz-tile'/'engine-tile'/g" src/games/letter-tap-sound/Quiz.test.tsx
```

Verify (should show 0 results):
```bash
grep -n "quiz-tile" src/games/letter-tap-sound/Quiz.test.tsx
```

- [ ] **Step 8: Update LetterTapSound.test.tsx test-id references**

```bash
sed -i "s/'quiz-tile'/'engine-tile'/g; s/\/\^quiz-tile/\/^engine-tile/g; s/(\/\^quiz-tile/(\/^engine-tile/g" src/games/letter-tap-sound/LetterTapSound.test.tsx
```

Verify (should show 0 results except possibly in comments):
```bash
grep -n "quiz-tile" src/games/letter-tap-sound/LetterTapSound.test.tsx
```

- [ ] **Step 9: Run full test suite**

Run: `npm run test`
Expected: PASS — same count as before (Letter Tap behavior unchanged; only test-id renamed).

- [ ] **Step 10: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 11: Commit**

```bash
git add src/games/_engine/Tile.tsx src/games/_engine/Tile.test.tsx src/games/_engine/index.ts src/games/letter-tap-sound/Quiz.tsx src/games/letter-tap-sound/Quiz.test.tsx src/games/letter-tap-sound/LetterTapSound.test.tsx
git commit -m "refactor(engine): extract Tile primitive, Quiz consumes it"
```

---

### Task 5: Extract LevelGrid into engine

**Files:**
- Create: `src/games/_engine/LevelGrid.tsx`
- Modify: `src/games/_engine/index.ts`
- Modify: `src/games/letter-tap-sound/LevelSelect.tsx` (consume LevelGrid)

LevelGrid is generic: given a list of level indices, stars per level, an `onPick`, and a `renderCard(index)` function, it lays them out in the same shadowed grid Letter Tap uses today.

- [ ] **Step 1: Implement LevelGrid**

Create `src/games/_engine/LevelGrid.tsx`:
```tsx
import { type ReactNode } from 'react';
import type { ProgressMap } from '../../types/game';
import { StarIcon } from '../../components/icons';

interface LevelGridProps {
  levelIndices: number[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
  /** Renders the face of each level card (the big char, the word preview, etc.). */
  renderCard: (levelIndex: number) => ReactNode;
  /** aria-label per card. */
  ariaLabelFor: (levelIndex: number) => string;
}

export function LevelGrid({ levelIndices, progress, onPick, renderCard, ariaLabelFor }: LevelGridProps) {
  return (
    <div
      data-testid="level-select"
      className="grid grid-cols-4 sm:grid-cols-6 gap-3 px-4 py-6 max-w-2xl mx-auto"
    >
      {levelIndices.map((i) => {
        const stars = progress.get(i) ?? 0;
        return (
          <button
            key={i}
            type="button"
            data-testid={`level-card-${i}`}
            aria-label={ariaLabelFor(i)}
            onClick={() => onPick(i)}
            className="aspect-square bg-white border-4 border-ink rounded-2xl shadow-pop flex flex-col items-center justify-center gap-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {renderCard(i)}
            {stars > 0 && (
              <span className="inline-flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: stars }).map((_, idx) => (
                  <StarIcon key={idx} size={14} />
                ))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Re-export from engine index**

Edit `src/games/_engine/index.ts`:
```ts
export { TAP_FEEDBACK_MS, STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
export { starsFor } from './stars';
export { LevelResult } from './LevelResult';
export { Tile } from './Tile';
export { LevelGrid } from './LevelGrid';
```

- [ ] **Step 3: Refactor LevelSelect.tsx**

Replace the entire content of `src/games/letter-tap-sound/LevelSelect.tsx` with:
```tsx
import type { Letter, ProgressMap } from '../../types/game';
import { LevelGrid } from '../_engine/LevelGrid';

interface LevelSelectProps {
  letters: Letter[];
  levelIndices: number[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
}

export function LevelSelect({ letters, levelIndices, progress, onPick }: LevelSelectProps) {
  return (
    <LevelGrid
      levelIndices={levelIndices}
      progress={progress}
      onPick={onPick}
      ariaLabelFor={(i) => letters[i].name}
      renderCard={(i) => (
        <span className="font-display font-black text-3xl text-ink">{letters[i].char}</span>
      )}
    />
  );
}
```

- [ ] **Step 4: Run full test suite**

Run: `npm run test && npx tsc --noEmit && npm run lint`
Expected: PASS — Letter Tap level select tests (testid `level-select`, `level-card-N`) still pass since LevelGrid uses the same testids.

- [ ] **Step 5: Commit**

```bash
git add src/games/_engine/LevelGrid.tsx src/games/_engine/index.ts src/games/letter-tap-sound/LevelSelect.tsx
git commit -m "refactor(engine): extract LevelGrid, LevelSelect consumes it"
```

---

### Task 6: Extract useGameShell into engine

**Files:**
- Create: `src/games/_engine/types.ts`
- Create: `src/games/_engine/useGameShell.ts`
- Modify: `src/games/_engine/index.ts`
- Modify: `src/games/letter-tap-sound/LetterTapSound.tsx` (consume useGameShell)

`useGameShell` owns the macro state: `select → playing → result`, level navigation (`startLevel`, `next`, `replay`, `goBack`), and progress integration. Mistake counting + per-prompt orchestration stays in each game's play screen (LetterTapSound for Letter Tap, SpellPad for Word Builder).

- [ ] **Step 1: Create types.ts**

Create `src/games/_engine/types.ts`:
```ts
import type { Lang, AgeGroup } from '../../stores/userStore';

export type ShellState =
  | { kind: 'select' }
  | { kind: 'playing'; levelIndex: number }
  | { kind: 'result'; levelIndex: number; stars: number };

export interface UseGameShellArgs {
  gameId: string;
  lang: Lang;
  ageGroup: AgeGroup | null;
  /** Returns the indices visible at this age, in level-order. */
  poolForAge: (age: AgeGroup | null) => number[];
}

export interface UseGameShellResult {
  state: ShellState;
  /** Progress map: levelIndex -> stars (1..3). */
  progress: Map<number, number>;
  loading: boolean;
  /** Currently-active pool, in order. */
  levelIndices: number[];
  startLevel: (levelIndex: number) => void;
  /** Call from the play screen when the level is finished. Computes stars, upserts, transitions. */
  completeLevel: (mistakes: number) => void;
  /** From the result screen: go to next level in pool. */
  next: () => void;
  /** From the result screen: replay same level. */
  replay: () => void;
  /** Return to select. */
  goBack: () => void;
  /** Whether a next level exists in the current pool. */
  hasNext: boolean;
}
```

- [ ] **Step 2: Implement useGameShell**

Create `src/games/_engine/useGameShell.ts`:
```ts
import { useMemo, useState } from 'react';
import { useGameProgress } from '../../hooks/useGameProgress';
import { starsFor } from './stars';
import type { ShellState, UseGameShellArgs, UseGameShellResult } from './types';

export function useGameShell({
  gameId,
  lang,
  ageGroup,
  poolForAge,
}: UseGameShellArgs): UseGameShellResult {
  const { progress, loading, upsert } = useGameProgress(gameId, lang);
  const [state, setState] = useState<ShellState>({ kind: 'select' });

  const levelIndices = useMemo(() => poolForAge(ageGroup), [poolForAge, ageGroup]);

  const startLevel = (levelIndex: number) => {
    setState({ kind: 'playing', levelIndex });
  };

  const completeLevel = (mistakes: number) => {
    if (state.kind !== 'playing') return;
    const stars = starsFor(mistakes);
    void upsert(state.levelIndex, stars);
    setState({ kind: 'result', levelIndex: state.levelIndex, stars });
  };

  const next = () => {
    if (state.kind !== 'result') return;
    const pos = levelIndices.indexOf(state.levelIndex);
    if (pos < 0) return;
    const nextPos = pos + 1;
    if (nextPos < levelIndices.length) startLevel(levelIndices[nextPos]);
    else goBack();
  };

  const replay = () => {
    if (state.kind !== 'result') return;
    startLevel(state.levelIndex);
  };

  const goBack = () => setState({ kind: 'select' });

  const hasNext =
    state.kind === 'result' &&
    (() => {
      const pos = levelIndices.indexOf(state.levelIndex);
      return pos >= 0 && pos + 1 < levelIndices.length;
    })();

  return {
    state,
    progress,
    loading,
    levelIndices,
    startLevel,
    completeLevel,
    next,
    replay,
    goBack,
    hasNext,
  };
}
```

- [ ] **Step 3: Re-export from engine index**

Edit `src/games/_engine/index.ts`:
```ts
export { TAP_FEEDBACK_MS, STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';
export { starsFor } from './stars';
export { LevelResult } from './LevelResult';
export { Tile } from './Tile';
export { LevelGrid } from './LevelGrid';
export { useGameShell } from './useGameShell';
export type { ShellState, UseGameShellArgs, UseGameShellResult } from './types';
```

- [ ] **Step 4: Refactor LetterTapSound.tsx to consume useGameShell**

Replace the entire content of `src/games/letter-tap-sound/LetterTapSound.tsx` with:
```tsx
import { useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { LevelSelect } from './LevelSelect';
import { Quiz } from './Quiz';
import { LevelResult, useGameShell } from '../_engine';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import { getChoiceCountForAge, getLevelIndicesForAge } from './config';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

const PROMPTS_PER_LEVEL = 3;

function pickDistractors(
  letters: Letter[],
  poolIndices: number[],
  targetIndex: number,
  count: number,
): Letter[] {
  const others = poolIndices.filter((i) => i !== targetIndex).map((i) => letters[i]);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

function buildChoices(
  letters: Letter[],
  poolIndices: number[],
  levelIndex: number,
  choiceCount: number,
): Letter[] {
  const target = letters[levelIndex];
  const distractors = pickDistractors(letters, poolIndices, levelIndex, choiceCount - 1);
  const all = [target, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

interface PromptState {
  promptIndex: number;
  mistakes: number;
  choices: Letter[];
}

export function LetterTapSound() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  const lang: Lang = learnLang ?? 'ar';
  const letters = lang === 'ar' ? LETTERS_AR : LETTERS_EN;
  const choiceCount = getChoiceCountForAge(ageGroup);

  const poolForAge = useMemo(
    () => (age: typeof ageGroup) => getLevelIndicesForAge(lang, age),
    [lang],
  );

  const shell = useGameShell({
    gameId: 'letter-tap-sound',
    lang,
    ageGroup,
    poolForAge,
  });

  const [prompt, setPrompt] = useState<PromptState | null>(null);

  // Initialize / reset per-level prompt state when entering a playing state.
  const playingIndex = shell.state.kind === 'playing' ? shell.state.levelIndex : null;
  useMemo(() => {
    if (playingIndex === null) {
      setPrompt(null);
      return;
    }
    setPrompt({
      promptIndex: 0,
      mistakes: 0,
      choices: buildChoices(letters, shell.levelIndices, playingIndex, choiceCount),
    });
  }, [playingIndex, letters, shell.levelIndices, choiceCount]);

  const onCorrect = () => {
    if (!prompt || shell.state.kind !== 'playing') return;
    const nextPrompt = prompt.promptIndex + 1;
    if (nextPrompt >= PROMPTS_PER_LEVEL) {
      shell.completeLevel(prompt.mistakes);
      return;
    }
    setPrompt({
      promptIndex: nextPrompt,
      mistakes: prompt.mistakes,
      choices: buildChoices(letters, shell.levelIndices, shell.state.levelIndex, choiceCount),
    });
  };

  const onWrong = () => {
    if (!prompt) return;
    setPrompt({ ...prompt, mistakes: prompt.mistakes + 1 });
  };

  if (shell.state.kind === 'select') {
    return (
      <LevelSelect
        letters={letters}
        levelIndices={shell.levelIndices}
        progress={shell.progress}
        onPick={shell.startLevel}
      />
    );
  }

  if (shell.state.kind === 'playing' && prompt) {
    const target = letters[shell.state.levelIndex];
    return (
      <Quiz
        key={`${shell.state.levelIndex}-${prompt.promptIndex}`}
        target={target}
        choices={prompt.choices}
        lang={lang}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    );
  }

  if (shell.state.kind === 'result') {
    return (
      <LevelResult
        stars={shell.state.stars}
        hasNext={shell.hasNext}
        onNext={shell.next}
        onReplay={shell.replay}
        onBack={shell.goBack}
      />
    );
  }

  return null;
}
```

Note: replacing `useMemo` for `playingIndex`-triggered setPrompt is intentional — `useMemo` here is used as a render-phase setter (returns nothing). This matches React's "derive state during render" pattern. If lint flags it, switch to a `useEffect` with the same dependency array.

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: PASS — all Letter Tap tests pass unchanged (62 tests). If `useMemo` setter trips a React warning, replace with `useEffect`.

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/games/_engine/types.ts src/games/_engine/useGameShell.ts src/games/_engine/index.ts src/games/letter-tap-sound/LetterTapSound.tsx
git commit -m "refactor(engine): extract useGameShell state machine, Letter Tap consumes it"
```

---

## Phase 2 — Word Builder v1

### Task 7: Word Builder skeleton + word lists + registry stub

**Files:**
- Create: `src/games/word-builder/data/words-en.ts`
- Create: `src/games/word-builder/config.ts`
- Create: `src/games/word-builder/WordBuilder.tsx` (placeholder)
- Create: `src/games/word-builder/index.ts`
- Create: `src/games/word-builder/data/words-en.test.ts`
- Modify: `src/games/registry.ts` (flip status, add route)

- [ ] **Step 1: Create the word list**

Create `src/games/word-builder/data/words-en.ts`:
```ts
export interface Word {
  id: string;
  text: string;
}

// Ages 3-4: 8 CVC words, 3 letters each. Mirrors Letter Tap's 8-letter starter pool size.
export const WORDS_AGE_3_4: Word[] = [
  { id: 'cat', text: 'CAT' },
  { id: 'dog', text: 'DOG' },
  { id: 'sun', text: 'SUN' },
  { id: 'bed', text: 'BED' },
  { id: 'hat', text: 'HAT' },
  { id: 'bus', text: 'BUS' },
  { id: 'pig', text: 'PIG' },
  { id: 'cup', text: 'CUP' },
];

// Ages 5-7: 20 words, 3-4 letters, mix of CVC + sight words.
export const WORDS_AGE_5_7: Word[] = [
  { id: 'the', text: 'THE' },
  { id: 'and', text: 'AND' },
  { id: 'big', text: 'BIG' },
  { id: 'run', text: 'RUN' },
  { id: 'red', text: 'RED' },
  { id: 'fox', text: 'FOX' },
  { id: 'book', text: 'BOOK' },
  { id: 'fish', text: 'FISH' },
  { id: 'milk', text: 'MILK' },
  { id: 'tree', text: 'TREE' },
  { id: 'bird', text: 'BIRD' },
  { id: 'moon', text: 'MOON' },
  { id: 'star', text: 'STAR' },
  { id: 'frog', text: 'FROG' },
  { id: 'king', text: 'KING' },
  { id: 'ball', text: 'BALL' },
  { id: 'ship', text: 'SHIP' },
  { id: 'farm', text: 'FARM' },
  { id: 'nest', text: 'NEST' },
  { id: 'rain', text: 'RAIN' },
];

// Ages 8-10: 20 words, 4-6 letters, broader vocab.
export const WORDS_AGE_8_10: Word[] = [
  { id: 'lion', text: 'LION' },
  { id: 'zebra', text: 'ZEBRA' },
  { id: 'tiger', text: 'TIGER' },
  { id: 'horse', text: 'HORSE' },
  { id: 'apple', text: 'APPLE' },
  { id: 'bread', text: 'BREAD' },
  { id: 'green', text: 'GREEN' },
  { id: 'water', text: 'WATER' },
  { id: 'house', text: 'HOUSE' },
  { id: 'mouse', text: 'MOUSE' },
  { id: 'black', text: 'BLACK' },
  { id: 'white', text: 'WHITE' },
  { id: 'night', text: 'NIGHT' },
  { id: 'light', text: 'LIGHT' },
  { id: 'plant', text: 'PLANT' },
  { id: 'cloud', text: 'CLOUD' },
  { id: 'smile', text: 'SMILE' },
  { id: 'music', text: 'MUSIC' },
  { id: 'ocean', text: 'OCEAN' },
  { id: 'train', text: 'TRAIN' },
];

/** Union of all words in the game, deduped, in stable order. */
export const WORDS_EN: Word[] = (() => {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const w of [...WORDS_AGE_3_4, ...WORDS_AGE_5_7, ...WORDS_AGE_8_10]) {
    if (!seen.has(w.id)) {
      seen.add(w.id);
      out.push(w);
    }
  }
  return out;
})();
```

- [ ] **Step 2: Write a sanity test for the word list**

Create `src/games/word-builder/data/words-en.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { WORDS_EN, WORDS_AGE_3_4, WORDS_AGE_5_7, WORDS_AGE_8_10 } from './words-en';

describe('words-en', () => {
  it('age 3-4 list has 8 CVC words', () => {
    expect(WORDS_AGE_3_4).toHaveLength(8);
    for (const w of WORDS_AGE_3_4) {
      expect(w.text).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('age 5-7 list has 20 words of 3-4 letters', () => {
    expect(WORDS_AGE_5_7).toHaveLength(20);
    for (const w of WORDS_AGE_5_7) {
      expect(w.text.length).toBeGreaterThanOrEqual(3);
      expect(w.text.length).toBeLessThanOrEqual(4);
      expect(w.text).toMatch(/^[A-Z]+$/);
    }
  });

  it('age 8-10 list has 20 words of 4-6 letters', () => {
    expect(WORDS_AGE_8_10).toHaveLength(20);
    for (const w of WORDS_AGE_8_10) {
      expect(w.text.length).toBeGreaterThanOrEqual(4);
      expect(w.text.length).toBeLessThanOrEqual(6);
      expect(w.text).toMatch(/^[A-Z]+$/);
    }
  });

  it('combined WORDS_EN is deduped', () => {
    const ids = WORDS_EN.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every word id maps to a unique entry in WORDS_EN', () => {
    for (const w of [...WORDS_AGE_3_4, ...WORDS_AGE_5_7, ...WORDS_AGE_8_10]) {
      expect(WORDS_EN.find((x) => x.id === w.id)).toBeDefined();
    }
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run src/games/word-builder/data/words-en.test.ts`
Expected: PASS (5/5).

- [ ] **Step 4: Create config.ts**

Create `src/games/word-builder/config.ts`:
```ts
import type { AgeGroup } from '../../stores/userStore';
import {
  WORDS_EN,
  WORDS_AGE_3_4,
  WORDS_AGE_5_7,
  WORDS_AGE_8_10,
  type Word,
} from './data/words-en';

export type Mode =
  | 'word-shown-no-distractors'
  | 'word-shown-with-distractors'
  | 'audio-only-with-distractors';

export interface PlayConfig {
  mode: Mode;
  extraDistractors: number;
}

export const PLAY_CONFIG_FOR_AGE: Record<AgeGroup, PlayConfig> = {
  '3-4': { mode: 'word-shown-no-distractors', extraDistractors: 0 },
  '5-7': { mode: 'word-shown-with-distractors', extraDistractors: 2 },
  '8-10': { mode: 'audio-only-with-distractors', extraDistractors: 2 },
};

export const DEFAULT_PLAY_CONFIG: PlayConfig = {
  mode: 'word-shown-with-distractors',
  extraDistractors: 2,
};

export function getPlayConfigForAge(age: AgeGroup | null): PlayConfig {
  return age === null ? DEFAULT_PLAY_CONFIG : PLAY_CONFIG_FOR_AGE[age];
}

/** Returns the words visible at this age, in WORDS_EN-index order (== level order). */
export function getWordsForAge(age: AgeGroup | null): Word[] {
  if (age === null) return WORDS_EN;
  switch (age) {
    case '3-4':
      return WORDS_AGE_3_4;
    case '5-7':
      return WORDS_AGE_5_7;
    case '8-10':
      return WORDS_AGE_8_10;
  }
}

/** Indices into WORDS_EN for the visible pool at this age. */
export function getLevelIndicesForAge(age: AgeGroup | null): number[] {
  const visible = getWordsForAge(age);
  return visible.map((w) => WORDS_EN.findIndex((x) => x.id === w.id));
}
```

- [ ] **Step 5: Create WordBuilder.tsx placeholder**

Create `src/games/word-builder/WordBuilder.tsx`:
```tsx
// Placeholder — fully implemented in Tasks 8–11.
export function WordBuilder() {
  return <div data-testid="word-builder-placeholder">Coming…</div>;
}
```

- [ ] **Step 6: Create index.ts**

Create `src/games/word-builder/index.ts`:
```ts
import type { GameDefinition } from '../../types/game';
import { WordBuilder } from './WordBuilder';

export const game: GameDefinition = {
  id: 'word-builder',
  nameKey: 'game.word_builder.name',
  Component: WordBuilder,
};
```

- [ ] **Step 7: Run typecheck + tests (registry not yet flipped)**

Run: `npx tsc --noEmit && npm run test`
Expected: PASS. The loader will pick up the new index.ts but registry still marks it `coming-soon`, so the hub won't link to it yet.

- [ ] **Step 8: Commit**

```bash
git add src/games/word-builder/
git commit -m "feat(word-builder): scaffold module with word lists, config, and placeholder"
```

---

### Task 8: SpellPad — mode A (3-4: word shown, exact letters)

**Files:**
- Create: `src/games/word-builder/SpellPad.tsx`
- Create: `src/games/word-builder/SpellPad.test.tsx`

SpellPad takes a target word + a `PlayConfig` and renders slots + tile rack. Mode A is the simplest: tile rack = the word's letters scrambled, no distractors. Slots fill left-to-right as the child taps correct letters. Mistakes counted internally; `onComplete(mistakes)` fires when the last slot fills.

- [ ] **Step 1: Write failing tests for mode A**

Create `src/games/word-builder/SpellPad.test.tsx`:
```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TAP_FEEDBACK_MS } from '../_engine/timings';

const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  speak: vi.fn().mockResolvedValue(undefined),
  useReducedMotion: vi.fn(() => false),
}));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: mocks.speak, speaking: false, supported: true }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));

import { SpellPad } from './SpellPad';
import type { Word } from './data/words-en';

const CAT: Word = { id: 'cat', text: 'CAT' };

beforeEach(() => {
  mocks.play.mockClear();
  mocks.speak.mockClear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

async function advancePastFeedback(kind: 'correct' | 'wrong') {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(TAP_FEEDBACK_MS[kind]);
  });
}

describe('SpellPad — mode A (word-shown-no-distractors)', () => {
  const config = { mode: 'word-shown-no-distractors' as const, extraDistractors: 0 };

  it('renders slots equal to word length', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(screen.getAllByTestId(/^spell-slot-/)).toHaveLength(3);
  });

  it('renders one tile per unique letter in the word (no distractors)', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    // CAT has 3 unique letters
    expect(screen.getAllByTestId('engine-tile')).toHaveLength(3);
  });

  it('shows the word text above the slots', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(screen.getByTestId('spell-word')).toHaveTextContent('CAT');
  });

  it('fills slot 0 with C when C is tapped first', async () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    fireEvent.click(screen.getByLabelText('letter C'));
    await advancePastFeedback('correct');
    expect(screen.getByTestId('spell-slot-0')).toHaveTextContent('C');
    expect(screen.getByTestId('spell-slot-1').textContent ?? '').toBe('');
  });

  it('rejects an out-of-order tap as wrong', async () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    // First letter expected is C, but tap A
    fireEvent.click(screen.getByLabelText('letter A'));
    await advancePastFeedback('wrong');
    expect(screen.getByTestId('spell-slot-0').textContent ?? '').toBe('');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });

  it('fires onComplete with mistakes=0 when CAT is spelled cleanly', async () => {
    const onComplete = vi.fn();
    render(<SpellPad word={CAT} config={config} onComplete={onComplete} />);
    for (const ch of ['C', 'A', 'T']) {
      fireEvent.click(screen.getByLabelText(`letter ${ch}`));
      await advancePastFeedback('correct');
    }
    expect(onComplete).toHaveBeenCalledWith(0);
  });

  it('fires onComplete with mistakes=2 after two wrong taps before completion', async () => {
    const onComplete = vi.fn();
    render(<SpellPad word={CAT} config={config} onComplete={onComplete} />);
    // wrong, wrong, then C A T
    fireEvent.click(screen.getByLabelText('letter A')); await advancePastFeedback('wrong');
    fireEvent.click(screen.getByLabelText('letter T')); await advancePastFeedback('wrong');
    fireEvent.click(screen.getByLabelText('letter C')); await advancePastFeedback('correct');
    fireEvent.click(screen.getByLabelText('letter A')); await advancePastFeedback('correct');
    fireEvent.click(screen.getByLabelText('letter T')); await advancePastFeedback('correct');
    expect(onComplete).toHaveBeenCalledWith(2);
  });

  it('marks a used tile as disabled after correct tap', async () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    fireEvent.click(screen.getByLabelText('letter C'));
    await advancePastFeedback('correct');
    expect(screen.getByLabelText('letter C')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/word-builder/SpellPad.test.tsx`
Expected: FAIL with "Cannot find module './SpellPad'".

- [ ] **Step 3: Implement SpellPad for mode A**

Create `src/games/word-builder/SpellPad.tsx`:
```tsx
import { useMemo, useState } from 'react';
import { Tile } from '../_engine/Tile';
import type { Word } from './data/words-en';
import type { PlayConfig } from './config';

interface SpellPadProps {
  word: Word;
  config: PlayConfig;
  onComplete: (mistakes: number) => void;
}

interface RackTile {
  /** Stable key per tile slot; allows duplicates of the same letter. */
  id: string;
  letter: string;
  /** Index into word.text this tile is intended to fill (or -1 for pure distractor). */
  intendedSlot: number;
  used: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build the tile rack. For mode A: exactly the word's letters (one tile per
 * slot), scrambled. Each tile carries `intendedSlot` so we know which slot
 * it fills when tapped — important for words with duplicate letters (e.g. BOOK).
 */
function buildRack(word: Word, _config: PlayConfig): RackTile[] {
  const tiles: RackTile[] = word.text.split('').map((letter, idx) => ({
    id: `slot-${idx}`,
    letter,
    intendedSlot: idx,
    used: false,
  }));
  return shuffle(tiles);
}

export function SpellPad({ word, config, onComplete }: SpellPadProps) {
  const initialRack = useMemo(() => buildRack(word, config), [word, config]);
  const [rack, setRack] = useState<RackTile[]>(initialRack);
  const [filled, setFilled] = useState<string[]>(() => Array(word.text.length).fill(''));
  const [mistakes, setMistakes] = useState(0);
  const nextSlot = filled.findIndex((s) => s === '');

  const expectedLetter = nextSlot >= 0 ? word.text[nextSlot] : null;

  const handleCorrect = (tile: RackTile) => {
    setRack((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
    setFilled((prev) => {
      const next = [...prev];
      next[nextSlot] = tile.letter;
      const allFilled = next.every((s) => s !== '');
      if (allFilled) {
        // Defer onComplete so it runs after this state batch settles.
        queueMicrotask(() => onComplete(mistakes));
      }
      return next;
    });
  };

  const handleWrong = () => {
    setMistakes((m) => m + 1);
  };

  return (
    <div data-testid="spell-pad" className="flex flex-col items-center gap-6 px-4 py-6">
      {config.mode !== 'audio-only-with-distractors' && (
        <div data-testid="spell-word" className="font-display font-black text-4xl text-ink tracking-widest">
          {word.text}
        </div>
      )}
      <div className="flex gap-2">
        {filled.map((ch, i) => (
          <div
            key={i}
            data-testid={`spell-slot-${i}`}
            className="w-16 h-16 border-4 border-ink rounded-2xl flex items-center justify-center font-display font-black text-4xl text-ink bg-white"
          >
            {ch}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {rack.map((tile) => {
          // A tile is "correct" if its letter matches the next expected slot's letter.
          // For mode A (no duplicates concern), letter equality is sufficient.
          const isCorrect = expectedLetter !== null && tile.letter === expectedLetter && !tile.used;
          return (
            <Tile
              key={tile.id}
              label={tile.letter}
              ariaLabel={`letter ${tile.letter}`}
              isCorrect={isCorrect}
              disabled={tile.used}
              onCorrect={() => handleCorrect(tile)}
              onWrong={handleWrong}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run SpellPad tests**

Run: `npx vitest run src/games/word-builder/SpellPad.test.tsx`
Expected: PASS (8/8). If the `onComplete` assertion fires synchronously instead of via microtask, add `await vi.advanceTimersByTimeAsync(0)` or `await Promise.resolve()` after the final tap in those tests.

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/games/word-builder/SpellPad.tsx src/games/word-builder/SpellPad.test.tsx
git commit -m "feat(word-builder): SpellPad mode A — word shown, exact letters"
```

---

### Task 9: SpellPad — mode B (5-7: word shown + distractors) and mode C (8-10: audio only)

**Files:**
- Modify: `src/games/word-builder/SpellPad.tsx` (add distractor letters + audio mode)
- Modify: `src/games/word-builder/SpellPad.test.tsx` (add mode B + mode C tests)

Distractors are letters NOT in the word, drawn from the English alphabet. For audio-only, the word display is hidden and a speak button calls `useSpeech.speak(word.text)`.

- [ ] **Step 1: Add mode B + C tests to SpellPad.test.tsx**

Append to `src/games/word-builder/SpellPad.test.tsx` (after the mode A describe block):

```tsx
describe('SpellPad — mode B (word-shown-with-distractors)', () => {
  const config = { mode: 'word-shown-with-distractors' as const, extraDistractors: 2 };

  it('renders word + (letters + 2 distractor) tiles', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    // CAT (3) + 2 distractors = 5 tiles
    expect(screen.getAllByTestId('engine-tile')).toHaveLength(5);
  });

  it('shows the word text', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(screen.getByTestId('spell-word')).toHaveTextContent('CAT');
  });

  it('distractor letters are not in the target word', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    const wordLetters = new Set('CAT'.split(''));
    const tiles = screen.getAllByTestId('engine-tile');
    const distractors = tiles.filter((t) => !wordLetters.has(t.textContent ?? ''));
    expect(distractors).toHaveLength(2);
    for (const d of distractors) {
      expect('CAT').not.toContain(d.textContent);
    }
  });

  it('tapping a distractor counts as a wrong mistake', async () => {
    const onComplete = vi.fn();
    render(<SpellPad word={CAT} config={config} onComplete={onComplete} />);
    const tiles = screen.getAllByTestId('engine-tile');
    const distractor = tiles.find((t) => !'CAT'.includes(t.textContent ?? ''));
    if (!distractor) throw new Error('no distractor');
    fireEvent.click(distractor);
    await advancePastFeedback('wrong');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });
});

describe('SpellPad — mode C (audio-only-with-distractors)', () => {
  const config = { mode: 'audio-only-with-distractors' as const, extraDistractors: 2 };

  it('does not show the word text', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(screen.queryByTestId('spell-word')).not.toBeInTheDocument();
  });

  it('renders a speaker button that calls speak(word.text)', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    const speaker = screen.getByTestId('spell-speaker');
    fireEvent.click(speaker);
    expect(mocks.speak).toHaveBeenCalledWith('CAT', expect.anything());
  });

  it('plays the word on mount', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(mocks.speak).toHaveBeenCalledWith('CAT', expect.anything());
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/games/word-builder/SpellPad.test.tsx`
Expected: FAIL on mode B + mode C tests (mode A still passes).

- [ ] **Step 3: Update SpellPad.tsx to support distractors + audio**

Replace the entire content of `src/games/word-builder/SpellPad.tsx` with:

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '../_engine/Tile';
import { useSpeech } from '../../hooks/useSpeech';
import type { Word } from './data/words-en';
import type { PlayConfig } from './config';

interface SpellPadProps {
  word: Word;
  config: PlayConfig;
  onComplete: (mistakes: number) => void;
}

interface RackTile {
  id: string;
  letter: string;
  /** -1 if this tile is a distractor that should never match a slot. */
  intendedSlot: number;
  used: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRack(word: Word, config: PlayConfig): RackTile[] {
  const letterTiles: RackTile[] = word.text.split('').map((letter, idx) => ({
    id: `slot-${idx}`,
    letter,
    intendedSlot: idx,
    used: false,
  }));

  if (config.extraDistractors <= 0) return shuffle(letterTiles);

  const wordLetterSet = new Set(word.text.split(''));
  const candidates = ALPHABET.split('').filter((ch) => !wordLetterSet.has(ch));
  const chosen = shuffle(candidates).slice(0, config.extraDistractors);
  const distractorTiles: RackTile[] = chosen.map((letter, idx) => ({
    id: `distractor-${idx}-${letter}`,
    letter,
    intendedSlot: -1,
    used: false,
  }));

  return shuffle([...letterTiles, ...distractorTiles]);
}

export function SpellPad({ word, config, onComplete }: SpellPadProps) {
  const { t } = useTranslation();
  const { speak } = useSpeech();
  const initialRack = useMemo(() => buildRack(word, config), [word, config]);
  const [rack, setRack] = useState<RackTile[]>(initialRack);
  const [filled, setFilled] = useState<string[]>(() => Array(word.text.length).fill(''));
  const [mistakes, setMistakes] = useState(0);
  const nextSlot = filled.findIndex((s) => s === '');
  const expectedLetter = nextSlot >= 0 ? word.text[nextSlot] : null;

  const playWordAudio = useCallback(() => {
    void speak(word.text);
  }, [speak, word]);

  // On mount, if audio-only, speak the word once.
  useEffect(() => {
    if (config.mode === 'audio-only-with-distractors') {
      playWordAudio();
    }
  }, [config.mode, playWordAudio]);

  const handleCorrect = (tile: RackTile) => {
    setRack((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
    setFilled((prev) => {
      const next = [...prev];
      next[nextSlot] = tile.letter;
      const allFilled = next.every((s) => s !== '');
      if (allFilled) {
        queueMicrotask(() => onComplete(mistakes));
      }
      return next;
    });
  };

  const handleWrong = () => {
    setMistakes((m) => m + 1);
  };

  return (
    <div data-testid="spell-pad" className="flex flex-col items-center gap-6 px-4 py-6">
      {config.mode !== 'audio-only-with-distractors' && (
        <div data-testid="spell-word" className="font-display font-black text-4xl text-ink tracking-widest">
          {word.text}
        </div>
      )}
      {config.mode === 'audio-only-with-distractors' && (
        <button
          type="button"
          data-testid="spell-speaker"
          onClick={playWordAudio}
          aria-label={t('game.tap_speaker')}
          className="text-4xl rounded-full bg-sunny border-4 border-ink shadow-pop w-20 h-20 flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          🔊
        </button>
      )}
      <div className="flex gap-2">
        {filled.map((ch, i) => (
          <div
            key={i}
            data-testid={`spell-slot-${i}`}
            className="w-16 h-16 border-4 border-ink rounded-2xl flex items-center justify-center font-display font-black text-4xl text-ink bg-white"
          >
            {ch}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {rack.map((tile) => {
          const isCorrect =
            expectedLetter !== null && tile.letter === expectedLetter && !tile.used;
          return (
            <Tile
              key={tile.id}
              label={tile.letter}
              ariaLabel={`letter ${tile.letter}`}
              isCorrect={isCorrect}
              disabled={tile.used}
              onCorrect={() => handleCorrect(tile)}
              onWrong={handleWrong}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run all SpellPad tests**

Run: `npx vitest run src/games/word-builder/SpellPad.test.tsx`
Expected: PASS (all describe blocks).

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/games/word-builder/SpellPad.tsx src/games/word-builder/SpellPad.test.tsx
git commit -m "feat(word-builder): SpellPad modes B (distractors) and C (audio-only)"
```

---

### Task 10: Wire WordBuilder.tsx via useGameShell

**Files:**
- Modify: `src/games/word-builder/WordBuilder.tsx`

Replace the placeholder with the full game entry that uses the engine shell, the LevelGrid for select, SpellPad for play, and LevelResult.

- [ ] **Step 1: Replace WordBuilder.tsx**

Replace the entire content of `src/games/word-builder/WordBuilder.tsx` with:

```tsx
import { useMemo } from 'react';
import { useUserStore } from '../../stores/userStore';
import { LevelGrid, LevelResult, useGameShell } from '../_engine';
import { SpellPad } from './SpellPad';
import { WORDS_EN } from './data/words-en';
import { getLevelIndicesForAge, getPlayConfigForAge } from './config';
import type { AgeGroup } from '../../stores/userStore';

export function WordBuilder() {
  const ageGroup = useUserStore((s) => s.ageGroup);

  const poolForAge = useMemo(
    () => (age: AgeGroup | null) => getLevelIndicesForAge(age),
    [],
  );

  const shell = useGameShell({
    gameId: 'word-builder',
    lang: 'en',
    ageGroup,
    poolForAge,
  });

  const playConfig = getPlayConfigForAge(ageGroup);

  if (shell.state.kind === 'select') {
    return (
      <LevelGrid
        levelIndices={shell.levelIndices}
        progress={shell.progress}
        onPick={shell.startLevel}
        ariaLabelFor={(i) => WORDS_EN[i].text}
        renderCard={(i) => (
          <span className="font-display font-black text-2xl text-ink">{WORDS_EN[i].text}</span>
        )}
      />
    );
  }

  if (shell.state.kind === 'playing') {
    return (
      <SpellPad
        key={shell.state.levelIndex}
        word={WORDS_EN[shell.state.levelIndex]}
        config={playConfig}
        onComplete={shell.completeLevel}
      />
    );
  }

  if (shell.state.kind === 'result') {
    return (
      <LevelResult
        stars={shell.state.stars}
        hasNext={shell.hasNext}
        onNext={shell.next}
        onReplay={shell.replay}
        onBack={shell.goBack}
      />
    );
  }

  return null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/games/word-builder/WordBuilder.tsx
git commit -m "feat(word-builder): wire WordBuilder via engine shell"
```

---

### Task 11: WordBuilder integration tests

**Files:**
- Create: `src/games/word-builder/WordBuilder.test.tsx`

Model these on `LetterTapSound.test.tsx`: mock `useGameProgress`, set ageGroup via `useUserStore.setState`, drive through select → play → result flow.

- [ ] **Step 1: Write the integration tests**

Create `src/games/word-builder/WordBuilder.test.tsx`:
```tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TAP_FEEDBACK_MS } from '../_engine/timings';

const mocks = vi.hoisted(() => ({
  upsert: vi.fn().mockResolvedValue(undefined),
  progress: new Map<number, number>(),
  play: vi.fn(),
  speak: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    progress: mocks.progress,
    loading: false,
    error: null,
    upsert: mocks.upsert,
  }),
}));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: mocks.speak, speaking: false, supported: true }),
}));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import { WordBuilder } from './WordBuilder';
import { useUserStore } from '../../stores/userStore';
import { WORDS_AGE_3_4, WORDS_AGE_5_7, WORDS_AGE_8_10, WORDS_EN } from './data/words-en';

async function advance(kind: 'correct' | 'wrong') {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(TAP_FEEDBACK_MS[kind]);
  });
}

async function tapLetter(letter: string, kind: 'correct' | 'wrong' = 'correct') {
  fireEvent.click(screen.getByLabelText(`letter ${letter}`));
  await advance(kind);
}

beforeEach(() => {
  mocks.upsert.mockClear();
  mocks.play.mockClear();
  mocks.speak.mockClear();
  mocks.progress = new Map();
  useUserStore.setState({
    profile: { id: 'u1', displayName: null, avatarUrl: null },
    learnLang: 'en',
    ageGroup: '5-7',
  });
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  useUserStore.getState().reset();
});

describe('WordBuilder', () => {
  it('shows level select initially', () => {
    render(<WordBuilder />);
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });

  it('renders age-5-7 pool (20 cards) for age 5-7', () => {
    render(<WordBuilder />);
    expect(screen.getAllByTestId(/^level-card-/)).toHaveLength(20);
  });

  it('renders age-3-4 pool (8 cards) for age 3-4', () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    expect(screen.getAllByTestId(/^level-card-/)).toHaveLength(8);
  });

  it('starts a level when a card is tapped (3-4 mode A)', () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    // First age-3-4 word is CAT; level index is WORDS_EN.findIndex(w=>w.id==='cat')
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    expect(screen.getByTestId('spell-pad')).toBeInTheDocument();
    expect(screen.getByTestId('spell-word')).toHaveTextContent('CAT');
  });

  it('awards 3 stars for spelling CAT with 0 mistakes (age 3-4)', async () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    await tapLetter('C');
    await tapLetter('A');
    await tapLetter('T');
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(mocks.upsert).toHaveBeenCalledWith(catIndex, 3);
  });

  it('awards 2 stars for 1 mistake', async () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    await tapLetter('A', 'wrong'); // C expected, tap A first
    await tapLetter('C');
    await tapLetter('A');
    await tapLetter('T');
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(mocks.upsert).toHaveBeenCalledWith(catIndex, 2);
  });

  it('age 5-7 mode shows word + 2 distractors (5 tiles for CAT)', () => {
    // Switch to age 5-7 and pick a 3-letter word in its pool. Use FOX.
    useUserStore.setState({ ageGroup: '5-7' });
    render(<WordBuilder />);
    const foxIndex = WORDS_EN.findIndex((w) => w.id === 'fox');
    fireEvent.click(screen.getByTestId(`level-card-${foxIndex}`));
    expect(screen.getByTestId('spell-word')).toHaveTextContent('FOX');
    expect(screen.getAllByTestId('engine-tile')).toHaveLength(5);
  });

  it('age 8-10 mode does not show the word and speaks it on mount', () => {
    useUserStore.setState({ ageGroup: '8-10' });
    render(<WordBuilder />);
    const lionIndex = WORDS_EN.findIndex((w) => w.id === 'lion');
    fireEvent.click(screen.getByTestId(`level-card-${lionIndex}`));
    expect(screen.queryByTestId('spell-word')).not.toBeInTheDocument();
    expect(screen.getByTestId('spell-speaker')).toBeInTheDocument();
    expect(mocks.speak).toHaveBeenCalledWith('LION');
  });

  it('Back button returns to level select', async () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    await tapLetter('C'); await tapLetter('A'); await tapLetter('T');
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('result-back'));
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });

  it('preserves earned stars across an age-group switch (progress is not age-keyed)', async () => {
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    mocks.progress = new Map([[catIndex, 3]]);
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const card34 = screen.getByTestId(`level-card-${catIndex}`);
    expect(card34.querySelectorAll('svg')).toHaveLength(3);
    act(() => { useUserStore.setState({ ageGroup: '5-7' }); });
    // CAT isn't in the 5-7 pool, so card won't be visible — but we can verify
    // that the registry didn't lose progress by switching to 8-10 (also misses)
    // and back to 3-4.
    act(() => { useUserStore.setState({ ageGroup: '3-4' }); });
    await waitFor(() => {
      const card = screen.getByTestId(`level-card-${catIndex}`);
      expect(card.querySelectorAll('svg')).toHaveLength(3);
    });
  });
});
```

- [ ] **Step 2: Run integration tests**

Run: `npx vitest run src/games/word-builder/WordBuilder.test.tsx`
Expected: PASS (all). If `mocks.speak.toHaveBeenCalledWith('LION')` flakes because of `useSpeech` argument shape, relax to `expect(mocks.speak).toHaveBeenCalled()` and assert the first call arg separately.

- [ ] **Step 3: Run the entire suite**

Run: `npm run test`
Expected: PASS — Letter Tap unchanged, Word Builder green.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/games/word-builder/WordBuilder.test.tsx
git commit -m "test(word-builder): integration tests covering modes A/B/C, stars, navigation"
```

---

### Task 12: Hub flip — make Word Builder playable + translation keys

**Files:**
- Modify: `src/games/registry.ts`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/ar.json`

- [ ] **Step 1: Flip the registry entry**

In `src/games/registry.ts`, replace the existing `word-builder` entry (the one with `status: 'coming-soon'`) with:

```ts
  {
    id: 'word-builder',
    testIdSlug: 'word-builder',
    titleKey: 'landing.card_word_builder',
    subtitleKey: 'landing.card_age_5_7',
    primaryAge: '5-7',
    alsoGoodFor: ['8-10'],
    badge: { labelKey: 'landing.free_badge', tone: 'free' },
    bg: 'bg-cream',
    status: 'playable',
    route: '/game/word-builder',
  },
```

- [ ] **Step 2: Add the game name translation key in en.json**

In `src/i18n/en.json`, find the `"game"` object and add a `word_builder` entry alongside the existing `letter_tap_sound`:

```json
"game": {
  "letter_tap_sound": { "name": "Letter Tap" },
  "word_builder": { "name": "Word Builder" },
  ...
}
```

(Keep all other game.* keys intact — only add `word_builder`.)

- [ ] **Step 3: Add the same key in ar.json**

In `src/i18n/ar.json`, add to the `"game"` object:

```json
"word_builder": { "name": "بناء الكلمات" }
```

- [ ] **Step 4: Run full suite (hub + registry tests)**

Run: `npm run test`
Expected: PASS. Registry test count may shift if it asserts game count by status — update any assertion that hard-codes "1 playable" to "2 playable" if such an assertion exists.

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 6: Build to verify route resolves**

Run: `npm run build`
Expected: PASS. The Vite glob loader should pick up `src/games/word-builder/index.ts` automatically.

- [ ] **Step 7: Commit**

```bash
git add src/games/registry.ts src/i18n/en.json src/i18n/ar.json
git commit -m "feat(hub): flip Word Builder to playable + add translations"
```

---

### Task 13: Final verification + push

- [ ] **Step 1: Run the full check pipeline**

Run: `npm run test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 2: Smoke check the count**

Run: `npx vitest run --reporter=verbose 2>&1 | tail -20`
Expected: total test count = (previous count, ~249) + new tests (~5 stars + ~7 Tile + ~5 words-en + ~14 SpellPad + ~11 WordBuilder ≈ ~42 new), landing somewhere around 290+. Letter Tap count unchanged (62).

- [ ] **Step 3: Push master**

```bash
git push origin master
```

- [ ] **Step 4: Fast-forward main**

```bash
git checkout main && git merge --ff-only master && git push origin main && git checkout master
```

Expected: clean fast-forward; Railway auto-deploys.

---

## Self-review (controller note)

Run through the spec section-by-section before kicking off Task 1:

| Spec section | Covered by |
|--------------|-----------|
| Engine files (types, useGameShell, Tile, LevelGrid, LevelResult, timings, index) | Tasks 1, 3, 4, 5, 6 |
| Stars helper extracted | Task 2 |
| Letter Tap refactor with zero behavior change | Tasks 1–6 each end with full-suite PASS |
| Word Builder module layout | Task 7 |
| Mode A | Task 8 |
| Modes B + C | Task 9 |
| Engine consumption via useGameShell | Task 10 |
| Integration tests modeled on Letter Tap | Task 11 |
| Hub flip + translations | Task 12 |
| Word lists (8 / 20 / 20) | Task 7 |
| Curated words ship in code | Task 7 (lists are TS literals) |
| Final verification + Railway deploy | Task 13 |

Non-goals (Arabic Word Builder, plugin framework, new audio assets, locked-1/2) are not touched.

Type consistency check: `UseGameShellResult` defined in Task 6 is consumed in Tasks 6, 10 with matching property names (`state`, `progress`, `levelIndices`, `startLevel`, `completeLevel`, `next`, `replay`, `goBack`, `hasNext`). `PlayConfig` defined in Task 7 is consumed in Tasks 8, 9, 10 with same shape (`mode`, `extraDistractors`). `Word` defined in Task 7 is consumed in Tasks 8–11 with same shape (`id`, `text`).


