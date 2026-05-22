# Age-Segmented Hub Grid — Design

**Date:** 2026-05-22
**Status:** Approved by Khalid, ready for implementation plan
**Replaces in part:** The "For you!" recommendation pill shipped earlier this session (commit `67d24b9`)

## Problem

The Hub age-group picker (commit `4d36acb`) lets users switch between age buckets, but the games grid below it only reorders tiles with a "For you!" star pill. The catalog itself doesn't change, the section header doesn't change, and the level grid inside Letter Tap is unaffected. Khalid reported "I changed age group but list of games didn't change" — meaning the picker felt purely cosmetic.

In parallel, the original age buckets (`3-5 / 6-8 / 9-12`) were arithmetic ranges chosen without research. Reviewing developmental literacy stages and competitor segmentation revealed the buckets are misaligned with the phonics window and with MENA school grades.

## Goals

1. The games grid composition changes meaningfully when the user picks a different age group.
2. Age buckets reflect developmental literacy stages and MENA school transitions, not arbitrary ranges.
3. Game-to-age metadata lives in one place (registry), not scattered through `Hub.tsx` JSX.
4. The catalog stays browseable — non-matched games are demoted, not hidden.

## Non-goals

- Letter Tap level subsets per age (the alphabet still renders full inside the game). Tracked separately as the Option-C backlog item.
- Real games for 8-10 (Word Builder appears via `alsoGoodFor` as a placeholder).
- Reading-level tracks (Reading Eggs / Nahla wa Nahil model). Defer until catalog is wider.
- Renaming i18n keys for unaffected surfaces (settings copy, onboarding flow text untouched beyond the age-label keys).

## Decisions

### Age buckets

| New bucket | Replaces | Stage | Anchor |
|---|---|---|---|
| **3-4** | 3-5 | Pre-K / letter exposure | Reading Rockets emergent stage; UAE KG1 |
| **5-7** | 6-8 | Phonics core (KG2-G1, Arabic tashkeel introduction) | UAE IQRA programme, Chall stage 1 |
| **8-10** | 9-12 | Fluency, Grade 2-3 (Arabic transitions to unvowelized at Grade 4) | Chall stage 2-3; honest acknowledgment that phonics ≠ 11-12 content |

Research rationale (full report in conversation history):

- 3-5 was too broad — splits the school-readiness boundary awkwardly.
- 6-8 straddled the phonics→fluency transition; tightening to 5-7 matches the phonics sweet spot.
- 9-12 is the wrong product fit for a phonics catalog. No comparable app (Duolingo ABC, Khan Kids, Lingokids, Lamsa, Adam wa Mishmish, Endless Alphabet) targets phonics in that range. Dropping to 8-10 sets honest expectations.
- All cuts align with MENA school grades (parents shop by stage).

### Layout — per-age section + "More to explore" below

```
[ For Ages 5 – 7 ]                  ← <h2>, t('hub.for_age_section')
[ Letter Tap ] [ Word Builder ]     ← gamesForAge(currentAge)

[ More to explore ]                  ← <h3>, t('hub.more_to_explore')
[ Locked    ] [ Locked    ]         ← otherGames(currentAge)
```

If `otherGames` is empty, the "More to explore" section is omitted.

### Catalog model — `primaryAge` + `alsoGoodFor`

Each game has one primary age plus zero or more "also good for" ages. A game qualifies for the current age's section if `primaryAge === currentAge || alsoGoodFor.includes(currentAge)`.

### Recommendation pill removed

The "For you!" star pill shipped at commit `67d24b9` becomes redundant — the section header already says who the games are for. The `hub.recommended_badge` i18n key, `GameTile.recommended` / `GameTile.recommendedLabel` props, and the StarIcon pill JSX are removed.

## Architecture

### `src/games/registry.ts` (new file)

Single source of truth for the games catalog. React-free so it can be tested in isolation and consumed from non-Hub contexts later (e.g., admin tools, analytics).

```ts
import type { AgeGroup } from '../stores/userStore';

export type GameStatus = 'playable' | 'coming-soon' | 'locked';
export type GameBadgeTone = 'free' | 'soon' | 'locked';

export interface GameMeta {
  id: string;                              // 'letter-tap-sound'
  testIdSlug: string;                      // → 'hub-card-{slug}', preserves existing testids
  titleKey: string;                        // i18n key
  subtitleKey: string;                     // i18n key
  primaryAge: AgeGroup | null;             // null = no-age placeholder (locked tiles)
  alsoGoodFor: AgeGroup[];                 // additional ages this game suits
  badge?: { labelKey: string; tone: GameBadgeTone };
  bg: string;                              // tailwind class
  status: GameStatus;
  route?: string;                          // navigate target when tapped
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
    titleKey: 'hub.locked_title',          // new key — value: '???' (both langs)
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

Icon JSX is **not** in the registry (keeps it React-free). A small `iconForGame(id: string): ReactNode` lookup — a plain `switch` or `Record<string, ReactNode>` — lives inside `Hub.tsx` and is the only place that needs editing when icons change.

### `src/stores/userStore.ts`

```ts
// Before
export type AgeGroup = '3-5' | '6-8' | '9-12';
// After
export type AgeGroup = '3-4' | '5-7' | '8-10';
```

### `src/pages/Hub.tsx` layout

```tsx
{ageGroup ? (
  <>
    <h2 className="mt-7 font-display font-black text-xl text-ink">
      {t('hub.for_age_section', { range: ageGroup })}
    </h2>
    <Grid games={gamesForAge(ageGroup)} />
    {otherGames(ageGroup).length > 0 && (
      <>
        <h3 className="mt-6 font-display font-black text-base text-ink/80">
          {t('hub.more_to_explore')}
        </h3>
        <Grid games={otherGames(ageGroup)} />
      </>
    )}
  </>
) : (
  <>
    <h2 className="mt-7 font-display font-black text-xl text-ink">
      {t('hub.all_games')}
    </h2>
    <Grid games={GAMES_REGISTRY} />
  </>
)}
```

`Grid` is an inline component that maps a `GameMeta[]` to a 2-column tile grid using the existing `GameTile` (slimmed down per the cleanup section below).

### Behavior matrix

| Selected age | "For Ages X" section | "More to explore" |
|---|---|---|
| 3-4 | Letter Tap | Word Builder (SOON), locked-1, locked-2 |
| 5-7 | Letter Tap, Word Builder | locked-1, locked-2 |
| 8-10 | Word Builder (SOON — honest "Coming for you") | Letter Tap, locked-1, locked-2 |
| (null, fallback) | — | — | (single "All Games" grid with full registry) |

The 8-10 for-you section deliberately leans on Word Builder's "Coming Soon" so the section is never empty without faking content. No empty-state UI is required for the current catalog.

## i18n changes

### Renamed keys (both `en.json` and `ar.json`)

| Old | New | EN | AR |
|---|---|---|---|
| `onboarding.age_3_5` | `onboarding.age_3_4` | "Ages 3 to 4" | "3 إلى 4 سنوات" |
| `onboarding.age_6_8` | `onboarding.age_5_7` | "Ages 5 to 7" | "5 إلى 7 سنوات" |
| `onboarding.age_9_12` | `onboarding.age_8_10` | "Ages 8 to 10" | "8 إلى 10 سنوات" |
| `landing.card_age_3_5` | `landing.card_age_3_4` | "Ages 3 – 4" | "3 – 4 سنوات" |
| `landing.card_age_6_8` | `landing.card_age_5_7` | "Ages 5 – 7" | "5 – 7 سنوات" |

### New keys

| Key | EN | AR |
|---|---|---|
| `hub.for_age_section` | "For Ages {{range}}" | "للأعمار {{range}}" |
| `hub.more_to_explore` | "More to explore" | "اكتشف المزيد" |
| `hub.locked_title` | "???" | "؟؟؟" |

### Removed keys

- `hub.recommended_badge` (shipped at `67d24b9`, redundant under the new layout)

## Supabase migration

New file: `supabase/migrations/20260522000001_age_group_buckets.sql`

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

Atomic per Supabase migration semantics. Khalid manually ran this against the production DB during brainstorming (his own profile row is now `3-4`); the migration file is still authored and committed for the historical record + future environment bootstraps.

## Removed code (cleanup from `67d24b9`)

- `GameTile.recommended` and `GameTile.recommendedLabel` props
- The StarIcon "For you!" pill JSX inside `GameTile`
- The inline `ageGroups: AgeGroup[]` array and `[...games].sort(...)` recommendation-sort block in `Hub.tsx` — replaced by `gamesForAge` / `otherGames` calls

## Testing strategy

### New `src/games/registry.test.ts`

- `gamesForAge('3-4')` returns only `letter-tap-sound`
- `gamesForAge('5-7')` returns `letter-tap-sound` and `word-builder` (order matches registry order)
- `gamesForAge('8-10')` returns only `word-builder`
- `otherGames(age)` returns the registry complement for each age, including locked placeholders
- locked entries never appear in `gamesForAge(any)`

### Revised `src/pages/Hub.test.tsx`

Replace the 5 `age-based recommendations` tests with section-aware tests:

1. Renders "For Ages 5 – 7" header when `ageGroup` is `5-7`.
2. For-you section contains `hub-card-letter-tap-sound` and `hub-card-word-builder` when `ageGroup` is `5-7`.
3. For-you section's tiles render before the "More to explore" tiles in DOM order.
4. "More to explore" contains `hub-card-locked-1` and `hub-card-locked-2` when `ageGroup` is `5-7`.
5. Locked tiles never render in the for-you section (asserted for each of the three ages).
6. When `ageGroup` is `null`, renders fallback single "All Games" grid containing all four registry tiles.

Existing tests (greeting, click navigation, age picker open/close, Supabase persist, guest skip, etc.) keep passing. Testids are preserved: `hub-card-letter-tap-sound`, `hub-card-word-builder`, `hub-card-locked-1`, `hub-card-locked-2`, `hub-age-badge`, `hub-age-option-{age}`.

### Test files swept for old age literals

Every literal `'3-5' | '6-8' | '9-12'` in test files is replaced with `'3-4' | '5-7' | '8-10'`. Affected files (from grep):

- `src/stores/userStore.test.ts`
- `src/pages/Hub.test.tsx` (age-picker subset)
- `src/pages/onboarding/AgeGroupSelect.test.tsx`
- `src/hooks/useAuth.test.tsx`
- `src/App.test.tsx`

### Onboarding constants

- `src/pages/onboarding/AgeGroupSelect.tsx` — `AGE_OPTIONS` constant updated to use new buckets and new i18n keys.

## Edge cases

- **Guest mode**: unchanged. The Hub re-renders from the Zustand store when `ageGroup` changes. No Supabase touchpoints.
- **`ageGroup === null`**: rare (RequireProfile redirects to onboarding) but handled by fallback single grid.
- **Empty for-you section**: not reachable with current assignments. Deferred until a future age bucket has zero qualifying games.
- **RTL / Arabic**: existing logical properties (`start`/`end`) preserved across the changes. Section headers translate via i18n.

## Notion follow-up (per CLAUDE.md definition of done)

After merge, append two Notion blocks:

1. **Decision — adopted 3-4 / 5-7 / 8-10 age buckets** — cites research, links commits.
2. **Feature — age-segmented Hub grid** — symptom, root cause, fix, files, verification, commit SHA.

## Out of scope

- Letter Tap *level* subsets per age (still shows full alphabet — Option-C backlog).
- Real 8-10 content (Word Builder `alsoGoodFor` is the placeholder until a real game lands).
- Reading-level / skill-track segmentation (Reading Eggs model). Defer until catalog grows.
- LevelResult.tsx Next/Replay/Back brand chrome (existing Notion backlog item).
