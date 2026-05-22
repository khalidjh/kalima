# Age-Segmented Hub Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "For you!" recommendation pill with a per-age section + "More to explore" Hub layout, and migrate age buckets from `3-5/6-8/9-12` → `3-4/5-7/8-10`.

**Architecture:** A new `src/games/registry.ts` becomes the single source of truth for the catalog (`primaryAge` + `alsoGoodFor`). Hub renders two sections via `gamesForAge(age)` and `otherGames(age)` helpers. The age-bucket migration is a mechanical sweep across types, i18n keys, AGE_OPTIONS, testids, and Supabase constraint.

**Tech Stack:** React 19 + TypeScript + Tailwind, Vitest + @testing-library/react, i18next, Zustand, Supabase (Postgres).

**Spec:** `docs/superpowers/specs/2026-05-22-age-segmented-hub-grid-design.md`

**Definition of done (per project CLAUDE.md):** `npm run lint && npx tsc --noEmit && npm test -- --run && npm run build` clean, then commit + push master → main + Notion note.

---

## File Inventory

**Create:**
- `src/games/registry.ts` — game catalog + `gamesForAge` / `otherGames` helpers (React-free)
- `src/games/registry.test.ts` — vitest unit tests for the helpers
- `supabase/migrations/20260522000001_age_group_buckets.sql` — drop CHECK, update rows, re-add CHECK

**Modify:**
- `src/stores/userStore.ts` — `AgeGroup` type literal
- `src/i18n/locales/en.json` — rename age keys, add hub section keys, remove recommended pill key
- `src/i18n/locales/ar.json` — same
- `src/pages/Hub.tsx` — AGE_OPTIONS literals + two-section grid + drop pill
- `src/pages/Landing.tsx` — landing.card_age_* key renames
- `src/pages/onboarding/AgeGroupSelect.tsx` — GROUPS literals + testid renames
- `src/components/GameTile` (lives inside Hub.tsx) — drop `recommended` / `recommendedLabel` props + pill JSX
- `src/stores/userStore.test.ts` — literal sweep
- `src/pages/Hub.test.tsx` — literal sweep + replace recommendation describe-block with section tests
- `src/pages/onboarding/AgeGroupSelect.test.tsx` — literal + testid sweep
- `src/hooks/useAuth.test.tsx` — literal sweep
- `src/App.test.tsx` — literal sweep

---

## Task 1: Migrate age bucket literals (3-5/6-8/9-12 → 3-4/5-7/8-10)

This task does the mechanical sweep. No new behaviour — every test that passed before must still pass after. Recommendation pill (shipped at commit `67d24b9`) stays in place for now; it gets removed in Task 3.

**Files:**
- Create: `supabase/migrations/20260522000001_age_group_buckets.sql`
- Modify: `src/stores/userStore.ts`, `src/i18n/locales/en.json`, `src/i18n/locales/ar.json`, `src/pages/Hub.tsx`, `src/pages/Landing.tsx`, `src/pages/onboarding/AgeGroupSelect.tsx`
- Modify (tests): `src/stores/userStore.test.ts`, `src/pages/Hub.test.tsx`, `src/pages/onboarding/AgeGroupSelect.test.tsx`, `src/hooks/useAuth.test.tsx`, `src/App.test.tsx`

> **Note on TDD:** This is a pure literal rename with no behaviour change. The discipline is "all tests passed before, must all pass after" rather than red-green-refactor. Update the production code and tests in the same atomic change so the suite is never broken mid-task.

- [ ] **Step 1: Write the Supabase migration file**

  Create `supabase/migrations/20260522000001_age_group_buckets.sql` with exactly this content:

  ```sql
  -- Drop the old whitelist
  alter table profiles drop constraint profiles_age_group_check;

  -- Migrate existing values
  update profiles set age_group = '3-4'  where age_group = '3-5';
  update profiles set age_group = '5-7'  where age_group = '6-8';
  update profiles set age_group = '8-10' where age_group = '9-12';

  -- Reinstate the whitelist with new values
  alter table profiles
    add constraint profiles_age_group_check
    check (age_group in ('3-4', '5-7', '8-10'));
  ```

  Note: Khalid already executed this migration manually against the production database during brainstorming. The file is committed for the historical record and future bootstraps. Do NOT run `supabase db push` or any similar command — committing the file is enough.

- [ ] **Step 2: Update the `AgeGroup` type literal**

  Edit `src/stores/userStore.ts`:

  ```ts
  // Before
  export type AgeGroup = '3-5' | '6-8' | '9-12';
  // After
  export type AgeGroup = '3-4' | '5-7' | '8-10';
  ```

- [ ] **Step 3: Run TypeScript to discover everywhere the rename breaks**

  Run: `cd src/.. && npx tsc --noEmit`

  Expected: errors at every site that still uses the old literals. Use the errors as a checklist for the next steps. Keep this terminal open.

- [ ] **Step 4: Update i18n keys in `src/i18n/locales/en.json`**

  In the `"onboarding"` block:
  - Rename `"age_3_5": "Ages 3 to 5"` → `"age_3_4": "Ages 3 to 4"`
  - Rename `"age_6_8": "Ages 6 to 8"` → `"age_5_7": "Ages 5 to 7"`
  - Rename `"age_9_12": "Ages 9 to 12"` → `"age_8_10": "Ages 8 to 10"`

  In the `"landing"` block:
  - Rename `"card_age_3_5": "Ages 3 – 5"` → `"card_age_3_4": "Ages 3 – 4"`
  - Rename `"card_age_6_8": "Ages 6 – 8"` → `"card_age_5_7": "Ages 5 – 7"`

  Do NOT touch the `"hub"` block in this task. Do NOT add `for_age_section` / `more_to_explore` / `locked_title` yet — those go in Task 3.

- [ ] **Step 5: Update i18n keys in `src/i18n/locales/ar.json`**

  In the `"onboarding"` block:
  - Rename `"age_3_5": "3 إلى 5 سنوات"` → `"age_3_4": "3 إلى 4 سنوات"`
  - Rename `"age_6_8": "6 إلى 8 سنوات"` → `"age_5_7": "5 إلى 7 سنوات"`
  - Rename `"age_9_12": "9 إلى 12 سنة"` → `"age_8_10": "8 إلى 10 سنوات"`

  In the `"landing"` block:
  - Rename `"card_age_3_5": "3 – 5 سنوات"` → `"card_age_3_4": "3 – 4 سنوات"`
  - Rename `"card_age_6_8": "6 – 8 سنوات"` → `"card_age_5_7": "5 – 7 سنوات"`

- [ ] **Step 6: Update `AGE_OPTIONS` in `src/pages/Hub.tsx`**

  Find the `AGE_OPTIONS` constant near the top of the file. Replace:

  ```ts
  const AGE_OPTIONS: { value: AgeGroup; key: string }[] = [
    { value: '3-5', key: 'onboarding.age_3_5' },
    { value: '6-8', key: 'onboarding.age_6_8' },
    { value: '9-12', key: 'onboarding.age_9_12' },
  ];
  ```

  with:

  ```ts
  const AGE_OPTIONS: { value: AgeGroup; key: string }[] = [
    { value: '3-4', key: 'onboarding.age_3_4' },
    { value: '5-7', key: 'onboarding.age_5_7' },
    { value: '8-10', key: 'onboarding.age_8_10' },
  ];
  ```

  Also in the games-grid section of `Hub.tsx`, swap:
  - `subtitle: t('landing.card_age_3_5')` → `subtitle: t('landing.card_age_3_4')`
  - `subtitle: t('landing.card_age_6_8')` → `subtitle: t('landing.card_age_5_7')`

  And in the existing `ageGroups: ['3-5', '6-8']` / `['6-8', '9-12']` arrays on the Letter Tap and Word Builder tiles, replace with `['3-4', '5-7']` and `['5-7', '8-10']` respectively. (These arrays disappear entirely in Task 3 when the registry takes over — for now they just need to compile.)

- [ ] **Step 7: Update i18n keys in `src/pages/Landing.tsx`**

  At lines ~135 and ~149:
  - `{t('landing.card_age_3_5')}` → `{t('landing.card_age_3_4')}`
  - `{t('landing.card_age_6_8')}` → `{t('landing.card_age_5_7')}`

- [ ] **Step 8: Update `GROUPS` + testids in `src/pages/onboarding/AgeGroupSelect.tsx`**

  Replace:

  ```ts
  const GROUPS: { value: AgeGroup; key: string; testId: string }[] = [
    { value: '3-5', key: 'onboarding.age_3_5', testId: 'age-3-5' },
    { value: '6-8', key: 'onboarding.age_6_8', testId: 'age-6-8' },
    { value: '9-12', key: 'onboarding.age_9_12', testId: 'age-9-12' },
  ];
  ```

  with:

  ```ts
  const GROUPS: { value: AgeGroup; key: string; testId: string }[] = [
    { value: '3-4', key: 'onboarding.age_3_4', testId: 'age-3-4' },
    { value: '5-7', key: 'onboarding.age_5_7', testId: 'age-5-7' },
    { value: '8-10', key: 'onboarding.age_8_10', testId: 'age-8-10' },
  ];
  ```

- [ ] **Step 9: Sweep test files for old literals**

  In each of these test files, do a careful find-and-replace. **Use a text editor; do not run shell `sed` — RTL strings and JSON whitespace make blind sed risky.**

  Replacements (apply to all 5 test files below):
  - String literal `'3-5'` → `'3-4'`
  - String literal `'6-8'` → `'5-7'`
  - String literal `'9-12'` → `'8-10'`
  - Testid string `'age-3-5'` → `'age-3-4'`
  - Testid string `'age-6-8'` → `'age-5-7'`
  - Testid string `'age-9-12'` → `'age-8-10'`
  - Testid string `'hub-age-option-3-5'` → `'hub-age-option-3-4'`
  - Testid string `'hub-age-option-6-8'` → `'hub-age-option-5-7'`
  - Testid string `'hub-age-option-9-12'` → `'hub-age-option-8-10'`

  Files:
  - `src/stores/userStore.test.ts`
  - `src/pages/Hub.test.tsx` (this includes the `age picker` describe block AND the `age-based recommendations` describe block — both must use the new literals)
  - `src/pages/onboarding/AgeGroupSelect.test.tsx`
  - `src/hooks/useAuth.test.tsx`
  - `src/App.test.tsx`

  Sanity check after editing: `cd /home/khalid/workspace/kids-learning && grep -rn "'3-5'\|'6-8'\|'9-12'\|age-3-5\|age-6-8\|age-9-12\|hub-age-option-3-5\|hub-age-option-6-8\|hub-age-option-9-12" src/` should return zero matches.

- [ ] **Step 10: Run TypeScript again**

  Run: `cd /home/khalid/workspace/kids-learning && npx tsc --noEmit`
  Expected: clean (no errors). If any errors remain, they point to a missed reference — fix and re-run.

- [ ] **Step 11: Run full test suite**

  Run: `cd /home/khalid/workspace/kids-learning && npm test -- --run`
  Expected: all 184 tests pass (same count as before this task). The recommendation tests added at `67d24b9` are still in place under the new literals.

- [ ] **Step 12: Run lint**

  Run: `cd /home/khalid/workspace/kids-learning && npm run lint`
  Expected: clean.

- [ ] **Step 13: Commit**

  ```bash
  cd /home/khalid/workspace/kids-learning && \
  git add \
    src/stores/userStore.ts \
    src/i18n/locales/en.json \
    src/i18n/locales/ar.json \
    src/pages/Hub.tsx \
    src/pages/Landing.tsx \
    src/pages/onboarding/AgeGroupSelect.tsx \
    src/stores/userStore.test.ts \
    src/pages/Hub.test.tsx \
    src/pages/onboarding/AgeGroupSelect.test.tsx \
    src/hooks/useAuth.test.tsx \
    src/App.test.tsx \
    supabase/migrations/20260522000001_age_group_buckets.sql && \
  git commit -m "$(cat <<'EOF'
  refactor(age-groups): migrate buckets to 3-4 / 5-7 / 8-10

  Renames AgeGroup literals, i18n keys, onboarding/hub AGE_OPTIONS,
  testids, and adds a Supabase migration to update the
  profiles.age_group CHECK constraint. Khalid ran the SQL manually
  against the live DB during brainstorming; the migration file is
  committed for the historical record and future env bootstraps.

  Research-backed change: 3-5 was too broad, 6-8 straddled the
  phonics→fluency transition, 9-12 is the wrong product fit for a
  phonics catalog. New buckets align with Reading Rockets stage
  boundaries and MENA school grades (UAE IQRA scope).

  No behaviour change in this commit — pure literal rename.

  Co-Authored-By: Claude Opus 4 <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 2: Create the games registry module

Pure additive task — new files only. TDD applies cleanly: write failing tests, then implement.

**Files:**
- Create: `src/games/registry.ts`
- Test:   `src/games/registry.test.ts`

- [ ] **Step 1: Write the failing test file**

  Create `src/games/registry.test.ts`:

  ```ts
  import { describe, expect, it } from 'vitest';
  import {
    GAMES_REGISTRY,
    gamesForAge,
    otherGames,
  } from './registry';

  describe('games registry', () => {
    it('contains exactly four entries in the expected order', () => {
      expect(GAMES_REGISTRY.map((g) => g.id)).toEqual([
        'letter-tap-sound',
        'word-builder',
        'locked-1',
        'locked-2',
      ]);
    });

    it('assigns Letter Tap to 3-4 with 5-7 as also-good-for', () => {
      const lt = GAMES_REGISTRY.find((g) => g.id === 'letter-tap-sound');
      expect(lt?.primaryAge).toBe('3-4');
      expect(lt?.alsoGoodFor).toEqual(['5-7']);
      expect(lt?.status).toBe('playable');
    });

    it('assigns Word Builder to 5-7 with 8-10 as also-good-for', () => {
      const wb = GAMES_REGISTRY.find((g) => g.id === 'word-builder');
      expect(wb?.primaryAge).toBe('5-7');
      expect(wb?.alsoGoodFor).toEqual(['8-10']);
      expect(wb?.status).toBe('coming-soon');
    });

    it('marks locked placeholders with no age and locked status', () => {
      const lockedIds = ['locked-1', 'locked-2'];
      for (const id of lockedIds) {
        const tile = GAMES_REGISTRY.find((g) => g.id === id);
        expect(tile?.primaryAge).toBeNull();
        expect(tile?.alsoGoodFor).toEqual([]);
        expect(tile?.status).toBe('locked');
      }
    });
  });

  describe('gamesForAge', () => {
    it('returns only Letter Tap for age 3-4', () => {
      expect(gamesForAge('3-4').map((g) => g.id)).toEqual(['letter-tap-sound']);
    });

    it('returns Letter Tap then Word Builder for age 5-7 (registry order preserved)', () => {
      expect(gamesForAge('5-7').map((g) => g.id)).toEqual([
        'letter-tap-sound',
        'word-builder',
      ]);
    });

    it('returns only Word Builder for age 8-10', () => {
      expect(gamesForAge('8-10').map((g) => g.id)).toEqual(['word-builder']);
    });

    it('never includes locked tiles at any age', () => {
      for (const age of ['3-4', '5-7', '8-10'] as const) {
        const ids = gamesForAge(age).map((g) => g.id);
        expect(ids).not.toContain('locked-1');
        expect(ids).not.toContain('locked-2');
      }
    });
  });

  describe('otherGames', () => {
    it('returns Word Builder + both locked tiles for age 3-4', () => {
      expect(otherGames('3-4').map((g) => g.id)).toEqual([
        'word-builder',
        'locked-1',
        'locked-2',
      ]);
    });

    it('returns only the locked tiles for age 5-7', () => {
      expect(otherGames('5-7').map((g) => g.id)).toEqual([
        'locked-1',
        'locked-2',
      ]);
    });

    it('returns Letter Tap + both locked tiles for age 8-10', () => {
      expect(otherGames('8-10').map((g) => g.id)).toEqual([
        'letter-tap-sound',
        'locked-1',
        'locked-2',
      ]);
    });

    it('is the exact complement of gamesForAge', () => {
      for (const age of ['3-4', '5-7', '8-10'] as const) {
        const focus = new Set(gamesForAge(age).map((g) => g.id));
        const other = new Set(otherGames(age).map((g) => g.id));
        for (const id of focus) expect(other.has(id)).toBe(false);
        expect(focus.size + other.size).toBe(GAMES_REGISTRY.length);
      }
    });
  });
  ```

- [ ] **Step 2: Verify RED**

  Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/games/registry.test.ts`
  Expected: fails with "Cannot find module './registry'" or equivalent.

- [ ] **Step 3: Implement the registry**

  Create `src/games/registry.ts`:

  ```ts
  import type { AgeGroup } from '../stores/userStore';

  export type GameStatus = 'playable' | 'coming-soon' | 'locked';
  export type GameBadgeTone = 'free' | 'soon' | 'locked';

  export interface GameMeta {
    id: string;
    testIdSlug: string;
    titleKey: string;
    subtitleKey: string;
    primaryAge: AgeGroup | null;
    alsoGoodFor: AgeGroup[];
    badge?: { labelKey: string; tone: GameBadgeTone };
    bg: string;
    status: GameStatus;
    route?: string;
  }

  export const GAMES_REGISTRY: GameMeta[] = [
    {
      id: 'letter-tap-sound',
      testIdSlug: 'letter-tap-sound',
      titleKey: 'landing.card_letter_tap',
      subtitleKey: 'landing.card_age_3_4',
      primaryAge: '3-4',
      alsoGoodFor: ['5-7'],
      badge: { labelKey: 'landing.free_badge', tone: 'free' },
      bg: 'bg-white',
      status: 'playable',
      route: '/game/letter-tap-sound',
    },
    {
      id: 'word-builder',
      testIdSlug: 'word-builder',
      titleKey: 'landing.card_word_builder',
      subtitleKey: 'landing.card_age_5_7',
      primaryAge: '5-7',
      alsoGoodFor: ['8-10'],
      badge: { labelKey: 'hub.coming_soon', tone: 'soon' },
      bg: 'bg-cream',
      status: 'coming-soon',
    },
    {
      id: 'locked-1',
      testIdSlug: 'locked-1',
      titleKey: 'hub.locked_title',
      subtitleKey: 'hub.locked',
      primaryAge: null,
      alsoGoodFor: [],
      bg: 'bg-white',
      status: 'locked',
    },
    {
      id: 'locked-2',
      testIdSlug: 'locked-2',
      titleKey: 'hub.locked_title',
      subtitleKey: 'hub.locked',
      primaryAge: null,
      alsoGoodFor: [],
      bg: 'bg-white',
      status: 'locked',
    },
  ];

  export function gamesForAge(age: AgeGroup): GameMeta[] {
    return GAMES_REGISTRY.filter(
      (g) => g.primaryAge === age || g.alsoGoodFor.includes(age),
    );
  }

  export function otherGames(age: AgeGroup): GameMeta[] {
    const inFocus = new Set(gamesForAge(age).map((g) => g.id));
    return GAMES_REGISTRY.filter((g) => !inFocus.has(g.id));
  }
  ```

  Note `hub.locked_title` is not yet defined in i18n — it gets added in Task 3. The registry referencing it now is fine because i18next falls back to the key string at runtime; the registry tests don't exercise i18n.

- [ ] **Step 4: Verify GREEN**

  Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/games/registry.test.ts`
  Expected: all registry tests pass.

- [ ] **Step 5: Run the full test suite — confirm nothing else broke**

  Run: `cd /home/khalid/workspace/kids-learning && npm test -- --run`
  Expected: all tests pass (184 from Task 1 + the new registry tests).

- [ ] **Step 6: Commit**

  ```bash
  cd /home/khalid/workspace/kids-learning && \
  git add src/games/registry.ts src/games/registry.test.ts && \
  git commit -m "$(cat <<'EOF'
  feat(games): add registry module as single source of truth for catalog

  New src/games/registry.ts holds GameMeta entries with primaryAge +
  alsoGoodFor metadata, plus gamesForAge / otherGames helpers. React-
  free so it can be consumed from non-Hub contexts later (admin tools,
  analytics).

  Hub still uses its inline games array — switchover happens in the
  next commit.

  Co-Authored-By: Claude Opus 4 <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 3: Refactor Hub to per-age section layout

This task ships the actual user-visible change. TDD: rewrite the `age-based recommendations` describe block in `Hub.test.tsx` first (failing), then refactor `Hub.tsx`, then clean up i18n.

**Files:**
- Modify: `src/pages/Hub.tsx`
- Modify: `src/pages/Hub.test.tsx`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ar.json`

- [ ] **Step 1: Rewrite the `age-based recommendations` describe block in `Hub.test.tsx`**

  Locate the existing `describe('age-based recommendations', ...)` block (5 tests, added at commit `67d24b9`, swept to new literals in Task 1). Replace the entire block with this section-aware block:

  ```tsx
  describe('age-based sections', () => {
    beforeEach(() => {
      useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
    });

    it('renders the "For Ages 5 – 7" section header when ageGroup is 5-7', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(screen.getByTestId('hub-for-age-section')).toHaveTextContent('5-7');
    });

    it('places Letter Tap and Word Builder in the for-you section when age is 5-7', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      expect(forYou).toContainElement(screen.getByTestId('hub-card-letter-tap-sound'));
      expect(forYou).toContainElement(screen.getByTestId('hub-card-word-builder'));
    });

    it('places locked tiles in the "More to explore" section, not the for-you section', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      const explore = screen.getByTestId('hub-more-to-explore-section');
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-locked-1'));
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-locked-2'));
      expect(explore).toContainElement(screen.getByTestId('hub-card-locked-1'));
      expect(explore).toContainElement(screen.getByTestId('hub-card-locked-2'));
    });

    it('renders the for-you section before "More to explore" in DOM order', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      const explore = screen.getByTestId('hub-more-to-explore-section');
      // eslint-disable-next-line no-bitwise
      const order = forYou.compareDocumentPosition(explore);
      expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows Letter Tap as the only for-you tile for age 3-4', () => {
      useUserStore.getState().setAgeGroup('3-4');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      expect(forYou).toContainElement(screen.getByTestId('hub-card-letter-tap-sound'));
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-word-builder'));
    });

    it('shows Word Builder as the only for-you tile for age 8-10', () => {
      useUserStore.getState().setAgeGroup('8-10');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      expect(forYou).toContainElement(screen.getByTestId('hub-card-word-builder'));
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-letter-tap-sound'));
    });

    it('falls back to a single "All Games" grid when no age group is selected', () => {
      // beforeEach sets a profile but no ageGroup. reset() clears both — reapply profile.
      useUserStore.getState().reset();
      useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(screen.queryByTestId('hub-for-age-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hub-more-to-explore-section')).not.toBeInTheDocument();
      expect(screen.getByTestId('hub-all-games-section')).toBeInTheDocument();
      // All four tiles still render in the fallback grid
      expect(screen.getByTestId('hub-card-letter-tap-sound')).toBeInTheDocument();
      expect(screen.getByTestId('hub-card-word-builder')).toBeInTheDocument();
      expect(screen.getByTestId('hub-card-locked-1')).toBeInTheDocument();
      expect(screen.getByTestId('hub-card-locked-2')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Verify RED**

  Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/pages/Hub.test.tsx`
  Expected: the new `age-based sections` tests fail because `hub-for-age-section`, `hub-more-to-explore-section`, and `hub-all-games-section` testids don't exist yet, and `recommended` testids the old block expected are gone. Other Hub tests (greeting, click navigate, age picker) keep passing.

- [ ] **Step 3: Add new i18n keys + remove the recommended pill key (en + ar)**

  In `src/i18n/locales/en.json`, in the `"hub"` block:
  - Remove `"recommended_badge": "For you!"`
  - Add (preserve trailing-comma JSON cleanliness):
    ```json
    "for_age_section": "For Ages {{range}}",
    "more_to_explore": "More to explore",
    "locked_title": "???"
    ```

  In `src/i18n/locales/ar.json`, in the `"hub"` block:
  - Remove `"recommended_badge": "لك!"`
  - Add:
    ```json
    "for_age_section": "للأعمار {{range}}",
    "more_to_explore": "اكتشف المزيد",
    "locked_title": "؟؟؟"
    ```

- [ ] **Step 4: Refactor `Hub.tsx` — replace the games grid block**

  Read the current `Hub.tsx`. There are three blocks that need work:

  **4a. Update imports.** Drop the `LetterTileIcon, PuzzleIcon, LockIcon` direct usage in the games-grid block (icons now resolved by a local `iconForGame` helper). Keep them imported because they're still referenced (LetterTileIcon in the hero card; LockIcon + PuzzleIcon now in the lookup). Add the registry import:

  ```ts
  import {
    GAMES_REGISTRY,
    gamesForAge,
    otherGames,
    type GameMeta,
  } from '../games/registry';
  ```

  **4b. Add the icon lookup just below `AGE_OPTIONS`** (still inside the module scope):

  ```tsx
  function iconForGame(id: string): ReactNode {
    switch (id) {
      case 'letter-tap-sound':
        return <LetterTileIcon size={44} />;
      case 'word-builder':
        return <PuzzleIcon size={44} />;
      default:
        return <LockIcon size={44} />;
    }
  }
  ```

  **4c. Slim down `GameTileProps` and `GameTile`.** Remove the `recommended` and `recommendedLabel` props and the StarIcon "For you!" pill JSX (the `recommended && recommendedLabel && (...)` block). The signature becomes:

  ```ts
  interface GameTileProps {
    testId?: string;
    icon: ReactNode;
    title: string;
    subtitle: string;
    badge?: { label: string; tone: 'free' | 'soon' | 'locked' };
    bg: string;
    onClick?: () => void;
    disabled?: boolean;
  }
  ```

  Also drop `StarIcon` from the imports if it's no longer used elsewhere in the file. (Check carefully — `StarIcon` is still used in the stars-counter block at the top of the page. Keep it imported.)

  **4d. Replace the entire `{/* All games section */}` block** — heading + IIFE + grid — with this:

  ```tsx
  {(() => {
    const renderTile = (game: GameMeta) => (
      <GameTile
        key={game.id}
        testId={`hub-card-${game.testIdSlug}`}
        icon={iconForGame(game.id)}
        title={t(game.titleKey)}
        subtitle={t(game.subtitleKey)}
        badge={
          game.badge
            ? { label: t(game.badge.labelKey), tone: game.badge.tone }
            : undefined
        }
        bg={game.bg}
        onClick={
          game.route
            ? () => navigate(game.route as string)
            : undefined
        }
        disabled={game.status !== 'playable'}
      />
    );

    if (!ageGroup) {
      return (
        <>
          <h2 className="mt-7 font-display font-black text-xl text-ink">
            {t('hub.all_games')}
          </h2>
          <div
            data-testid="hub-all-games-section"
            className="mt-3 grid grid-cols-2 gap-3"
          >
            {GAMES_REGISTRY.map(renderTile)}
          </div>
        </>
      );
    }

    const focus = gamesForAge(ageGroup);
    const rest = otherGames(ageGroup);

    return (
      <>
        <h2 className="mt-7 font-display font-black text-xl text-ink">
          {t('hub.for_age_section', { range: ageGroup })}
        </h2>
        <div
          data-testid="hub-for-age-section"
          className="mt-3 grid grid-cols-2 gap-3"
        >
          {focus.map(renderTile)}
        </div>
        {rest.length > 0 && (
          <>
            <h3 className="mt-6 font-display font-black text-base text-ink/80">
              {t('hub.more_to_explore')}
            </h3>
            <div
              data-testid="hub-more-to-explore-section"
              className="mt-3 grid grid-cols-2 gap-3"
            >
              {rest.map(renderTile)}
            </div>
          </>
        )}
      </>
    );
  })()}
  ```

  Make sure to delete the obsolete inline games array, the `[...games].sort` recommendation block, and the now-unused `recommendedLabel` variable.

- [ ] **Step 5: Verify GREEN on Hub tests**

  Run: `cd /home/khalid/workspace/kids-learning && npx vitest run src/pages/Hub.test.tsx`
  Expected: all Hub tests pass (existing greeting/navigation/age-picker tests + the 7 new section tests).

- [ ] **Step 6: Run TypeScript**

  Run: `cd /home/khalid/workspace/kids-learning && npx tsc --noEmit`
  Expected: clean. If errors mention `recommended` or `recommendedLabel`, confirm those props are fully gone from both the interface and the component body.

- [ ] **Step 7: Run the full Definition-of-Done suite**

  ```bash
  cd /home/khalid/workspace/kids-learning && \
    npm run lint && \
    npx tsc --noEmit && \
    npm test -- --run && \
    npm run build
  ```

  Expected: lint clean, tsc clean, all tests pass (including the new section tests + registry tests from Task 2), build succeeds. The pre-existing 633KB chunk-size warning is fine.

- [ ] **Step 8: Commit**

  ```bash
  cd /home/khalid/workspace/kids-learning && \
  git add \
    src/pages/Hub.tsx \
    src/pages/Hub.test.tsx \
    src/i18n/locales/en.json \
    src/i18n/locales/ar.json && \
  git commit -m "$(cat <<'EOF'
  feat(hub): replace recommendation pill with per-age sections

  Hub now consumes the games registry and renders two sections:
  "For Ages {{range}}" (gamesForAge(currentAge)) followed by "More
  to explore" (otherGames(currentAge)). When no age group is
  selected, falls back to a single "All Games" grid.

  Removes the "For you!" star pill shipped earlier today — the
  section header is sufficient signal. Drops GameTile.recommended
  and GameTile.recommendedLabel props, the StarIcon pill JSX, and
  the hub.recommended_badge i18n key. Adds hub.for_age_section,
  hub.more_to_explore, and hub.locked_title.

  Behaviour by age (with current catalog):
    3-4:  for-you = Letter Tap; explore = Word Builder + 2 locked
    5-7:  for-you = Letter Tap, Word Builder; explore = 2 locked
    8-10: for-you = Word Builder (SOON); explore = Letter Tap + 2 locked

  Co-Authored-By: Claude Opus 4 <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 4: Push to remote and log progress to Notion

No code changes. Just remote sync + the project's required Notion update.

- [ ] **Step 1: Push master → master + main**

  ```bash
  cd /home/khalid/workspace/kids-learning && \
    git push origin master && \
    git push origin master:main
  ```

  Expected: both pushes succeed. If push-protection fires (e.g. catches a secret in a future change), stop and surface the error.

- [ ] **Step 2: Append the "Decision" note to the Kalima Notion page**

  ```bash
  source ~/.env.kalima && \
  curl -s -X PATCH "https://api.notion.com/v1/blocks/${KALIMA_NOTION_PAGE_ID}/children" \
    -H "Authorization: Bearer ${NOTION_TOKEN}" \
    -H "Notion-Version: 2022-06-28" \
    -H "Content-Type: application/json" \
    -d '{
      "children": [
        {
          "object": "block",
          "type": "heading_3",
          "heading_3": {
            "rich_text": [{"type": "text", "text": {"content": "Decision — 2026-05-22 — Adopted 3-4 / 5-7 / 8-10 age buckets"}}]
          }
        },
        {
          "object": "block",
          "type": "bulleted_list_item",
          "bulleted_list_item": {
            "rich_text": [{"type": "text", "text": {"content": "Original buckets 3-5 / 6-8 / 9-12 were arithmetic, not research-backed. Replaced after literacy + competitor research."}}]
          }
        },
        {
          "object": "block",
          "type": "bulleted_list_item",
          "bulleted_list_item": {
            "rich_text": [{"type": "text", "text": {"content": "New buckets: 3-4 (Pre-K / letter exposure), 5-7 (phonics core, KG2-Grade 1, Arabic tashkeel), 8-10 (fluency, Grade 2-3; Arabic unvowelized transition at Grade 4)."}}]
          }
        },
        {
          "object": "block",
          "type": "bulleted_list_item",
          "bulleted_list_item": {
            "rich_text": [{"type": "text", "text": {"content": "Dropped 11-12 entirely — no comparable kids phonics app targets that range (Duolingo ABC, Khan Kids, Lingokids, Lamsa all stop at 8)."}}]
          }
        },
        {
          "object": "block",
          "type": "bulleted_list_item",
          "bulleted_list_item": {
            "rich_text": [{"type": "text", "text": {"content": "Spec: docs/superpowers/specs/2026-05-22-age-segmented-hub-grid-design.md. Supabase CHECK constraint migrated via supabase/migrations/20260522000001_age_group_buckets.sql."}}]
          }
        }
      ]
    }' | head -c 200 && echo
  ```

- [ ] **Step 3: Append the feature progress note**

  Replace `<TASK1_SHA>`, `<TASK2_SHA>`, `<TASK3_SHA>` with the actual commit SHAs from `git log --oneline -5` before running.

  ```bash
  source ~/.env.kalima && \
  TASK1_SHA="$(cd /home/khalid/workspace/kids-learning && git log --pretty=%h --grep='refactor(age-groups)' -n 1)" && \
  TASK2_SHA="$(cd /home/khalid/workspace/kids-learning && git log --pretty=%h --grep='feat(games): add registry' -n 1)" && \
  TASK3_SHA="$(cd /home/khalid/workspace/kids-learning && git log --pretty=%h --grep='feat(hub): replace recommendation pill' -n 1)" && \
  curl -s -X PATCH "https://api.notion.com/v1/blocks/${KALIMA_NOTION_PAGE_ID}/children" \
    -H "Authorization: Bearer ${NOTION_TOKEN}" \
    -H "Notion-Version: 2022-06-28" \
    -H "Content-Type: application/json" \
    -d "$(cat <<EOF
  {
    "children": [
      {
        "object": "block",
        "type": "heading_3",
        "heading_3": {
          "rich_text": [{"type": "text", "text": {"content": "Feature — 2026-05-22 — Age-segmented Hub grid"}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"type": "text", "text": {"content": "Symptom: changing age group only added a 'For you!' star pill — composition of the catalog didn't change."}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"type": "text", "text": {"content": "Fix: introduced src/games/registry.ts (primaryAge + alsoGoodFor); Hub renders 'For Ages X' section followed by 'More to explore' section. 'For you!' pill removed entirely (section header is the signal)."}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"type": "text", "text": {"content": "Catalog assignments: Letter Tap primary=3-4 alsoGoodFor=[5-7]; Word Builder primary=5-7 alsoGoodFor=[8-10]; locked tiles never recommended."}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"type": "text", "text": {"content": "Commits: ${TASK1_SHA} (bucket literals), ${TASK2_SHA} (registry), ${TASK3_SHA} (Hub refactor). Pushed to master + main."}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"type": "text", "text": {"content": "Verification: lint clean, tsc --noEmit clean, full Vitest suite green, build OK."}}]
        }
      }
    ]
  }
  EOF
  )" | head -c 200 && echo
  ```

- [ ] **Step 4: Confirm the working tree is clean**

  Run: `cd /home/khalid/workspace/kids-learning && git status`
  Expected: `nothing to commit, working tree clean` on `master`.

---

## Self-Review Notes

- All spec sections are covered: bucket migration (Task 1), registry module (Task 2), two-section layout + cleanup (Task 3), push + Notion (Task 4).
- No placeholders. Every code block is concrete; every command is exact.
- Type / property consistency checked: `GameMeta` shape, `gamesForAge`/`otherGames` signatures, and all i18n key names match between registry, Hub, and tests.
- Supabase migration: the user manually ran the SQL during brainstorming; the file is still authored and committed for the historical record (Task 1, Step 1) — `supabase db push` is NOT to be run.
- Out-of-scope items (Letter Tap level subsets per age, real 8-10 content, reading-level tracks, LevelResult brand chrome) are intentionally not in this plan — they're tracked separately.
