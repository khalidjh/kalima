# Letter Tap Juice Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a juice layer to Letter Tap — per-tap visual + audio feedback during quiz play and a staged level-complete celebration (cascading stars, fanfare, confetti) — while reusing the existing Howler-based sound infrastructure and respecting `prefers-reduced-motion`.

**Architecture:** Extend the existing `lib/sound.ts` SoundKey union with three rising-pitch `star_ping_*` chimes; add a leaf `useReducedMotion` hook; gate SFX through the existing `soundStore.muted` (exposed via a new "Sound effects" toggle row on Settings). `Quiz.tsx` gains a brief feedback state that delays `onCorrect`/`onWrong` and pulses/shakes the tapped tile while `useSound().play('correct'|'wrong')` fires. `LevelResult.tsx` runs a stars-first cascade on mount, plays one ping per revealed star, and on the LAST EARNED star's slot triggers a fanfare + a lazy-imported `canvas-confetti` burst + a mascot bounce. Reduced-motion variants drop scale/shake/confetti while audio is unchanged.

**Tech Stack:** React 19 + TypeScript + Vitest + Tailwind. Reuse: Howler (already installed) via `lib/sound.ts`, zustand `soundStore`, `useSound` hook. New dep: `canvas-confetti` (+ `@types/canvas-confetti`).

**Spec:** `docs/superpowers/specs/2026-05-23-letter-tap-juice-layer-design.md`

---

## File Structure

**Create:**
- `src/hooks/useReducedMotion.ts` — matchMedia wrapper with subscription, returns `boolean`.
- `src/hooks/useReducedMotion.test.tsx` — unit tests for the hook.
- `src/games/letter-tap-sound/timings.ts` — `TAP_FEEDBACK_MS`, `STAR_CASCADE_MS`, `CONFETTI_PARTICLES` constants.
- `src/lib/sound.test.ts` — registry test for SoundKey + SOURCES (covers existing + new keys).
- `public/sounds/README.md` — attribution + asset sourcing notes (assets themselves land separately).

**Modify:**
- `src/lib/sound.ts` — add `star_ping_1`, `star_ping_2`, `star_ping_3` to `SoundKey` and `SOURCES`.
- `src/pages/Settings.tsx` — add "Sound effects" toggle row wired to `soundStore.muted`.
- `src/pages/Settings.test.tsx` — assert toggle row presence and that click flips `soundStore.muted`.
- `src/i18n/locales/en.json` — add `settings.sound_effects` + `settings.sound_effects_on/off` strings.
- `src/i18n/locales/ar.json` — same keys in Arabic.
- `src/games/letter-tap-sound/Quiz.tsx` — feedback state, animation classes via `data-feedback`, `useSound().play`, delayed `onCorrect`/`onWrong`.
- `src/games/letter-tap-sound/Quiz.test.tsx` — fake timers; verify delay, double-tap lock, SFX calls, reduced-motion attr.
- `src/games/letter-tap-sound/LevelResult.tsx` — staggered cascade `useEffect`, lazy `canvas-confetti`, fanfare on last earned star, mascot bounce gate.
- `src/games/letter-tap-sound/LevelResult.test.tsx` — fake timers + Howler mock + canvas-confetti mock; cover 1/2/3 stars, reduced-motion, muted.
- `package.json` — `canvas-confetti` + `@types/canvas-confetti`.

Tasks are ordered so each leaves the repo in a green-tests state; assets are intentionally deferred (Howler silently no-ops missing files, so the game keeps functioning while juice plays silently for any unsourced key).

---

## Task 1: Extend `lib/sound.ts` with three star_ping keys

**Files:**
- Modify: `src/lib/sound.ts`
- Create: `src/lib/sound.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/sound.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('howler', () => ({
  Howl: vi.fn(function (this: { play: typeof mocks.play }) {
    this.play = mocks.play;
  }),
}));

import { getSound, playSound, __resetSoundCache, type SoundKey } from './sound';

const REQUIRED_KEYS: SoundKey[] = [
  'correct',
  'wrong',
  'session_complete',
  'button_tap',
  'level_up',
  'streak_milestone',
  'star_ping_1',
  'star_ping_2',
  'star_ping_3',
];

describe('lib/sound registry', () => {
  beforeEach(() => {
    mocks.play.mockClear();
    __resetSoundCache();
  });

  it.each(REQUIRED_KEYS)('has a Howl entry for %s', (key) => {
    const howl = getSound(key);
    expect(howl).toBeDefined();
  });

  it('caches per key (second getSound returns the same instance)', () => {
    const a = getSound('star_ping_1');
    const b = getSound('star_ping_1');
    expect(a).toBe(b);
  });

  it('playSound invokes Howl.play when not muted', () => {
    playSound('star_ping_2', false);
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it('playSound no-ops when muted', () => {
    playSound('star_ping_3', true);
    expect(mocks.play).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/sound.test.ts`
Expected: FAIL — `star_ping_1`, `star_ping_2`, `star_ping_3` are not assignable to `SoundKey` (TypeScript) or registry assertions fail.

- [ ] **Step 3: Extend the registry**

Edit `src/lib/sound.ts`: extend the `SoundKey` union and `SOURCES` map.

```ts
export type SoundKey =
  | 'correct'
  | 'wrong'
  | 'session_complete'
  | 'button_tap'
  | 'level_up'
  | 'streak_milestone'
  | 'star_ping_1'
  | 'star_ping_2'
  | 'star_ping_3';

// Asset paths are placeholders — actual files will be added in Phase 3
// (the game engine phase). The keys defined here are the contract.
const SOURCES: Record<SoundKey, string[]> = {
  correct: ['/sounds/correct.mp3'],
  wrong: ['/sounds/wrong.mp3'],
  session_complete: ['/sounds/session_complete.mp3'],
  button_tap: ['/sounds/button_tap.mp3'],
  level_up: ['/sounds/level_up.mp3'],
  streak_milestone: ['/sounds/streak_milestone.mp3'],
  star_ping_1: ['/sounds/star_ping_1.mp3'],
  star_ping_2: ['/sounds/star_ping_2.mp3'],
  star_ping_3: ['/sounds/star_ping_3.mp3'],
};
```

Leave the `cache`, `getSound`, `playSound`, `__resetSoundCache` functions unchanged.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/sound.test.ts`
Expected: PASS (4 tests + 9 `it.each` cases = 12 passing).

- [ ] **Step 5: Run the existing useSound test for regression**

Run: `npx vitest run src/hooks/useSound.test.tsx`
Expected: PASS (2 existing tests still green).

- [ ] **Step 6: Commit**

```bash
git add src/lib/sound.ts src/lib/sound.test.ts
git commit -m "feat(sound): add star_ping_1/2/3 keys to sound registry"
```

---

## Task 2: `useReducedMotion` hook

**Files:**
- Create: `src/hooks/useReducedMotion.ts`
- Create: `src/hooks/useReducedMotion.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useReducedMotion.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useReducedMotion } from './useReducedMotion';

type Listener = (e: { matches: boolean }) => void;

interface MockMQL {
  matches: boolean;
  media: string;
  addEventListener: (type: 'change', cb: Listener) => void;
  removeEventListener: (type: 'change', cb: Listener) => void;
}

let mql: MockMQL;
let listeners: Set<Listener>;

beforeEach(() => {
  listeners = new Set();
  mql = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_type, cb) => listeners.add(cb),
    removeEventListener: (_type, cb) => listeners.delete(cb),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  );
  // jsdom doesn't attach matchMedia by default; stub on window too.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => mql),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useReducedMotion', () => {
  it('returns false when the media query does not match', () => {
    mql.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the media query matches at mount', () => {
    mql.matches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    mql.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      mql.matches = true;
      listeners.forEach((cb) => cb({ matches: true }));
    });
    expect(result.current).toBe(true);
  });

  it('removes its listener on unmount', () => {
    mql.matches = false;
    const { unmount } = renderHook(() => useReducedMotion());
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/hooks/useReducedMotion.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useReducedMotion.ts`:

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(QUERY);
    const onChange = (e: { matches: boolean }) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/hooks/useReducedMotion.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReducedMotion.ts src/hooks/useReducedMotion.test.tsx
git commit -m "feat(hooks): add useReducedMotion media-query hook"
```

---

## Task 3: Timing constants

**Files:**
- Create: `src/games/letter-tap-sound/timings.ts`

Constants only — no tests (a test file would just re-assert the literals). Tests in later tasks import these constants so the values stay in one place.

- [ ] **Step 1: Create the constants module**

Create `src/games/letter-tap-sound/timings.ts`:

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

- [ ] **Step 2: Verify TypeScript accepts it**

Run: `npx tsc --noEmit`
Expected: clean (0 errors).

- [ ] **Step 3: Commit**

```bash
git add src/games/letter-tap-sound/timings.ts
git commit -m "feat(letter-tap): add juice-layer timing constants"
```

---

## Task 4: "Sound effects" toggle on Settings page

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ar.json`
- Modify: `src/pages/Settings.tsx`
- Modify: `src/pages/Settings.test.tsx`

- [ ] **Step 1: Add the i18n strings**

Edit `src/i18n/locales/en.json` — inside the existing `"settings"` object, add three keys:

```json
"sound_effects": "Sound effects",
"sound_effects_on": "On",
"sound_effects_off": "Off"
```

Edit `src/i18n/locales/ar.json` — same keys, Arabic values:

```json
"sound_effects": "المؤثرات الصوتية",
"sound_effects_on": "تشغيل",
"sound_effects_off": "إيقاف"
```

(Match the order/style of the other `settings.*` keys.)

- [ ] **Step 2: Write the failing tests**

Append to `src/pages/Settings.test.tsx`:

```tsx
// Top of file — add to existing imports
import { useSoundStore } from '../stores/soundStore';

// Inside the existing describe('Settings', ...) — add two tests:
it('renders the sound-effects toggle reflecting the current muted state', () => {
  useSoundStore.setState({ muted: false });
  render(<MemoryRouter><Settings /></MemoryRouter>);
  expect(screen.getByTestId('toggle-sfx')).toHaveTextContent(/on/i);
});

it('flips soundStore.muted when the sound-effects toggle is clicked', async () => {
  useSoundStore.setState({ muted: false });
  render(<MemoryRouter><Settings /></MemoryRouter>);
  await userEvent.click(screen.getByTestId('toggle-sfx'));
  expect(useSoundStore.getState().muted).toBe(true);
  await userEvent.click(screen.getByTestId('toggle-sfx'));
  expect(useSoundStore.getState().muted).toBe(false);
});
```

Also add `useSoundStore.setState({ muted: false });` inside the existing `beforeEach` so test isolation holds.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/pages/Settings.test.tsx`
Expected: FAIL — `toggle-sfx` not found.

- [ ] **Step 4: Add the toggle to Settings.tsx**

Edit `src/pages/Settings.tsx`:

1. Add an import at the top:

```tsx
import { useSoundStore } from '../stores/soundStore';
```

2. Inside the component body (with the other store selectors), read the muted flag and the toggle action:

```tsx
const muted = useSoundStore((s) => s.muted);
const toggleMuted = useSoundStore((s) => s.toggle);
```

3. Render a new `Button` row alongside the existing toggles (e.g., directly after `toggle-ui-lang`):

```tsx
<Button variant="secondary" data-testid="toggle-sfx" onClick={toggleMuted}>
  {t('settings.sound_effects')}: {muted ? t('settings.sound_effects_off') : t('settings.sound_effects_on')}
</Button>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/pages/Settings.test.tsx`
Expected: PASS (all existing tests + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Settings.tsx src/pages/Settings.test.tsx src/i18n/locales/en.json src/i18n/locales/ar.json
git commit -m "feat(settings): add Sound effects toggle wired to soundStore"
```

---

## Task 5: Quiz tap feedback (visual + SFX + delays)

**Files:**
- Modify: `src/games/letter-tap-sound/Quiz.tsx`
- Modify: `src/games/letter-tap-sound/Quiz.test.tsx`

The Quiz holds a local `feedback` state. On tile click it sets the state, calls `useSound().play('correct'|'wrong')`, and schedules `onCorrect`/`onWrong` to fire after the per-kind delay. Re-taps during the feedback window are ignored.

- [ ] **Step 1: Write the failing tests**

Replace the file body of `src/games/letter-tap-sound/Quiz.test.tsx` so the mocks include `useSound` and the existing test block uses fake timers. Add new tests for feedback behavior. Full file:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TAP_FEEDBACK_MS } from './timings';

const mocks = vi.hoisted(() => ({
  dispatchSpeak: vi.fn().mockResolvedValue(undefined),
  useSpeech: vi.fn(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    speaking: false,
    supported: true,
  })),
  play: vi.fn(),
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('./audio/speak', () => ({ dispatchSpeak: mocks.dispatchSpeak }));
vi.mock('../../hooks/useSpeech', () => ({ useSpeech: mocks.useSpeech }));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));

import { Quiz } from './Quiz';
import type { Letter } from '../../types/game';

const target: Letter = { char: 'ا', name: 'alif', audio_key: 'alif' };
const distractors: Letter[] = [
  { char: 'ب', name: 'baa', audio_key: 'baa' },
  { char: 'ت', name: 'taa', audio_key: 'taa' },
  { char: 'ث', name: 'thaa', audio_key: 'thaa' },
];

beforeEach(() => {
  mocks.dispatchSpeak.mockClear();
  mocks.play.mockClear();
  mocks.useReducedMotion.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Quiz', () => {
  it('renders 4 tiles', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    expect(screen.getAllByTestId('quiz-tile')).toHaveLength(4);
  });

  it('plays audio on mount', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    expect(mocks.dispatchSpeak).toHaveBeenCalledWith('alif', 'ar', expect.any(Function));
  });

  it('replays audio when speaker tapped', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    mocks.dispatchSpeak.mockClear();
    fireEvent.click(screen.getByTestId('quiz-speaker'));
    expect(mocks.dispatchSpeak).toHaveBeenCalledOnce();
  });

  it('marks the tapped target tile with data-feedback="correct" and plays the correct SFX', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    expect(screen.getByLabelText('alif')).toHaveAttribute('data-feedback', 'correct');
    expect(mocks.play).toHaveBeenCalledWith('correct');
  });

  it('delays onCorrect by TAP_FEEDBACK_MS.correct', () => {
    const onCorrect = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    expect(onCorrect).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct);
    });
    expect(onCorrect).toHaveBeenCalledOnce();
  });

  it('marks a wrong tile with data-feedback="wrong" and plays the wrong SFX', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('baa'));
    expect(screen.getByLabelText('baa')).toHaveAttribute('data-feedback', 'wrong');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });

  it('delays onWrong by TAP_FEEDBACK_MS.wrong', () => {
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={onWrong} />);
    fireEvent.click(screen.getByLabelText('baa'));
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.wrong - 1);
    });
    expect(onWrong).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onWrong).toHaveBeenCalledOnce();
  });

  it('ignores a second tap during the feedback window', () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={onWrong} />);
    fireEvent.click(screen.getByLabelText('alif'));
    fireEvent.click(screen.getByLabelText('baa')); // ignored — feedback in flight
    expect(mocks.play).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct);
    });
    expect(onCorrect).toHaveBeenCalledOnce();
    expect(onWrong).not.toHaveBeenCalled();
  });

  it('does not fire onCorrect if the component unmounts mid-feedback', () => {
    const onCorrect = vi.fn();
    const { unmount } = render(
      <Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={() => {}} />,
    );
    fireEvent.click(screen.getByLabelText('alif'));
    unmount();
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct + 50);
    });
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('sets data-reduced-motion="true" on the tile when reduced motion is active', () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    const tile = screen.getByLabelText('alif');
    expect(tile).toHaveAttribute('data-feedback', 'correct');
    expect(tile).toHaveAttribute('data-reduced-motion', 'true');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/games/letter-tap-sound/Quiz.test.tsx`
Expected: FAIL — feedback attribute missing; onCorrect fires synchronously; etc.

- [ ] **Step 3: Implement the feedback logic in Quiz.tsx**

Replace `src/games/letter-tap-sound/Quiz.tsx` with:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dispatchSpeak } from './audio/speak';
import { useSpeech } from '../../hooks/useSpeech';
import { useSound } from '../../hooks/useSound';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TAP_FEEDBACK_MS } from './timings';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

interface QuizProps {
  target: Letter;
  choices: Letter[];
  lang: Lang;
  onCorrect: () => void;
  onWrong: () => void;
}

type Feedback = { char: string; kind: 'correct' | 'wrong' } | null;

export function Quiz({ target, choices, lang, onCorrect, onWrong }: QuizProps) {
  const { t } = useTranslation();
  const { speak } = useSpeech();
  const { play } = useSound();
  const reducedMotion = useReducedMotion();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<number | null>(null);

  const playPrompt = useCallback(() => {
    void dispatchSpeak(target.audio_key, lang, speak);
  }, [target, lang, speak]);

  useEffect(() => {
    playPrompt();
  }, [playPrompt]);

  // Cancel any pending feedback-completion timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleTileClick = (c: Letter) => {
    if (feedback !== null) return; // feedback window lock
    const kind: 'correct' | 'wrong' = c.char === target.char ? 'correct' : 'wrong';
    setFeedback({ char: c.char, kind });
    play(kind);
    const delay = TAP_FEEDBACK_MS[kind];
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setFeedback(null);
      if (kind === 'correct') onCorrect();
      else onWrong();
    }, delay);
  };

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
        {choices.map((c) => {
          const isThisTile = feedback?.char === c.char;
          const dataFeedback = isThisTile ? feedback.kind : undefined;
          return (
            <button
              key={c.char}
              type="button"
              data-testid="quiz-tile"
              data-feedback={dataFeedback}
              data-reduced-motion={isThisTile && reducedMotion ? 'true' : undefined}
              aria-label={c.name}
              className={[
                'font-display font-black text-5xl text-ink bg-white border-4 border-ink rounded-2xl shadow-pop w-24 h-24 flex items-center justify-center transition-all',
                // Default (motion-on) feedback styles
                'data-[feedback=correct]:scale-110 data-[feedback=correct]:border-mint',
                'data-[feedback=wrong]:animate-shake data-[feedback=wrong]:border-tomato',
                // Reduced-motion overrides
                'data-[reduced-motion=true]:scale-100 data-[reduced-motion=true]:animate-none',
                'data-[reduced-motion=true]:data-[feedback=correct]:bg-mint/40',
                'data-[reduced-motion=true]:data-[feedback=wrong]:bg-tomato/40',
                // Press effect when idle
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
              ].join(' ')}
              onClick={() => handleTileClick(c)}
            >
              {c.char}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

Notes for the implementer:
- Use `window.setTimeout` (DOM lib) so the return type is `number`, not Node's `Timeout`.
- The Tailwind `animate-shake` keyframe is referenced below — if it isn't already defined in `tailwind.config.js`, add it. Quick check: search the config for `shake`; if missing, add a keyframe + animation:

```js
// tailwind.config.js — inside theme.extend
keyframes: {
  shake: {
    '0%,100%': { transform: 'translateX(0)' },
    '20%': { transform: 'translateX(-6px)' },
    '40%': { transform: 'translateX(6px)' },
    '60%': { transform: 'translateX(-4px)' },
    '80%': { transform: 'translateX(4px)' },
  },
},
animation: {
  shake: 'shake 400ms ease-in-out',
},
```

- `mint` / `tomato` / `sunny` / `accent` brand colors should already exist in `tailwind.config.js` (used elsewhere in the codebase — verify by searching). If `mint` doesn't exist, use the closest green that's already defined (e.g., the color used for the correct/success state on existing components).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/games/letter-tap-sound/Quiz.test.tsx`
Expected: PASS (all 11 tests).

- [ ] **Step 5: Run the full LetterTapSound integration test for regression**

Run: `npx vitest run src/games/letter-tap-sound/LetterTapSound.test.tsx`
Expected: PASS. If a test that previously expected `onCorrect`/`onWrong` to fire synchronously fails, wrap the test's tile click with `vi.useFakeTimers()` + `vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct|wrong)`. Update those tests in place.

- [ ] **Step 6: Commit**

```bash
git add src/games/letter-tap-sound/Quiz.tsx src/games/letter-tap-sound/Quiz.test.tsx src/games/letter-tap-sound/LetterTapSound.test.tsx tailwind.config.js
git commit -m "feat(letter-tap): add per-tap juice (visual + SFX with reduced-motion fallback)"
```

(If `tailwind.config.js` didn't need a change, drop it from the `add`.)

---

## Task 6: Install `canvas-confetti`

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the runtime dep and its types**

Run: `npm install canvas-confetti && npm install --save-dev @types/canvas-confetti`
Expected: both added; lockfile updated.

- [ ] **Step 2: Verify the import resolves**

Run: `npx tsc --noEmit -e "import confetti from 'canvas-confetti'; void confetti;"` is awkward — instead, verify by trial import in the next task. For now: just check `package.json` lists `canvas-confetti` under `dependencies` and `@types/canvas-confetti` under `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add canvas-confetti for level-complete celebration"
```

---

## Task 7: LevelResult cascade + confetti + fanfare

**Files:**
- Modify: `src/games/letter-tap-sound/LevelResult.tsx`
- Modify: `src/games/letter-tap-sound/LevelResult.test.tsx`

The cascade reveals 1, 2, or 3 stars at offsets `STAR_CASCADE_MS[0..N-1]`. At the LAST EARNED star's slot, a fanfare + confetti + mascot bounce fire. Star 1 is rendered synchronously (no timer). The `canvas-confetti` import is lazy via dynamic `import()`, wrapped in try/catch so a load failure logs in dev and skips confetti without breaking the rest.

- [ ] **Step 1: Write the failing tests**

Replace `src/games/letter-tap-sound/LevelResult.test.tsx` with:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { STAR_CASCADE_MS } from './timings';

const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  confetti: vi.fn(),
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));
vi.mock('canvas-confetti', () => ({
  default: (opts: unknown) => mocks.confetti(opts),
}));

import { LevelResult } from './LevelResult';

async function flushDynamicImports() {
  // Allow the awaited dynamic import("canvas-confetti") promise to resolve.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  mocks.play.mockClear();
  mocks.confetti.mockClear();
  mocks.useReducedMotion.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LevelResult cascade — 3 stars', () => {
  it('reveals star 1 synchronously and plays star_ping_1', () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    const revealed = screen.getAllByTestId('star-filled').filter((el) => el.dataset.revealed === 'true');
    expect(revealed).toHaveLength(1);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_1');
  });

  it('reveals star 2 at t=350 with star_ping_2', () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[1]);
    });
    const revealed = screen.getAllByTestId('star-filled').filter((el) => el.dataset.revealed === 'true');
    expect(revealed).toHaveLength(2);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_2');
  });

  it('reveals star 3 + fanfare + confetti at t=700', async () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[2]);
    });
    await flushDynamicImports();
    const revealed = screen.getAllByTestId('star-filled').filter((el) => el.dataset.revealed === 'true');
    expect(revealed).toHaveLength(3);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_3');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).toHaveBeenCalledOnce();
  });
});

describe('LevelResult cascade — 2 stars (climax at last earned slot)', () => {
  it('fires fanfare + confetti at t=350 (not t=700)', async () => {
    render(<LevelResult stars={2} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_1');
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[1]);
    });
    await flushDynamicImports();
    expect(mocks.play).toHaveBeenCalledWith('star_ping_2');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).toHaveBeenCalledOnce();
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[2] - STAR_CASCADE_MS[1] + 100);
    });
    expect(mocks.play).not.toHaveBeenCalledWith('star_ping_3');
    expect(mocks.confetti).toHaveBeenCalledOnce(); // not a second time
  });
});

describe('LevelResult cascade — 1 star (climax synchronous)', () => {
  it('fires star_ping_1 + level_up + confetti on mount', async () => {
    render(<LevelResult stars={1} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    await flushDynamicImports();
    expect(mocks.play).toHaveBeenCalledWith('star_ping_1');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).toHaveBeenCalledOnce();
  });
});

describe('LevelResult — reduced motion', () => {
  it('skips confetti at the climax but still plays fanfare + pings', async () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[2]);
    });
    await flushDynamicImports();
    expect(mocks.play).toHaveBeenCalledWith('star_ping_3');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).not.toHaveBeenCalled();
  });
});

describe('LevelResult — buttons still work', () => {
  it('renders earned stars (1)', () => {
    render(<LevelResult stars={1} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(1);
    expect(screen.getAllByTestId('star-empty')).toHaveLength(2);
  });

  it('Next button calls onNext when hasNext', () => {
    const onNext = vi.fn();
    render(<LevelResult stars={2} onNext={onNext} onReplay={() => {}} onBack={() => {}} hasNext />);
    fireEvent.click(screen.getByTestId('result-next'));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('Next button hidden when !hasNext', () => {
    render(<LevelResult stars={2} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext={false} />);
    expect(screen.queryByTestId('result-next')).toBeNull();
  });

  it('Replay button calls onReplay', () => {
    const onReplay = vi.fn();
    render(<LevelResult stars={2} onNext={() => {}} onReplay={onReplay} onBack={() => {}} hasNext />);
    fireEvent.click(screen.getByTestId('result-replay'));
    expect(onReplay).toHaveBeenCalledOnce();
  });

  it('Back button calls onBack', () => {
    const onBack = vi.fn();
    render(<LevelResult stars={2} onNext={() => {}} onReplay={() => {}} onBack={onBack} hasNext />);
    fireEvent.click(screen.getByTestId('result-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/games/letter-tap-sound/LevelResult.test.tsx`
Expected: FAIL — most cascade tests fail; only the button + stars-count tests still pass.

- [ ] **Step 3: Implement the cascade in LevelResult.tsx**

Replace `src/games/letter-tap-sound/LevelResult.tsx` with:

```tsx
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

  // How many stars are currently revealed. Star at index 0 reveals
  // synchronously on first paint; later stars reveal via setTimeout.
  const [revealed, setRevealed] = useState<number>(stars > 0 ? 1 : 0);
  // Whether the mascot should play its bounce animation (gated on climax + motion).
  const [climaxed, setClimaxed] = useState<boolean>(false);

  useEffect(() => {
    const earned = Math.max(0, Math.min(3, stars));
    if (earned === 0) return;

    // The pings/fanfare/confetti tied to star index `i` (0-based).
    // The climax (level_up + confetti + mascot bounce) fires at the LAST earned star.
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

    // Slot 0 runs synchronously on mount.
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
    // Run once per mount per `stars` value. Capturing `play`/`reducedMotion`
    // by reference is fine — they're stable for the lifetime of the screen.
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
                  // Default motion: spring scale on reveal
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

Notes for the implementer:
- The `Mascot` component supports `'idle' | 'success' | 'fail'` moods. We render `idle` before climax and `success` after. If the existing `Mascot` doesn't have an `idle` mood, just always render `mood="success"` — the `animate-bounce` Tailwind class on success is what gives the bounce; gating the bounce via CSS instead is also acceptable. Verify which approach matches the existing `Mascot.tsx` API and pick the simpler one.
- The `data-revealed` attribute is what tests assert on. Make sure it's `"true"` (string) or `"false"`, not boolean.
- The dynamic `import('canvas-confetti')` is what gives us code-splitting; if it weren't dynamic, the ~14KB would land in the entry chunk.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/games/letter-tap-sound/LevelResult.test.tsx`
Expected: PASS (16 tests total: 3 three-star, 1 two-star, 1 one-star, 1 reduced-motion, 5 button-regression, plus the iterations).

- [ ] **Step 5: Run the broader LetterTapSound integration test for regression**

Run: `npx vitest run src/games/letter-tap-sound/`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/games/letter-tap-sound/LevelResult.tsx src/games/letter-tap-sound/LevelResult.test.tsx
git commit -m "feat(letter-tap): cascade stars + fanfare + lazy confetti on level result"
```

---

## Task 8: Asset attribution scaffold

**Files:**
- Create: `public/sounds/README.md`

The audio files themselves are sourced separately (CC0 from freesound.org; Khalid picks candidates before they land). Howler silently no-ops when an asset 404s, so the feature ships green without the files; this task creates the directory + an attribution scaffold so future asset commits have a home.

- [ ] **Step 1: Create the directory + README**

Run: `mkdir -p public/sounds`

Create `public/sounds/README.md` with the following content:

```markdown
# Sound assets

All audio files in this directory are **CC0** (public domain) unless otherwise noted, sourced from [freesound.org](https://freesound.org).

| File | Description | Length | Source URL | Author |
|---|---|---|---|---|
| `correct.mp3` | Short positive ding | ~150ms | _TBD_ | _TBD_ |
| `wrong.mp3` | Short gentle negative blip | ~200ms | _TBD_ | _TBD_ |
| `star_ping_1.mp3` | Low-pitch chime | ~250ms | _TBD_ | _TBD_ |
| `star_ping_2.mp3` | Mid-pitch chime | ~250ms | _TBD_ | _TBD_ |
| `star_ping_3.mp3` | High-pitch chime | ~250ms | _TBD_ | _TBD_ |
| `level_up.mp3` | Fanfare on level complete | ~1.5–2.5s, ≤80KB | _TBD_ | _TBD_ |

When adding a new asset:
1. Confirm the licence on freesound.org is CC0.
2. Fill in the row above with the source URL and author.
3. Re-encode to mp3 if necessary (target ≤80KB for fanfare, ≤30KB for short SFX).
```

- [ ] **Step 2: Commit**

```bash
git add public/sounds/README.md
git commit -m "docs(sounds): scaffold attribution README for juice-layer assets"
```

---

## Task 9: Full verify + push to master + main

**Files:** none (verification + git only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all green. If any test fails, investigate before proceeding.

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run the lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 4: Build the production bundle**

Run: `npm run build`
Expected: build succeeds; `canvas-confetti` appears in a separate chunk (not the entry bundle).

- [ ] **Step 5: Push to master**

```bash
git push origin master
```

- [ ] **Step 6: Fast-forward main and push**

```bash
git checkout main
git merge --ff-only master
git push origin main
git checkout master
```

Expected: Railway auto-deploys main. Open https://kalima.fun, finish a level, confirm the cascade + buttons work (sound will be silent until assets land — this is expected).

---

## Notes for the implementer

- **Reviewer caught real bugs in the previous feature.** Don't trust your own self-report — run the full suite (`npm test`), don't just run the file you touched.
- **The Tailwind `animate-shake` keyframe may need to be added** to `tailwind.config.js` (see Task 5 step 3 notes). Check first; only edit the config if the keyframe doesn't already exist.
- **`mint` / `tomato` brand colors:** the spec assumes they exist. Grep `tailwind.config.js` for `mint` and `tomato` — if either is missing, use the closest existing color in the palette (or coordinate with Khalid).
- **Assets are deferred.** The feature ships green without them; the README scaffold in Task 8 is the home for future entries.
- **Don't import `canvas-confetti` statically anywhere** — that defeats the code-splitting goal. Always `await import('canvas-confetti')` inside the function that fires it.
- **Mock pattern reference:** the existing `src/hooks/useSound.test.tsx` shows the canonical Howler mock pattern using `vi.hoisted` + a constructor function. Reuse it.
