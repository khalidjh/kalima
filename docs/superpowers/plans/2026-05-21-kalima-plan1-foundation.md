# Kalima — Plan 1: Foundation + First Game

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Kalima platform from zero to a deployed, playable app with Google auth, onboarding flow, games hub, and the Letter Tap game working end-to-end in both Arabic and English.

**Architecture:** Vite + React 18 SPA with React Router v6. All game modules are self-contained folders under `src/games/` exporting a config + component — adding games requires no changes to the registry loader. Supabase handles auth (Google OAuth) and progress storage with RLS.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS 3, Framer Motion 11, React Router v6, Supabase JS v2, i18next, Zustand 4, Howler.js 2

---

## File Map

```
kids-learning/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── Dockerfile
├── src/
│   ├── main.tsx                       # entry, i18n init, router mount
│   ├── App.tsx                        # route definitions
│   ├── vite-env.d.ts
│   ├── lib/
│   │   ├── supabase.ts                # supabase client singleton
│   │   ├── i18n.ts                    # i18next config (ar + en)
│   │   └── cn.ts                      # clsx + twMerge helper
│   ├── stores/
│   │   ├── userStore.ts               # profile, auth state (Zustand)
│   │   └── soundStore.ts              # muted toggle (Zustand)
│   ├── hooks/
│   │   ├── useProfile.ts              # fetch/upsert profile from Supabase
│   │   ├── useProgress.ts             # save/load game_progress rows
│   │   └── useSound.ts                # play sounds via Howler
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx             # rounded, bounce-on-tap button
│   │   │   ├── Card.tsx               # parchment card base
│   │   │   └── StarBurst.tsx          # particle star burst on correct answer
│   │   ├── Mascot.tsx                 # age-group mascot (emoji-based MVP)
│   │   └── GameCard.tsx               # hub game card thumbnail
│   ├── pages/
│   │   ├── Landing.tsx                # hero + Google sign-in CTA
│   │   ├── OnboardLanguage.tsx        # "What do you want to learn?"
│   │   ├── OnboardAge.tsx             # age group picker
│   │   ├── Hub.tsx                    # games hub — main home screen
│   │   └── GamePage.tsx               # full-screen game wrapper
│   └── games/
│       ├── types.ts                   # GameConfig + GameProps interfaces
│       ├── registry.ts                # auto-loads all game configs
│       ├── GameShell.tsx              # wraps any game: header, stars, end screen
│       └── letter-tap/
│           ├── config.ts              # GameConfig for letter-tap
│           ├── LetterTap.tsx          # game component
│           └── data/
│               ├── ar.ts             # Arabic alphabet + audio labels
│               └── en.ts             # English alphabet + audio labels
├── supabase/
│   └── migrations/
│       └── 001_initial.sql            # all tables + RLS policies
└── public/
    └── sounds/
        ├── correct.mp3
        ├── wrong.mp3
        ├── complete.mp3
        └── tap.mp3
```

---

## Task 1: Scaffold Project

**Files:**
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/vite-env.d.ts`
- Create: `.env.example`
- Create: `package.json`

- [ ] **Step 1: Initialise the project in the existing directory**

```bash
cd /home/khalid/workspace/kids-learning
npm create vite@latest . -- --template react-ts
# When prompted "Current directory is not empty" → choose "Ignore files and continue"
# Framework: React, Variant: TypeScript
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom@6 \
  @supabase/supabase-js \
  zustand \
  framer-motion \
  i18next react-i18next \
  howler \
  clsx tailwind-merge

npm install -D \
  tailwindcss postcss autoprefixer \
  @types/howler \
  @tailwindcss/forms

npx tailwindcss init -p
```

- [ ] **Step 3: Replace `tailwind.config.ts` with the design system config**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#FFD60A',
        secondary: '#4361EE',
        accent:    '#F72585',
        success:   '#06D6A0',
        warning:   '#FB8500',
        surface:   '#FFFBF0',
        dark:      '#1A1A2E',
      },
      fontFamily: {
        display: ['Baloo 2', 'Baloo Bhaijaan 2', 'sans-serif'],
        body:    ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config
```

- [ ] **Step 4: Replace `index.html` to load Google Fonts**

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>كلمة | Kalima</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Baloo+Bhaijaan+2:wght@400;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.env.example`**

```bash
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Copy to `.env.local` and fill in your Supabase project credentials.

- [ ] **Step 6: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server on http://localhost:5173, no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React+Tailwind project"
```

---

## Task 2: Core Utilities

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create `src/lib/cn.ts`**

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create `src/lib/supabase.ts`**

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/
git commit -m "feat: add supabase client and cn utility"
```

---

## Task 3: i18n Setup (AR/EN UI strings)

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/locales/ar.json`
- Create: `src/locales/en.json`

- [ ] **Step 1: Create `src/locales/ar.json`**

```json
{
  "app_name": "كلمة",
  "landing_hero": "تعلّم وألعب كل يوم",
  "landing_cta": "ابدأ التعلم",
  "login_with_google": "الدخول بحساب جوجل",
  "onboard_lang_title": "ماذا تريد أن تتعلم؟",
  "onboard_lang_ar": "أتعلّم العربية",
  "onboard_lang_en": "أتعلّم الإنجليزية",
  "onboard_age_title": "كم عمرك؟",
  "onboard_age_3": "٣ – ٥ سنوات",
  "onboard_age_6": "٦ – ٨ سنوات",
  "onboard_age_9": "٩ – ١٢ سنة",
  "hub_greeting_3": "مرحباً يا {{name}}! جاهز للعب؟",
  "hub_greeting_6": "أهلاً {{name}}! ماذا نتعلم اليوم؟",
  "hub_greeting_9": "مرحباً {{name}}! هيا نبدأ!",
  "game_correct": "أحسنت!",
  "game_wrong": "حاول مرة أخرى",
  "game_complete": "رائع! أنهيت اللعبة!",
  "stars_earned": "نجوم حصلت عليها",
  "play_again": "العب مجدداً",
  "next_level": "المستوى التالي",
  "locked_game": "اشترك لفتح جميع الألعاب!",
  "subscribe_btn": "اشترك الآن",
  "settings": "الإعدادات",
  "trophies": "الجوائز",
  "back": "رجوع",
  "level": "المستوى {{n}}"
}
```

- [ ] **Step 2: Create `src/locales/en.json`**

```json
{
  "app_name": "Kalima",
  "landing_hero": "Learn and play every day",
  "landing_cta": "Start Learning",
  "login_with_google": "Sign in with Google",
  "onboard_lang_title": "What do you want to learn?",
  "onboard_lang_ar": "I'm learning Arabic",
  "onboard_lang_en": "I'm learning English",
  "onboard_age_title": "How old are you?",
  "onboard_age_3": "3 – 5 years",
  "onboard_age_6": "6 – 8 years",
  "onboard_age_9": "9 – 12 years",
  "hub_greeting_3": "Hi {{name}}! Ready to play?",
  "hub_greeting_6": "Hey {{name}}! What are we learning today?",
  "hub_greeting_9": "Welcome back {{name}}! Let's go!",
  "game_correct": "Awesome!",
  "game_wrong": "Try again!",
  "game_complete": "Amazing! You finished!",
  "stars_earned": "Stars earned",
  "play_again": "Play Again",
  "next_level": "Next Level",
  "locked_game": "Subscribe to unlock all games!",
  "subscribe_btn": "Subscribe Now",
  "settings": "Settings",
  "trophies": "Trophies",
  "back": "Back",
  "level": "Level {{n}}"
}
```

- [ ] **Step 3: Create `src/lib/i18n.ts`**

```ts
// src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from '../locales/ar.json'
import en from '../locales/en.json'

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar',           // default UI language
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n.ts src/locales/
git commit -m "feat: add i18n with Arabic and English UI strings"
```

---

## Task 4: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/001_initial.sql

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  age_group    TEXT CHECK (age_group IN ('3-5', '6-8', '9-12')),
  learn_lang   TEXT CHECK (learn_lang IN ('ar', 'en')),
  ui_lang      TEXT CHECK (ui_lang IN ('ar', 'en')) DEFAULT 'ar',
  is_premium   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Per-level game progress
CREATE TABLE IF NOT EXISTS game_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id      TEXT NOT NULL,
  level        INT NOT NULL,
  stars        INT CHECK (stars BETWEEN 1 AND 3),
  completed    BOOLEAN DEFAULT FALSE,
  played_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id, level)
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON game_progress FOR ALL USING (auth.uid() = user_id);

-- Trophies
CREATE TABLE IF NOT EXISTS trophies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_id    TEXT NOT NULL,
  earned_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, trophy_id)
);

ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trophies" ON trophies FOR ALL USING (auth.uid() = user_id);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current      INT DEFAULT 0,
  longest      INT DEFAULT 0,
  last_played  DATE
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streak" ON streaks FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  moyasar_id   TEXT UNIQUE,
  started_at   TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to your Supabase project → SQL Editor → paste the SQL → Run.

Verify all 5 tables created: `profiles`, `game_progress`, `trophies`, `streaks`, `subscriptions`.

- [ ] **Step 3: Enable Google OAuth in Supabase**

In Supabase dashboard: Authentication → Providers → Google → Enable.
Add your Google OAuth client ID and secret (create at console.cloud.google.com).
Add `http://localhost:5173` to allowed redirect URLs.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema with RLS policies"
```

---

## Task 5: Zustand Stores

**Files:**
- Create: `src/stores/userStore.ts`
- Create: `src/stores/soundStore.ts`

- [ ] **Step 1: Create `src/stores/userStore.ts`**

```ts
// src/stores/userStore.ts
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

export type AgeGroup = '3-5' | '6-8' | '9-12'
export type LearnLang = 'ar' | 'en'
export type UiLang = 'ar' | 'en'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  age_group: AgeGroup | null
  learn_lang: LearnLang | null
  ui_lang: UiLang
  is_premium: boolean
}

interface UserState {
  user: User | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}))
```

- [ ] **Step 2: Create `src/stores/soundStore.ts`**

```ts
// src/stores/soundStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundState {
  muted: boolean
  toggleMuted: () => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      muted: false,
      toggleMuted: () => set({ muted: !get().muted }),
    }),
    { name: 'kalima-sound' }
  )
)
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand stores for user and sound state"
```

---

## Task 6: Custom Hooks

**Files:**
- Create: `src/hooks/useProfile.ts`
- Create: `src/hooks/useProgress.ts`
- Create: `src/hooks/useSound.ts`

- [ ] **Step 1: Create `src/hooks/useProfile.ts`**

```ts
// src/hooks/useProfile.ts
import { supabase } from '../lib/supabase'
import { Profile, useUserStore } from '../stores/userStore'

export function useProfile() {
  const { profile, setProfile } = useUserStore()

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) return null
    return data as Profile
  }

  async function upsertProfile(updates: Partial<Profile> & { id: string }): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates)
      .select()
      .single()
    if (!error && data) setProfile(data as Profile)
  }

  return { profile, fetchProfile, upsertProfile }
}
```

- [ ] **Step 2: Create `src/hooks/useProgress.ts`**

```ts
// src/hooks/useProgress.ts
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/userStore'

export interface ProgressRow {
  game_id: string
  level: number
  stars: number
  completed: boolean
}

export function useProgress() {
  const { user } = useUserStore()

  async function saveProgress(gameId: string, level: number, stars: number): Promise<void> {
    if (!user) return
    await supabase.from('game_progress').upsert({
      user_id: user.id,
      game_id: gameId,
      level,
      stars,
      completed: true,
      played_at: new Date().toISOString(),
    }, { onConflict: 'user_id,game_id,level' })
  }

  async function loadProgress(gameId: string): Promise<ProgressRow[]> {
    if (!user) return []
    const { data } = await supabase
      .from('game_progress')
      .select('game_id,level,stars,completed')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
    return (data ?? []) as ProgressRow[]
  }

  async function loadAllProgress(): Promise<ProgressRow[]> {
    if (!user) return []
    const { data } = await supabase
      .from('game_progress')
      .select('game_id,level,stars,completed')
      .eq('user_id', user.id)
    return (data ?? []) as ProgressRow[]
  }

  return { saveProgress, loadProgress, loadAllProgress }
}
```

- [ ] **Step 3: Create `src/hooks/useSound.ts`**

```ts
// src/hooks/useSound.ts
import { Howl } from 'howler'
import { useSoundStore } from '../stores/soundStore'

const sounds: Record<string, Howl> = {
  correct:  new Howl({ src: ['/sounds/correct.mp3'],  volume: 0.7 }),
  wrong:    new Howl({ src: ['/sounds/wrong.mp3'],    volume: 0.5 }),
  complete: new Howl({ src: ['/sounds/complete.mp3'], volume: 0.8 }),
  tap:      new Howl({ src: ['/sounds/tap.mp3'],      volume: 0.4 }),
}

export function useSound() {
  const { muted } = useSoundStore()

  function play(name: keyof typeof sounds) {
    if (muted) return
    sounds[name]?.play()
  }

  return { play }
}
```

- [ ] **Step 4: Add placeholder sound files**

```bash
mkdir -p public/sounds
# Download or create placeholder MP3s — use any short sound files for development.
# Rename them: correct.mp3, wrong.mp3, complete.mp3, tap.mp3
# Free sounds: https://freesound.org or https://mixkit.co/free-sound-effects/
touch public/sounds/correct.mp3 public/sounds/wrong.mp3
touch public/sounds/complete.mp3 public/sounds/tap.mp3
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ public/sounds/
git commit -m "feat: add useProfile, useProgress, useSound hooks"
```

---

## Task 7: Shared UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/StarBurst.tsx`
- Create: `src/components/Mascot.tsx`

- [ ] **Step 1: Create `src/components/ui/Button.tsx`**

```tsx
// src/components/ui/Button.tsx
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const base = 'rounded-full font-display font-bold cursor-pointer select-none transition-colors'
  const variants = {
    primary:   'bg-primary text-dark hover:bg-yellow-400 active:bg-yellow-500',
    secondary: 'bg-secondary text-white hover:bg-blue-600 active:bg-blue-700',
    ghost:     'bg-white/80 text-dark hover:bg-white active:bg-gray-100 border border-gray-200',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/Card.tsx`**

```tsx
// src/components/ui/Card.tsx
import { cn } from '../../lib/cn'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-surface rounded-2xl shadow-md p-4', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/StarBurst.tsx`**

```tsx
// src/components/ui/StarBurst.tsx
import { motion, AnimatePresence } from 'framer-motion'

interface StarBurstProps {
  show: boolean
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i / 12) * 360,
  distance: 60 + Math.random() * 40,
}))

export function StarBurst({ show }: StarBurstProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute text-2xl"
              initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: 0,
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              ⭐
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Create `src/components/Mascot.tsx`**

```tsx
// src/components/Mascot.tsx
// MVP: emoji mascots — replace with SVG illustrations later
import { motion } from 'framer-motion'
import { AgeGroup } from '../stores/userStore'

const MASCOTS: Record<AgeGroup, { emoji: string; name: string }> = {
  '3-5': { emoji: '🌟', name: 'Baby Noor' },
  '6-8': { emoji: '🧙', name: 'Zaid' },
  '9-12': { emoji: '🦊', name: 'Scholar Fox' },
}

interface MascotProps {
  ageGroup: AgeGroup
  mood?: 'idle' | 'happy' | 'sad'
  size?: 'sm' | 'md' | 'lg'
  rtl?: boolean
}

export function Mascot({ ageGroup, mood = 'idle', size = 'md', rtl = false }: MascotProps) {
  const { emoji } = MASCOTS[ageGroup]
  const sizes = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-8xl' }

  const animation = mood === 'happy'
    ? { y: [-4, 4, -4], transition: { repeat: 2, duration: 0.3 } }
    : mood === 'sad'
    ? { rotate: [-5, 5, -5], transition: { repeat: 2, duration: 0.3 } }
    : { y: [0, -4, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }

  return (
    <motion.span
      className={`${sizes[size]} inline-block select-none`}
      style={rtl ? { transform: 'scaleX(-1)' } : undefined}
      animate={animation}
    >
      {emoji}
    </motion.span>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add shared UI components (Button, Card, StarBurst, Mascot)"
```

---

## Task 8: Game Registry

**Files:**
- Create: `src/games/types.ts`
- Create: `src/games/registry.ts`

- [ ] **Step 1: Create `src/games/types.ts`**

```ts
// src/games/types.ts
import { AgeGroup, LearnLang } from '../stores/userStore'
import React from 'react'

export interface GameConfig {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  ageGroups: AgeGroup[]
  learnLang: LearnLang
  isPremium: boolean
  levels: number
  estimatedMinutes: number
  emoji: string
}

export interface GameProps {
  level: number
  learnLang: LearnLang
  onComplete: (stars: number) => void
  onExit: () => void
}

export interface GameModule {
  config: GameConfig
  Component: React.ComponentType<GameProps>
}
```

- [ ] **Step 2: Create `src/games/registry.ts`**

```ts
// src/games/registry.ts
// Import each game module explicitly. Add new games here.
import { config as letterTapArConfig, LetterTap as LetterTapAr } from './letter-tap/LetterTap'
import { GameModule, GameConfig } from './types'
import { AgeGroup, LearnLang } from '../stores/userStore'

const ALL_MODULES: GameModule[] = [
  { config: letterTapArConfig, Component: LetterTapAr },
]

export function getGamesForProfile(ageGroup: AgeGroup, learnLang: LearnLang): GameModule[] {
  return ALL_MODULES.filter(
    (m) => m.config.learnLang === learnLang && m.config.ageGroups.includes(ageGroup)
  )
}

export function getGameById(id: string): GameModule | undefined {
  return ALL_MODULES.find((m) => m.config.id === id)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/games/types.ts src/games/registry.ts
git commit -m "feat: add game registry types and loader"
```

---

## Task 9: Letter Tap Game — Data

**Files:**
- Create: `src/games/letter-tap/data/ar.ts`
- Create: `src/games/letter-tap/data/en.ts`

- [ ] **Step 1: Create `src/games/letter-tap/data/ar.ts`**

```ts
// src/games/letter-tap/data/ar.ts
export interface LetterData {
  letter: string    // the letter to display
  name: string      // spoken name (for TTS label)
  example: string   // Arabic word starting with this letter
  emoji: string     // visual representation
}

export const AR_LETTERS: LetterData[] = [
  { letter: 'أ', name: 'ألف', example: 'أسد', emoji: '🦁' },
  { letter: 'ب', name: 'باء', example: 'بيت', emoji: '🏠' },
  { letter: 'ت', name: 'تاء', example: 'تفاحة', emoji: '🍎' },
  { letter: 'ث', name: 'ثاء', example: 'ثعلب', emoji: '🦊' },
  { letter: 'ج', name: 'جيم', example: 'جمل', emoji: '🐪' },
  { letter: 'ح', name: 'حاء', example: 'حصان', emoji: '🐴' },
  { letter: 'خ', name: 'خاء', example: 'خروف', emoji: '🐑' },
  { letter: 'د', name: 'دال', example: 'دجاجة', emoji: '🐔' },
  { letter: 'ذ', name: 'ذال', example: 'ذئب', emoji: '🐺' },
  { letter: 'ر', name: 'راء', example: 'رمان', emoji: '🍎' },
  { letter: 'ز', name: 'زاي', example: 'زرافة', emoji: '🦒' },
  { letter: 'س', name: 'سين', example: 'سمكة', emoji: '🐟' },
  { letter: 'ش', name: 'شين', example: 'شمس', emoji: '☀️' },
  { letter: 'ص', name: 'صاد', example: 'صقر', emoji: '🦅' },
  { letter: 'ض', name: 'ضاد', example: 'ضفدع', emoji: '🐸' },
  { letter: 'ط', name: 'طاء', example: 'طائر', emoji: '🐦' },
  { letter: 'ظ', name: 'ظاء', example: 'ظبي', emoji: '🦌' },
  { letter: 'ع', name: 'عين', example: 'عصفور', emoji: '🐦' },
  { letter: 'غ', name: 'غين', example: 'غزال', emoji: '🦌' },
  { letter: 'ف', name: 'فاء', example: 'فيل', emoji: '🐘' },
  { letter: 'ق', name: 'قاف', example: 'قطة', emoji: '🐱' },
  { letter: 'ك', name: 'كاف', example: 'كلب', emoji: '🐶' },
  { letter: 'ل', name: 'لام', example: 'ليمون', emoji: '🍋' },
  { letter: 'م', name: 'ميم', example: 'موزة', emoji: '🍌' },
  { letter: 'ن', name: 'نون', example: 'نملة', emoji: '🐜' },
  { letter: 'ه', name: 'هاء', example: 'هرة', emoji: '🐱' },
  { letter: 'و', name: 'واو', example: 'وردة', emoji: '🌹' },
  { letter: 'ي', name: 'ياء', example: 'يد', emoji: '✋' },
]
```

- [ ] **Step 2: Create `src/games/letter-tap/data/en.ts`**

```ts
// src/games/letter-tap/data/en.ts
export interface LetterData {
  letter: string
  name: string
  example: string
  emoji: string
}

export const EN_LETTERS: LetterData[] = [
  { letter: 'A', name: 'ay', example: 'Apple', emoji: '🍎' },
  { letter: 'B', name: 'bee', example: 'Ball', emoji: '⚽' },
  { letter: 'C', name: 'see', example: 'Cat', emoji: '🐱' },
  { letter: 'D', name: 'dee', example: 'Dog', emoji: '🐶' },
  { letter: 'E', name: 'ee', example: 'Elephant', emoji: '🐘' },
  { letter: 'F', name: 'ef', example: 'Fish', emoji: '🐟' },
  { letter: 'G', name: 'jee', example: 'Giraffe', emoji: '🦒' },
  { letter: 'H', name: 'aitch', example: 'House', emoji: '🏠' },
  { letter: 'I', name: 'eye', example: 'Ice cream', emoji: '🍦' },
  { letter: 'J', name: 'jay', example: 'Jellyfish', emoji: '🪼' },
  { letter: 'K', name: 'kay', example: 'Kite', emoji: '🪁' },
  { letter: 'L', name: 'el', example: 'Lion', emoji: '🦁' },
  { letter: 'M', name: 'em', example: 'Moon', emoji: '🌙' },
  { letter: 'N', name: 'en', example: 'Nest', emoji: '🪺' },
  { letter: 'O', name: 'oh', example: 'Orange', emoji: '🍊' },
  { letter: 'P', name: 'pee', example: 'Penguin', emoji: '🐧' },
  { letter: 'Q', name: 'cue', example: 'Queen', emoji: '👑' },
  { letter: 'R', name: 'ar', example: 'Rainbow', emoji: '🌈' },
  { letter: 'S', name: 'ess', example: 'Star', emoji: '⭐' },
  { letter: 'T', name: 'tee', example: 'Tiger', emoji: '🐯' },
  { letter: 'U', name: 'you', example: 'Umbrella', emoji: '☂️' },
  { letter: 'V', name: 'vee', example: 'Violin', emoji: '🎻' },
  { letter: 'W', name: 'double-u', example: 'Whale', emoji: '🐳' },
  { letter: 'X', name: 'ex', example: 'Xylophone', emoji: '🎵' },
  { letter: 'Y', name: 'why', example: 'Yak', emoji: '🐃' },
  { letter: 'Z', name: 'zee', example: 'Zebra', emoji: '🦓' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/games/letter-tap/data/
git commit -m "feat: add letter data for Arabic and English alphabets"
```

---

## Task 10: Letter Tap Game — Component

**Files:**
- Create: `src/games/letter-tap/config.ts`
- Create: `src/games/letter-tap/LetterTap.tsx`

- [ ] **Step 1: Create `src/games/letter-tap/config.ts`**

```ts
// src/games/letter-tap/config.ts
import { GameConfig } from '../types'

export const letterTapArConfig: GameConfig = {
  id: 'letter-tap-ar',
  nameAr: 'اضغط الحرف',
  nameEn: 'Letter Tap (Arabic)',
  descriptionAr: 'اضغط على الحرف واسمع صوته',
  descriptionEn: 'Tap the letter and hear its sound',
  ageGroups: ['3-5', '6-8'],
  learnLang: 'ar',
  isPremium: false,
  levels: 28,
  estimatedMinutes: 5,
  emoji: '🔤',
}

export const letterTapEnConfig: GameConfig = {
  id: 'letter-tap-en',
  nameAr: 'اضغط الحرف الإنجليزي',
  nameEn: 'Letter Tap',
  descriptionAr: 'اضغط على الحرف واسمع اسمه',
  descriptionEn: 'Tap the letter and hear its name',
  ageGroups: ['3-5', '6-8'],
  learnLang: 'en',
  isPremium: false,
  levels: 26,
  estimatedMinutes: 5,
  emoji: '🔤',
}
```

- [ ] **Step 2: Create `src/games/letter-tap/LetterTap.tsx`**

```tsx
// src/games/letter-tap/LetterTap.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '../types'
import { letterTapArConfig, letterTapEnConfig } from './config'
import { AR_LETTERS } from './data/ar'
import { EN_LETTERS } from './data/en'
import { StarBurst } from '../../components/ui/StarBurst'
import { useSound } from '../../hooks/useSound'

export { letterTapArConfig, letterTapEnConfig }

// Which letters to show in this level (1 target + 3 distractors)
function getChoices(letters: typeof AR_LETTERS, targetIndex: number) {
  const target = letters[targetIndex]
  const others = letters.filter((_, i) => i !== targetIndex)
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3)
  const all = [...shuffled, target].sort(() => Math.random() - 0.5)
  return { target, choices: all }
}

interface LetterTapProps extends GameProps {}

function LetterTapGame({ level, learnLang, onComplete, onExit }: LetterTapProps) {
  const letters = learnLang === 'ar' ? AR_LETTERS : EN_LETTERS
  const letterIndex = level % letters.length
  const { target, choices } = getChoices(letters, letterIndex)

  const [selected, setSelected] = useState<string | null>(null)
  const [showBurst, setShowBurst] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [done, setDone] = useState(false)
  const { play } = useSound()

  function handleTap(letter: string) {
    if (done || selected) return
    setSelected(letter)

    if (letter === target.letter) {
      play('correct')
      setShowBurst(true)
      setTimeout(() => setShowBurst(false), 700)
      setTimeout(() => {
        setDone(true)
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
        onComplete(stars)
      }, 1000)
    } else {
      play('wrong')
      setMistakes((m) => m + 1)
      setTimeout(() => setSelected(null), 600)
    }
  }

  const isRtl = learnLang === 'ar'

  return (
    <div
      className="relative flex flex-col items-center gap-8 px-4 py-8"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Target prompt */}
      <div className="text-center">
        <p className="font-body text-lg text-dark/70 mb-2">
          {isRtl ? `أين حرف "${target.name}"؟` : `Where is the letter "${target.name}"?`}
        </p>
        <div className="text-6xl">{target.emoji}</div>
        <p className="font-display text-xl font-bold text-dark mt-1">{target.example}</p>
      </div>

      {/* Letter choices */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs relative">
        <AnimatePresence mode="wait">
          {choices.map((c) => {
            const isTarget = c.letter === target.letter
            const isSelected = selected === c.letter
            const isWrong = isSelected && !isTarget

            return (
              <motion.button
                key={c.letter}
                onClick={() => handleTap(c.letter)}
                animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`
                  relative flex items-center justify-center
                  h-24 rounded-2xl text-5xl font-display font-bold
                  shadow-md transition-colors cursor-pointer
                  ${isSelected && isTarget
                    ? 'bg-success text-white scale-105'
                    : isWrong
                    ? 'bg-red-100 text-red-400'
                    : 'bg-surface text-dark hover:bg-yellow-50 active:scale-95'}
                `}
              >
                {c.letter}
                {isSelected && isTarget && (
                  <span className="absolute -top-2 -right-2 text-xl">✅</span>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
        <StarBurst show={showBurst} />
      </div>
    </div>
  )
}

// Named exports for registry
export function LetterTap(props: LetterTapProps) {
  if (props.learnLang === 'ar') {
    return <LetterTapGame {...props} />
  }
  return <LetterTapGame {...props} />
}

export const config = letterTapArConfig
```

- [ ] **Step 3: Commit**

```bash
git add src/games/letter-tap/
git commit -m "feat: implement Letter Tap game for Arabic and English"
```

---

## Task 11: Game Shell

**Files:**
- Create: `src/games/GameShell.tsx`

- [ ] **Step 1: Create `src/games/GameShell.tsx`**

```tsx
// src/games/GameShell.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { GameModule } from './types'
import { LearnLang } from '../stores/userStore'
import { Button } from '../components/ui/Button'
import { useProgress } from '../hooks/useProgress'
import { useSound } from '../hooks/useSound'

interface GameShellProps {
  gameModule: GameModule
  level: number
  learnLang: LearnLang
  onExit: () => void
}

type Phase = 'playing' | 'complete'

export function GameShell({ gameModule, level, learnLang, onExit }: GameShellProps) {
  const { config, Component } = gameModule
  const { t } = useTranslation()
  const { saveProgress } = useProgress()
  const { play } = useSound()
  const [phase, setPhase] = useState<Phase>('playing')
  const [stars, setStars] = useState(0)

  async function handleComplete(earnedStars: number) {
    setStars(earnedStars)
    play('complete')
    await saveProgress(config.id, level, earnedStars)
    setPhase('complete')
  }

  const isRtl = learnLang === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/10 to-surface flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm shadow-sm">
        <button onClick={onExit} className="text-2xl">←</button>
        <h1 className="font-display font-bold text-dark">
          {isRtl ? config.nameAr : config.nameEn}
        </h1>
        <span className="font-body text-sm text-dark/50">
          {t('level', { n: level + 1 })}
        </span>
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'playing' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <Component
                level={level}
                learnLang={learnLang}
                onComplete={handleComplete}
                onExit={onExit}
              />
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 px-8 text-center"
            >
              <div className="text-6xl">🎉</div>
              <h2 className="font-display text-2xl font-bold text-dark">
                {t('game_complete')}
              </h2>
              <div className="flex gap-2 text-4xl">
                {[1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: i <= stars ? 1 : 0.4 }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                    className={i <= stars ? 'opacity-100' : 'opacity-30'}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button variant="primary" onClick={() => setPhase('playing')}>
                  {t('play_again')}
                </Button>
                <Button variant="ghost" onClick={onExit}>
                  {t('back')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/games/GameShell.tsx
git commit -m "feat: add GameShell wrapper with complete/star screen"
```

---

## Task 12: App Routing + Auth Shell

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Modify: `src/index.css` (Tailwind directives)

- [ ] **Step 1: Replace `src/index.css`**

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Nunito', sans-serif;
  background-color: #FFFBF0;
  color: #1A1A2E;
}
```

- [ ] **Step 2: Create `src/main.tsx`**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './lib/i18n'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 3: Create `src/App.tsx`**

```tsx
// src/App.tsx
import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useUserStore } from './stores/userStore'
import { useProfile } from './hooks/useProfile'
import Landing from './pages/Landing'
import OnboardLanguage from './pages/OnboardLanguage'
import OnboardAge from './pages/OnboardAge'
import Hub from './pages/Hub'
import GamePage from './pages/GamePage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-4xl">🌟</div>
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUserStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-4xl">🌟</div>
  if (!profile?.age_group) return <Navigate to="/onboard/language" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setProfile, setLoading } = useUserStore()
  const { fetchProfile } = useProfile()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        setProfile(p)
        if (event === 'SIGNED_IN' && !p?.age_group) {
          navigate('/onboard/language')
        }
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboard/language" element={<RequireAuth><OnboardLanguage /></RequireAuth>} />
      <Route path="/onboard/age"      element={<RequireAuth><OnboardAge /></RequireAuth>} />
      <Route path="/hub"              element={<RequireAuth><RequireProfile><Hub /></RequireProfile></RequireAuth>} />
      <Route path="/game/:gameId"     element={<RequireAuth><RequireProfile><GamePage /></RequireProfile></RequireAuth>} />
      <Route path="*"                 element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/App.tsx src/index.css
git commit -m "feat: add app routing with auth and profile guards"
```

---

## Task 13: Landing Page

**Files:**
- Create: `src/pages/Landing.tsx`

- [ ] **Step 1: Create `src/pages/Landing.tsx`**

```tsx
// src/pages/Landing.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/userStore'
import { Button } from '../components/ui/Button'

export default function Landing() {
  const { t } = useTranslation()
  const { user, profile } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile?.age_group) navigate('/hub')
    else if (user) navigate('/onboard/language')
  }, [user, profile])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/hub` },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/30 via-surface to-secondary/20 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        <div className="text-7xl">📚✨</div>
        <h1 className="font-display text-5xl font-extrabold text-dark tracking-tight">
          {t('app_name')}
        </h1>
        <p className="font-body text-xl text-dark/70">{t('landing_hero')}</p>
        <Button size="lg" onClick={signInWithGoogle} className="w-full">
          🌐 {t('login_with_google')}
        </Button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat: add landing page with Google sign-in"
```

---

## Task 14: Onboarding Screens

**Files:**
- Create: `src/pages/OnboardLanguage.tsx`
- Create: `src/pages/OnboardAge.tsx`

- [ ] **Step 1: Create `src/pages/OnboardLanguage.tsx`**

```tsx
// src/pages/OnboardLanguage.tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '../stores/userStore'
import { useProfile } from '../hooks/useProfile'
import { Card } from '../components/ui/Card'

export default function OnboardLanguage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { upsertProfile } = useProfile()

  async function pick(lang: 'ar' | 'en') {
    if (!user) return
    await upsertProfile({ id: user.id, learn_lang: lang })
    navigate('/onboard/age')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-primary/20 to-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8 w-full max-w-xs"
      >
        <div className="text-5xl">🌐</div>
        <h2 className="font-display text-2xl font-bold text-dark text-center">
          {t('onboard_lang_title')}
        </h2>

        <div className="flex flex-col gap-4 w-full">
          {([
            { lang: 'ar', label: t('onboard_lang_ar'), flag: '🇸🇦' },
            { lang: 'en', label: t('onboard_lang_en'), flag: '🇬🇧' },
          ] as const).map(({ lang, label, flag }) => (
            <Card
              key={lang}
              className="cursor-pointer hover:shadow-lg active:scale-95 transition-transform text-center py-6"
              onClick={() => pick(lang)}
            >
              <div className="text-4xl mb-2">{flag}</div>
              <p className="font-display text-xl font-bold text-dark">{label}</p>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/pages/OnboardAge.tsx`**

```tsx
// src/pages/OnboardAge.tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useUserStore, AgeGroup } from '../stores/userStore'
import { useProfile } from '../hooks/useProfile'
import { Card } from '../components/ui/Card'
import { Mascot } from '../components/Mascot'

const AGE_OPTIONS: { group: AgeGroup; labelKey: string }[] = [
  { group: '3-5',  labelKey: 'onboard_age_3' },
  { group: '6-8',  labelKey: 'onboard_age_6' },
  { group: '9-12', labelKey: 'onboard_age_9' },
]

export default function OnboardAge() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { upsertProfile } = useProfile()

  async function pick(ageGroup: AgeGroup) {
    if (!user) return
    await upsertProfile({ id: user.id, age_group: ageGroup, display_name: user.email?.split('@')[0] ?? 'friend' })
    navigate('/hub')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-secondary/10 to-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8 w-full max-w-xs"
      >
        <h2 className="font-display text-2xl font-bold text-dark text-center">
          {t('onboard_age_title')}
        </h2>

        <div className="flex flex-col gap-4 w-full">
          {AGE_OPTIONS.map(({ group, labelKey }) => (
            <Card
              key={group}
              className="cursor-pointer hover:shadow-lg active:scale-95 transition-transform"
              onClick={() => pick(group)}
            >
              <div className="flex items-center gap-4 px-2">
                <Mascot ageGroup={group} size="sm" />
                <p className="font-display text-xl font-bold text-dark">{t(labelKey)}</p>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/OnboardLanguage.tsx src/pages/OnboardAge.tsx
git commit -m "feat: add language and age onboarding screens"
```

---

## Task 15: Games Hub

**Files:**
- Create: `src/components/GameCard.tsx`
- Create: `src/pages/Hub.tsx`

- [ ] **Step 1: Create `src/components/GameCard.tsx`**

```tsx
// src/components/GameCard.tsx
import { motion } from 'framer-motion'
import { GameConfig } from '../games/types'
import { LearnLang } from '../stores/userStore'

interface GameCardProps {
  config: GameConfig
  uiLang: LearnLang
  starsEarned?: number   // max stars earned on this game (0 = not played)
  onPlay: () => void
}

export function GameCard({ config, uiLang, starsEarned = 0, onPlay }: GameCardProps) {
  const isAr = uiLang === 'ar'
  const name = isAr ? config.nameAr : config.nameEn
  const desc = isAr ? config.descriptionAr : config.descriptionEn

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onPlay}
      className="bg-surface rounded-2xl shadow-md p-4 cursor-pointer relative overflow-hidden border border-primary/20"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl">{config.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-dark text-base truncate">{name}</h3>
          <p className="font-body text-xs text-dark/60 mt-0.5 line-clamp-2">{desc}</p>
        </div>
      </div>

      {/* Stars earned */}
      <div className="flex gap-0.5 mt-3 text-lg">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= starsEarned ? 'opacity-100' : 'opacity-20'}>⭐</span>
        ))}
      </div>

      {/* Premium lock */}
      {config.isPremium && (
        <div className="absolute top-2 end-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
          🔒
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/pages/Hub.tsx`**

```tsx
// src/pages/Hub.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useUserStore } from '../stores/userStore'
import { getGamesForProfile } from '../games/registry'
import { GameCard } from '../components/GameCard'
import { Mascot } from '../components/Mascot'
import { useProgress, ProgressRow } from '../hooks/useProgress'

export default function Hub() {
  const { t } = useTranslation()
  const { profile } = useUserStore()
  const navigate = useNavigate()
  const { loadAllProgress } = useProgress()
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  const ageGroup = profile!.age_group!
  const learnLang = profile!.learn_lang!
  const uiLang = profile!.ui_lang ?? 'ar'
  const games = getGamesForProfile(ageGroup, learnLang)
  const isRtl = uiLang === 'ar'

  useEffect(() => {
    loadAllProgress().then((rows: ProgressRow[]) => {
      const map: Record<string, number> = {}
      rows.forEach((r) => {
        if (!map[r.game_id] || r.stars > map[r.game_id]) {
          map[r.game_id] = r.stars
        }
      })
      setProgressMap(map)
    })
  }, [])

  const greetingKey = ageGroup === '3-5' ? 'hub_greeting_3' : ageGroup === '6-8' ? 'hub_greeting_6' : 'hub_greeting_9'
  const name = profile!.display_name ?? '👋'

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-surface pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/70 backdrop-blur-sm shadow-sm">
        <h1 className="font-display font-extrabold text-xl text-dark">{t('app_name')}</h1>
        <button onClick={() => navigate('/settings')} className="text-xl">⚙️</button>
      </div>

      {/* Mascot greeting */}
      <div className="flex flex-col items-center gap-2 py-8 px-4">
        <Mascot ageGroup={ageGroup} mood="idle" size="lg" rtl={isRtl} />
        <p className="font-display text-lg font-semibold text-dark text-center mt-2">
          {t(greetingKey, { name })}
        </p>
      </div>

      {/* Game grid */}
      <div className="px-4 grid grid-cols-1 gap-3 max-w-md mx-auto">
        {games.map((gm) => (
          <motion.div
            key={gm.config.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GameCard
              config={gm.config}
              uiLang={uiLang}
              starsEarned={progressMap[gm.config.id] ?? 0}
              onPlay={() => navigate(`/game/${gm.config.id}`)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GameCard.tsx src/pages/Hub.tsx
git commit -m "feat: add games hub with mascot and game cards"
```

---

## Task 16: Game Page

**Files:**
- Create: `src/pages/GamePage.tsx`

- [ ] **Step 1: Create `src/pages/GamePage.tsx`**

```tsx
// src/pages/GamePage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import { getGameById } from '../games/registry'
import { GameShell } from '../games/GameShell'

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { profile } = useUserStore()

  const gameModule = getGameById(gameId ?? '')
  const learnLang = profile?.learn_lang ?? 'ar'

  if (!gameModule) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Game not found</p>
    </div>
  )

  return (
    <GameShell
      gameModule={gameModule}
      level={0}
      learnLang={learnLang}
      onExit={() => navigate('/hub')}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/GamePage.tsx
git commit -m "feat: add game page route"
```

---

## Task 17: Update Registry with Both Letter Tap Configs

**Files:**
- Modify: `src/games/registry.ts`
- Modify: `src/games/letter-tap/LetterTap.tsx`

- [ ] **Step 1: Export EN config from LetterTap.tsx**

Add to the bottom of `src/games/letter-tap/LetterTap.tsx`:

```tsx
// Additional export at bottom of LetterTap.tsx
export { letterTapEnConfig }

export function LetterTapEn(props: LetterTapProps) {
  return <LetterTapGame {...props} />
}
```

- [ ] **Step 2: Update `src/games/registry.ts`**

```ts
// src/games/registry.ts
import { letterTapArConfig, letterTapEnConfig, LetterTap, LetterTapEn } from './letter-tap/LetterTap'
import { GameModule } from './types'
import { AgeGroup, LearnLang } from '../stores/userStore'

const ALL_MODULES: GameModule[] = [
  { config: letterTapArConfig, Component: LetterTap },
  { config: letterTapEnConfig, Component: LetterTapEn },
]

export function getGamesForProfile(ageGroup: AgeGroup, learnLang: LearnLang): GameModule[] {
  return ALL_MODULES.filter(
    (m) => m.config.learnLang === learnLang && m.config.ageGroups.includes(ageGroup)
  )
}

export function getGameById(id: string): GameModule | undefined {
  return ALL_MODULES.find((m) => m.config.id === id)
}
```

- [ ] **Step 3: Verify app compiles with no TypeScript errors**

```bash
npm run build
```

Expected: Build succeeds. Zero TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/games/
git commit -m "feat: register both AR and EN letter tap games"
```

---

## Task 18: Docker + Railway Config

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Create `Dockerfile`**

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: Create `nginx.conf`**

```nginx
# nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  gzip on;
  gzip_types text/css application/javascript application/json;
}
```

- [ ] **Step 3: Create `.dockerignore`**

```
node_modules
dist
.env*
.git
```

- [ ] **Step 4: Test Docker build locally**

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_ANON_KEY=your_key \
  -t kalima:dev .

docker run -p 8080:80 kalima:dev
```

Open http://localhost:8080 — should show the landing page.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile nginx.conf .dockerignore
git commit -m "feat: add Docker + nginx config for Railway deployment"
```

---

## Task 19: End-to-End Smoke Test

- [ ] **Step 1: Start dev server and run through full user flow**

```bash
npm run dev
```

Walk through each step and verify:

1. Landing page loads at http://localhost:5173
2. Click "Sign in with Google" — redirects to Google, returns logged in
3. Language select screen appears — click Arabic or English
4. Age group select screen appears — click an age group
5. Hub loads with mascot and at least one game card
6. Click the Letter Tap game card
7. Game screen loads — see a letter and 4 choices
8. Tap the correct letter — star burst plays, correct answer highlighted
9. Tap wrong letter — wobble animation plays
10. After correct answer — completion screen shows stars
11. Click "Back" — returns to hub
12. Stars appear on the game card in hub

- [ ] **Step 2: Verify progress saved in Supabase**

In Supabase dashboard → Table Editor → `game_progress`:
Confirm a row was inserted with the correct `user_id`, `game_id`, `stars`, `completed`.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Plan 1 complete — Kalima foundation + Letter Tap game end-to-end"
```

---

## Summary

After Plan 1 is complete you will have:
- ✅ Working React SPA with Google auth
- ✅ Supabase schema with RLS
- ✅ Onboarding: language + age selection
- ✅ Games hub with mascot companion
- ✅ Letter Tap game (Arabic + English) fully playable
- ✅ Progress saved to Supabase after each session
- ✅ Docker build + nginx ready for Railway

**Next plans:**
- Plan 2: Word Builder + Bubble Pop + Dot Placement games
- Plan 3: Word Match Race + Spelling Sprint
- Plan 4: Gamification (XP, streaks, trophies, level-up ceremony)
- Plan 5: Freemium gating + Moyasar subscription
- Plan 6: Railway deployment + kalima.fun domain migration
