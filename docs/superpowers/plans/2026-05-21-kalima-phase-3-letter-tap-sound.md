# Kalima Phase 3 — Letter Tap & Sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first Kalima game — Letter Tap & Sound — with 28 Arabic + 26 English levels, multi-prompt audio quiz, star scoring, and Supabase progress persistence.

**Architecture:** A pluggable game registry (Vite glob import) loads game modules; the Letter Tap & Sound module owns its data, UI, and a hybrid TTS-or-MP3 audio dispatcher. A `useGameProgress` hook reads/writes a `game_progress` table with no-regress upsert semantics.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, react-router-dom v6, Zustand (existing user store), Supabase JS (existing client), Web Speech API (`SpeechSynthesis`), Tailwind (existing classes/tokens).

**Spec:** `docs/superpowers/specs/2026-05-21-kalima-phase-3-letter-tap-sound-design.md`

---

## Project Conventions (Read This Once)

- All tests use Vitest. Run a single file with `npx vitest run path/to/file`. Run all with `npm test`.
- Supabase is mocked via `vi.hoisted` (see `src/hooks/useAuth.test.tsx` for the established pattern).
- Strings live in `src/i18n/locales/{ar,en}.json`. Both files must be updated together. Always add new keys to both languages.
- File naming: components and hooks use PascalCase / camelCase respectively. Tests sit next to the file under test as `*.test.ts(x)`.
- Commits: short imperative subject, optional body. Use `feat:` / `test:` / `chore:` prefixes consistent with prior phases.
- Never bypass git hooks. If a hook fails, fix the root cause.
- Existing supabase client lives at `src/lib/supabase.ts`; never re-instantiate it.

---

## File Map

**Create:**
- `src/types/game.ts` — `GameDefinition`, `Letter`, `ProgressMap` types
- `src/games/registry.ts` — Vite glob → `GAMES` map
- `src/games/letter-tap-sound/index.ts` — game definition export
- `src/games/letter-tap-sound/data/letters-ar.ts` — 28 Arabic letters
- `src/games/letter-tap-sound/data/letters-en.ts` — 26 English letters
- `src/games/letter-tap-sound/audio/speak.ts` — hybrid dispatcher
- `src/games/letter-tap-sound/LetterTapSound.tsx` — orchestrator
- `src/games/letter-tap-sound/LevelSelect.tsx`
- `src/games/letter-tap-sound/Quiz.tsx`
- `src/games/letter-tap-sound/LevelResult.tsx`
- `src/hooks/useSpeech.ts`
- `src/hooks/useGameProgress.ts`
- `src/components/Mascot.tsx`
- `supabase/migrations/20260521000002_game_progress.sql`
- Tests for all of the above (`*.test.ts(x)` next to source)

**Modify:**
- `src/pages/Game.tsx` — resolve via registry
- `src/pages/Hub.tsx` — wire Letter Tap card to navigate
- `src/i18n/locales/en.json` — add `game.*` keys
- `src/i18n/locales/ar.json` — add `game.*` keys

---

## Task 1: Game Types

**Files:**
- Create: `src/types/game.ts`
- Test: `src/types/game.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/types/game.test.ts
import { describe, expect, it } from 'vitest';
import type { Letter, GameDefinition, ProgressMap } from './game';

describe('game types', () => {
  it('Letter requires char, name, audio_key', () => {
    const l: Letter = { char: 'ا', name: 'alif', audio_key: 'alif' };
    expect(l.char).toBe('ا');
  });

  it('ProgressMap maps level_index to stars 1-3', () => {
    const p: ProgressMap = new Map([[0, 3], [1, 2]]);
    expect(p.get(0)).toBe(3);
  });

  it('GameDefinition has id, nameKey, Component', () => {
    const Comp = () => null;
    const g: GameDefinition = { id: 'x', nameKey: 'game.x', Component: Comp };
    expect(g.id).toBe('x');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/types/game.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/types/game.ts
import type { ComponentType } from 'react';

export interface Letter {
  char: string;
  name: string;
  audio_key: string;
}

export type ProgressMap = Map<number, number>; // level_index → stars (1..3)

export interface GameDefinition {
  id: string;
  nameKey: string;
  Component: ComponentType;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/types/game.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/game.ts src/types/game.test.ts
git commit -m "feat: add game type definitions"
```

---

## Task 2: Arabic Letter Data

**Files:**
- Create: `src/games/letter-tap-sound/data/letters-ar.ts`
- Test: `src/games/letter-tap-sound/data/letters-ar.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/games/letter-tap-sound/data/letters-ar.test.ts
import { describe, expect, it } from 'vitest';
import { LETTERS_AR } from './letters-ar';

describe('LETTERS_AR', () => {
  it('contains 28 letters', () => {
    expect(LETTERS_AR).toHaveLength(28);
  });

  it('every entry has char, name, audio_key', () => {
    for (const l of LETTERS_AR) {
      expect(l.char).toBeTruthy();
      expect(l.name).toBeTruthy();
      expect(l.audio_key).toBeTruthy();
    }
  });

  it('all chars are unique', () => {
    const chars = LETTERS_AR.map((l) => l.char);
    expect(new Set(chars).size).toBe(chars.length);
  });

  it('all audio_keys are unique', () => {
    const keys = LETTERS_AR.map((l) => l.audio_key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/data/letters-ar.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/games/letter-tap-sound/data/letters-ar.ts
import type { Letter } from '../../../types/game';

export const LETTERS_AR: Letter[] = [
  { char: 'ا', name: 'alif',  audio_key: 'alif' },
  { char: 'ب', name: 'baa',   audio_key: 'baa' },
  { char: 'ت', name: 'taa',   audio_key: 'taa' },
  { char: 'ث', name: 'thaa',  audio_key: 'thaa' },
  { char: 'ج', name: 'jeem',  audio_key: 'jeem' },
  { char: 'ح', name: 'haa',   audio_key: 'haa' },
  { char: 'خ', name: 'khaa',  audio_key: 'khaa' },
  { char: 'د', name: 'daal',  audio_key: 'daal' },
  { char: 'ذ', name: 'dhaal', audio_key: 'dhaal' },
  { char: 'ر', name: 'raa',   audio_key: 'raa' },
  { char: 'ز', name: 'zay',   audio_key: 'zay' },
  { char: 'س', name: 'seen',  audio_key: 'seen' },
  { char: 'ش', name: 'sheen', audio_key: 'sheen' },
  { char: 'ص', name: 'saad',  audio_key: 'saad' },
  { char: 'ض', name: 'daad',  audio_key: 'daad' },
  { char: 'ط', name: 'taa2',  audio_key: 'taa2' },
  { char: 'ظ', name: 'dhaa',  audio_key: 'dhaa' },
  { char: 'ع', name: 'ayn',   audio_key: 'ayn' },
  { char: 'غ', name: 'ghayn', audio_key: 'ghayn' },
  { char: 'ف', name: 'faa',   audio_key: 'faa' },
  { char: 'ق', name: 'qaaf',  audio_key: 'qaaf' },
  { char: 'ك', name: 'kaaf',  audio_key: 'kaaf' },
  { char: 'ل', name: 'laam',  audio_key: 'laam' },
  { char: 'م', name: 'meem',  audio_key: 'meem' },
  { char: 'ن', name: 'noon',  audio_key: 'noon' },
  { char: 'ه', name: 'haa2',  audio_key: 'haa2' },
  { char: 'و', name: 'waaw',  audio_key: 'waaw' },
  { char: 'ي', name: 'yaa',   audio_key: 'yaa' },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/data/letters-ar.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/games/letter-tap-sound/data/letters-ar.ts src/games/letter-tap-sound/data/letters-ar.test.ts
git commit -m "feat: add 28 Arabic letters dataset"
```

---

## Task 3: English Letter Data

**Files:**
- Create: `src/games/letter-tap-sound/data/letters-en.ts`
- Test: `src/games/letter-tap-sound/data/letters-en.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/games/letter-tap-sound/data/letters-en.test.ts
import { describe, expect, it } from 'vitest';
import { LETTERS_EN } from './letters-en';

describe('LETTERS_EN', () => {
  it('contains 26 letters', () => {
    expect(LETTERS_EN).toHaveLength(26);
  });

  it('every entry has char, name, audio_key', () => {
    for (const l of LETTERS_EN) {
      expect(l.char).toBeTruthy();
      expect(l.name).toBeTruthy();
      expect(l.audio_key).toBeTruthy();
    }
  });

  it('all chars are unique uppercase A-Z', () => {
    const chars = LETTERS_EN.map((l) => l.char);
    expect(new Set(chars).size).toBe(26);
    for (const c of chars) {
      expect(c).toMatch(/^[A-Z]$/);
    }
  });

  it('all audio_keys are unique', () => {
    const keys = LETTERS_EN.map((l) => l.audio_key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/data/letters-en.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/games/letter-tap-sound/data/letters-en.ts
import type { Letter } from '../../../types/game';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const LETTERS_EN: Letter[] = Array.from(ALPHABET).map((char) => ({
  char,
  name: char.toLowerCase(),
  audio_key: char.toLowerCase(),
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/data/letters-en.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/games/letter-tap-sound/data/letters-en.ts src/games/letter-tap-sound/data/letters-en.test.ts
git commit -m "feat: add 26 English letters dataset"
```

---

## Task 4: Game Registry

**Files:**
- Create: `src/games/registry.ts`
- Test: `src/games/registry.test.ts`

The registry uses `import.meta.glob` so new games drop in by creating a folder with `index.ts`. For now we register Letter Tap & Sound explicitly via a stub `index.ts` that we will replace in Task 12.

- [ ] **Step 1: Write the failing test**

```ts
// src/games/registry.test.ts
import { describe, expect, it } from 'vitest';
import { getGame, listGames } from './registry';

describe('game registry', () => {
  it('listGames returns at least one game', () => {
    expect(listGames().length).toBeGreaterThan(0);
  });

  it('getGame returns letter-tap-sound', () => {
    const g = getGame('letter-tap-sound');
    expect(g).toBeDefined();
    expect(g?.id).toBe('letter-tap-sound');
  });

  it('getGame returns undefined for unknown id', () => {
    expect(getGame('does-not-exist')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Create a stub game module so the registry has something to load**

```ts
// src/games/letter-tap-sound/index.ts
import type { GameDefinition } from '../../types/game';

const Placeholder = () => null;

export const game: GameDefinition = {
  id: 'letter-tap-sound',
  nameKey: 'game.letter_tap_sound.name',
  Component: Placeholder,
};
```

This stub will be replaced in Task 12 with the real component. The id and nameKey are final.

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/games/registry.test.ts`
Expected: FAIL — registry module not found

- [ ] **Step 4: Implement registry**

```ts
// src/games/registry.ts
import type { GameDefinition } from '../types/game';

interface GameModule {
  game: GameDefinition;
}

const modules = import.meta.glob<GameModule>('./*/index.ts', { eager: true });

const GAMES: Record<string, GameDefinition> = {};
for (const mod of Object.values(modules)) {
  GAMES[mod.game.id] = mod.game;
}

export function getGame(id: string): GameDefinition | undefined {
  return GAMES[id];
}

export function listGames(): GameDefinition[] {
  return Object.values(GAMES);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/games/registry.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/games/registry.ts src/games/registry.test.ts src/games/letter-tap-sound/index.ts
git commit -m "feat: add pluggable game registry with letter-tap-sound stub"
```

---

## Task 5: useSpeech Hook

**Files:**
- Create: `src/hooks/useSpeech.ts`
- Test: `src/hooks/useSpeech.test.tsx`

This hook wraps `SpeechSynthesis`. It returns `{ speak, speaking, supported }`. We test by mocking `window.speechSynthesis`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/hooks/useSpeech.test.tsx
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeech } from './useSpeech';

interface FakeUtterance {
  text: string;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

let fakeSpeak: ReturnType<typeof vi.fn>;
let lastUtterance: FakeUtterance | null;
const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');
const originalUtterance = (globalThis as Record<string, unknown>).SpeechSynthesisUtterance;

beforeEach(() => {
  fakeSpeak = vi.fn((u: FakeUtterance) => {
    lastUtterance = u;
  });
  lastUtterance = null;
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { speak: fakeSpeak, cancel: vi.fn(), getVoices: () => [] },
  });
  (globalThis as Record<string, unknown>).SpeechSynthesisUtterance = vi
    .fn()
    .mockImplementation((text: string) => ({ text, lang: '', onend: null, onerror: null }));
});

afterEach(() => {
  if (originalDescriptor) Object.defineProperty(window, 'speechSynthesis', originalDescriptor);
  else delete (window as unknown as Record<string, unknown>).speechSynthesis;
  (globalThis as Record<string, unknown>).SpeechSynthesisUtterance = originalUtterance;
});

describe('useSpeech', () => {
  it('reports supported when API is available', () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(true);
  });

  it('calls speechSynthesis.speak with the requested text and lang', async () => {
    const { result } = renderHook(() => useSpeech());
    await act(async () => {
      await result.current.speak('alif', 'ar');
    });
    expect(fakeSpeak).toHaveBeenCalledOnce();
    expect(lastUtterance?.text).toBe('alif');
    expect(lastUtterance?.lang).toBe('ar-SA');
  });

  it('maps en to en-US', async () => {
    const { result } = renderHook(() => useSpeech());
    await act(async () => {
      await result.current.speak('a', 'en');
    });
    expect(lastUtterance?.lang).toBe('en-US');
  });

  it('resolves the promise when utterance ends', async () => {
    const { result } = renderHook(() => useSpeech());
    fakeSpeak.mockImplementation((u: FakeUtterance) => {
      lastUtterance = u;
      queueMicrotask(() => u.onend?.());
    });
    await expect(result.current.speak('alif', 'ar')).resolves.toBeUndefined();
  });

  it('reports not supported when API missing', () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useSpeech.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/hooks/useSpeech.ts
import { useCallback, useState } from 'react';
import type { Lang } from '../stores/userStore';

const LANG_TAGS: Record<Lang, string> = {
  ar: 'ar-SA',
  en: 'en-US',
};

export interface UseSpeech {
  speak: (text: string, lang: Lang) => Promise<void>;
  speaking: boolean;
  supported: boolean;
}

export function useSpeech(): UseSpeech {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string, lang: Lang): Promise<void> => {
      if (!supported) return Promise.resolve();
      return new Promise<void>((resolve) => {
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = LANG_TAGS[lang];
          u.onend = () => {
            setSpeaking(false);
            resolve();
          };
          u.onerror = () => {
            setSpeaking(false);
            resolve();
          };
          setSpeaking(true);
          window.speechSynthesis.speak(u);
        } catch (err) {
          console.error('useSpeech failed', err);
          setSpeaking(false);
          resolve();
        }
      });
    },
    [supported],
  );

  return { speak, speaking, supported };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useSpeech.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpeech.ts src/hooks/useSpeech.test.tsx
git commit -m "feat: add useSpeech hook wrapping SpeechSynthesis"
```

---

## Task 6: Hybrid Audio Dispatcher (`speak.ts`)

**Files:**
- Create: `src/games/letter-tap-sound/audio/speak.ts`
- Test: `src/games/letter-tap-sound/audio/speak.test.ts`

`speak.ts` is a thin pure function exposed as `dispatchSpeak(key, lang, synth)` where `synth` is the speech function from `useSpeech`. This keeps it injectable for tests and decouples it from React. The fallback set starts empty.

- [ ] **Step 1: Write the failing test**

```ts
// src/games/letter-tap-sound/audio/speak.test.ts
import { describe, expect, it, vi } from 'vitest';
import { dispatchSpeak, FALLBACK_KEYS, playMp3 } from './speak';

describe('FALLBACK_KEYS', () => {
  it('starts empty', () => {
    expect(FALLBACK_KEYS.size).toBe(0);
  });
});

describe('dispatchSpeak', () => {
  it('uses synth when key is not in fallback set', async () => {
    const synth = vi.fn().mockResolvedValue(undefined);
    const mp3 = vi.fn().mockResolvedValue(undefined);
    await dispatchSpeak('alif', 'ar', synth, mp3);
    expect(synth).toHaveBeenCalledWith('alif', 'ar');
    expect(mp3).not.toHaveBeenCalled();
  });

  it('uses mp3 when compound key is in fallback set', async () => {
    const synth = vi.fn().mockResolvedValue(undefined);
    const mp3 = vi.fn().mockResolvedValue(undefined);
    FALLBACK_KEYS.add('ar-ayn');
    try {
      await dispatchSpeak('ayn', 'ar', synth, mp3);
      expect(mp3).toHaveBeenCalledWith('/audio/fallbacks/ar-ayn.mp3');
      expect(synth).not.toHaveBeenCalled();
    } finally {
      FALLBACK_KEYS.delete('ar-ayn');
    }
  });

  it('falls back to synth if mp3 throws', async () => {
    const synth = vi.fn().mockResolvedValue(undefined);
    const mp3 = vi.fn().mockRejectedValue(new Error('404'));
    FALLBACK_KEYS.add('ar-ayn');
    try {
      await dispatchSpeak('ayn', 'ar', synth, mp3);
      expect(synth).toHaveBeenCalledWith('ayn', 'ar');
    } finally {
      FALLBACK_KEYS.delete('ar-ayn');
    }
  });
});

describe('playMp3', () => {
  it('returns a promise', () => {
    // Cannot actually play in jsdom; just confirm it returns a thenable.
    const result = playMp3('/audio/fallbacks/missing.mp3');
    expect(typeof result.then).toBe('function');
    result.catch(() => undefined);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/audio/speak.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/games/letter-tap-sound/audio/speak.ts
import type { Lang } from '../../../stores/userStore';

// Format: `${lang}-${audio_key}`. Add entries as we identify letters
// where TTS quality is unacceptable on real devices.
export const FALLBACK_KEYS = new Set<string>();

type Synth = (text: string, lang: Lang) => Promise<void>;
type Mp3Player = (url: string) => Promise<void>;

export function playMp3(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(url);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error(`audio failed: ${url}`));
      void audio.play().catch(reject);
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

export async function dispatchSpeak(
  key: string,
  lang: Lang,
  synth: Synth,
  mp3: Mp3Player = playMp3,
): Promise<void> {
  const compoundKey = `${lang}-${key}`;
  if (FALLBACK_KEYS.has(compoundKey)) {
    try {
      await mp3(`/audio/fallbacks/${compoundKey}.mp3`);
      return;
    } catch (err) {
      console.warn('mp3 fallback failed, using synth', err);
    }
  }
  await synth(key, lang);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/audio/speak.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/games/letter-tap-sound/audio/speak.ts src/games/letter-tap-sound/audio/speak.test.ts
git commit -m "feat: add hybrid TTS-or-MP3 audio dispatcher"
```

---

## Task 7: Supabase Migration — `game_progress`

**Files:**
- Create: `supabase/migrations/20260521000002_game_progress.sql`

No automated test for SQL; the engineer applies the migration manually in Supabase Studio when ready. The hook in Task 8 covers behavior.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260521000002_game_progress.sql
create table public.game_progress (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  game_id      text not null,
  lang         text not null check (lang in ('ar', 'en')),
  level_index  int  not null check (level_index >= 0),
  stars        int  not null check (stars between 1 and 3),
  updated_at   timestamptz not null default now(),
  unique (profile_id, game_id, lang, level_index)
);

alter table public.game_progress enable row level security;

create policy "game_progress_select_own"
  on public.game_progress for select
  using (auth.uid() = profile_id);

create policy "game_progress_insert_own"
  on public.game_progress for insert
  with check (auth.uid() = profile_id);

create policy "game_progress_update_own"
  on public.game_progress for update
  using (auth.uid() = profile_id);
```

- [ ] **Step 2: Lint check (no syntax tooling — just eyeball)**

Confirm: table name, RLS enabled, three policies, unique constraint on (profile_id, game_id, lang, level_index), stars CHECK.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260521000002_game_progress.sql
git commit -m "feat: add game_progress migration with RLS"
```

---

## Task 8: `useGameProgress` Hook

**Files:**
- Create: `src/hooks/useGameProgress.ts`
- Test: `src/hooks/useGameProgress.test.tsx`

Returns `{ progress, loading, error, upsert }`. `progress` is a `Map<number, number>`. `upsert(level, stars)` writes only if `stars > existing` (no-regress) and updates the local map optimistically. On error it still resolves but sets `error` for the UI.

- [ ] **Step 1: Write the failing test**

```tsx
// src/hooks/useGameProgress.test.tsx
import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
}));

import { useGameProgress } from './useGameProgress';
import { useUserStore } from '../stores/userStore';

const fakeProfile = { id: 'u1', displayName: null, avatarUrl: null };

function mockFetchReturning(rows: { level_index: number; stars: number }[]) {
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: rows, error: null }),
        }),
      }),
    }),
    upsert: vi.fn(() => Promise.resolve({ error: null })),
  });
}

beforeEach(() => {
  mocks.from.mockReset();
  useUserStore.setState({ profile: fakeProfile });
});

afterEach(() => {
  useUserStore.getState().reset();
});

describe('useGameProgress', () => {
  it('fetches rows and builds map keyed by level_index', async () => {
    mockFetchReturning([
      { level_index: 0, stars: 3 },
      { level_index: 1, stars: 2 },
    ]);
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.progress.get(0)).toBe(3);
    expect(result.current.progress.get(1)).toBe(2);
  });

  it('returns empty map when fetch errors', async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: null, error: new Error('boom') }),
          }),
        }),
      }),
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.progress.size).toBe(0);
    expect(result.current.error).toBeTruthy();
  });

  it('upsert writes when stars > existing', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }));
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [{ level_index: 0, stars: 1 }], error: null }),
          }),
        }),
      }),
      upsert: upsertFn,
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.upsert(0, 3);
    });
    expect(upsertFn).toHaveBeenCalledOnce();
    expect(result.current.progress.get(0)).toBe(3);
  });

  it('upsert no-ops when stars <= existing', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }));
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [{ level_index: 0, stars: 3 }], error: null }),
          }),
        }),
      }),
      upsert: upsertFn,
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.upsert(0, 1);
    });
    expect(upsertFn).not.toHaveBeenCalled();
    expect(result.current.progress.get(0)).toBe(3);
  });

  it('upsert writes when no existing row', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }));
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      upsert: upsertFn,
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.upsert(5, 2);
    });
    expect(upsertFn).toHaveBeenCalledOnce();
    expect(result.current.progress.get(5)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useGameProgress.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// src/hooks/useGameProgress.ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { Lang } from '../stores/userStore';
import type { ProgressMap } from '../types/game';

interface Row {
  level_index: number;
  stars: number;
}

export interface UseGameProgress {
  progress: ProgressMap;
  loading: boolean;
  error: string | null;
  upsert: (levelIndex: number, stars: number) => Promise<void>;
}

export function useGameProgress(gameId: string, lang: Lang): UseGameProgress {
  const profileId = useUserStore((s) => s.profile?.id) ?? null;
  const [progress, setProgress] = useState<ProgressMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from('game_progress')
      .select('level_index, stars')
      .eq('profile_id', profileId)
      .eq('game_id', gameId)
      .eq('lang', lang)
      .then(({ data, error: err }: { data: Row[] | null; error: Error | null }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setProgress(new Map());
        } else {
          const map: ProgressMap = new Map();
          for (const row of data ?? []) map.set(row.level_index, row.stars);
          setProgress(map);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, gameId, lang]);

  const upsert = useCallback(
    async (levelIndex: number, stars: number) => {
      if (!profileId) return;
      const existing = progress.get(levelIndex) ?? 0;
      if (stars <= existing) return;
      const { error: err } = await supabase.from('game_progress').upsert(
        {
          profile_id: profileId,
          game_id: gameId,
          lang,
          level_index: levelIndex,
          stars,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id,game_id,lang,level_index' },
      );
      if (err) {
        setError(err.message);
        return;
      }
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(levelIndex, stars);
        return next;
      });
    },
    [profileId, gameId, lang, progress],
  );

  return { progress, loading, error, upsert };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useGameProgress.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGameProgress.ts src/hooks/useGameProgress.test.tsx
git commit -m "feat: add useGameProgress hook with no-regress upsert"
```

---

## Task 9: Mascot Component

**Files:**
- Create: `src/components/Mascot.tsx`
- Test: `src/components/Mascot.test.tsx`

Reusable mascot with `mood` prop. Uses CSS classes for animation; tests verify the right class is applied.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/Mascot.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Mascot } from './Mascot';

describe('Mascot', () => {
  it('renders idle by default', () => {
    render(<Mascot />);
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-mood', 'idle');
  });

  it('renders success mood', () => {
    render(<Mascot mood="success" />);
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-mood', 'success');
  });

  it('renders fail mood', () => {
    render(<Mascot mood="fail" />);
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-mood', 'fail');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Mascot.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```tsx
// src/components/Mascot.tsx
export type MascotMood = 'idle' | 'success' | 'fail';

interface MascotProps {
  mood?: MascotMood;
}

const EMOJI: Record<MascotMood, string> = {
  idle: '🦊',
  success: '🎉',
  fail: '😅',
};

const ANIM: Record<MascotMood, string> = {
  idle: '',
  success: 'animate-bounce',
  fail: 'animate-pulse',
};

export function Mascot({ mood = 'idle' }: MascotProps) {
  return (
    <div
      data-testid="mascot"
      data-mood={mood}
      className={`text-6xl inline-block ${ANIM[mood]}`}
      aria-hidden="true"
    >
      {EMOJI[mood]}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Mascot.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Mascot.tsx src/components/Mascot.test.tsx
git commit -m "feat: add Mascot component with idle/success/fail moods"
```

---

## Task 10: i18n Strings

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ar.json`

Add the keys all subsequent UI tasks will reference. Do this now so later tasks don't need to revisit the locale files.

- [ ] **Step 1: Add to `src/i18n/locales/en.json`** under top level:

```json
"game": {
  "letter_tap_sound": {
    "name": "Letter Tap & Sound"
  },
  "level": "Level {{n}}",
  "tap_speaker": "Tap to hear the letter",
  "next_level": "Next level",
  "replay": "Replay",
  "back_to_levels": "Back to levels",
  "level_complete": "Great job!",
  "stars_earned": "You earned {{stars}} stars"
}
```

- [ ] **Step 2: Add to `src/i18n/locales/ar.json`** (Arabic equivalents):

```json
"game": {
  "letter_tap_sound": {
    "name": "اضغط الحرف"
  },
  "level": "المستوى {{n}}",
  "tap_speaker": "اضغط لسماع الحرف",
  "next_level": "المستوى التالي",
  "replay": "إعادة",
  "back_to_levels": "العودة إلى المستويات",
  "level_complete": "أحسنت!",
  "stars_earned": "حصلت على {{stars}} نجوم"
}
```

- [ ] **Step 3: Run full test suite to confirm nothing broke**

Run: `npm test`
Expected: all existing tests pass

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/ar.json
git commit -m "feat: add Letter Tap & Sound i18n strings"
```

---

## Task 11: Quiz Component

**Files:**
- Create: `src/games/letter-tap-sound/Quiz.tsx`
- Test: `src/games/letter-tap-sound/Quiz.test.tsx`

Pure UI. Receives `{ target, choices, lang, onCorrect, onWrong }`. Plays target audio on mount and on speaker tap. Speaker tap and tile taps are the only user actions.

**Testid scheme:** Each tile has `data-testid="quiz-tile"` (shared, for counting) plus `aria-label={letter.name}` so tests can click a specific tile via `screen.getByLabelText(letter.name)`. Two tiles with the same Arabic letter cannot occur because choices include the target plus distinct distractors.

- [ ] **Step 1: Write the failing test**

```tsx
// src/games/letter-tap-sound/Quiz.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  dispatchSpeak: vi.fn().mockResolvedValue(undefined),
  useSpeech: vi.fn(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    speaking: false,
    supported: true,
  })),
}));

vi.mock('./audio/speak', () => ({ dispatchSpeak: mocks.dispatchSpeak }));
vi.mock('../../hooks/useSpeech', () => ({ useSpeech: mocks.useSpeech }));

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

  it('fires onCorrect when target tile tapped', () => {
    const onCorrect = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    expect(onCorrect).toHaveBeenCalledOnce();
  });

  it('fires onWrong when non-target tile tapped', () => {
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={onWrong} />);
    fireEvent.click(screen.getByLabelText('baa'));
    expect(onWrong).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/Quiz.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```tsx
// src/games/letter-tap-sound/Quiz.tsx
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dispatchSpeak } from './audio/speak';
import { useSpeech } from '../../hooks/useSpeech';
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

  const play = useCallback(() => {
    void dispatchSpeak(target.audio_key, lang, speak);
  }, [target, lang, speak]);

  useEffect(() => {
    play();
  }, [play]);

  return (
    <div data-testid="quiz" className="flex flex-col items-center gap-6">
      <button
        type="button"
        data-testid="quiz-speaker"
        onClick={play}
        aria-label={t('game.tap_speaker')}
        className="text-5xl rounded-full bg-surface shadow-card w-20 h-20"
      >
        🔊
      </button>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((c) => (
          <button
            key={c.char}
            type="button"
            data-testid="quiz-tile"
            aria-label={c.name}
            className="font-display text-5xl bg-surface rounded-2xl shadow-card w-24 h-24 flex items-center justify-center"
            onClick={() => (c.char === target.char ? onCorrect() : onWrong())}
          >
            {c.char}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/Quiz.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/games/letter-tap-sound/Quiz.tsx src/games/letter-tap-sound/Quiz.test.tsx
git commit -m "feat: add Quiz component for Letter Tap"
```

---

## Task 12: LevelResult Component

**Files:**
- Create: `src/games/letter-tap-sound/LevelResult.tsx`
- Test: `src/games/letter-tap-sound/LevelResult.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/games/letter-tap-sound/LevelResult.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelResult } from './LevelResult';

describe('LevelResult', () => {
  it('renders earned stars (1)', () => {
    render(<LevelResult stars={1} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(1);
    expect(screen.getAllByTestId('star-empty')).toHaveLength(2);
  });

  it('renders earned stars (3)', () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(3);
    expect(screen.queryAllByTestId('star-empty')).toHaveLength(0);
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

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/LevelResult.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement**

```tsx
// src/games/letter-tap-sound/LevelResult.tsx
import { useTranslation } from 'react-i18next';
import { Mascot } from '../../components/Mascot';

interface LevelResultProps {
  stars: number;
  hasNext: boolean;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
}

export function LevelResult({ stars, hasNext, onNext, onReplay, onBack }: LevelResultProps) {
  const { t } = useTranslation();
  return (
    <section data-testid="level-result" className="flex flex-col items-center gap-6 px-6 py-8">
      <Mascot mood="success" />
      <h2 className="font-display text-3xl text-ink">{t('game.level_complete')}</h2>
      <div className="flex gap-2 text-4xl" aria-label={t('game.stars_earned', { stars })}>
        {[1, 2, 3].map((i) =>
          i <= stars ? (
            <span key={i} data-testid="star-filled">⭐</span>
          ) : (
            <span key={i} data-testid="star-empty">☆</span>
          ),
        )}
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/LevelResult.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/games/letter-tap-sound/LevelResult.tsx src/games/letter-tap-sound/LevelResult.test.tsx
git commit -m "feat: add LevelResult component"
```

---

## Task 13: LevelSelect Component

**Files:**
- Create: `src/games/letter-tap-sound/LevelSelect.tsx`
- Test: `src/games/letter-tap-sound/LevelSelect.test.tsx`

Receives `{ letters, progress, onPick }`. Renders a grid of cards, each showing the letter and (if earned) the star count.

**Testid scheme:** Each card has unique `data-testid={`level-card-${i}`}`. The count test uses a regex matcher: `screen.getAllByTestId(/^level-card-\d+$/)`. Individual card lookup uses the indexed testid.

- [ ] **Step 1: Write the failing test**

```tsx
// src/games/letter-tap-sound/LevelSelect.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelSelect } from './LevelSelect';
import type { Letter, ProgressMap } from '../../types/game';

const letters: Letter[] = [
  { char: 'ا', name: 'alif', audio_key: 'alif' },
  { char: 'ب', name: 'baa', audio_key: 'baa' },
  { char: 'ت', name: 'taa', audio_key: 'taa' },
];

describe('LevelSelect', () => {
  it('renders one card per letter', () => {
    render(<LevelSelect letters={letters} progress={new Map()} onPick={() => {}} />);
    expect(screen.getAllByTestId(/^level-card-\d+$/)).toHaveLength(3);
  });

  it('shows star count when level has progress', () => {
    const progress: ProgressMap = new Map([[0, 3], [2, 1]]);
    render(<LevelSelect letters={letters} progress={progress} onPick={() => {}} />);
    expect(screen.getByTestId('level-card-0').textContent).toContain('⭐⭐⭐');
    expect(screen.getByTestId('level-card-2').textContent).toContain('⭐');
    expect(screen.getByTestId('level-card-1').textContent).not.toContain('⭐');
  });

  it('calls onPick with index when card tapped', () => {
    const onPick = vi.fn();
    render(<LevelSelect letters={letters} progress={new Map()} onPick={onPick} />);
    fireEvent.click(screen.getByTestId('level-card-1'));
    expect(onPick).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/LevelSelect.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement**

```tsx
// src/games/letter-tap-sound/LevelSelect.tsx
import type { Letter, ProgressMap } from '../../types/game';

interface LevelSelectProps {
  letters: Letter[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
}

export function LevelSelect({ letters, progress, onPick }: LevelSelectProps) {
  return (
    <div
      data-testid="level-select"
      className="grid grid-cols-4 sm:grid-cols-6 gap-3 px-4 py-6 max-w-2xl mx-auto"
    >
      {letters.map((l, i) => {
        const stars = progress.get(i) ?? 0;
        return (
          <button
            key={i}
            type="button"
            data-testid={`level-card-${i}`}
            aria-label={l.name}
            onClick={() => onPick(i)}
            className="aspect-square bg-surface rounded-2xl shadow-card flex flex-col items-center justify-center gap-1"
          >
            <span className="font-display text-3xl">{l.char}</span>
            {stars > 0 && (
              <span className="text-xs">{'⭐'.repeat(stars)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/LevelSelect.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/games/letter-tap-sound/LevelSelect.tsx src/games/letter-tap-sound/LevelSelect.test.tsx
git commit -m "feat: add LevelSelect grid with star badges"
```

---

## Task 14: LetterTapSound Orchestrator

**Files:**
- Create: `src/games/letter-tap-sound/LetterTapSound.tsx`
- Test: `src/games/letter-tap-sound/LetterTapSound.test.tsx`
- Modify: `src/games/letter-tap-sound/index.ts`

State machine: `select` → `playing` → `result` → back to `select`. Owns prompt index and mistake count. Picks distractors. Computes stars and calls `upsert` after the last prompt. Tracks the highest level reached so `hasNext` is correct.

Star calculation:
- `mistakes === 0` → 3
- `mistakes === 1` → 2
- otherwise → 1

Distractor selection: from the letter pool excluding the target, pick 3 at random, then shuffle target into the 4-tile array.

- [ ] **Step 1: Write the failing test**

```tsx
// src/games/letter-tap-sound/LetterTapSound.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const upsertMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    progress: new Map(),
    loading: false,
    error: null,
    upsert: upsertMock,
  }),
}));

vi.mock('./audio/speak', () => ({
  dispatchSpeak: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: vi.fn().mockResolvedValue(undefined), speaking: false, supported: true }),
}));

import { LetterTapSound } from './LetterTapSound';
import { useUserStore } from '../../stores/userStore';

beforeEach(() => {
  upsertMock.mockClear();
  useUserStore.setState({ profile: { id: 'u1', displayName: null, avatarUrl: null }, learnLang: 'ar' });
});

afterEach(() => {
  useUserStore.getState().reset();
});

async function playLevel(targetChar: string, targetName: string, mistakes: number) {
  // Pick level 0 from the grid
  fireEvent.click(screen.getByTestId('level-card-0'));
  // 3 prompts
  for (let p = 0; p < 3; p++) {
    if (p === 0) {
      // make `mistakes` wrong taps first, then correct
      for (let m = 0; m < mistakes; m++) {
        const tiles = screen.getAllByTestId('quiz-tile');
        const wrong = tiles.find((b) => b.getAttribute('aria-label') !== targetName);
        if (wrong) fireEvent.click(wrong);
      }
    }
    const correct = screen.getByLabelText(targetName);
    fireEvent.click(correct);
  }
}

describe('LetterTapSound', () => {
  it('shows level select initially', () => {
    render(<LetterTapSound />);
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });

  it('starts a level when card tapped', () => {
    render(<LetterTapSound />);
    // First Arabic letter is alif (ا)
    fireEvent.click(screen.getByText('ا'));
    expect(screen.getByTestId('quiz')).toBeInTheDocument();
  });

  it('awards 3 stars for 0 mistakes', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 0);
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(upsertMock).toHaveBeenCalledWith(0, 3);
  });

  it('awards 2 stars for 1 mistake', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 1);
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(upsertMock).toHaveBeenCalledWith(0, 2);
  });

  it('awards 1 star for 2+ mistakes', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 2);
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(upsertMock).toHaveBeenCalledWith(0, 1);
  });

  it('Back button returns to level select', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 0);
    fireEvent.click(screen.getByTestId('result-back'));
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/letter-tap-sound/LetterTapSound.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```tsx
// src/games/letter-tap-sound/LetterTapSound.tsx
import { useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { useGameProgress } from '../../hooks/useGameProgress';
import { LevelSelect } from './LevelSelect';
import { Quiz } from './Quiz';
import { LevelResult } from './LevelResult';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

const PROMPTS_PER_LEVEL = 3;

type State =
  | { kind: 'select' }
  | { kind: 'playing'; levelIndex: number; promptIndex: number; mistakes: number; choices: Letter[] }
  | { kind: 'result'; levelIndex: number; stars: number };

function pickDistractors(pool: Letter[], targetIndex: number): Letter[] {
  const others = pool.filter((_, i) => i !== targetIndex);
  // Fisher-Yates partial shuffle, take first 3
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, 3);
}

function buildChoices(letters: Letter[], levelIndex: number): Letter[] {
  const target = letters[levelIndex];
  const distractors = pickDistractors(letters, levelIndex);
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
  const lang: Lang = learnLang ?? 'ar';
  const letters = lang === 'ar' ? LETTERS_AR : LETTERS_EN;
  const { progress, upsert } = useGameProgress('letter-tap-sound', lang);
  const [state, setState] = useState<State>({ kind: 'select' });

  const startLevel = (levelIndex: number) => {
    setState({
      kind: 'playing',
      levelIndex,
      promptIndex: 0,
      mistakes: 0,
      choices: buildChoices(letters, levelIndex),
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
      choices: buildChoices(letters, state.levelIndex),
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
    const nextIndex = state.levelIndex + 1;
    if (nextIndex < letters.length) startLevel(nextIndex);
    else goBack();
  };

  const target = useMemo(() => {
    if (state.kind !== 'playing') return null;
    return letters[state.levelIndex];
  }, [state, letters]);

  if (state.kind === 'select') {
    return <LevelSelect letters={letters} progress={progress} onPick={startLevel} />;
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
        hasNext={state.levelIndex + 1 < letters.length}
        onNext={next}
        onReplay={replay}
        onBack={goBack}
      />
    );
  }
  return null;
}
```

- [ ] **Step 4: Update `src/games/letter-tap-sound/index.ts`** to export the real component:

```ts
// src/games/letter-tap-sound/index.ts
import type { GameDefinition } from '../../types/game';
import { LetterTapSound } from './LetterTapSound';

export const game: GameDefinition = {
  id: 'letter-tap-sound',
  nameKey: 'game.letter_tap_sound.name',
  Component: LetterTapSound,
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/games/letter-tap-sound/LetterTapSound.test.tsx`
Expected: PASS (6 tests)

Also run the registry test again to confirm nothing broke:

Run: `npx vitest run src/games/registry.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/games/letter-tap-sound/LetterTapSound.tsx src/games/letter-tap-sound/LetterTapSound.test.tsx src/games/letter-tap-sound/index.ts
git commit -m "feat: add Letter Tap & Sound orchestrator with state machine"
```

---

## Task 15: Wire `Game.tsx` Through Registry

**Files:**
- Modify: `src/pages/Game.tsx`
- Modify: `src/pages/Game.test.tsx` (create if absent)

`Game.tsx` looks up the game by `:gameId` and renders its `Component`. Unknown id redirects to `/hub`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/Game.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../games/registry', () => {
  const FakeGame = () => <div data-testid="fake-game">hello</div>;
  return {
    getGame: (id: string) => (id === 'letter-tap-sound' ? { id, nameKey: 'x', Component: FakeGame } : undefined),
  };
});

import Game from './Game';

describe('Game page', () => {
  it('renders the registered game by id', () => {
    render(
      <MemoryRouter initialEntries={['/game/letter-tap-sound']}>
        <Routes>
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/hub" element={<div data-testid="hub" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('fake-game')).toBeInTheDocument();
  });

  it('redirects to /hub when game id is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/game/unknown']}>
        <Routes>
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/hub" element={<div data-testid="hub" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('hub')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Game.test.tsx`
Expected: FAIL — current Game.tsx renders a static h2, not via registry

- [ ] **Step 3: Modify `src/pages/Game.tsx`**

```tsx
import { Navigate, useParams } from 'react-router-dom';
import { getGame } from '../games/registry';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? getGame(gameId) : undefined;
  if (!game) return <Navigate to="/hub" replace />;
  const Comp = game.Component;
  return (
    <section data-testid="game-page">
      <Comp />
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Game.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/Game.tsx src/pages/Game.test.tsx
git commit -m "feat: resolve Game page through registry, redirect unknown ids"
```

---

## Task 16: Wire Hub Card to Letter Tap

**Files:**
- Modify: `src/pages/Hub.tsx`
- Modify: `src/pages/Hub.test.tsx`

Replace the first placeholder card with a real card that navigates to `/game/letter-tap-sound`. The remaining three stay locked.

- [ ] **Step 1: Write/update the failing test**

Open `src/pages/Hub.test.tsx` and add (or replace) tests so:

```tsx
// near top, add:
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

// inside describe('Hub'):
it('renders a Letter Tap card', () => {
  render(<Hub />, { wrapper: MemoryRouter });
  expect(screen.getByTestId('hub-card-letter-tap-sound')).toBeInTheDocument();
});

it('navigates to /game/letter-tap-sound when card tapped', () => {
  render(<Hub />, { wrapper: MemoryRouter });
  fireEvent.click(screen.getByTestId('hub-card-letter-tap-sound'));
  expect(navigateMock).toHaveBeenCalledWith('/game/letter-tap-sound');
});
```

Adjust imports (`fireEvent`, `MemoryRouter`, `vi`) and the existing Hub tests if needed so the new mock applies cleanly.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Hub.test.tsx`
Expected: FAIL — no such testid

- [ ] **Step 3: Modify `src/pages/Hub.tsx`**

```tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/Card';

export default function Hub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);

  return (
    <section data-testid="hub-page" className="px-6 py-12 flex flex-col items-center gap-8">
      <h1 data-testid="hub-greeting" className="font-display text-4xl text-ink text-center">
        {profile?.displayName
          ? t('hub.greeting', { name: profile.displayName })
          : t('hub.greeting_fallback')}
      </h1>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <button
          type="button"
          data-testid="hub-card-letter-tap-sound"
          onClick={() => navigate('/game/letter-tap-sound')}
          className="text-left"
        >
          <Card>
            <div className="aspect-square flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🔤</span>
              <span className="font-display text-sm text-center">
                {t('game.letter_tap_sound.name')}
              </span>
            </div>
          </Card>
        </button>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="aspect-square flex items-center justify-center text-3xl">🔒</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

Note: removed the "Games coming soon" line since one game is now live.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Hub.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the full suite as a sanity check**

Run: `npm test`
Expected: all green

- [ ] **Step 6: Commit**

```bash
git add src/pages/Hub.tsx src/pages/Hub.test.tsx
git commit -m "feat: wire Hub Letter Tap card to game route"
```

---

## Task 17: Final Verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: clean

- [ ] **Step 2: Run typecheck + build**

Run: `npm run build`
Expected: clean build

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: every test from every task passes; no regressions in Phase 1/2 tests

- [ ] **Step 4: Manual smoke test (local)**

1. `npm run dev`
2. Sign in (existing OAuth), confirm Hub renders
3. Click Letter Tap card → level select grid appears
4. Pick level 0, complete with 0 mistakes → 3 stars on result
5. Tap "Back to levels" → grid shows ⭐⭐⭐ on level 0
6. Hard refresh → 3 stars still visible (Supabase persistence — only after migration applied; if migration not applied, expect graceful no-stars state)
7. Replay level 0 with 2 wrong taps → grid still shows 3 stars (no-regress)
8. Switch UI to English in Settings → labels flip, RTL flips off
9. Note any letters where TTS sounds bad — record for future fallback MP3 list

- [ ] **Step 5: Apply migration (Khalid does this in Supabase Studio when ready)**

Paste the SQL from `supabase/migrations/20260521000002_game_progress.sql` into the SQL Editor. Confirm three policies appear under `game_progress` in Authentication → Policies.

---

## Spec-Coverage Self-Check (Plan Author Note)

| Spec section | Covered by task(s) |
|---|---|
| §1.1 In Scope — registry pattern | 4 |
| §1.1 — 28 AR + 26 EN levels | 2, 3 |
| §1.1 — multi-prompt quiz, 3 prompts | 11, 14 |
| §1.1 — star rating 1/2/3 | 12, 14 |
| §1.1 — hybrid audio | 5, 6 |
| §1.1 — level select grid, all unlocked | 13 |
| §1.1 — star badges | 13 |
| §1.1 — mascot reactions | 9, 12 |
| §1.1 — game_progress table + RLS | 7 |
| §1.1 — no-regress upsert | 8 |
| §1.1 — Hub card wired | 16 |
| §1.2 Out of Scope | not implemented (correct) |
| §2 Architecture / file layout | all tasks |
| §3 Data model (table, letter shape) | 1, 7 |
| §4 Data flow (open, play, dispatch, distractors) | 6, 11, 14 |
| §5 UI / UX (grid, quiz, result, RTL, mascot) | 9, 11, 12, 13 |
| §6 Error handling (fetch fail, upsert fail, TTS missing, unknown id) | 6, 8, 15 |
| §7 Testing (all unit + integration cases) | every task |
| §8 Deliverables | all tasks 1–16, verified in 17 |
