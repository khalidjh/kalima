# Guest Mode & Custom Icon Set — Design

**Date:** 2026-05-22
**Status:** Approved, ready for implementation planning
**Scope:** Two independent features shipped as two separate PRs

## Background

Kalima is live with a sign-in-required entry flow (Google OAuth) and emoji-based iconography. Two pieces of user feedback drive this design:

1. **"Allow user to use as guest"** — let visitors try the app without signing in
2. **"Make all icons have same style as website"** — replace platform emojis with custom illustrations that match the Pop Cartoon visual system (chunky 4px black borders, hard offset shadows, high-saturation palette)

Both are quality-of-life and brand improvements, not new game content. They're independent: either can ship without the other.

---

## Feature 1 — Guest Mode (local-only persistence)

### Goal

A visitor can tap **"Play as guest"** on the Landing page and reach the Hub + games without signing in. Their progress (stars, completed levels) survives across browser sessions on the same device via `localStorage`. Sign-in remains the recommended path for cross-device sync; guest progress migration is **out of scope** for this PR (parked as Phase 4 polish).

### User flow

1. Landing page now shows two CTAs:
   - **▶ Start Learning** (primary, existing Google sign-in)
   - **❤️ Play as guest** (secondary, smaller, neutral colors)
2. Tapping "Play as guest":
   - Generates a guest profile `{ id: 'guest-<uuid>', displayName: null, avatarUrl: null }` if one doesn't already exist in `localStorage`
   - Sets `isGuest = true` in `userStore`
   - Navigates to `/onboarding`
3. Onboarding runs as normal — user picks `learnLang` + `ageGroup`. For guests, these are written to `userStore` only (no Supabase profile upsert).
4. Hub renders with the existing layout. Greeting falls back to `t('hub.greeting_fallback')` since `displayName` is null.
5. Games work as normal. Progress goes to `localStorage` instead of Supabase.
6. Settings keeps every existing control (toggle UI language, change learn language, change age group). Only the bottom action differs: instead of the red **"Sign out"** button, guests see a **"☁️ Save progress — Sign in with Google"** button with a small caption: *"Heads up: your guest stars won't carry over yet — that's coming soon."*

### Data model

**`userStore` additions:**
```ts
interface UserState {
  // existing fields...
  isGuest: boolean;                    // NEW
  startGuestSession: () => void;       // NEW — generates UUID, sets profile + isGuest
  // reset() also resets isGuest to false
}
```
The existing zustand `persist` middleware handles serialization. Guest UUID survives reloads automatically since it's part of the persisted profile.

**Guest progress storage:**
- Key format: `kalima.guestProgress.<gameId>.<lang>`
- Value: JSON-serialized `Array<[levelIndex, stars]>` (so it round-trips through a `Map` constructor)
- One key per (game, lang) pair, matching the Supabase row structure

**New module:** `src/lib/guestProgress.ts`
```ts
export function loadGuestProgress(gameId: string, lang: Lang): ProgressMap;
export function saveGuestProgress(gameId: string, lang: Lang, levelIndex: number, stars: number): void;
```

**UUID generation:** Use `crypto.randomUUID()` directly. Available on every browser that ships modern OAuth, which we already require for the Google sign-in path.

**`useGameProgress` branching:**
- If `isGuest === true`: read initial state from `loadGuestProgress`, `upsert` writes via `saveGuestProgress`, no Supabase calls
- Else: existing Supabase path

### Auth gating

- `RequireAuth` already checks `profile !== null`. A guest profile satisfies this — no change needed.
- `RequireProfile` checks `learnLang && ageGroup`. Same — works as-is.
- The only special case: `signOut()` for a guest just calls `reset()` on the store (no Supabase logout needed).

### Translations

New i18n keys under `landing.cta_guest`, `settings.guest_upgrade`, `settings.guest_upgrade_warning`. Provided in both `en.json` and `ar.json`.

### Tests

- New: guest entry button on Landing navigates to `/onboarding` and sets `isGuest`
- New: `useGameProgress` reads/writes localStorage when `isGuest`
- New: Settings renders the upgrade CTA when `isGuest`, renders sign-out otherwise
- Existing Hub/RequireAuth/RequireProfile tests pass unchanged (guest profile is structurally identical)

### Files touched

- **New:** `src/lib/guestProgress.ts`
- **Modified:** `src/stores/userStore.ts`, `src/hooks/useGameProgress.ts`, `src/pages/Landing.tsx`, `src/pages/Settings.tsx`, `src/i18n/locales/{en,ar}.json`
- **New tests:** alongside each modified file

### Non-goals

- Guest → signed-in progress migration (parked)
- Anonymous Supabase auth (parked)
- Multi-device guest sync (out of scope by definition)

---

## Feature 2 — Custom Icon Set (Pop Cartoon, Tier 1 + 2)

### Goal

Replace every emoji used as a UI affordance with a custom SVG icon that follows the Pop Cartoon style (chunky black outlines, flat palette fills). The icons render identically on every device.

### Style spec

- **viewBox:** `0 0 64 64` for every icon
- **Outline:** `stroke="#1A1A2E"`, `strokeWidth={5}`, `strokeLinecap="round"`, `strokeLinejoin="round"`
- **Fills:** literal hex from the Pop Cartoon palette — `#3B82F6` (cobalt), `#FACC15` (sunny), `#F87171` (tomato), `#84CC16` (lime), `#F72585` (accent), `#FFFFFF` (white), `#FEFCE8` (cream)
- **No gradients, no drop shadows on the icon itself** — the wrapping tile provides the hard shadow
- **Sized** to sit visually centered inside a `border-4 rounded-2xl` tile

### Component API

```ts
interface IconProps {
  size?: number;       // px, default 32
  className?: string;  // for color overrides, animations, layout
  title?: string;      // a11y label; if omitted, icon is aria-hidden
}
```

Every icon component:
- Accepts the same `IconProps`
- Renders a `<svg width={size} height={size} viewBox="0 0 64 64" {...accessibility}>`
- If `title` is provided, includes a `<title>{title}</title>` child and `role="img"`; otherwise sets `aria-hidden="true"`

### Icon catalog (11 components)

| Component | Replaces | Used on |
|---|---|---|
| `<BeeMascot />` | 🐝 | Landing hero |
| `<FoxMascot mood="idle\|success\|fail" />` | 🦊 🎉 😅 | Game results screen |
| `<StarIcon />` | ⭐ | Hub stats, Level select, Trophies |
| `<TrophyIcon />` | 🏆 | Hub menu, Trophies page |
| `<LockIcon />` | 🔒 | Locked game cards |
| `<PlayIcon />` | ▶ | Landing CTA, Hub Continue card |
| `<LetterTileIcon />` | 🔤 | Letter Tap card, Continue card |
| `<PuzzleIcon />` | 🧩 | Word Builder card |
| `<GearIcon />` | ⚙️ | Settings, Hub menu |
| `<LangToggleIcon />` | — (decorative) | Set, but not actually used in Header (text `ع`/`EN` stays — letters are clearer) |
| `<FlameIcon />` | (future) 🔥 | Streak counter, Phase 4-ready |

`<FoxMascot>` is one component with a `mood` prop that swaps internal geometry — not three separate components, to keep the API tight.

### Layout & exports

```
src/components/icons/
  index.ts            // barrel: export * from './BeeMascot'; etc.
  BeeMascot.tsx
  FoxMascot.tsx
  StarIcon.tsx
  TrophyIcon.tsx
  LockIcon.tsx
  PlayIcon.tsx
  LetterTileIcon.tsx
  PuzzleIcon.tsx
  GearIcon.tsx
  LangToggleIcon.tsx
  FlameIcon.tsx
  icons.test.tsx      // shared smoke test: every icon renders, exposes title when given
```

### Replacement sweep

- `src/pages/Landing.tsx` — 🐝 → `<BeeMascot />`, ▶ → `<PlayIcon />`. The free-badge `★` stays as a text glyph (it's a tiny decorative accent inside the lime pill, not a UI affordance)
- `src/pages/Hub.tsx` — ⭐ → `<StarIcon />`, 🔤 → `<LetterTileIcon />`, 🧩 → `<PuzzleIcon />`, 🔒 → `<LockIcon />`, 🏆 → `<TrophyIcon />`, ⚙️ → `<GearIcon />`, ▶ → `<PlayIcon />`
- `src/components/Mascot.tsx` — emoji record → `<FoxMascot mood={mood} />`
- `src/games/letter-tap-sound/LevelSelect.tsx` — ⭐ → `<StarIcon size={14} />`
- `src/pages/Trophies.tsx` — design pass deferred, but at minimum import `<TrophyIcon />` for the header
- `src/components/Header.tsx` — no change (text toggle stays)

### Tests

- One shared test file `src/components/icons/icons.test.tsx` that iterates every exported icon and asserts: (a) renders an `<svg>`, (b) respects `size`, (c) renders `<title>` when `title` is set and is `aria-hidden` otherwise
- Update any existing tests that grep for emoji characters (e.g. checking `🔤` is rendered) to instead check for `data-testid` or component presence

### Non-goals

- Animating icons individually (the wrapping motion components on Landing/Hub already handle hover/tap animation)
- Theming icons via Tailwind `currentColor` for now — they ship with literal hex fills. We can refactor to use Tailwind tokens later if a dark mode appears.
- Replacing the Header brand "K" letter mark (already on-brand)

---

## Implementation order

Two independent PRs in this order:

1. **PR-1: Guest mode** — smaller diff, gives the live site immediate value (anyone can try the app without auth)
2. **PR-2: Custom icon set** — larger diff (11 new components + sweep across 5 files), but no functional risk

Each PR ships with green lint, type-check, tests, and build before push.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `crypto.randomUUID()` not available in some older browsers | Polyfill or fall back to `Date.now() + Math.random()` (kids' app target is modern mobile browsers, so likely a non-issue) |
| localStorage quota or disabled (private mode) | Wrap reads/writes in try/catch; on failure, progress is in-memory for that session only — surface a one-time toast |
| Custom SVG icons look ugly at small sizes | Author at 64×64 with 5px strokes, but verify at `size=14` (LevelSelect star) during implementation; adjust stroke if needed |
| Guest sign-in upgrade is a known follow-up | Settings copy is explicit: *"your guest stars won't carry over yet — that's coming soon"* |

## Open questions resolved during brainstorm

- Persistence model → **A: localStorage only**
- Icon strategy → **B: Custom Pop Cartoon SVGs**
- Icon scope → **ii: Tier 1 + Tier 2 (full sweep)**
- Guest→signed-in migration → **Parked**

## Next step

`writing-plans` skill to produce the task-by-task implementation plan for each PR.
