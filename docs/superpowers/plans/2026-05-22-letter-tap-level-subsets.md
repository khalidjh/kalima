# Letter Tap Level Subsets per Age — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Letter Tap renders a per-age subset of letters in LevelSelect and adjusts choice count per round (2/4/6 tiles) based on the user's age bucket; no data migration, full backward compatibility when ageGroup is null.

**Architecture:** Single new declarative module (`config.ts`) exposes pure `(lang, age) → number[]` and `age → number` lookups against the existing alphabetical `LETTERS_AR` / `LETTERS_EN` arrays. `LetterTapSound.tsx` reads `ageGroup` from `useUserStore`, derives `levelIndices` and `choiceCount`, and passes them down. `LevelSelect.tsx` iterates over `levelIndices` instead of the full array. `buildChoices` / `pickDistractors` now take both the choice count and the age-restricted pool so distractors stay inside the child's known letters.

**Tech Stack:** TypeScript, React 19, Vitest, @testing-library/react, Tailwind, Zustand (`useUserStore`).

**Spec:** `docs/superpowers/specs/2026-05-22-letter-tap-level-subsets-design.md`

---

## File Structure

**New files:**
- `src/games/letter-tap-sound/config.ts` — `LEVEL_INDICES_FOR_AGE`, `CHOICES_FOR_AGE`, `DEFAULT_CHOICE_COUNT`, `getLevelIndicesForAge(lang, age)`, `getChoiceCountForAge(age)`. Pure data + helpers. No React imports.
- `src/games/letter-tap-sound/config.test.ts` — unit tests covering all `(lang, age)` combinations, null fallback, and the invariant `pool.length >= choiceCount`.

**Modified files:**
- `src/games/letter-tap-sound/LetterTapSound.tsx` — read `ageGroup`, derive `levelIndices` + `choiceCount`, restructure `buildChoices` / `pickDistractors` signatures, pass `levelIndices` down to `LevelSelect`.
- `src/games/letter-tap-sound/LevelSelect.tsx` — accept new `levelIndices: number[]` prop; iterate that instead of `letters.map`.
- `src/games/letter-tap-sound/LetterTapSound.test.tsx` — extend with three new test cases (3-4 grid size, 8-10 choice count, null ageGroup full-alphabet fallback). Existing tests remain green by virtue of the null-ageGroup fallback.

**Frozen / out of scope:**
- `LETTERS_AR`, `LETTERS_EN`, `useGameProgress`, `Quiz.tsx`, `LevelResult.tsx`, `game_progress` schema, `src/games/registry.ts`, all i18n strings.

---

## Task 1: Pure config module + unit tests

**Files:**
- Create: `src/games/letter-tap-sound/config.ts`
- Create: `src/games/letter-tap-sound/config.test.ts`

- [ ] **Step 1: Write the failing tests**

Write `src/games/letter-tap-sound/config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  CHOICES_FOR_AGE,
  DEFAULT_CHOICE_COUNT,
  LEVEL_INDICES_FOR_AGE,
  getChoiceCountForAge,
  getLevelIndicesForAge,
} from './config';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import type { AgeGroup } from '../../stores/userStore';

const AGES: AgeGroup[] = ['3-4', '5-7', '8-10'];

describe('LEVEL_INDICES_FOR_AGE', () => {
  it('Arabic 3-4 pool maps to ا ب ت د س ل م ن', () => {
    const chars = LEVEL_INDICES_FOR_AGE.ar['3-4'].map((i) => LETTERS_AR[i].char);
    expect(chars).toEqual(['ا', 'ب', 'ت', 'د', 'س', 'ل', 'م', 'ن']);
  });

  it('English 3-4 pool maps to A D I M N P S T', () => {
    const chars = LEVEL_INDICES_FOR_AGE.en['3-4'].map((i) => LETTERS_EN[i].char);
    expect(chars).toEqual(['A', 'D', 'I', 'M', 'N', 'P', 'S', 'T']);
  });

  it('Arabic 5-7 and 8-10 are the full 28-letter alphabet', () => {
    const full = Array.from({ length: 28 }, (_, i) => i);
    expect(LEVEL_INDICES_FOR_AGE.ar['5-7']).toEqual(full);
    expect(LEVEL_INDICES_FOR_AGE.ar['8-10']).toEqual(full);
  });

  it('English 5-7 and 8-10 are the full 26-letter alphabet', () => {
    const full = Array.from({ length: 26 }, (_, i) => i);
    expect(LEVEL_INDICES_FOR_AGE.en['5-7']).toEqual(full);
    expect(LEVEL_INDICES_FOR_AGE.en['8-10']).toEqual(full);
  });

  it('every (lang, age) index list contains no duplicates and stays in range', () => {
    for (const lang of ['ar', 'en'] as const) {
      const maxIdx = lang === 'ar' ? 28 : 26;
      for (const age of AGES) {
        const indices = LEVEL_INDICES_FOR_AGE[lang][age];
        expect(new Set(indices).size).toBe(indices.length);
        for (const i of indices) {
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).toBeLessThan(maxIdx);
        }
      }
    }
  });
});

describe('CHOICES_FOR_AGE', () => {
  it('scales 2 / 4 / 6 across the three buckets', () => {
    expect(CHOICES_FOR_AGE['3-4']).toBe(2);
    expect(CHOICES_FOR_AGE['5-7']).toBe(4);
    expect(CHOICES_FOR_AGE['8-10']).toBe(6);
  });

  it('default fallback is 4 (current shipped behavior)', () => {
    expect(DEFAULT_CHOICE_COUNT).toBe(4);
  });
});

describe('getLevelIndicesForAge', () => {
  it('returns the bucket-specific list for known ages', () => {
    expect(getLevelIndicesForAge('ar', '3-4')).toEqual([0, 1, 2, 7, 11, 22, 23, 24]);
    expect(getLevelIndicesForAge('en', '3-4')).toEqual([0, 3, 8, 12, 13, 15, 18, 19]);
  });

  it('returns the full alphabet when age is null', () => {
    expect(getLevelIndicesForAge('ar', null)).toHaveLength(28);
    expect(getLevelIndicesForAge('en', null)).toHaveLength(26);
    expect(getLevelIndicesForAge('ar', null)).toEqual(Array.from({ length: 28 }, (_, i) => i));
  });
});

describe('getChoiceCountForAge', () => {
  it('returns 2 / 4 / 6 for known ages', () => {
    expect(getChoiceCountForAge('3-4')).toBe(2);
    expect(getChoiceCountForAge('5-7')).toBe(4);
    expect(getChoiceCountForAge('8-10')).toBe(6);
  });

  it('returns DEFAULT_CHOICE_COUNT when age is null', () => {
    expect(getChoiceCountForAge(null)).toBe(4);
  });
});

describe('pool/choice invariant', () => {
  it('every (lang, age) pool has more letters than its choice count', () => {
    for (const lang of ['ar', 'en'] as const) {
      for (const age of AGES) {
        const pool = LEVEL_INDICES_FOR_AGE[lang][age];
        const choices = CHOICES_FOR_AGE[age];
        // Need at least `choices` letters total (target + distractors) — strictly,
        // pool.length must be >= choices so distractor selection never starves.
        expect(pool.length).toBeGreaterThanOrEqual(choices);
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/games/letter-tap-sound/config.test.ts`
Expected: FAIL — `Cannot find module './config'` or equivalent module-not-found error on every test.

- [ ] **Step 3: Write minimal implementation**

Create `src/games/letter-tap-sound/config.ts`:

```ts
import type { AgeGroup, Lang } from '../../stores/userStore';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';

const allIndices = (length: number): number[] =>
  Array.from({ length }, (_, i) => i);

export const LEVEL_INDICES_FOR_AGE: Record<Lang, Record<AgeGroup, number[]>> = {
  ar: {
    '3-4': [0, 1, 2, 7, 11, 22, 23, 24], // ا ب ت د س ل م ن
    '5-7': allIndices(LETTERS_AR.length),
    '8-10': allIndices(LETTERS_AR.length),
  },
  en: {
    '3-4': [0, 3, 8, 12, 13, 15, 18, 19], // A D I M N P S T
    '5-7': allIndices(LETTERS_EN.length),
    '8-10': allIndices(LETTERS_EN.length),
  },
};

export const CHOICES_FOR_AGE: Record<AgeGroup, number> = {
  '3-4': 2,
  '5-7': 4,
  '8-10': 6,
};

export const DEFAULT_CHOICE_COUNT = 4;

export function getLevelIndicesForAge(
  lang: Lang,
  age: AgeGroup | null,
): number[] {
  if (age === null) {
    return allIndices(lang === 'ar' ? LETTERS_AR.length : LETTERS_EN.length);
  }
  return LEVEL_INDICES_FOR_AGE[lang][age];
}

export function getChoiceCountForAge(age: AgeGroup | null): number {
  return age === null ? DEFAULT_CHOICE_COUNT : CHOICES_FOR_AGE[age];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/games/letter-tap-sound/config.test.ts`
Expected: PASS — all 11 test cases green.

- [ ] **Step 5: Commit**

```bash
cd /home/khalid/workspace/kids-learning
git add src/games/letter-tap-sound/config.ts src/games/letter-tap-sound/config.test.ts
git commit -m "feat(letter-tap): per-age letter pools and choice counts in config module"
```

---

## Task 2: Wire ageGroup into LetterTapSound + LevelSelect

**Files:**
- Modify: `src/games/letter-tap-sound/LevelSelect.tsx` — accept `levelIndices` prop, iterate it instead of full array.
- Modify: `src/games/letter-tap-sound/LetterTapSound.tsx` — read ageGroup, derive levelIndices + choiceCount, restructure choice helpers, pass props.
- Modify: `src/games/letter-tap-sound/LetterTapSound.test.tsx` — add three new test cases.

- [ ] **Step 1: Write the new failing tests**

Append these three tests to `src/games/letter-tap-sound/LetterTapSound.test.tsx`, immediately before the closing `});` of the outer `describe('LetterTapSound', …)` block:

```tsx
  it('renders only the age 3-4 starter pool (8 tiles) when ageGroup is 3-4 in Arabic', () => {
    useUserStore.setState({
      profile: { id: 'u1', displayName: null, avatarUrl: null },
      learnLang: 'ar',
      ageGroup: '3-4',
    });
    render(<LetterTapSound />);
    const tiles = screen.getAllByTestId(/^level-card-/);
    expect(tiles).toHaveLength(8);
    // Stable testid keying = full-alphabet index, so the first card is ا (index 0)
    expect(screen.getByTestId('level-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('level-card-7')).toBeInTheDocument(); // د
    expect(screen.getByTestId('level-card-24')).toBeInTheDocument(); // ن
    // Out-of-bucket letter ث (index 3) is not rendered
    expect(screen.queryByTestId('level-card-3')).not.toBeInTheDocument();
  });

  it('shows 6 quiz tiles per round when ageGroup is 8-10', () => {
    useUserStore.setState({
      profile: { id: 'u1', displayName: null, avatarUrl: null },
      learnLang: 'ar',
      ageGroup: '8-10',
    });
    render(<LetterTapSound />);
    fireEvent.click(screen.getByTestId('level-card-0'));
    expect(screen.getAllByTestId('quiz-tile')).toHaveLength(6);
  });

  it('shows 2 quiz tiles per round when ageGroup is 3-4', () => {
    useUserStore.setState({
      profile: { id: 'u1', displayName: null, avatarUrl: null },
      learnLang: 'ar',
      ageGroup: '3-4',
    });
    render(<LetterTapSound />);
    fireEvent.click(screen.getByTestId('level-card-0'));
    expect(screen.getAllByTestId('quiz-tile')).toHaveLength(2);
  });

  it('falls back to full alphabet and 4 choices when ageGroup is null', () => {
    useUserStore.setState({
      profile: { id: 'u1', displayName: null, avatarUrl: null },
      learnLang: 'ar',
      ageGroup: null,
    });
    render(<LetterTapSound />);
    expect(screen.getAllByTestId(/^level-card-/)).toHaveLength(28);
    fireEvent.click(screen.getByTestId('level-card-0'));
    expect(screen.getAllByTestId('quiz-tile')).toHaveLength(4);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/games/letter-tap-sound/LetterTapSound.test.tsx`
Expected: FAIL — four new tests fail. The 8-tile test fails because `LevelSelect` still renders 28 (full array). The 6-tile and 2-tile tests fail because `Quiz` still renders 4 tiles. The null fallback passes accidentally for the 28-tile + 4-tile assertions (this is fine — it's the contract).

- [ ] **Step 3: Update `LevelSelect.tsx` to iterate a `levelIndices` array**

Replace the entire contents of `src/games/letter-tap-sound/LevelSelect.tsx` with:

```tsx
import type { Letter, ProgressMap } from '../../types/game';
import { StarIcon } from '../../components/icons';

interface LevelSelectProps {
  letters: Letter[];
  levelIndices: number[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
}

export function LevelSelect({ letters, levelIndices, progress, onPick }: LevelSelectProps) {
  return (
    <div
      data-testid="level-select"
      className="grid grid-cols-4 sm:grid-cols-6 gap-3 px-4 py-6 max-w-2xl mx-auto"
    >
      {levelIndices.map((i) => {
        const l = letters[i];
        const stars = progress.get(i) ?? 0;
        return (
          <button
            key={i}
            type="button"
            data-testid={`level-card-${i}`}
            aria-label={l.name}
            onClick={() => onPick(i)}
            className="aspect-square bg-white border-4 border-ink rounded-2xl shadow-pop flex flex-col items-center justify-center gap-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <span className="font-display font-black text-3xl text-ink">{l.char}</span>
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

Note: `letters` stays the full array. `levelIndices` drives the iteration. The `i` used for `key`, `data-testid`, and `progress.get(i)` is the full-array index (the value inside `levelIndices`), keeping progress lookups stable.

- [ ] **Step 4: Update `LetterTapSound.tsx` to derive and pass age-based config**

Replace the entire contents of `src/games/letter-tap-sound/LetterTapSound.tsx` with:

```tsx
import { useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { useGameProgress } from '../../hooks/useGameProgress';
import { LevelSelect } from './LevelSelect';
import { Quiz } from './Quiz';
import { LevelResult } from './LevelResult';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import { getChoiceCountForAge, getLevelIndicesForAge } from './config';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

const PROMPTS_PER_LEVEL = 3;

type State =
  | { kind: 'select' }
  | { kind: 'playing'; levelIndex: number; promptIndex: number; mistakes: number; choices: Letter[] }
  | { kind: 'result'; levelIndex: number; stars: number };

function pickDistractors(
  letters: Letter[],
  poolIndices: number[],
  targetIndex: number,
  count: number,
): Letter[] {
  const others = poolIndices.filter((i) => i !== targetIndex).map((i) => letters[i]);
  // Fisher-Yates partial shuffle, take first `count`
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

function starsFor(mistakes: number): number {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

export function LetterTapSound() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  const lang: Lang = learnLang ?? 'ar';
  const letters = lang === 'ar' ? LETTERS_AR : LETTERS_EN;
  const levelIndices = useMemo(
    () => getLevelIndicesForAge(lang, ageGroup),
    [lang, ageGroup],
  );
  const choiceCount = getChoiceCountForAge(ageGroup);
  const { progress, upsert } = useGameProgress('letter-tap-sound', lang);
  const [state, setState] = useState<State>({ kind: 'select' });

  const startLevel = (levelIndex: number) => {
    setState({
      kind: 'playing',
      levelIndex,
      promptIndex: 0,
      mistakes: 0,
      choices: buildChoices(letters, levelIndices, levelIndex, choiceCount),
    });
  };

  const onCorrect = () => {
    if (state.kind !== 'playing') return;
    const nextPrompt = state.promptIndex + 1;
    if (nextPrompt >= PROMPTS_PER_LEVEL) {
      const stars = starsFor(state.mistakes);
      void upsert(state.levelIndex, stars);
      setState({ kind: 'result', levelIndex: state.levelIndex, stars });
      return;
    }
    setState({
      ...state,
      promptIndex: nextPrompt,
      choices: buildChoices(letters, levelIndices, state.levelIndex, choiceCount),
    });
  };

  const onWrong = () => {
    if (state.kind !== 'playing') return;
    setState({ ...state, mistakes: state.mistakes + 1 });
  };

  const goBack = () => setState({ kind: 'select' });
  const replay = () => {
    if (state.kind !== 'result') return;
    startLevel(state.levelIndex);
  };
  const next = () => {
    if (state.kind !== 'result') return;
    const currentPos = levelIndices.indexOf(state.levelIndex);
    const nextPos = currentPos + 1;
    if (nextPos < levelIndices.length) startLevel(levelIndices[nextPos]);
    else goBack();
  };

  const target = useMemo(() => {
    if (state.kind !== 'playing') return null;
    return letters[state.levelIndex];
  }, [state, letters]);

  if (state.kind === 'select') {
    return (
      <LevelSelect
        letters={letters}
        levelIndices={levelIndices}
        progress={progress}
        onPick={startLevel}
      />
    );
  }
  if (state.kind === 'playing' && target) {
    return (
      <Quiz
        key={`${state.levelIndex}-${state.promptIndex}`}
        target={target}
        choices={state.choices}
        lang={lang}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    );
  }
  if (state.kind === 'result') {
    return (
      <LevelResult
        stars={state.stars}
        hasNext={levelIndices.indexOf(state.levelIndex) + 1 < levelIndices.length}
        onNext={next}
        onReplay={replay}
        onBack={goBack}
      />
    );
  }
  return null;
}
```

Key behavioral changes worth understanding:

- `pickDistractors` now takes the full `letters` array PLUS the bucket's `poolIndices` and `count`. It draws candidate distractors from the pool only, then shuffles.
- `buildChoices` similarly takes the pool + count; the `target` still comes from the full array via `letters[levelIndex]` (since `levelIndex` is the full-array index).
- "Next level" advances by position *within* `levelIndices` (not by `levelIndex + 1`), so a 3-4 child finishing ا (index 0) goes to ب (index 1), then ت (index 2), then **د (index 7, skipping out-of-bucket letters)** — which matches the LevelSelect ordering they see.
- `hasNext` mirrors the same position-within-pool logic.

- [ ] **Step 5: Run the Letter Tap test file to verify the four new tests + all original tests pass**

Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/games/letter-tap-sound/LetterTapSound.test.tsx`
Expected: PASS — all tests green, including the four new ones and the six original ones (which rely on the null-ageGroup fallback because `beforeEach` does not set `ageGroup`).

- [ ] **Step 6: Commit**

```bash
cd /home/khalid/workspace/kids-learning
git add src/games/letter-tap-sound/LevelSelect.tsx src/games/letter-tap-sound/LetterTapSound.tsx src/games/letter-tap-sound/LetterTapSound.test.tsx
git commit -m "feat(letter-tap): filter LevelSelect and Quiz choices by age bucket"
```

---

## Task 3: Verify full project, push to remote

**Files:**
- No code changes. This task gates the merge.

- [ ] **Step 1: Run the linter**

Run: `cd /home/khalid/workspace/kids-learning && npm run lint`
Expected: zero errors, zero warnings.

- [ ] **Step 2: Run the TypeScript compiler in noEmit mode**

Run: `cd /home/khalid/workspace/kids-learning && npx tsc --noEmit`
Expected: no diagnostics — clean exit.

- [ ] **Step 3: Run the full Vitest suite**

Run: `cd /home/khalid/workspace/kids-learning && npx vitest run`
Expected: every test file passes. Total count should be the pre-feature baseline (~199 tests) plus the 11 new `config.test.ts` cases plus the 4 new LetterTapSound tests — roughly 214 tests, all green.

- [ ] **Step 4: Build the project**

Run: `cd /home/khalid/workspace/kids-learning && npm run build`
Expected: build succeeds, dist/ produced, no TypeScript errors leaked through.

- [ ] **Step 5: Push to both master and main**

Run:
```bash
cd /home/khalid/workspace/kids-learning
git push origin master
git push origin master:main
```
Expected: both pushes succeed; Railway picks up the `main` push and starts an auto-deploy.

---

## Self-Review Summary (already performed)

**Spec coverage:**
- "Letter pool config" → Task 1 (`LEVEL_INDICES_FOR_AGE`, `getLevelIndicesForAge`).
- "Difficulty config" → Task 1 (`CHOICES_FOR_AGE`, `getChoiceCountForAge`).
- "Null fallback" → Task 1 helpers + Task 2 null-ageGroup test.
- "Single source of truth — `LETTERS_AR/EN` frozen" → Plan never touches those files.
- "Render filter only, no migration" → Task 2 keeps `level_index` semantics; testids remain full-array index.
- "Distractors from user's pool, not full alphabet" → Task 2 `pickDistractors` signature accepts `poolIndices`.
- "Mid-level age switch is benign" → Inherent to the implementation (local state, no subscription).
- "Existing tests still green" → Confirmed by Task 2 Step 5 expectation (null fallback covers the unset-age case).
- "Pool invariant `length ≥ choiceCount`" → Task 1 has an explicit invariant test.

**Type consistency:** `getLevelIndicesForAge(lang, age)`, `getChoiceCountForAge(age)`, `levelIndices: number[]`, `choiceCount: number`, `poolIndices: number[]` are used identically across Tasks 1-2.

**Placeholders:** None.
