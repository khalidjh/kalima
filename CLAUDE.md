# Kalima — كلمة

Bilingual Arabic + English kids learning web app (ages 3–12). Live at https://kalima.fun.

## Notion sync — REQUIRED

**After every feature, bugfix, or notable change that lands on `main`, update the Notion project page.**

- Page: `Kalima — كلمة` (id `3682b70e-1eb9-81f1-96c7-cff3a906ed9a`)
  https://www.notion.so/Kalima-3682b70e1eb981f196c7cff3a906ed9a
- Integration token: read from env `$NOTION_TOKEN` (stored in `~/.env.kalima` or your shell init — never commit it). Notion-Version header: `2022-06-28`.
- What to do each time:
  1. Append a dated **Progress Update** section (heading_2: `Progress Update — YYYY-MM-DD`) summarizing what shipped and verification results (lint / typecheck / vitest counts / build size).
  2. Check off any completed items in the **TODO / Next Steps** list (`PATCH /v1/blocks/<id>` with `{"to_do":{"checked":true}}`).
  3. Add new follow-ups discovered during the work as new `to_do` blocks.
  4. If the change spans a meaningful area (new game, new system, design shift), also update the relevant child page (Design System, Architecture Notes, Roadmap, Feedback, or Word Builder Design).

Don't ask permission to do this — it's part of the definition of done.

## Stack

Vite + React 18 + TypeScript + Tailwind 3 + framer-motion 11. Zustand 4 (persist for userStore). React Router v6. i18next (AR/EN). Howler.js for audio. Supabase (Google OAuth + Postgres with RLS). Vitest + React Testing Library. Deploy: Docker → Railway, Express on :8080.

## Branching & deploy

- Develop on `master`; mirror to `main` to trigger Railway auto-deploy (`git push origin master && git push origin master:main`).
- Don't force-push `main`. Don't commit `.env`.

## Definition of done

Before claiming a task complete:

```
npm run lint && npx tsc --noEmit && npm test -- --run && npm run build
```

All four must pass clean. Then commit (per-feature, not bundled), push both branches, then update Notion.

## Conventions

- **Guest mode.** `userStore.isGuest` flag, `kalima.user` persist key. Guest progress lives in localStorage under `kalima.guest.progress.<gameId>.<lang>`. `useGameProgress` branches via `useMemo` over a `guestVersion` counter — never call `setState` directly inside `useEffect` (lint rule `react-hooks/set-state-in-effect`).
- **Auth guard.** `useAuth` must skip `userStore.reset()` when `isGuest` is true.
- **Onboarding & Settings.** Skip Supabase upserts when guest; show upgrade CTA in Settings instead of sign-out.
- **Icons.** Use the custom SVG set in `src/components/icons/` (Star, Bee, Trophy, Lock, Play, Fox, LetterTile, Puzzle, Gear, LangToggle, Flame). No emoji in UI. Spec: viewBox `0 0 64 64`, stroke `#1A1A2E`, strokeWidth `5`, round caps/joins, palette fills only.
- **Palette.** ink `#1A1A2E`, cobalt `#3B82F6`, sunny `#FACC15`, tomato `#F87171`, lime `#84CC16`, accent `#F72585`, white, cream `#FFF7E1`.
- **Component style.** `border-4 border-ink rounded-2xl shadow-pop`; press feedback via `whileTap` translate + `shadow-none`.
- **Games.** Self-contained under `src/games/<id>/` with `config.ts`, `<Game>.tsx`, and `data/`. Reuse `useGameProgress` so guest + Supabase paths are handled.
- **i18n.** Every user-visible string in `src/i18n/locales/{en,ar}.json`. RTL when learning Arabic, LTR when learning English.

## Plans & specs

- Plans live in `docs/superpowers/plans/YYYY-MM-DD-<slug>.md`
- Specs live in `docs/superpowers/specs/`

## Repo facts

- GitHub: `khalidjh/kalima`
- Railway: project `d040e0a1`, service `dd289667`, env `02eed107`
- Supabase project: `grlaiwqfwbxlqlcrbyfu` → https://grlaiwqfwbxlqlcrbyfu.supabase.co
- Local workspace: `/home/khalid/workspace/kids-learning`
