# Guest Mode + Custom Icon Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two independent UX improvements to Kalima: (1) a guest mode that lets visitors play without signing in, with progress saved to `localStorage`; (2) a custom Pop Cartoon SVG icon set replacing every emoji used as a UI affordance.

**Architecture:** Two independent PRs. PR-1 adds an `isGuest` flag + a `guestProgress` localStorage module + branches in `useGameProgress` / `useAuth` / onboarding. PR-2 adds 11 SVG icon components under `src/components/icons/` and swaps emoji usage across 5 files.

**Tech Stack:** React 19, TypeScript, Zustand (with `persist` middleware), Vitest + React Testing Library, framer-motion, Tailwind, Supabase (only relied on by signed-in path).

**Spec:** `docs/superpowers/specs/2026-05-22-guest-mode-and-icon-set-design.md`

---

## File Structure

### PR-1 — Guest Mode

| Path | Purpose | Status |
|---|---|---|
| `src/stores/userStore.ts` | Adds `isGuest`, `startGuestSession()`; `reset()` clears guest flag too | Modified |
| `src/stores/userStore.test.ts` | New tests for guest helpers | New |
| `src/lib/guestProgress.ts` | `loadGuestProgress` / `saveGuestProgress` localStorage I/O | New |
| `src/lib/guestProgress.test.ts` | Round-trip tests, error handling | New |
| `src/hooks/useGameProgress.ts` | Branches on `isGuest` — uses localStorage instead of Supabase | Modified |
| `src/hooks/useGameProgress.test.ts` | Updated to cover guest branch | New (currently no test file) |
| `src/hooks/useAuth.ts` | Skips `store.reset()` when `isGuest === true` | Modified |
| `src/pages/onboarding/LearnLanguage.tsx` | Skip `updateProfile` for guests | Modified |
| `src/pages/onboarding/AgeGroupSelect.tsx` | Skip `updateProfile` for guests | Modified |
| `src/pages/Landing.tsx` | Adds "Play as guest" secondary button | Modified |
| `src/pages/Landing.test.tsx` | Adds guest entry test | Modified |
| `src/pages/Settings.tsx` | Replaces sign-out with upgrade CTA when `isGuest` | Modified |
| `src/pages/Settings.test.tsx` | Asserts upgrade CTA appears for guests | Modified |
| `src/i18n/locales/en.json`, `ar.json` | New keys for guest CTA + Settings upgrade copy | Modified |

### PR-2 — Custom Icon Set

| Path | Purpose | Status |
|---|---|---|
| `src/components/icons/Icon.types.ts` | Shared `IconProps` interface + helper | New |
| `src/components/icons/index.ts` | Barrel export | New |
| `src/components/icons/{Bee,Fox,Star,Trophy,Lock,Play,LetterTile,Puzzle,Gear,LangToggle,Flame}.tsx` | 11 icon components (FoxMascot has a `mood` prop) | New (×11) |
| `src/components/icons/icons.test.tsx` | One shared smoke test iterating every icon | New |
| `src/pages/Landing.tsx` | 🐝 → `<BeeMascot />`, ▶ → `<PlayIcon />` | Modified |
| `src/pages/Hub.tsx` | Multiple emoji → icon swaps | Modified |
| `src/components/Mascot.tsx` | Replaces emoji record with `<FoxMascot mood={mood} />` | Modified |
| `src/games/letter-tap-sound/LevelSelect.tsx` | `⭐` text → `<StarIcon size={14} />` | Modified |
| `src/pages/Trophies.tsx` | Adds `<TrophyIcon />` in heading | Modified |

---

# PR-1: Guest Mode

## Task 1: Extend `userStore` with `isGuest` + `startGuestSession`

**Files:**
- Modify: `src/stores/userStore.ts`
- Create: `src/stores/userStore.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/stores/userStore.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
    // Persist middleware writes to localStorage — clear so tests don't leak
    localStorage.removeItem('kalima.user');
  });

  it('starts a guest session with a generated id', () => {
    useUserStore.getState().startGuestSession();
    const s = useUserStore.getState();
    expect(s.isGuest).toBe(true);
    expect(s.profile?.id).toMatch(/^guest-/);
    expect(s.profile?.displayName).toBeNull();
    expect(s.profile?.avatarUrl).toBeNull();
  });

  it('reuses the same guest id on repeated calls', () => {
    useUserStore.getState().startGuestSession();
    const first = useUserStore.getState().profile?.id;
    useUserStore.getState().startGuestSession();
    const second = useUserStore.getState().profile?.id;
    expect(first).toBe(second);
  });

  it('reset() clears isGuest and profile', () => {
    useUserStore.getState().startGuestSession();
    useUserStore.getState().reset();
    expect(useUserStore.getState().isGuest).toBe(false);
    expect(useUserStore.getState().profile).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `npx vitest run src/stores/userStore.test.ts`
Expected: tests fail because `startGuestSession` and `isGuest` don't exist yet.

- [ ] **Step 3: Update `userStore.ts`**

Replace `src/stores/userStore.ts` with:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'ar' | 'en';
export type AgeGroup = '3-5' | '6-8' | '9-12';

export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface UserState {
  profile: Profile | null;
  learnLang: Lang | null;
  uiLang: Lang;
  ageGroup: AgeGroup | null;
  isPremium: boolean;
  isGuest: boolean;
  setProfile: (p: Profile | null) => void;
  setLearnLang: (l: Lang | null) => void;
  setUiLang: (l: Lang) => void;
  setAgeGroup: (a: AgeGroup | null) => void;
  setPremium: (v: boolean) => void;
  startGuestSession: () => void;
  reset: () => void;
}

const defaults = {
  profile: null,
  learnLang: null,
  uiLang: 'ar' as Lang,
  ageGroup: null,
  isPremium: false,
  isGuest: false,
};

function generateGuestId(): string {
  const fn = (globalThis.crypto as Crypto | undefined)?.randomUUID;
  const uuid = typeof fn === 'function' ? fn.call(globalThis.crypto) : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `guest-${uuid}`;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setProfile: (profile) => set({ profile }),
      setLearnLang: (learnLang) => set({ learnLang }),
      setUiLang: (uiLang) => set({ uiLang }),
      setAgeGroup: (ageGroup) => set({ ageGroup }),
      setPremium: (isPremium) => set({ isPremium }),
      startGuestSession: () => {
        const existing = get().profile;
        if (existing && existing.id.startsWith('guest-')) {
          set({ isGuest: true });
          return;
        }
        set({
          isGuest: true,
          profile: { id: generateGuestId(), displayName: null, avatarUrl: null },
        });
      },
      reset: () => set(defaults),
    }),
    { name: 'kalima.user' },
  ),
);
```

- [ ] **Step 4: Run tests, confirm green**

Run: `npx vitest run src/stores/userStore.test.ts`
Expected: 3/3 pass.

- [ ] **Step 5: Run full test + typecheck**

Run: `npm run lint && npx tsc --noEmit && npm test -- --run`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/stores/userStore.ts src/stores/userStore.test.ts
git commit -m "feat(user-store): add isGuest flag and startGuestSession helper"
```

---

## Task 2: Create `guestProgress` localStorage module

**Files:**
- Create: `src/lib/guestProgress.ts`
- Create: `src/lib/guestProgress.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/guestProgress.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGuestProgress, saveGuestProgress } from './guestProgress';

describe('guestProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty map when no data exists', () => {
    const result = loadGuestProgress('letter-tap-sound', 'ar');
    expect(result.size).toBe(0);
  });

  it('round-trips stars through save then load', () => {
    saveGuestProgress('letter-tap-sound', 'ar', 0, 2);
    saveGuestProgress('letter-tap-sound', 'ar', 3, 3);
    const result = loadGuestProgress('letter-tap-sound', 'ar');
    expect(result.get(0)).toBe(2);
    expect(result.get(3)).toBe(3);
    expect(result.size).toBe(2);
  });

  it('separates progress by game and lang', () => {
    saveGuestProgress('letter-tap-sound', 'ar', 1, 3);
    saveGuestProgress('letter-tap-sound', 'en', 1, 1);
    expect(loadGuestProgress('letter-tap-sound', 'ar').get(1)).toBe(3);
    expect(loadGuestProgress('letter-tap-sound', 'en').get(1)).toBe(1);
  });

  it('overwrites a level when called again with higher stars', () => {
    saveGuestProgress('letter-tap-sound', 'ar', 0, 1);
    saveGuestProgress('letter-tap-sound', 'ar', 0, 3);
    expect(loadGuestProgress('letter-tap-sound', 'ar').get(0)).toBe(3);
  });

  it('returns empty map when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(loadGuestProgress('letter-tap-sound', 'ar').size).toBe(0);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run, confirm tests fail**

Run: `npx vitest run src/lib/guestProgress.test.ts`
Expected: file-not-found / import errors.

- [ ] **Step 3: Implement `guestProgress.ts`**

```ts
// src/lib/guestProgress.ts
import type { Lang } from '../stores/userStore';
import type { ProgressMap } from '../types/game';

function key(gameId: string, lang: Lang): string {
  return `kalima.guestProgress.${gameId}.${lang}`;
}

export function loadGuestProgress(gameId: string, lang: Lang): ProgressMap {
  try {
    const raw = localStorage.getItem(key(gameId, lang));
    if (!raw) return new Map();
    const entries = JSON.parse(raw) as Array<[number, number]>;
    return new Map(entries);
  } catch (err) {
    console.warn('loadGuestProgress failed:', err);
    return new Map();
  }
}

export function saveGuestProgress(
  gameId: string,
  lang: Lang,
  levelIndex: number,
  stars: number,
): void {
  try {
    const current = loadGuestProgress(gameId, lang);
    current.set(levelIndex, stars);
    const entries = Array.from(current.entries());
    localStorage.setItem(key(gameId, lang), JSON.stringify(entries));
  } catch (err) {
    console.warn('saveGuestProgress failed:', err);
  }
}
```

- [ ] **Step 4: Run, confirm green**

Run: `npx vitest run src/lib/guestProgress.test.ts`
Expected: 5/5 pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/guestProgress.ts src/lib/guestProgress.test.ts
git commit -m "feat(guest-progress): add localStorage progress module for guest sessions"
```

---

## Task 3: Branch `useGameProgress` on `isGuest`

**Files:**
- Modify: `src/hooks/useGameProgress.ts`
- Create: `src/hooks/useGameProgress.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/hooks/useGameProgress.test.ts
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameProgress } from './useGameProgress';
import { useUserStore } from '../stores/userStore';

describe('useGameProgress (guest path)', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
    localStorage.clear();
  });

  it('reads from localStorage when isGuest', async () => {
    useUserStore.getState().startGuestSession();
    localStorage.setItem(
      'kalima.guestProgress.letter-tap-sound.ar',
      JSON.stringify([[0, 2], [1, 3]]),
    );
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.progress.size).toBe(2));
    expect(result.current.progress.get(0)).toBe(2);
    expect(result.current.progress.get(1)).toBe(3);
    expect(result.current.loading).toBe(false);
  });

  it('upserts to localStorage when isGuest', async () => {
    useUserStore.getState().startGuestSession();
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await act(async () => {
      await result.current.upsert(0, 3);
    });
    expect(result.current.progress.get(0)).toBe(3);
    const persisted = localStorage.getItem('kalima.guestProgress.letter-tap-sound.ar');
    expect(persisted).toContain('[0,3]');
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npx vitest run src/hooks/useGameProgress.test.ts`
Expected: fails — the current hook always tries to hit Supabase.

- [ ] **Step 3: Update `useGameProgress.ts`**

Replace `src/hooks/useGameProgress.ts` with:

```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { Lang } from '../stores/userStore';
import type { ProgressMap } from '../types/game';
import { loadGuestProgress, saveGuestProgress } from '../lib/guestProgress';

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
  const isGuest = useUserStore((s) => s.isGuest);
  const fetchKey = profileId === null ? null : `${profileId}|${gameId}|${lang}`;
  const [progress, setProgress] = useState<ProgressMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  const loading = fetchKey !== null && fetchedKey !== fetchKey;

  useEffect(() => {
    if (!profileId || fetchKey === null) return;

    if (isGuest) {
      setProgress(loadGuestProgress(gameId, lang));
      setError(null);
      setFetchedKey(fetchKey);
      return;
    }

    let cancelled = false;
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
          setError(null);
        }
        setFetchedKey(fetchKey);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, gameId, lang, fetchKey, isGuest]);

  const upsert = useCallback(
    async (levelIndex: number, stars: number) => {
      if (!profileId) return;
      const existing = progress.get(levelIndex) ?? 0;
      if (stars <= existing) return;

      if (isGuest) {
        saveGuestProgress(gameId, lang, levelIndex, stars);
        setProgress((prev) => {
          const next = new Map(prev);
          next.set(levelIndex, stars);
          return next;
        });
        return;
      }

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
    [profileId, gameId, lang, progress, isGuest],
  );

  return { progress, loading, error, upsert };
}
```

- [ ] **Step 4: Run, confirm green**

Run: `npx vitest run src/hooks/useGameProgress.test.ts`
Expected: 2/2 pass.

- [ ] **Step 5: Run full suite to verify no regressions**

Run: `npm test -- --run`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useGameProgress.ts src/hooks/useGameProgress.test.ts
git commit -m "feat(progress): branch useGameProgress on isGuest to use localStorage"
```

---

## Task 4: Update `useAuth` to skip reset for guests

**Files:**
- Modify: `src/hooks/useAuth.ts`

- [ ] **Step 1: Read current code, identify change**

The current `hydrate` calls `store.reset()` when there is no Supabase user. For guests this would wipe out their guest profile on every page load (because no Supabase session exists). We must skip the reset when `isGuest` is already true.

- [ ] **Step 2: Modify the hydrate function**

In `src/hooks/useAuth.ts`, change the `if (!user)` branch:

```ts
if (!user) {
  if (!store.isGuest) {
    store.reset();
  }
  return;
}
```

- [ ] **Step 3: Run tests**

Run: `npm test -- --run`
Expected: all pass (existing useAuth tests don't cover the guest branch, but they shouldn't regress).

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "fix(auth): don't reset user store when session is a guest"
```

---

## Task 5: Skip Supabase calls in Onboarding for guests

**Files:**
- Modify: `src/pages/onboarding/LearnLanguage.tsx`
- Modify: `src/pages/onboarding/AgeGroupSelect.tsx`

- [ ] **Step 1: Update `LearnLanguage.tsx`**

In the `choose` function, branch on `isGuest`:

```tsx
import { useUserStore } from '../../stores/userStore';
// ... existing imports

export default function LearnLanguage() {
  // ... existing hooks
  const isGuest = useUserStore((s) => s.isGuest);

  async function choose(lang: Lang) {
    if (!profile) return;
    const previous = useUserStore.getState().learnLang;
    setError(null);
    setLearnLang(lang);
    if (isGuest) {
      navigate('/onboarding/age', { replace: true });
      return;
    }
    try {
      await updateProfile(profile.id, { learn_lang: lang });
      navigate('/onboarding/age', { replace: true });
    } catch (err) {
      console.error('updateProfile (learn_lang) failed:', err);
      setLearnLang(previous);
      setError(t('errors.action_failed'));
    }
  }
  // ... rest unchanged
}
```

- [ ] **Step 2: Update `AgeGroupSelect.tsx` with the equivalent guest branch**

Read the file first to see the exact submit function name, then apply the same pattern: read `isGuest` from the store, and when true, skip the `updateProfile` call but still navigate forward.

- [ ] **Step 3: Run existing onboarding tests**

Run: `npx vitest run src/pages/onboarding`
Expected: existing tests still pass (they don't set `isGuest`, so they go down the non-guest branch).

- [ ] **Step 4: Commit**

```bash
git add src/pages/onboarding/LearnLanguage.tsx src/pages/onboarding/AgeGroupSelect.tsx
git commit -m "feat(onboarding): skip Supabase profile upserts for guest sessions"
```

---

## Task 6: Add i18n keys + "Play as guest" CTA on Landing

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ar.json`
- Modify: `src/pages/Landing.tsx`
- Modify: `src/pages/Landing.test.tsx`

- [ ] **Step 1: Add new translation keys**

`en.json` — extend the `landing` block:
```json
"cta_guest": "Play as guest",
```

`ar.json` — extend the `landing` block:
```json
"cta_guest": "العب كضيف",
```

`en.json` extend `settings`:
```json
"guest_upgrade": "Save my progress — Sign in with Google",
"guest_upgrade_warning": "Heads up: your guest stars won't carry over yet — that's coming soon.",
```

`ar.json` extend `settings`:
```json
"guest_upgrade": "احفظ تقدّمي — سجّل بحساب Google",
"guest_upgrade_warning": "تنبيه: لن يتم نقل نجومك كضيف بعد، هذه الميزة قادمة قريباً.",
```

- [ ] **Step 2: Write the failing test**

In `src/pages/Landing.test.tsx`, add:

```tsx
it('starts a guest session and navigates to onboarding', () => {
  render(<MemoryRouter><Landing /></MemoryRouter>);
  fireEvent.click(screen.getByTestId('landing-guest-button'));
  expect(useUserStore.getState().isGuest).toBe(true);
  expect(useUserStore.getState().profile?.id).toMatch(/^guest-/);
  // navigation mocked elsewhere — assert via navigateMock if available, else
  // check the URL via MemoryRouter routes setup
});
```

(If the existing test file doesn't already mock `useNavigate`, add a mock in the same style as `Hub.test.tsx`.)

- [ ] **Step 3: Run test, confirm failure**

Run: `npx vitest run src/pages/Landing.test.tsx`
Expected: fails (testid doesn't exist yet).

- [ ] **Step 4: Update `Landing.tsx`**

In `src/pages/Landing.tsx`, just below the primary `Start Learning` button block (inside the existing `.mt-8` container), add:

```tsx
import { useUserStore } from '../stores/userStore';
// ... existing imports

export default function Landing() {
  // ... existing hooks
  const startGuestSession = useUserStore((s) => s.startGuestSession);

  function handleGuest() {
    startGuestSession();
    navigate('/onboarding');
  }

  // ... inside JSX, after the Start Learning button:
  <button
    type="button"
    onClick={handleGuest}
    data-testid="landing-guest-button"
    className="mt-4 text-ink font-black text-base underline underline-offset-4 decoration-2 decoration-ink/40 hover:decoration-ink"
  >
    {t('landing.cta_guest')}
  </button>
}
```

- [ ] **Step 5: Run tests, confirm green**

Run: `npx vitest run src/pages/Landing.test.tsx`
Expected: pass, including the new guest test.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/ar.json src/pages/Landing.tsx src/pages/Landing.test.tsx
git commit -m "feat(landing): add Play as guest CTA"
```

---

## Task 7: Update Settings for guest users

**Files:**
- Modify: `src/pages/Settings.tsx`
- Modify: `src/pages/Settings.test.tsx`

- [ ] **Step 1: Write the failing test**

In `src/pages/Settings.test.tsx`, add:

```tsx
it('shows the sign-in upgrade CTA for guest users', async () => {
  useUserStore.getState().reset();
  useUserStore.getState().startGuestSession();
  // (also set ageGroup + learnLang if RequireProfile guards the test path,
  //  but Settings can be rendered directly)
  render(<MemoryRouter><Settings /></MemoryRouter>);
  expect(screen.getByTestId('guest-upgrade-cta')).toBeInTheDocument();
  expect(screen.getByTestId('guest-upgrade-warning')).toBeInTheDocument();
  expect(screen.queryByTestId('logout')).not.toBeInTheDocument();
});

it('shows sign-out for non-guest users', () => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: 'K', avatarUrl: null });
  render(<MemoryRouter><Settings /></MemoryRouter>);
  expect(screen.getByTestId('logout')).toBeInTheDocument();
  expect(screen.queryByTestId('guest-upgrade-cta')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests, confirm failure**

Run: `npx vitest run src/pages/Settings.test.tsx`
Expected: new tests fail.

- [ ] **Step 3: Update `Settings.tsx`**

Read the existing file, then change the bottom block of the JSX from:

```tsx
<Button variant="accent" data-testid="logout" onClick={logout}>
  {t('settings.logout')}
</Button>
```

to:

```tsx
{isGuest ? (
  <>
    <Button
      variant="accent"
      data-testid="guest-upgrade-cta"
      onClick={signInForUpgrade}
    >
      {t('settings.guest_upgrade')}
    </Button>
    <p
      data-testid="guest-upgrade-warning"
      className="text-xs font-bold text-ink/70 text-center max-w-xs"
    >
      {t('settings.guest_upgrade_warning')}
    </p>
  </>
) : (
  <Button variant="accent" data-testid="logout" onClick={logout}>
    {t('settings.logout')}
  </Button>
)}
```

Add `const isGuest = useUserStore((s) => s.isGuest);` near the other store selectors, and add a handler:

```tsx
async function signInForUpgrade() {
  setError(null);
  try {
    const { error: oauthError } = await signInWithGoogle();
    if (oauthError) {
      console.error('signInWithGoogle (upgrade) error:', oauthError);
      setError(t('errors.action_failed'));
    }
  } catch (err) {
    console.error('signInWithGoogle (upgrade) threw:', err);
    setError(t('errors.action_failed'));
  }
}
```

Import `signInWithGoogle` at the top: `import { signInWithGoogle, signOut } from '../lib/auth';`

- [ ] **Step 4: Run tests, confirm green**

Run: `npx vitest run src/pages/Settings.test.tsx`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Settings.tsx src/pages/Settings.test.tsx
git commit -m "feat(settings): show sign-in upgrade CTA for guest sessions"
```

---

## Task 8: PR-1 final verification

- [ ] **Step 1: Full lint + typecheck + test + build**

Run:
```
npm run lint && npx tsc --noEmit && npm test -- --run && npm run build
```
Expected: all clean.

- [ ] **Step 2: Push**

```bash
git push origin master && git push origin master:main
```

(Railway redeploys automatically from `main`.)

---

# PR-2: Custom Icon Set

## Task 9: Icon scaffold + first icon (`StarIcon`) + shared test

**Files:**
- Create: `src/components/icons/Icon.types.ts`
- Create: `src/components/icons/StarIcon.tsx`
- Create: `src/components/icons/index.ts`
- Create: `src/components/icons/icons.test.tsx`

- [ ] **Step 1: Define shared types**

```ts
// src/components/icons/Icon.types.ts
export interface IconProps {
  size?: number;
  className?: string;
  title?: string;
}
```

- [ ] **Step 2: Build the `StarIcon`**

```tsx
// src/components/icons/StarIcon.tsx
import type { IconProps } from './Icon.types';

export function StarIcon({ size = 32, className, title }: IconProps) {
  const labelled = Boolean(title);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {labelled && <title>{title}</title>}
      <path
        d="M32 6 L40 24 L60 26 L45 40 L49 60 L32 50 L15 60 L19 40 L4 26 L24 24 Z"
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 3: Barrel export**

```ts
// src/components/icons/index.ts
export { StarIcon } from './StarIcon';
```

- [ ] **Step 4: Write the shared smoke test**

```tsx
// src/components/icons/icons.test.tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as Icons from './index';

const ALL = Object.entries(Icons);

describe('icon set', () => {
  it('exports at least one icon', () => {
    expect(ALL.length).toBeGreaterThan(0);
  });

  for (const [name, Component] of ALL) {
    if (typeof Component !== 'function') continue;

    it(`${name} renders an SVG`, () => {
      const { container } = render(<Component />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it(`${name} respects the size prop`, () => {
      const { container } = render(<Component size={48} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it(`${name} renders a <title> when title prop is set`, () => {
      const { container } = render(<Component title={`${name} icon`} />);
      const titleEl = container.querySelector('title');
      expect(titleEl).not.toBeNull();
      expect(titleEl?.textContent).toBe(`${name} icon`);
    });
  }
});
```

> Note: `FoxMascot` will need a default mood when rendered with no props (handle in Task 10). The smoke test calls every export with no required props; design icons so they all render with zero props.

- [ ] **Step 5: Run tests, confirm green**

Run: `npx vitest run src/components/icons`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/icons
git commit -m "feat(icons): add icon scaffold and StarIcon"
```

---

## Task 10: Build remaining Tier-1 icons

**Files:**
- Create: `src/components/icons/BeeMascot.tsx`
- Create: `src/components/icons/TrophyIcon.tsx`
- Create: `src/components/icons/LockIcon.tsx`
- Create: `src/components/icons/PlayIcon.tsx`
- Create: `src/components/icons/FoxMascot.tsx`
- Modify: `src/components/icons/index.ts`

- [ ] **Step 1: Design and implement each Tier-1 icon**

Follow the style spec from the design doc strictly:
- viewBox `0 0 64 64`
- `stroke="#1A1A2E"`, `strokeWidth={5}`, `strokeLinecap="round"`, `strokeLinejoin="round"`
- Fills from palette only: `#3B82F6` cobalt, `#FACC15` sunny, `#F87171` tomato, `#84CC16` lime, `#F72585` accent, `#FFFFFF` white
- Same `IconProps` and a11y pattern as `StarIcon`

**`BeeMascot.tsx`** — chubby bee body (ellipse, sunny fill with two black stripes), round head, dot eyes, small smile, two white wings on the back; sized to feel like a mascot when scaled up to 160px.

**`TrophyIcon.tsx`** — cup-shaped trophy (sunny fill), two side handles, rectangular base, optional star detail on the cup.

**`LockIcon.tsx`** — rounded square body (white fill), shackle arc on top (no fill), small keyhole at center (dark dot + slot).

**`PlayIcon.tsx`** — right-pointing triangle, tomato fill, black outline. Optical-center the triangle so it doesn't look off-balance in a circle.

**`FoxMascot.tsx`** — takes a `mood: 'idle' | 'success' | 'fail'` prop (default `'idle'`). Body is a fox face (orange `#FB923C` or tomato fill, white snout, dark dot eyes); swap mouth shape per mood (neutral, big grin, "oof" downturn).

```tsx
// src/components/icons/FoxMascot.tsx
import type { IconProps } from './Icon.types';
export type FoxMood = 'idle' | 'success' | 'fail';
interface FoxProps extends IconProps {
  mood?: FoxMood;
}
export function FoxMascot({ mood = 'idle', size = 64, className, title }: FoxProps) {
  // ... rendering code
}
```

- [ ] **Step 2: Update the barrel export**

```ts
// src/components/icons/index.ts
export { StarIcon } from './StarIcon';
export { BeeMascot } from './BeeMascot';
export { TrophyIcon } from './TrophyIcon';
export { LockIcon } from './LockIcon';
export { PlayIcon } from './PlayIcon';
export { FoxMascot } from './FoxMascot';
```

- [ ] **Step 3: Run smoke test for all icons**

Run: `npx vitest run src/components/icons`
Expected: every icon passes the shared smoke test (renders SVG, respects size, renders title).

- [ ] **Step 4: Visual sanity check**

Run: `npm run dev` and open the app — eyeball the icons at small (14px) and large (160px) sizes. Adjust stroke widths if they're illegible at 14px.

- [ ] **Step 5: Commit**

```bash
git add src/components/icons
git commit -m "feat(icons): add Tier-1 icons (Bee, Trophy, Lock, Play, Fox)"
```

---

## Task 11: Build Tier-2 icons

**Files:**
- Create: `src/components/icons/LetterTileIcon.tsx`
- Create: `src/components/icons/PuzzleIcon.tsx`
- Create: `src/components/icons/GearIcon.tsx`
- Create: `src/components/icons/LangToggleIcon.tsx`
- Create: `src/components/icons/FlameIcon.tsx`
- Modify: `src/components/icons/index.ts`

- [ ] **Step 1: Implement each Tier-2 icon**

Follow the same style spec.

**`LetterTileIcon.tsx`** — rounded square (cobalt fill), large white "A" or generic letter glyph in the middle.

**`PuzzleIcon.tsx`** — one classic puzzle piece (tomato fill), tab on one side and slot on the other.

**`GearIcon.tsx`** — 8-toothed gear (sunny fill), center hole white-filled, optional center dot.

**`LangToggleIcon.tsx`** — speech-bubble style with two letters inside ("ع" and "EN") split diagonally. Cobalt + white. Set, but not necessarily used in Header.

**`FlameIcon.tsx`** — teardrop flame shape (tomato fill on outside, sunny fill inside), pointed top, rounded bottom.

- [ ] **Step 2: Update barrel export to include all Tier-2 icons**

- [ ] **Step 3: Run smoke test**

Run: `npx vitest run src/components/icons`
Expected: every icon passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/icons
git commit -m "feat(icons): add Tier-2 icons (LetterTile, Puzzle, Gear, LangToggle, Flame)"
```

---

## Task 12: Swap emojis in Landing

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Replace mascot emoji**

In the hero `motion.div`, replace the `🐝` text with `<BeeMascot size={140} />`. Remove `text-7xl sm:text-8xl` since the icon sets its own size; keep the cobalt circle + border-4 + shadow-pop-lg wrapper as a "stage" for the icon.

- [ ] **Step 2: Replace the play arrow**

In the start button's children, replace the `▶` text with `<PlayIcon size={28} className="me-2" />` (or wrap the text in a flex container). Keep the surrounding `<Button>` markup.

- [ ] **Step 3: Run Landing tests**

Run: `npx vitest run src/pages/Landing.test.tsx`
Expected: pass. Existing testids unchanged.

- [ ] **Step 4: Visual check**

`npm run dev`, open Landing — confirm the bee renders inside the cobalt circle and the play arrow sits next to "Start Learning" cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat(landing): swap emojis for custom icons (BeeMascot, PlayIcon)"
```

---

## Task 13: Swap emojis in Hub

**Files:**
- Modify: `src/pages/Hub.tsx`

- [ ] **Step 1: Replace each emoji with the corresponding icon**

Inside `Hub.tsx`:
- ⭐ in the stars pill → `<StarIcon size={20} />`
- 🔤 inside the Continue hero card sunny tile → `<LetterTileIcon size={32} />`
- ▶ in the Continue Play button → `<PlayIcon size={20} />` (keep the `▶` as a fallback if you prefer text + icon)
- 🔤 in the Letter Tap GameTile → `<LetterTileIcon size={36} />`
- 🧩 in the Word Builder GameTile → `<PuzzleIcon size={36} />`
- 🔒 in the two locked GameTiles → `<LockIcon size={36} />`
- 🏆 in the Trophies menu link → `<TrophyIcon size={22} />`
- ⚙️ in the Settings menu link → `<GearIcon size={22} />`

The `<GameTile>` component currently takes `emoji: string`; refactor its prop to take `icon: ReactNode` instead, and update call sites accordingly.

```tsx
interface GameTileProps {
  // ...
  icon: ReactNode;
}
function GameTile({ icon, /* ... */ }: GameTileProps) {
  return (
    // ...
    <div className="text-4xl leading-none" aria-hidden="true">{icon}</div>
    // ...
  );
}
```

- [ ] **Step 2: Run Hub tests**

Run: `npx vitest run src/pages/Hub.test.tsx`
Expected: pass. testids preserved.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Hub.tsx
git commit -m "feat(hub): swap emoji icons for custom Pop Cartoon SVGs"
```

---

## Task 14: Replace `Mascot.tsx` with `FoxMascot`

**Files:**
- Modify: `src/components/Mascot.tsx`
- Modify: `src/components/Mascot.test.tsx`

- [ ] **Step 1: Update the implementation**

```tsx
// src/components/Mascot.tsx
import { FoxMascot, type FoxMood } from './icons/FoxMascot';

export type MascotMood = FoxMood;

interface MascotProps {
  mood?: MascotMood;
}

const ANIM: Record<MascotMood, string> = {
  idle: '',
  success: 'animate-bounce',
  fail: 'animate-pulse',
};

export function Mascot({ mood = 'idle' }: MascotProps) {
  return (
    <div data-testid="mascot" data-mood={mood} className={`inline-block ${ANIM[mood]}`}>
      <FoxMascot mood={mood} size={96} />
    </div>
  );
}
```

- [ ] **Step 2: Update `Mascot.test.tsx`**

The existing tests only check `data-testid="mascot"` and `data-mood` attributes on the wrapper — they don't assert on emoji characters. **No test changes required**, the existing tests will pass against the new `FoxMascot`-backed implementation. Skip to Step 3.

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/components/Mascot.test.tsx`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/Mascot.tsx
git commit -m "feat(mascot): replace emoji mood icons with FoxMascot component"
```

---

## Task 15: Swap `⭐` in LevelSelect and add TrophyIcon to Trophies

**Files:**
- Modify: `src/games/letter-tap-sound/LevelSelect.tsx`
- Modify: `src/pages/Trophies.tsx`

- [ ] **Step 1: LevelSelect star**

Replace:
```tsx
{stars > 0 && (
  <span className="text-xs">{'⭐'.repeat(stars)}</span>
)}
```

With:
```tsx
{stars > 0 && (
  <span className="flex gap-0.5" aria-label={`${stars} stars`}>
    {Array.from({ length: stars }).map((_, i) => (
      <StarIcon key={i} size={14} />
    ))}
  </span>
)}
```

Import: `import { StarIcon } from '../../components/icons';`

- [ ] **Step 2: Trophies page**

Replace `Trophies.tsx` with:

```tsx
import { TrophyIcon } from '../components/icons';

export default function Trophies() {
  return (
    <section data-testid="trophies-page" className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <TrophyIcon size={48} />
        <h2 className="font-display font-black text-3xl text-ink">Trophy Room</h2>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run existing tests**

Run: `npx vitest run src/games/letter-tap-sound src/pages/Trophies`
Expected: pass (no Trophies test yet, LevelSelect test should still pass — verify by reading its assertions about stars).

- [ ] **Step 4: Commit**

```bash
git add src/games/letter-tap-sound/LevelSelect.tsx src/pages/Trophies.tsx
git commit -m "feat(level-select,trophies): use StarIcon and TrophyIcon"
```

---

## Task 16: PR-2 final verification

- [ ] **Step 1: Full lint + typecheck + tests + build**

```
npm run lint && npx tsc --noEmit && npm test -- --run && npm run build
```
Expected: all clean.

- [ ] **Step 2: Manual visual check**

Run `npm run dev` and walk through:
- Landing → bee mascot renders in cobalt circle, play arrow looks balanced
- Click "Start Learning" or "Play as guest" → Onboarding → Hub
- Hub → stars pill shows custom star, Continue card has custom letter tile + play, game grid uses custom icons, menu strip has Trophy + Gear icons
- Letter Tap → LevelSelect shows tiny custom stars under each letter once played
- Settings → for guest, shows upgrade CTA; for signed-in, shows sign-out

- [ ] **Step 3: Push**

```bash
git push origin master && git push origin master:main
```

---

# Self-review notes (for the executor)

- **DRY:** `IconProps` is shared; the smoke test iterates every export so adding a new icon costs nothing in test code.
- **TDD:** Each non-cosmetic task has a failing test before implementation.
- **YAGNI:** `LangToggleIcon` and `FlameIcon` ship but are not used yet (they're tier-2 by user request and prepare us for header + streaks).
- **Commits:** Each task ends in a commit; PR-1 and PR-2 are independent and can be pushed separately.
- **Risk surface:** The biggest TypeScript risk is the `GameTile` prop rename in Task 13 — if you forget to update a call site, `tsc --noEmit` will catch it.

# Open follow-ups (out of scope, parked for later)

- Guest → signed-in progress migration
- Header lang toggle redesign using `LangToggleIcon`
- Streak counter UI using `FlameIcon`
- Trophies page content beyond the heading
- Onboarding pages Pop Cartoon redesign (still cosmetic placeholder beyond the icon swap)
