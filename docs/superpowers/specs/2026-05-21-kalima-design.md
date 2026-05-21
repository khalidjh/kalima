# Kalima (كلمة) — Product Design Spec
**Date:** 2026-05-21  
**Domain:** kalima.fun  
**Status:** Approved for implementation

---

## Overview

Kalima is a bilingual kids learning platform where children choose a language to learn (Arabic or English) and progress through age-appropriate educational games. The name means "word" in Arabic — fitting for a platform built around letter and vocabulary mastery.

**Target audience:** Children ages 3–12 in the Saudi/GCC market  
**Platform:** Web (mobile-first, responsive for phone + iPad)  
**Business model:** Freemium — first game free per age group, subscription unlocks all

---

## 1. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Vite + React 18 | Fast builds, minimal config, HMR |
| Routing | React Router v6 | Client-side SPA routing |
| Styling | Tailwind CSS | Utility-first, easy theming |
| Animation | Framer Motion | Micro-interactions, page transitions |
| Audio | Howler.js | Sound effects with OS silent-mode respect |
| i18n | i18next | UI language strings + RTL switching |
| State | Zustand | Global user/progress state |
| Backend | Supabase | Auth (Google OAuth), Postgres, RLS |
| Payments | Moyasar | Saudi gateway — mada, Visa, Apple Pay |
| Deployment | Railway | Docker-based, environment variables |
| Domain | kalima.fun | Already owned |

**Project structure:**
```
src/
  games/              # self-contained game modules
    letter-tap/       # index.tsx + config.ts per game
    word-builder/
    bubble-pop/
    match-pair/
    word-match-race/
    spelling-sprint/
    dot-placement/    # Arabic-only signature game
  components/         # shared UI (Button, Card, Mascot, Trophy)
  pages/              # route-level screens
  stores/             # Zustand slices (user, progress, sound)
  lib/                # supabase client, i18n config, moyasar
  hooks/              # useProgress, useSound, useGame, useStreak
  assets/             # fonts, illustrations, sounds
```

Each game exports:
```ts
export const config: GameConfig = {
  id: 'letter-tap-ar',
  nameAr: 'اضغط الحرف',
  nameEn: 'Letter Tap',
  ageGroups: ['3-5'],
  learnLang: 'ar',        // 'ar' | 'en' — what the kid is learning
  isPremium: false,
  levels: 28,             // one per Arabic letter
  estimatedMinutes: 5,
}
```

Adding a new game = adding one folder. No changes to the registry loader.

---

## 2. User Flow

```
kalima.fun
    │
    ▼
Landing Page  (unauthenticated)
    Hero, "Start Learning" CTA, Google Sign-In
    │
    ▼
Language to Learn  (first-run only, saved to profile)
    [ أتعلم العربية ]     [ I'm learning English ]
    │
    ▼
Age Group  (first-run only, saved to profile)
    [ 3–5 ]   [ 6–8 ]   [ 9–12 ]
    │
    ▼
Games Hub  (home screen on return visits)
    Mascot companion greeting
    Game cards: free first, then premium locked (🔒)
    Streak indicator + XP level badge
    │
    ├──► Game Screen
    │       Full-screen gameplay
    │       Stars earned → saved to Supabase
    │       End screen: stars + mascot reaction + "Play Again / Next Level"
    │
    ├──► Trophy Room
    │       Badge cabinet, streak history, level progress
    │
    └──► Settings
            Change age group, change learning language
            Manage subscription
            UI language toggle (AR/EN)
```

**Return visit:** language + age are remembered, user lands directly on Games Hub.

---

## 3. Age-Specific Mascot Companions

Each age group has a dedicated companion character in the Storybook Magic world:

| Age Group | Mascot | Personality |
|-----------|--------|------------|
| 3–5 | Baby Noor 🌟 (magical firefly) | Gentle, encouraging, celebrates everything |
| 6–8 | Zaid ✨ (young wizard-in-training) | Curious, excited, loves challenges |
| 9–12 | Scholar Fox 🦊 (wise but cool) | Confident, competitive, gives tips |

Mascots:
- Run an idle breathing/blinking animation at all times
- React to correct answers (happy bounce), wrong answers (sympathetic head-shake)
- Trigger a full dance animation on level-up
- Flip horizontally (CSS `scale-x: -1`) in RTL mode
- Peek behind locked game cards with a "Unlock me!" speech bubble

---

## 4. Launch Games (MVP)

Two games per age group per learning language = **13 game types** at launch.

### Learning Arabic (أتعلم العربية)

| Age | Game | Mechanic | Free/Premium |
|-----|------|----------|-------------|
| 3–5 | Letter Tap & Sound | Tap a large Arabic letter, hear its name + see animated object | **Free** |
| 3–5 | Match the Pair | Flip cards, match Arabic letter to picture | Premium |
| 6–8 | Word Builder | Drag Arabic letter tiles to spell a pictured word (RTL) | **Free** |
| 6–8 | Bubble Pop | Hear a sound, pop the correct Arabic letter bubble | Premium |
| 9–12 | Word Match Race | Two columns, tap matching Arabic word pairs under timer | **Free** |
| 9–12 | Spelling Sprint | Image shown, type Arabic word before time runs out | Premium |
| 6–12 | Dot Placement ⭐ | Place dots on the correct letter base shape (ب ت ث signature mechanic) | Premium |

### Learning English

| Age | Game | Mechanic | Free/Premium |
|-----|------|----------|-------------|
| 3–5 | Letter Tap & Sound | Tap a large English letter, hear its name + phonics sound | **Free** |
| 3–5 | Match the Pair | Flip cards, match letter to picture | Premium |
| 6–8 | Word Builder | Drag letter tiles to spell a pictured word | **Free** |
| 6–8 | Bubble Pop | Hear a phonics sound, pop the correct letter | Premium |
| 9–12 | Word Match Race | Two columns, tap matching word pairs under timer | **Free** |
| 9–12 | Spelling Sprint | Image shown, type the word before time runs out | Premium |

### Game Engine Rules (all games)
- Ages 3–5: no time pressure
- Wrong answer: gentle wobble animation + soft sound + hint shown (never a harsh buzzer)
- Correct answer: star particle burst + chime sound + mascot bounce
- Session length: ~5 min (ages 3–5), ~10 min (ages 6–8, 9–12)
- End of session: 1–3 stars awarded, summary screen, mascot reaction

---

## 5. Supabase Schema

```sql
-- Extends auth.users
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  age_group    text CHECK (age_group IN ('3-5', '6-8', '9-12')),
  learn_lang   text CHECK (learn_lang IN ('ar', 'en')),
  ui_lang      text CHECK (ui_lang IN ('ar', 'en')) DEFAULT 'ar',
  is_premium   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Moyasar subscriptions
CREATE TABLE subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status       text CHECK (status IN ('active', 'cancelled', 'expired')),
  moyasar_id   text UNIQUE,
  started_at   timestamptz,
  expires_at   timestamptz
);

-- Per-level progress
CREATE TABLE game_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_id      text NOT NULL,   -- e.g. 'letter-tap-ar'
  level        int NOT NULL,
  stars        int CHECK (stars BETWEEN 1 AND 3),
  completed    boolean DEFAULT false,
  played_at    timestamptz DEFAULT now()
);

-- Trophy cabinet
CREATE TABLE trophies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_id    text NOT NULL,
  earned_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, trophy_id)
);

-- Daily streaks
CREATE TABLE streaks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current      int DEFAULT 0,
  longest      int DEFAULT 0,
  last_played  date
);
```

**RLS:** All tables: `USING (auth.uid() = user_id)`. No cross-user data access.

---

## 6. Gamification System

### XP & Levels
- 1 star = 10 XP, max 30 XP per session
- Level thresholds: 100 → 250 → 500 → 900 → 1400 → 2100…
- Level badge shown on hub ("Level 5 Explorer")
- Level-up triggers: fullscreen confetti (2s), mascot dance, badge reveal

### Streaks
- Any game played = streak day
- Flame icon 🔥 + count shown on hub
- Streak milestone trophies: 3, 7, 14, 30 days
- Missed day: current resets to 0, longest preserved

### Trophy Catalogue

| Trophy ID | Name | Trigger |
|-----------|------|---------|
| first-letter | First Letter | Complete first Letter Tap level |
| alphabet-master-ar | Arabic Alphabet Master | Complete all 28 Arabic Letter Tap levels |
| alphabet-master-en | English Alphabet Master | Complete all 26 English Letter Tap levels |
| word-wizard | Word Wizard | Build first word in Word Builder |
| dot-detective | Dot Detective | Complete first Dot Placement level |
| speed-reader | Speed Reader | Complete Spelling Sprint under 5s |
| streak-3 | Hot Streak | 3-day streak |
| streak-7 | Week Warrior | 7-day streak |
| streak-14 | Fortnight Fire | 14-day streak |
| streak-30 | Month Master | 30-day streak |
| star-50 | Star Collector | Earn 50 total stars |
| bilingual | Bilingual Explorer | Play both Arabic and English paths |

### Stars Per Session
- 3 stars: completed, 0–1 mistakes
- 2 stars: completed, 2–3 mistakes
- 1 star: completed, many mistakes
- Stars shown on game card thumbnail in the hub

### Freemium Gating
- First game per learning-lang + age-group: fully free
- Premium games: first level always free as teaser, then soft paywall modal
- Paywall shows mascot, trophy count locked, and Moyasar subscribe button

---

## 7. UI Design System — Storybook Magic

### Color Palette
```
Primary:   #FFD60A   golden yellow (magic glow, CTAs)
Secondary: #4361EE   royal blue (castle sky, accents)
Accent:    #F72585   magic pink (highlights, badges)
Success:   #06D6A0   mint green (correct answers)
Warning:   #FB8500   amber (streak, warnings)
Surface:   #FFFBF0   warm parchment (card backgrounds)
Dark:      #1A1A2E   night sky (text, dark elements)
```

### Typography
- **Latin headings + UI:** Baloo 2 (rounded, playful)
- **Latin body:** Nunito (soft, legible for kids)
- **Arabic:** Baloo Bhaijaan 2 (same family, Arabic-optimized, includes harakat)
- Min font size: 16px body, 20px for ages 3–5 game content

### Component Rules
- Buttons: fully rounded (`rounded-full`), min 48px height, bounce on tap (`scale: 0.95` on press)
- Cards: `rounded-2xl`, soft shadow, parchment background
- Touch targets: minimum 48×48px everywhere
- Inputs: only in ages 9–12, large tap target, no autofocus on mobile

### Animation (Framer Motion)
| Trigger | Animation |
|---------|-----------|
| Correct answer | Star burst particles + mascot bounce |
| Wrong answer | Gentle wobble (shake 3×) |
| Page enter | Slide up + fade in (300ms) |
| Level up | Fullscreen confetti shower (2s auto-dismiss) |
| Mascot idle | Slow breathe / blink loop |
| Button tap | Scale 0.95 → 1.0 spring |
| Game card hover | Lift shadow + slight scale |

### RTL Handling
- `dir="rtl"` applied at route level when `learn_lang === 'ar'`
- All layout uses CSS logical properties (`margin-inline-start`, `padding-inline-end`)
- Letter tiles flow right-to-left in Word Builder
- Mascot flips horizontally in RTL (`transform: scaleX(-1)`)
- Progress bar fills right-to-left
- Arabic letters always rendered with full harakat (diacritics) for ages 3–8

### Sound Effects (Howler.js)
| Event | Sound |
|-------|-------|
| Correct answer | Cheerful chime |
| Wrong answer | Soft thud |
| Session complete | Fanfare melody |
| Button tap | Soft pop |
| Level up | Triumphant fanfare |
| Streak milestone | Sizzle + pop |

All sounds respect OS silent mode. Sound toggle in settings.

---

## 8. Freemium & Subscription

**Free tier:**
- Letter Tap (first learning language chosen) — fully free
- Word Match Race (age 9–12) — fully free
- 1 free level on all premium games (teaser)

**Premium subscription:**
- All games unlocked across both learning languages
- All levels, no limits
- Trophy catalogue fully accessible
- Monthly and annual pricing via Moyasar
- Supported payment: mada, Visa/Mastercard, Apple Pay

**Paywall UX:**
- Soft modal (no full-screen block)
- Mascot appears looking sad/hopeful
- Shows exactly what unlocks ("Unlock 6 more games + 200 levels!")
- One-tap subscribe with Moyasar hosted page
- No paywall during an active game session — only on game selection

---

## 9. Out of Scope for Launch

- Parent dashboard / multi-child accounts
- Leaderboards (added post-launch for ages 9–12)
- Speech recognition / pronunciation games
- Offline mode
- Push notifications
- Admin content management panel
- Number / math games
- Custom avatar builder (planned for v2 as premium reward)

---

## Research Basis

Game types and age appropriateness validated against:
- Duolingo ABC (sequential letter progression, bubble-pop mechanic)
- Khan Academy Kids (silent adaptive difficulty, animal companions)
- ABCmouse (token economy, level-based board)
- Starfall (phonics scaffolding: CVC → long vowels → digraphs)
- Arabic Playground ("Little Detective" letter-form game, dot mechanic)
- 2023–2024 gamification meta-analyses (large effect sizes for immediate feedback, streaks, progress paths)

Arabic-specific design decisions:
- Isolated letter form only for ages 3–5; all four forms for 9–12
- Harakat always included for ages 3–8
- MSA (Modern Standard Arabic) exclusively — no dialect content at launch
- Dot-placement game is a platform differentiator with no Western equivalent
