# Kalima Phase 2 — Auth & Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Google sign-in, create a `profiles` row per user, and walk the user through a two-step onboarding (learning language → age group) so returning users land directly on the Hub.

**Architecture:** All client-side. Supabase Auth (Google OAuth provider) issues a session, the SPA fetches/creates the matching `profiles` row, and React Router gates protected routes behind two checks: session present, and profile complete (both `learn_lang` and `age_group` set). UI strings continue through i18next; the existing Zustand `userStore` becomes the in-memory mirror of the `profiles` row.

**Tech Stack:** Same as Phase 1 — Supabase JS client, React Router v6, Zustand, i18next. No new runtime dependencies. SQL migrations are checked in under `supabase/migrations/` and applied manually via the Supabase dashboard.

---

## Phase 2 Boundary

**In scope:**
- `profiles` table + RLS policies (SQL migration checked into repo, applied manually)
- Google OAuth sign-in from Landing
- OAuth callback handler at `/auth/callback`
- First-run onboarding: pick learning language → pick age group → write profile → land on Hub
- Auth gate (`/hub`, `/game/:gameId`, `/trophies`, `/settings` require a session + complete profile)
- Hub greeting (name + mascot placeholder, no real game cards)
- Settings: UI language toggle (working), change-language / change-age (returns user to onboarding), logout

**Out of scope (later phases):**
- Game engine and any real game content
- Trophy logic, streaks, XP
- Payments / Moyasar / subscriptions
- Mascot character art (placeholder emoji only)
- Multi-child accounts (explicitly out per spec §9)

---

## Manual Setup (Khalid — before Task 1)

These are one-time human-side steps. The plan assumes they are done before execution.

1. **Supabase project** — create at supabase.com if not already
2. **Google Cloud OAuth client**:
   - Console → APIs & Services → Credentials → Create OAuth client ID → Web application
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Save Client ID + Client Secret
3. **Supabase dashboard → Authentication → Providers → Google**:
   - Enable, paste Client ID + Secret, save
4. **Supabase dashboard → Authentication → URL Configuration**:
   - Site URL: `https://kalima.fun`
   - Redirect URLs: add `https://kalima.fun/auth/callback`, `http://localhost:5173/auth/callback`
5. **Railway / local `.env`**: confirm `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set (already from Phase 1)
6. **Migration application**: Task 1 produces the SQL file; paste into Supabase dashboard → SQL Editor → Run, after Task 1 commits

---

## File Structure

```
supabase/
  migrations/
    20260521000001_profiles.sql        # CREATE
src/
  lib/
    auth.ts                            # CREATE — signInWithGoogle, signOut
    profile.ts                         # CREATE — fetchProfile, ensureProfile, updateProfile, isProfileComplete, ProfileRow type
  hooks/
    useAuth.ts                         # CREATE — subscribes to supabase.auth, hydrates userStore
  components/
    RequireAuth.tsx                    # CREATE — redirects to / if no session
    RequireProfile.tsx                 # CREATE — redirects to /onboarding if profile incomplete
  pages/
    AuthCallback.tsx                   # CREATE — processes /auth/callback
    onboarding/
      LearnLanguage.tsx                # CREATE — step 1
      AgeGroupSelect.tsx               # CREATE — step 2
  App.tsx                              # MODIFY — wire useAuth, add /auth/callback, wrap protected routes
  pages/Landing.tsx                    # MODIFY — CTA calls signInWithGoogle
  pages/Onboarding.tsx                 # MODIFY — container that picks step from profile state
  pages/Hub.tsx                        # MODIFY — greet user, placeholder game grid
  pages/Settings.tsx                   # MODIFY — UI lang toggle, change-flow links, logout
  i18n/locales/ar.json                 # MODIFY — onboarding/hub/settings strings
  i18n/locales/en.json                 # MODIFY — same
```

---

### Task 1: Profiles table + RLS migration

**Files:**
- Create: `supabase/migrations/20260521000001_profiles.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/20260521000001_profiles.sql
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  age_group    text check (age_group in ('3-5', '6-8', '9-12')),
  learn_lang   text check (learn_lang in ('ar', 'en')),
  ui_lang      text check (ui_lang in ('ar', 'en')) default 'ar',
  is_premium   boolean default false,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);
```

- [ ] **Step 2: Apply the migration manually**

Open Supabase dashboard → SQL Editor → paste the file contents → Run.
Expected: 1 `CREATE TABLE`, 1 `ALTER TABLE`, 3 `CREATE POLICY` succeed. The table appears in Table Editor with RLS enabled.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260521000001_profiles.sql
git commit -m "feat(phase-2): add profiles table + RLS policies"
```

---

### Task 2: Auth + profile data layer

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/profile.ts`
- Test:   `src/lib/profile.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/profile.test.ts
import { describe, expect, it } from 'vitest';
import { isProfileComplete, type ProfileRow } from './profile';

const base: ProfileRow = {
  id: 'u1',
  display_name: 'A',
  avatar_url: null,
  age_group: null,
  learn_lang: null,
  ui_lang: 'ar',
  is_premium: false,
};

describe('isProfileComplete', () => {
  it('returns false when learn_lang missing', () => {
    expect(isProfileComplete({ ...base, age_group: '3-5' })).toBe(false);
  });
  it('returns false when age_group missing', () => {
    expect(isProfileComplete({ ...base, learn_lang: 'ar' })).toBe(false);
  });
  it('returns true when both set', () => {
    expect(isProfileComplete({ ...base, learn_lang: 'ar', age_group: '3-5' })).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/profile.test.ts`
Expected: FAIL — module `./profile` does not exist.

- [ ] **Step 3: Implement `src/lib/auth.ts`**

```ts
// src/lib/auth.ts
import { supabase } from './supabase';

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
```

- [ ] **Step 4: Implement `src/lib/profile.ts`**

```ts
// src/lib/profile.ts
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AgeGroup, Lang } from '../stores/userStore';

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age_group: AgeGroup | null;
  learn_lang: Lang | null;
  ui_lang: Lang;
  is_premium: boolean;
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function ensureProfile(user: User): Promise<ProfileRow> {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const row: ProfileRow = {
    id: user.id,
    display_name: typeof meta.full_name === 'string' ? meta.full_name : null,
    avatar_url: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
    age_group: null,
    learn_lang: null,
    ui_lang: 'ar',
    is_premium: false,
  };
  const { error } = await supabase.from('profiles').insert(row);
  if (error) throw error;
  return row;
}

export async function updateProfile(userId: string, patch: Partial<ProfileRow>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export function isProfileComplete(p: ProfileRow): boolean {
  return p.learn_lang !== null && p.age_group !== null;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/lib/profile.test.ts`
Expected: PASS — 3/3.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/profile.ts src/lib/profile.test.ts
git commit -m "feat(phase-2): add auth + profile data layer"
```

---

### Task 3: `useAuth` hook — session subscription + store hydration

**Files:**
- Create: `src/hooks/useAuth.ts`
- Test:   `src/hooks/useAuth.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/hooks/useAuth.test.tsx
import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
  from: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
  },
}));

import { useAuth } from './useAuth';
import { useUserStore } from '../stores/userStore';

const fakeUser = {
  id: 'u1',
  user_metadata: { full_name: 'Khalid', avatar_url: 'http://x/a.png' },
};

const completeRow = {
  id: 'u1',
  display_name: 'Khalid',
  avatar_url: 'http://x/a.png',
  age_group: '6-8',
  learn_lang: 'ar',
  ui_lang: 'ar',
  is_premium: false,
};

beforeEach(() => {
  useUserStore.getState().reset();
  mocks.getSession.mockReset();
  mocks.onAuthStateChange.mockReset();
  mocks.from.mockReset();
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  });
});

afterEach(() => useUserStore.getState().reset());

function mockProfileSelect(row: unknown) {
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: row, error: null }),
      }),
    }),
  });
}

describe('useAuth', () => {
  it('hydrates store from an existing profile on session restore', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: fakeUser } } });
    mockProfileSelect(completeRow);

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(useUserStore.getState().profile?.id).toBe('u1');
      expect(useUserStore.getState().learnLang).toBe('ar');
      expect(useUserStore.getState().ageGroup).toBe('6-8');
    });
  });

  it('resets store when session is null', async () => {
    useUserStore.getState().setProfile({ id: 'old', displayName: null, avatarUrl: null });
    mocks.getSession.mockResolvedValue({ data: { session: null } });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(useUserStore.getState().profile).toBeNull();
    });
  });

  it('unsubscribes on unmount', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    const { unmount } = renderHook(() => useAuth());
    await act(async () => {}); // flush
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/hooks/useAuth.test.tsx`
Expected: FAIL — `useAuth` not found.

- [ ] **Step 3: Implement the hook**

```ts
// src/hooks/useAuth.ts
import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ensureProfile } from '../lib/profile';
import { useUserStore } from '../stores/userStore';

export function useAuth() {
  useEffect(() => {
    let cancelled = false;

    async function hydrate(user: User | null) {
      const store = useUserStore.getState();
      if (!user) {
        store.reset();
        return;
      }
      const row = await ensureProfile(user);
      if (cancelled) return;
      store.setProfile({
        id: row.id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
      });
      if (row.learn_lang) store.setLearnLang(row.learn_lang);
      if (row.age_group) store.setAgeGroup(row.age_group);
      store.setUiLang(row.ui_lang);
      store.setPremium(row.is_premium);
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      hydrate(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/hooks/useAuth.test.tsx`
Expected: PASS — 3/3.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.ts src/hooks/useAuth.test.tsx
git commit -m "feat(phase-2): add useAuth hook to hydrate userStore from session"
```

---

### Task 4: Wire Landing CTA to Google sign-in

**Files:**
- Modify: `src/pages/Landing.tsx`
- Test:   `src/pages/Landing.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/Landing.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));
vi.mock('../lib/auth', () => ({
  signInWithGoogle: mocks.signIn,
  signOut: vi.fn(),
}));

import Landing from './Landing';

beforeEach(() => {
  mocks.signIn.mockReset();
});

describe('Landing', () => {
  it('calls signInWithGoogle when CTA is clicked', async () => {
    mocks.signIn.mockResolvedValue({ data: {}, error: null });
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: /start|ابدأ/i }));
    expect(mocks.signIn).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/Landing.test.tsx`
Expected: FAIL — current CTA has no `onClick`.

- [ ] **Step 3: Modify `Landing.tsx`**

```tsx
// src/pages/Landing.tsx
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { signInWithGoogle } from '../lib/auth';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <section data-testid="landing-page" className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-6xl text-ink">Kalima</h1>
      <p className="text-xl text-ink/80 text-center max-w-md">{t('landing.tagline')}</p>
      <Button variant="primary" onClick={() => signInWithGoogle()}>
        {t('landing.cta_start')}
      </Button>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/Landing.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Landing.tsx src/pages/Landing.test.tsx
git commit -m "feat(phase-2): Landing CTA triggers Google sign-in"
```

---

### Task 5: `/auth/callback` page

**Files:**
- Create: `src/pages/AuthCallback.tsx`
- Test:   `src/pages/AuthCallback.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/AuthCallback.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AuthCallback from './AuthCallback';

describe('AuthCallback', () => {
  it('renders a brief progress indicator', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('auth-callback')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/AuthCallback.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `AuthCallback.tsx`**

The Supabase JS client auto-handles the OAuth code exchange on page load (via `detectSessionInUrl: true` which is the default — confirmed already enabled in Phase 1 `src/lib/supabase.ts`). This page only needs to show a spinner until `useAuth` finishes hydrating, then route the user.

```tsx
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { isProfileComplete } from '../lib/profile';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);

  useEffect(() => {
    if (!profile) return; // still hydrating
    const complete = isProfileComplete({
      id: profile.id,
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl,
      age_group: ageGroup,
      learn_lang: learnLang,
      ui_lang: 'ar',
      is_premium: false,
    });
    navigate(complete ? '/hub' : '/onboarding', { replace: true });
  }, [profile, learnLang, ageGroup, navigate]);

  return (
    <div data-testid="auth-callback" className="min-h-screen flex items-center justify-center">
      <p className="text-ink/70">{t('auth.signing_in')}</p>
    </div>
  );
}
```

- [ ] **Step 4: Add `auth.signing_in` to i18n locales**

`src/i18n/locales/ar.json`: add `"auth": { "signing_in": "جارٍ تسجيل الدخول..." }`
`src/i18n/locales/en.json`: add `"auth": { "signing_in": "Signing in..." }`

- [ ] **Step 5: Register the route in `App.tsx`**

```tsx
// src/App.tsx — add the import and the route
import AuthCallback from './pages/AuthCallback';
// ...
<Route path="/auth/callback" element={<AuthCallback />} />
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: All pass (existing 25+ tests plus the new AuthCallback case).

- [ ] **Step 7: Commit**

```bash
git add src/pages/AuthCallback.tsx src/pages/AuthCallback.test.tsx src/App.tsx \
        src/i18n/locales/ar.json src/i18n/locales/en.json
git commit -m "feat(phase-2): add /auth/callback page that routes by profile state"
```

---

### Task 6: Route guards — `RequireAuth` + `RequireProfile`

**Files:**
- Create: `src/components/RequireAuth.tsx`
- Create: `src/components/RequireProfile.tsx`
- Test:   `src/components/RequireAuth.test.tsx`
- Test:   `src/components/RequireProfile.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/RequireAuth.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import RequireAuth from './RequireAuth';
import { useUserStore } from '../stores/userStore';

function Protected() {
  return <div data-testid="protected">ok</div>;
}
function PublicLanding() {
  return <div data-testid="landing">home</div>;
}

function tree(initialPath: string) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route element={<RequireAuth />}>
          <Route path="/hub" element={<Protected />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  beforeEach(() => useUserStore.getState().reset());

  it('redirects to / when no profile in store', () => {
    render(tree('/hub'));
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  it('renders child when profile present', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    render(tree('/hub'));
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/RequireProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import RequireProfile from './RequireProfile';
import { useUserStore } from '../stores/userStore';

function Inner() { return <div data-testid="inner">inner</div>; }
function OB() { return <div data-testid="onboarding">ob</div>; }

function tree(path: string) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/onboarding" element={<OB />} />
        <Route element={<RequireProfile />}>
          <Route path="/hub" element={<Inner />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireProfile', () => {
  beforeEach(() => useUserStore.getState().reset());

  it('redirects to /onboarding when learn_lang missing', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    useUserStore.getState().setAgeGroup('3-5');
    render(tree('/hub'));
    expect(screen.getByTestId('onboarding')).toBeInTheDocument();
  });

  it('redirects to /onboarding when age_group missing', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    useUserStore.getState().setLearnLang('ar');
    render(tree('/hub'));
    expect(screen.getByTestId('onboarding')).toBeInTheDocument();
  });

  it('renders child when both fields set', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    useUserStore.getState().setLearnLang('ar');
    useUserStore.getState().setAgeGroup('3-5');
    render(tree('/hub'));
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/RequireAuth.test.tsx src/components/RequireProfile.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `RequireAuth.tsx`**

```tsx
// src/components/RequireAuth.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export default function RequireAuth() {
  const profile = useUserStore((s) => s.profile);
  if (!profile) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

- [ ] **Step 4: Implement `RequireProfile.tsx`**

```tsx
// src/components/RequireProfile.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export default function RequireProfile() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  if (!learnLang || !ageGroup) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/components/RequireAuth.test.tsx src/components/RequireProfile.test.tsx`
Expected: PASS — 5/5.

- [ ] **Step 6: Commit**

```bash
git add src/components/RequireAuth.tsx src/components/RequireProfile.tsx \
        src/components/RequireAuth.test.tsx src/components/RequireProfile.test.tsx
git commit -m "feat(phase-2): add RequireAuth + RequireProfile route guards"
```

---

### Task 7: Onboarding step 1 — Learning language

**Files:**
- Create: `src/pages/onboarding/LearnLanguage.tsx`
- Test:   `src/pages/onboarding/LearnLanguage.test.tsx`
- Modify: `src/i18n/locales/ar.json`, `src/i18n/locales/en.json`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/onboarding/LearnLanguage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import LearnLanguage from './LearnLanguage';
import { useUserStore } from '../../stores/userStore';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  mocks.navigate.mockReset();
  mocks.updateProfile.mockClear();
});

describe('LearnLanguage', () => {
  it('persists ar choice and advances to step 2', async () => {
    render(<MemoryRouter><LearnLanguage /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('choose-ar'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { learn_lang: 'ar' });
    expect(useUserStore.getState().learnLang).toBe('ar');
    expect(mocks.navigate).toHaveBeenCalledWith('/onboarding/age', { replace: true });
  });

  it('persists en choice', async () => {
    render(<MemoryRouter><LearnLanguage /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('choose-en'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { learn_lang: 'en' });
    expect(useUserStore.getState().learnLang).toBe('en');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/onboarding/LearnLanguage.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Add i18n strings**

`src/i18n/locales/ar.json`:
```json
"onboarding": {
  "learn_lang_title": "ماذا تريد أن تتعلم؟",
  "learn_lang_ar": "أتعلم العربية",
  "learn_lang_en": "I'm learning English",
  "age_title": "كم عمرك؟",
  "age_3_5": "3 إلى 5 سنوات",
  "age_6_8": "6 إلى 8 سنوات",
  "age_9_12": "9 إلى 12 سنة"
}
```

`src/i18n/locales/en.json`:
```json
"onboarding": {
  "learn_lang_title": "What do you want to learn?",
  "learn_lang_ar": "أتعلم العربية",
  "learn_lang_en": "I'm learning English",
  "age_title": "How old are you?",
  "age_3_5": "Ages 3 to 5",
  "age_6_8": "Ages 6 to 8",
  "age_9_12": "Ages 9 to 12"
}
```

- [ ] **Step 4: Implement `LearnLanguage.tsx`**

```tsx
// src/pages/onboarding/LearnLanguage.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useUserStore } from '../../stores/userStore';
import { updateProfile } from '../../lib/profile';
import type { Lang } from '../../stores/userStore';

export default function LearnLanguage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const setLearnLang = useUserStore((s) => s.setLearnLang);

  async function choose(lang: Lang) {
    if (!profile) return;
    setLearnLang(lang);
    await updateProfile(profile.id, { learn_lang: lang });
    navigate('/onboarding/age', { replace: true });
  }

  return (
    <section className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-4xl text-ink text-center">
        {t('onboarding.learn_lang_title')}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button variant="primary" data-testid="choose-ar" onClick={() => choose('ar')}>
          {t('onboarding.learn_lang_ar')}
        </Button>
        <Button variant="secondary" data-testid="choose-en" onClick={() => choose('en')}>
          {t('onboarding.learn_lang_en')}
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/pages/onboarding/LearnLanguage.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/onboarding/LearnLanguage.tsx \
        src/pages/onboarding/LearnLanguage.test.tsx \
        src/i18n/locales/ar.json src/i18n/locales/en.json
git commit -m "feat(phase-2): add onboarding step 1 (learning language)"
```

---

### Task 8: Onboarding step 2 — Age group

**Files:**
- Create: `src/pages/onboarding/AgeGroupSelect.tsx`
- Test:   `src/pages/onboarding/AgeGroupSelect.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/onboarding/AgeGroupSelect.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import AgeGroupSelect from './AgeGroupSelect';
import { useUserStore } from '../../stores/userStore';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  useUserStore.getState().setLearnLang('ar');
  mocks.navigate.mockReset();
  mocks.updateProfile.mockClear();
});

describe('AgeGroupSelect', () => {
  it('persists choice and navigates to /hub', async () => {
    render(<MemoryRouter><AgeGroupSelect /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('age-6-8'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { age_group: '6-8' });
    expect(useUserStore.getState().ageGroup).toBe('6-8');
    expect(mocks.navigate).toHaveBeenCalledWith('/hub', { replace: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/onboarding/AgeGroupSelect.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `AgeGroupSelect.tsx`**

```tsx
// src/pages/onboarding/AgeGroupSelect.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useUserStore } from '../../stores/userStore';
import { updateProfile } from '../../lib/profile';
import type { AgeGroup } from '../../stores/userStore';

const GROUPS: { value: AgeGroup; key: string; testId: string }[] = [
  { value: '3-5', key: 'onboarding.age_3_5', testId: 'age-3-5' },
  { value: '6-8', key: 'onboarding.age_6_8', testId: 'age-6-8' },
  { value: '9-12', key: 'onboarding.age_9_12', testId: 'age-9-12' },
];

export default function AgeGroupSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const setAgeGroup = useUserStore((s) => s.setAgeGroup);

  async function choose(age: AgeGroup) {
    if (!profile) return;
    setAgeGroup(age);
    await updateProfile(profile.id, { age_group: age });
    navigate('/hub', { replace: true });
  }

  return (
    <section className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-4xl text-ink text-center">
        {t('onboarding.age_title')}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {GROUPS.map(({ value, key, testId }) => (
          <Button key={value} variant="primary" data-testid={testId} onClick={() => choose(value)}>
            {t(key)}
          </Button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/onboarding/AgeGroupSelect.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/onboarding/AgeGroupSelect.tsx src/pages/onboarding/AgeGroupSelect.test.tsx
git commit -m "feat(phase-2): add onboarding step 2 (age group)"
```

---

### Task 9: Onboarding container — pick the right step

**Files:**
- Modify: `src/pages/Onboarding.tsx`
- Test:   `src/pages/Onboarding.test.tsx`

The existing `Onboarding.tsx` is a stub. Replace it with a router that picks step 1 or step 2 based on what the profile already has.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/Onboarding.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Onboarding from './Onboarding';
import { useUserStore } from '../stores/userStore';

function tree(initialPath: string) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/onboarding/*" element={<Onboarding />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Onboarding container', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  });

  it('shows step 1 when learn_lang missing', () => {
    render(tree('/onboarding'));
    expect(screen.getByText(/ماذا تريد أن تتعلم|what do you want to learn/i)).toBeInTheDocument();
  });

  it('shows step 2 when learn_lang set but age_group missing', () => {
    useUserStore.getState().setLearnLang('ar');
    render(tree('/onboarding'));
    expect(screen.getByText(/كم عمرك|how old/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/Onboarding.test.tsx`
Expected: FAIL — current stub renders different content.

- [ ] **Step 3: Rewrite `Onboarding.tsx`**

```tsx
// src/pages/Onboarding.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LearnLanguage from './onboarding/LearnLanguage';
import AgeGroupSelect from './onboarding/AgeGroupSelect';
import { useUserStore } from '../stores/userStore';

export default function Onboarding() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);

  if (ageGroup && learnLang) return <Navigate to="/hub" replace />;

  return (
    <Routes>
      <Route index element={learnLang ? <AgeGroupSelect /> : <LearnLanguage />} />
      <Route path="age" element={<AgeGroupSelect />} />
    </Routes>
  );
}
```

- [ ] **Step 4: Update `App.tsx` route to allow nested onboarding paths**

Change `<Route path="/onboarding" element={<Onboarding />} />` to `<Route path="/onboarding/*" element={<Onboarding />} />`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/pages/Onboarding.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Onboarding.tsx src/pages/Onboarding.test.tsx src/App.tsx
git commit -m "feat(phase-2): onboarding container picks step from profile state"
```

---

### Task 10: Hub greeting shell

**Files:**
- Modify: `src/pages/Hub.tsx`
- Test:   `src/pages/Hub.test.tsx`
- Modify: `src/i18n/locales/ar.json`, `src/i18n/locales/en.json`

The Hub stays a placeholder until Phase 3 brings real game cards. For Phase 2 it greets the user and shows a "Coming soon" grid.

- [ ] **Step 1: Add i18n strings**

`src/i18n/locales/ar.json` add:
```json
"hub": {
  "greeting": "مرحباً، {{name}}!",
  "greeting_fallback": "مرحباً بك!",
  "coming_soon": "ألعاب قادمة قريباً"
}
```

`src/i18n/locales/en.json` add:
```json
"hub": {
  "greeting": "Hi, {{name}}!",
  "greeting_fallback": "Welcome!",
  "coming_soon": "Games coming soon"
}
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/pages/Hub.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Hub from './Hub';
import { useUserStore } from '../stores/userStore';

describe('Hub', () => {
  beforeEach(() => useUserStore.getState().reset());

  it('greets the signed-in user by name', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByText(/Khalid/)).toBeInTheDocument();
  });

  it('falls back when no display name', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByTestId('hub-greeting')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/pages/Hub.test.tsx`
Expected: FAIL — Hub does not show greeting yet.

- [ ] **Step 4: Rewrite `Hub.tsx`**

```tsx
// src/pages/Hub.tsx
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/Card';

export default function Hub() {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);

  return (
    <section className="px-6 py-12 flex flex-col items-center gap-8">
      <h1 data-testid="hub-greeting" className="font-display text-4xl text-ink text-center">
        {profile?.displayName
          ? t('hub.greeting', { name: profile.displayName })
          : t('hub.greeting_fallback')}
      </h1>
      <p className="text-ink/70">{t('hub.coming_soon')}</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="aspect-square flex items-center justify-center text-3xl">🔒</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/pages/Hub.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Hub.tsx src/pages/Hub.test.tsx \
        src/i18n/locales/ar.json src/i18n/locales/en.json
git commit -m "feat(phase-2): Hub greets user, shows placeholder game grid"
```

---

### Task 11: Settings — UI language toggle, logout, change-flow

**Files:**
- Modify: `src/stores/userStore.ts` (widen setters to accept `null`)
- Modify: `src/pages/Settings.tsx`
- Test:   `src/pages/Settings.test.tsx`
- Modify: `src/i18n/locales/ar.json`, `src/i18n/locales/en.json`

- [ ] **Step 1: Widen `userStore` setters to accept `null`**

In `src/stores/userStore.ts`, change the setter signatures so the change-flow can clear them:

```ts
setLearnLang: (l: Lang | null) => void;
setAgeGroup: (a: AgeGroup | null) => void;
```

The implementations are already `(value) => set({ key: value })` so the runtime works for `null` — only the type signature needs widening.

Run existing tests to confirm nothing breaks: `npm test`. Expected: still green.

- [ ] **Step 2: Add i18n strings**

`src/i18n/locales/ar.json` add:
```json
"settings": {
  "title": "الإعدادات",
  "ui_lang": "لغة التطبيق",
  "switch_to_en": "English",
  "switch_to_ar": "العربية",
  "change_learn_lang": "غيّر لغة التعلّم",
  "change_age": "غيّر الفئة العمرية",
  "logout": "تسجيل الخروج"
}
```

`src/i18n/locales/en.json` add:
```json
"settings": {
  "title": "Settings",
  "ui_lang": "App language",
  "switch_to_en": "English",
  "switch_to_ar": "العربية",
  "change_learn_lang": "Change learning language",
  "change_age": "Change age group",
  "logout": "Sign out"
}
```

- [ ] **Step 3: Write the failing test**

```tsx
// src/pages/Settings.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../lib/auth', () => ({
  signOut: mocks.signOut,
  signInWithGoogle: vi.fn(),
}));

vi.mock('../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import Settings from './Settings';
import { useUserStore } from '../stores/userStore';
import i18n from '../i18n';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  mocks.navigate.mockReset();
  mocks.signOut.mockClear();
  mocks.updateProfile.mockClear();
});

describe('Settings', () => {
  it('toggles UI language and persists it', async () => {
    await i18n.changeLanguage('ar');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('toggle-ui-lang'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { ui_lang: 'en' });
    expect(useUserStore.getState().uiLang).toBe('en');
  });

  it('signs out and navigates home', async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('logout'));
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('clears learning language and navigates to /onboarding', async () => {
    useUserStore.getState().setLearnLang('ar');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('change-learn-lang'));
    expect(useUserStore.getState().learnLang).toBeNull();
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { learn_lang: null });
    expect(mocks.navigate).toHaveBeenCalledWith('/onboarding', { replace: true });
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/pages/Settings.test.tsx`
Expected: FAIL — current Settings is a stub.

- [ ] **Step 5: Rewrite `Settings.tsx`**

```tsx
// src/pages/Settings.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../stores/userStore';
import { signOut } from '../lib/auth';
import { updateProfile } from '../lib/profile';
import type { Lang } from '../stores/userStore';
import i18n from '../i18n';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const uiLang = useUserStore((s) => s.uiLang);
  const setUiLang = useUserStore((s) => s.setUiLang);
  const setLearnLang = useUserStore((s) => s.setLearnLang);
  const setAgeGroup = useUserStore((s) => s.setAgeGroup);

  async function toggleUiLang() {
    if (!profile) return;
    const next: Lang = uiLang === 'ar' ? 'en' : 'ar';
    setUiLang(next);
    await i18n.changeLanguage(next);
    await updateProfile(profile.id, { ui_lang: next });
  }

  async function changeLearnLang() {
    if (!profile) return;
    setLearnLang(null);
    await updateProfile(profile.id, { learn_lang: null });
    navigate('/onboarding', { replace: true });
  }

  async function changeAgeGroup() {
    if (!profile) return;
    setAgeGroup(null);
    await updateProfile(profile.id, { age_group: null });
    navigate('/onboarding', { replace: true });
  }

  async function logout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <section className="px-6 py-12 flex flex-col items-center gap-6 max-w-md mx-auto">
      <h1 className="font-display text-3xl text-ink">{t('settings.title')}</h1>

      <Button variant="secondary" data-testid="toggle-ui-lang" onClick={toggleUiLang}>
        {t('settings.ui_lang')}: {uiLang === 'ar' ? t('settings.switch_to_en') : t('settings.switch_to_ar')}
      </Button>

      <Button variant="secondary" data-testid="change-learn-lang" onClick={changeLearnLang}>
        {t('settings.change_learn_lang')}
      </Button>

      <Button variant="secondary" data-testid="change-age" onClick={changeAgeGroup}>
        {t('settings.change_age')}
      </Button>

      <Button variant="accent" data-testid="logout" onClick={logout}>
        {t('settings.logout')}
      </Button>
    </section>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/pages/Settings.test.tsx`
Expected: PASS — 3/3.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Settings.tsx src/pages/Settings.test.tsx \
        src/stores/userStore.ts \
        src/i18n/locales/ar.json src/i18n/locales/en.json
git commit -m "feat(phase-2): Settings page with UI lang toggle, change-flow, logout"
```

---

### Task 12: Wire everything in `App.tsx` and verify

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx` (if useAuth needs root mounting)

- [ ] **Step 1: Update `App.tsx`**

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useDirection } from './hooks/useDirection';
import { useAuth } from './hooks/useAuth';
import RequireAuth from './components/RequireAuth';
import RequireProfile from './components/RequireProfile';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import Game from './pages/Game';
import Trophies from './pages/Trophies';
import Settings from './pages/Settings';

export default function App() {
  useDirection();
  useAuth();
  return (
    <main className="min-h-screen bg-surface">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Signed-in routes */}
        <Route element={<RequireAuth />}>
          <Route path="/onboarding/*" element={<Onboarding />} />

          {/* Signed-in + complete profile */}
          <Route element={<RequireProfile />}>
            <Route path="/hub" element={<Hub />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/trophies" element={<Trophies />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </main>
  );
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: All tests pass (Phase 1 24 + new Phase 2 tests).

- [ ] **Step 3: Run lint + build**

Run: `npm run lint && npm run build`
Expected: Both clean.

- [ ] **Step 4: Smoke-test in dev**

Run: `npm run dev`
Open `http://localhost:5173/`. Click "Start Learning" — browser redirects to Google. Sign in. Browser returns to `/auth/callback`, then to `/onboarding`. Pick a language → pick an age → land on `/hub` greeting you by name. Open `/settings` → toggle UI lang (Arabic ↔ English switches instantly with RTL flip). Sign out → back on Landing.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(phase-2): wire auth, route guards, and onboarding nesting in App"
```

---

## Phase 2 Exit Criteria

- [ ] `npm test` — all tests pass (Phase 1 24 + Phase 2 additions, ~40+ expected)
- [ ] `npm run lint` — clean
- [ ] `npm run build` — succeeds
- [ ] Manual smoke test on `localhost:5173`:
  - Unauthenticated `/hub` redirects to `/`
  - Google sign-in → `/auth/callback` → `/onboarding`
  - Two onboarding screens persist choices to Supabase `profiles`
  - Completed profile → `/hub` greets by name
  - Settings UI-lang toggle flips Arabic ↔ English live with `dir` switch
  - Change-learn-lang / change-age return user to onboarding
  - Logout returns to Landing, store cleared, hub no longer accessible
- [ ] Deployed to Railway, same checks pass against `https://kalima.fun`

## Phase 2 Handoff for Phase 3

Phase 3 (Game Engine + first game) will replace the Hub placeholder grid with a registry-driven game catalogue, add `useProgress` / `useGame` hooks, and ship the first concrete game (Letter Tap & Sound for whichever learning language the user picked).

---

## Self-Review Checklist

- ✅ Every spec §2 onboarding step has a task (Tasks 7, 8)
- ✅ Every spec §5 `profiles` column is covered by Task 1 (table) and Task 2 (data layer)
- ✅ RLS policies match spec §5 (Task 1)
- ✅ Google OAuth (spec §1 + §2) wired in Task 4
- ✅ Returning-user routing (spec §2) implemented by Tasks 5, 6, 9
- ✅ UI language toggle (spec §2 settings) wired in Task 11
- ✅ Out-of-scope items (game engine, payments, trophies) explicitly excluded
- ✅ All code blocks complete — no TODOs, no "similar to above"
- ✅ Type consistency: `ProfileRow`, `Lang`, `AgeGroup` used consistently throughout
- ✅ Test patterns mirror Phase 1: `vi.hoisted` for module mocks, `userEvent` for interactions, Zustand `getState().reset()` between tests
