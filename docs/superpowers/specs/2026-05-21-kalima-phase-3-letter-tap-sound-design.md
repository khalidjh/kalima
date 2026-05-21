# Kalima Phase 3 — Letter Tap & Sound

**Date:** 2026-05-21
**Status:** Spec — ready for implementation plan
**Depends on:** Phase 2 (Auth + Onboarding) — complete

## 1. Scope

Build the first game in Kalima: **Letter Tap & Sound**. The game teaches Arabic and English letter recognition through a multi-prompt audio quiz with star-based scoring and persistent progress.

### 1.1 In Scope

- Game registry pattern (Vite glob import) so future games plug in
- Letter Tap & Sound game with:
  - 28 Arabic levels + 26 English levels
  - Multi-prompt quiz mechanic (3 prompts per level)
  - Star rating: 3 (0 mistakes) / 2 (1 mistake) / 1 (2+ mistakes)
  - Hybrid audio: Web Speech API + per-letter MP3 fallback registry
  - Level select grid; all levels unlocked from start
  - Star badges on level cards reflecting earned progress
  - Mascot success/failure reactions per prompt
- Supabase `game_progress` table with RLS
- Progress persistence with **no-regress upsert** (lower stars never overwrite higher)
- Wire Letter Tap card on Hub to the game route

### 1.2 Out of Scope

- Other games (Word Builder, Story Time, etc.)
- Freemium gating / paywall
- Trophies / achievements wire-up beyond stub
- Profile age-group content filtering (all letters shown regardless of age band)
- Mascot character art beyond what already exists; reuse current sprites

## 2. Architecture

### 2.1 File Layout

```
src/
├── games/
│   ├── registry.ts                    # Vite glob, exports GAMES map by id
│   └── letter-tap-sound/
│       ├── index.ts                   # GameDefinition export
│       ├── LetterTapSound.tsx         # Top-level game component (state machine)
│       ├── LevelSelect.tsx            # 28/26 grid with star badges
│       ├── Quiz.tsx                   # Single prompt: 4 letters + audio
│       ├── LevelResult.tsx            # End-of-level mascot + stars + next/replay/back
│       ├── data/
│       │   ├── letters-ar.ts          # 28 Arabic letters
│       │   └── letters-en.ts          # 26 English letters
│       └── audio/
│           ├── speak.ts               # Hybrid dispatch (TTS or mp3)
│           └── fallbacks/             # mp3 assets (initially empty)
├── hooks/
│   ├── useGameProgress.ts             # Fetch + upsert against game_progress
│   └── useSpeech.ts                   # SpeechSynthesis state + speak()
├── pages/
│   └── Game.tsx                       # Route /game/:gameId → registry lookup
├── components/
│   └── Mascot.tsx                     # Reusable success/failure animation
└── types/
    └── game.ts                        # GameDefinition, Level, ProgressRecord

supabase/migrations/
└── 002_game_progress.sql              # Table + RLS policies
```

### 2.2 Module Boundaries

- **`registry.ts`** owns the list of games. Pages import from the registry; games do not know about routing.
- **`useGameProgress`** is the only module that talks to Supabase for progress. UI consumes it via hook.
- **`speak.ts`** hides the hybrid TTS-vs-MP3 decision behind a single `speak(key, lang)` call.
- **`Quiz.tsx`** is pure UI: receives target letter + distractors as props, reports outcome via callback. No data fetching.
- **`LetterTapSound.tsx`** owns the level-playing state machine and orchestrates Quiz → LevelResult.

### 2.3 Game Registry Contract

```ts
// src/types/game.ts
export interface GameDefinition {
  id: string;                   // 'letter-tap-sound'
  nameKey: string;              // i18n key for display name
  Component: React.ComponentType;
}
```

`registry.ts` uses `import.meta.glob('./*/index.ts', { eager: true })` so adding a new game in Phase 4+ requires only creating a folder.

## 3. Data Model

### 3.1 `game_progress` Table

```sql
CREATE TABLE game_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id     text NOT NULL,
  lang        text NOT NULL,                    -- 'ar' | 'en'
  level_index int  NOT NULL,                    -- 0-based
  stars       int  NOT NULL CHECK (stars BETWEEN 1 AND 3),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, game_id, lang, level_index)
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY game_progress_select_own ON game_progress
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY game_progress_insert_own ON game_progress
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY game_progress_update_own ON game_progress
  FOR UPDATE USING (profile_id = auth.uid());
```

### 3.2 Letter Data Format

```ts
// src/games/letter-tap-sound/data/letters-ar.ts
export interface Letter {
  char: string;        // 'ا'
  name: string;        // 'alif'
  audio_key: string;   // 'alif' — passed to speak()
}

export const LETTERS_AR: Letter[] = [/* 28 entries */];
```

English uses the same shape with 26 entries.

## 4. Data Flow

### 4.1 Opening Level Select

1. Hub card click → navigate to `/game/letter-tap-sound`
2. `Game.tsx` reads `:gameId`, looks up registry, renders `<LetterTapSound />`
3. `LetterTapSound` reads `learnLang` from userStore
4. `useGameProgress('letter-tap-sound', lang)` returns `{ progress: Map<number, number>, loading, upsert }`
5. `LevelSelect` renders N cards (28 or 26); each card shows star count from the map (or empty if absent)

### 4.2 Playing a Level

1. User taps level N → state machine moves to `{ status: 'playing', levelIndex: N, promptIndex: 0, mistakes: 0 }`
2. `Quiz.tsx` mounts with target = `letters[N]`, distractors = 3 random other letters from the same language
3. On mount: `speak(target.audio_key, lang)` plays the audio
4. Speaker icon allows replay of the same prompt
5. Kid taps a letter:
   - Correct: mascot plays success animation; after a brief delay, advance `promptIndex`. If `promptIndex === 3`, transition to `result`.
   - Wrong: mascot plays fail animation; `mistakes++`; the same prompt stays so the kid can try again
6. After 3 prompts the stars are computed:
   - `mistakes === 0` → 3 stars
   - `mistakes === 1` → 2 stars
   - `mistakes >= 2` → 1 star
7. `upsert(levelIndex, stars)` is called. The hook **only writes when `stars > existing[levelIndex]`** (no-regress).
8. `LevelResult` shows mascot, the earned star count, and three buttons: Next Level / Replay / Back to Levels.

### 4.3 Audio Dispatch

```ts
// src/games/letter-tap-sound/audio/speak.ts
const FALLBACK_KEYS = new Set<string>([
  // Populated as we identify letters where TTS quality is poor.
  // Format: `${lang}-${audio_key}`, e.g. 'ar-ayn'
]);

export function speak(key: string, lang: 'ar' | 'en'): Promise<void> {
  const compoundKey = `${lang}-${key}`;
  if (FALLBACK_KEYS.has(compoundKey)) {
    return playMp3(`/audio/fallbacks/${compoundKey}.mp3`);
  }
  return synthSpeak(key, lang);
}
```

The fallback set starts empty. As real-device testing reveals letters where TTS is bad, contributors add the letter to the set and drop the matching MP3 file into `public/audio/fallbacks/`.

### 4.4 Distractor Selection

For a target letter at index N in language L:

- Pool = all letters in L except index N
- Pick 3 distinct random letters from the pool
- Shuffle target + 3 distractors so the correct answer position rotates

## 5. UI / UX

- **Level Select Grid:** Responsive grid (e.g., 4–6 columns), large tappable cards. Each card shows the letter and the star count badge if earned.
- **Quiz Screen:** Big speaker icon at top (replay). Below it, the 4 letter tiles in a 2×2 grid (or 1×4 on narrow screens). Mascot positioned where it can react.
- **Level Result:** Mascot center, large stars (1–3 filled), three buttons.
- **RTL Handling:** When `learnLang === 'ar'`, the quiz tiles and level grid follow RTL flow. Existing direction handling from Phase 2 applies.
- **Mascot:** Two short animations — `success` (cheerful bounce) and `fail` (gentle shake). CSS animations. No new art required; reuse existing mascot sprite.

## 6. Error Handling

- **Supabase fetch fails on level select:** Show grid with no stars; user can still play (progress will not persist). Log error.
- **Supabase upsert fails after level completion:** Show a small toast "Could not save progress"; let the result screen proceed normally. No retry loop.
- **TTS unavailable / Web Speech API missing:** Try to fall back to MP3. If neither works, render quiz without audio; user can still play visually. Log warning.
- **MP3 fetch fails:** Fall back to TTS; if that also fails, render silent.
- **Unknown `:gameId` in route:** `Game.tsx` redirects to `/hub`.

## 7. Testing

### 7.1 Unit / Component Tests (Vitest + RTL)

- `registry.test.ts` — known id returns definition; unknown id returns `undefined`
- `letters-ar.test.ts` / `letters-en.test.ts` — correct count, required fields present, no duplicate `char` or `audio_key`
- `speak.test.ts` — fallback keys route to `playMp3`; others route to `synthSpeak`; both mocked
- `useSpeech.test.tsx` — exposes `speak()`, tracks `speaking` state through utterance lifecycle
- `useGameProgress.test.tsx` — Supabase client mocked:
  - fetches all rows for profile+game+lang on mount
  - `upsert(level, stars)` writes when no existing row
  - `upsert(level, stars)` writes when new stars > existing
  - `upsert(level, stars)` no-ops when new stars ≤ existing
  - swallows fetch errors gracefully (returns empty map)
- `Quiz.test.tsx`:
  - renders 4 tiles; audio plays on mount (mocked)
  - tap correct fires `onCorrect`
  - tap wrong fires `onWrong`; same prompt stays for retry
  - speaker icon re-triggers audio
- `LevelSelect.test.tsx` — N cards rendered; star badge per progress map; tap navigates to playing state
- `LevelResult.test.tsx` — star count rendered; buttons call correct handlers
- `LetterTapSound.test.tsx` (integration):
  - 0 mistakes across 3 prompts → upsert called with 3
  - 1 mistake → 2 stars
  - 2+ mistakes → 1 star
  - returning to grid reflects updated stars

### 7.2 Mocks

- Supabase client (table builder chain)
- `SpeechSynthesis` and `HTMLAudioElement` (no real audio in tests)
- `useNavigate` where component-tests need it

### 7.3 Not Tested Automatically

- TTS audio quality (manual — drives the fallback list)
- Supabase RLS (trust Postgres)
- Visual animations (CSS — manual verification)

### 7.4 Manual Smoke Test

1. Sign in fresh, pick Arabic, age 3–5
2. Click Letter Tap card on Hub
3. Play level 0 with no mistakes → 3 stars
4. Return to grid → level 0 shows 3-star badge
5. Refresh browser → 3 stars persist
6. Replay level 0 with 2 mistakes → grid still shows 3 stars (no-regress verified)
7. Settings → switch UI lang → RTL flips for Arabic
8. Sample several letters; note any with poor TTS for fallback list

## 8. Deliverables

1. Supabase migration `002_game_progress.sql`
2. Game registry + `Game.tsx` route
3. `letter-tap-sound` game module (data, audio, components)
4. `useGameProgress` and `useSpeech` hooks
5. Hub card wired to game route
6. Unit + integration tests, all passing
7. Manual smoke test verified
