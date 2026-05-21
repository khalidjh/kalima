# Kalima Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Kalima kids learning platform — auth, onboarding flow (language + age select), design system, games hub shell — deployed live on Railway at kalima.fun.

**Architecture:** Vite + React 18 SPA with React Router v6. Supabase handles Google OAuth and Postgres. Tailwind CSS with Storybook Magic design tokens. Framer Motion for animations. No games yet — just the shell that games will plug into.

**Tech Stack:** Vite 5, React 18, TypeScript, React Router v6, Tailwind CSS v3, Framer Motion 11, Zustand 4, @supabase/supabase-js v2, i18next, Howler.js, Railway (Docker)

**Project directory:** `/home/khalid/workspace/kids-learning`

---

## File Map

```
kids-learning/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── postcss.config.ts
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
├── public/
│   └── (static assets — fonts added via Google Fonts in index.html)
├── src/
│   ├── main.tsx               # app entry, i18n init
│   ├── App.tsx                # router setup
│   ├── index.css              # Tailwind directives + base styles
│   ├── types/
│   │   ├── profile.ts         # Profile, AgeGroup, LearnLang types
│   │   └── game.ts            # GameConfig type (used by game modules later)
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client singleton
│   │   └── i18n.ts            # i18next config + AR/EN strings
│   ├── stores/
│   │   └── user.store.ts      # Zustand: auth user + profile + loading state
│   ├── hooks/
│   │   ├── useAuth.ts         # listen to Supabase auth state changes
│   │   └── useProfile.ts      # fetch/upsert profile row
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx     # rounded-full, bounce-on-tap, variants
│   │   │   ├── Card.tsx       # parchment card with shadow
│   │   │   └── PageTransition.tsx  # Framer Motion slide+fade wrapper
│   │   └── mascots/
│   │       ├── Mascot.tsx     # idle-breathing mascot, reacts to events
│   │       └── mascots.config.ts  # emoji+name per age group
│   ├── pages/
│   │   ├── Landing.tsx        # hero + Google sign-in
│   │   ├── LanguageSelect.tsx # "I want to learn Arabic / English"
│   │   ├── AgeSelect.tsx      # pick age group 3-5 / 6-8 / 9-12
│   │   ├── Hub.tsx            # games hub shell (empty game slots)
│   │   └── Settings.tsx       # change age/lang, sign out
│   └── router.tsx             # all routes + auth guard
├── supabase/
│   └── migrations/
│       └── 001_initial.sql    # profiles + streaks tables + RLS
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-05-21-kalima-design.md
        └── plans/
            └── 2026-05-21-kalima-phase1-foundation.md
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.env.example`

- [ ] **Step 1: Initialize the project**

```bash
cd /home/khalid/workspace/kids-learning
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty", choose **Ignore files and continue**.

- [ ] **Step 2: Install all dependencies**

```bash
npm install \
  react-router-dom@6 \
  framer-motion \
  zustand \
  @supabase/supabase-js \
  i18next react-i18next \
  howler @types/howler \
  clsx tailwind-merge

npm install -D \
  tailwindcss@3 \
  @tailwindcss/forms \
  postcss \
  autoprefixer \
  @types/node
```

- [ ] **Step 3: Initialize Tailwind**

```bash
npx tailwindcss init -p --ts
```

- [ ] **Step 4: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

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
        display: ['"Baloo 2"', '"Baloo Bhaijaan 2"', 'sans-serif'],
        body:    ['"Nunito"', '"Baloo Bhaijaan 2"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        breathe: 'breathe 3s ease-in-out infinite',
        bounce2: 'bounce2 0.4s ease-in-out',
        wobble:  'wobble 0.4s ease-in-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.04)' },
        },
        bounce2: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%':      { transform: 'rotate(-6deg)' },
          '60%':      { transform: 'rotate(6deg)' },
        },
      },
    },
  },
  plugins: [forms],
} satisfies Config
```

- [ ] **Step 5: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');

@layer base {
  html {
    font-family: 'Nunito', 'Baloo Bhaijaan 2', sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  h1, h2, h3 {
    font-family: 'Baloo 2', 'Baloo Bhaijaan 2', sans-serif;
  }
}

/* RTL logical property shim for older Safaris */
[dir='rtl'] .flip-rtl {
  transform: scaleX(-1);
}
```

- [ ] **Step 6: Write `index.html`**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>كلمة — Kalima</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="description" content="Kalima — bilingual Arabic & English learning games for kids" />
  </head>
  <body class="bg-surface text-dark antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Copy to `.env.local` and fill in real values (get from Supabase dashboard).

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: server running at `http://localhost:5173`, blank page with no console errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + Tailwind project"
```

---

## Task 2: Types

**Files:**
- Create: `src/types/profile.ts`
- Create: `src/types/game.ts`

- [ ] **Step 1: Write `src/types/profile.ts`**

```ts
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
  created_at: string
}
```

- [ ] **Step 2: Write `src/types/game.ts`**

```ts
import type { AgeGroup, LearnLang } from './profile'

export interface GameConfig {
  id: string                  // e.g. 'letter-tap-ar'
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  ageGroups: AgeGroup[]
  learnLang: LearnLang
  isPremium: boolean
  levels: number
  estimatedMinutes: number
  icon: string                // emoji
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/
git commit -m "feat: add Profile and GameConfig types"
```

---

## Task 3: Supabase Setup

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Write `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '../types/profile'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url, key)

// Helper: fetch profile for current user
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

// Helper: upsert profile fields
export async function upsertProfile(
  userId: string,
  fields: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<void> {
  await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields }, { onConflict: 'id' })
}
```

- [ ] **Step 2: Write `supabase/migrations/001_initial.sql`**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  age_group    text CHECK (age_group IN ('3-5', '6-8', '9-12')),
  learn_lang   text CHECK (learn_lang IN ('ar', 'en')),
  ui_lang      text CHECK (ui_lang IN ('ar', 'en')) DEFAULT 'ar',
  is_premium   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current     int DEFAULT 0,
  longest     int DEFAULT 0,
  last_played date
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streak"
  ON public.streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 3: Run migration in Supabase**

Go to Supabase Dashboard → SQL Editor → paste the contents of `001_initial.sql` → Run.

Verify: Tables `profiles` and `streaks` appear in Table Editor with RLS enabled.

- [ ] **Step 4: Enable Google OAuth in Supabase**

Go to Supabase Dashboard → Authentication → Providers → Google → enable it.
Add your Google OAuth Client ID and Secret (create at console.cloud.google.com if needed).
Add `http://localhost:5173` and `https://kalima.fun` to the allowed redirect URLs.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts supabase/
git commit -m "feat: add Supabase client + initial DB migration"
```

---

## Task 4: i18n Setup

**Files:**
- Create: `src/lib/i18n.ts`

- [ ] **Step 1: Write `src/lib/i18n.ts`**

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const ar = {
  translation: {
    // Landing
    landing_title: 'تعلّم وانبسط مع كلمة!',
    landing_subtitle: 'العاب تعليمية للأطفال باللغتين العربية والإنجليزية',
    landing_cta: 'ابدأ الآن',
    landing_login: 'سجّل الدخول بـ Google',

    // Language select
    lang_select_title: 'ماذا تريد أن تتعلم؟',
    lang_select_arabic: 'أتعلم العربية',
    lang_select_english: 'أتعلم الإنجليزية',

    // Age select
    age_select_title: 'كم عمرك؟',
    age_3_5: '٣ – ٥ سنوات',
    age_6_8: '٦ – ٨ سنوات',
    age_9_12: '٩ – ١٢ سنة',

    // Hub
    hub_greeting_noor: 'مرحبا! أنا نور ✨ هيا نلعب!',
    hub_greeting_zaid: 'أهلاً! أنا زيد 🧙 جاهز للتحدي؟',
    hub_greeting_fox: 'مرحباً! أنا الثعلب 🦊 لنبدأ!',
    hub_locked: 'مقفل 🔒',
    hub_free_badge: 'مجاني',
    hub_premium_badge: 'مميز',
    hub_streak: 'أيام متتالية',
    hub_level: 'المستوى',

    // Settings
    settings_title: 'الإعدادات',
    settings_change_lang: 'غيّر اللغة التي تتعلمها',
    settings_change_age: 'غيّر الفئة العمرية',
    settings_signout: 'تسجيل الخروج',
    settings_subscription: 'إدارة الاشتراك',

    // General
    back: 'رجوع',
    next: 'التالي',
    play: 'العب',
    stars: 'نجوم',
  },
}

const en = {
  translation: {
    landing_title: 'Learn & Play with Kalima!',
    landing_subtitle: 'Educational games for kids in Arabic and English',
    landing_cta: 'Get Started',
    landing_login: 'Sign in with Google',

    lang_select_title: 'What do you want to learn?',
    lang_select_arabic: 'I\'m learning Arabic',
    lang_select_english: 'I\'m learning English',

    age_select_title: 'How old are you?',
    age_3_5: '3 – 5 years',
    age_6_8: '6 – 8 years',
    age_9_12: '9 – 12 years',

    hub_greeting_noor: 'Hi! I\'m Noor ✨ Let\'s play!',
    hub_greeting_zaid: 'Hey! I\'m Zaid 🧙 Ready for a challenge?',
    hub_greeting_fox: 'Hello! I\'m Fox 🦊 Let\'s go!',
    hub_locked: 'Locked 🔒',
    hub_free_badge: 'Free',
    hub_premium_badge: 'Premium',
    hub_streak: 'day streak',
    hub_level: 'Level',

    settings_title: 'Settings',
    settings_change_lang: 'Change learning language',
    settings_change_age: 'Change age group',
    settings_signout: 'Sign Out',
    settings_subscription: 'Manage Subscription',

    back: 'Back',
    next: 'Next',
    play: 'Play',
    stars: 'stars',
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources: { ar, en },
    lng: 'ar',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

export function setUiLang(lang: 'ar' | 'en') {
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}
```

- [ ] **Step 2: Initialize i18n in `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './lib/i18n'          // must be imported before App
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n.ts src/main.tsx
git commit -m "feat: add i18n with Arabic and English strings"
```

---

## Task 5: Zustand User Store

**Files:**
- Create: `src/stores/user.store.ts`

- [ ] **Step 1: Write `src/stores/user.store.ts`**

```ts
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, AgeGroup, LearnLang } from '../types/profile'

interface UserState {
  user: User | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  updateProfile: (fields: Partial<Profile>) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  updateProfile: (fields) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...fields } : null,
    })),
  reset: () => set({ user: null, profile: null, loading: false }),
}))

// Convenience selectors
export const selectIsOnboarded = (s: UserState) =>
  s.profile?.age_group != null && s.profile?.learn_lang != null

export const selectAgeGroup = (s: UserState): AgeGroup | null =>
  s.profile?.age_group ?? null

export const selectLearnLang = (s: UserState): LearnLang | null =>
  s.profile?.learn_lang ?? null

export const selectIsPremium = (s: UserState): boolean =>
  s.profile?.is_premium ?? false
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand user store"
```

---

## Task 6: Auth Hook

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useProfile.ts`

- [ ] **Step 1: Write `src/hooks/useAuth.ts`**

```ts
import { useEffect } from 'react'
import { supabase, fetchProfile } from '../lib/supabase'
import { useUserStore } from '../stores/user.store'
import { setUiLang } from '../lib/i18n'

/**
 * Sets up a Supabase auth listener.
 * Mount this ONCE at the app root (inside App.tsx).
 */
export function useAuth() {
  const { setUser, setProfile, setLoading, reset } = useUserStore()

  useEffect(() => {
    // Hydrate on first load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)
        if (profile?.ui_lang) setUiLang(profile.ui_lang)
      }
      setLoading(false)
    })

    // Listen for sign-in / sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          reset()
          return
        }
        setUser(session.user)
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)
        if (profile?.ui_lang) setUiLang(profile.ui_lang)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])
}
```

- [ ] **Step 2: Write `src/hooks/useProfile.ts`**

```ts
import { useCallback } from 'react'
import { upsertProfile } from '../lib/supabase'
import { useUserStore } from '../stores/user.store'
import type { Profile, AgeGroup, LearnLang, UiLang } from '../types/profile'
import { setUiLang } from '../lib/i18n'

export function useProfile() {
  const { user, profile, updateProfile } = useUserStore()

  const save = useCallback(
    async (fields: Partial<Omit<Profile, 'id' | 'created_at'>>) => {
      if (!user) return
      await upsertProfile(user.id, fields)
      updateProfile(fields)
      if (fields.ui_lang) setUiLang(fields.ui_lang)
    },
    [user, updateProfile]
  )

  const setAgeGroup = (age_group: AgeGroup) => save({ age_group })
  const setLearnLang = (learn_lang: LearnLang) => save({ learn_lang })
  const setUiLanguage = (ui_lang: UiLang) => save({ ui_lang })

  return { profile, save, setAgeGroup, setLearnLang, setUiLanguage }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useAuth and useProfile hooks"
```

---

## Task 7: Core UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/PageTransition.tsx`
- Create: `src/lib/cn.ts`

- [ ] **Step 1: Write `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Write `src/components/ui/Button.tsx`**

```tsx
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary text-dark font-bold shadow-lg hover:brightness-105',
  secondary: 'bg-secondary text-white font-bold shadow-lg hover:brightness-105',
  ghost:     'bg-transparent text-dark border-2 border-dark/20 hover:bg-dark/5',
}

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'rounded-full font-display transition-all duration-150 select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 3: Write `src/components/ui/Card.tsx`**

```tsx
import { cn } from '../../lib/cn'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface rounded-2xl shadow-md border border-dark/5 p-4',
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow duration-150',
        className
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/ui/PageTransition.tsx`**

```tsx
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ src/lib/cn.ts
git commit -m "feat: add Button, Card, PageTransition UI components"
```

---

## Task 8: Mascot Component

**Files:**
- Create: `src/components/mascots/mascots.config.ts`
- Create: `src/components/mascots/Mascot.tsx`

- [ ] **Step 1: Write `src/components/mascots/mascots.config.ts`**

```ts
import type { AgeGroup } from '../../types/profile'

export interface MascotConfig {
  emoji: string
  nameAr: string
  nameEn: string
  greetingKey: string   // i18n key
}

export const MASCOTS: Record<AgeGroup, MascotConfig> = {
  '3-5': {
    emoji: '🌟',
    nameAr: 'نور',
    nameEn: 'Noor',
    greetingKey: 'hub_greeting_noor',
  },
  '6-8': {
    emoji: '🧙',
    nameAr: 'زيد',
    nameEn: 'Zaid',
    greetingKey: 'hub_greeting_zaid',
  },
  '9-12': {
    emoji: '🦊',
    nameAr: 'الثعلب',
    nameEn: 'Fox',
    greetingKey: 'hub_greeting_fox',
  },
}
```

- [ ] **Step 2: Write `src/components/mascots/Mascot.tsx`**

```tsx
import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import type { AgeGroup } from '../../types/profile'
import { MASCOTS } from './mascots.config'

type MascotEvent = 'idle' | 'correct' | 'wrong' | 'levelup'

interface MascotProps {
  ageGroup: AgeGroup
  event?: MascotEvent
  size?: 'sm' | 'md' | 'lg'
  rtl?: boolean
}

const sizes = { sm: 'text-5xl', md: 'text-7xl', lg: 'text-9xl' }

export function Mascot({ ageGroup, event = 'idle', size = 'md', rtl = false }: MascotProps) {
  const controls = useAnimation()
  const config = MASCOTS[ageGroup]

  useEffect(() => {
    if (event === 'correct') {
      controls.start({
        y: [0, -20, 0],
        transition: { duration: 0.4, ease: 'easeOut' },
      })
    } else if (event === 'wrong') {
      controls.start({
        rotate: [0, -8, 8, -8, 0],
        transition: { duration: 0.4 },
      })
    } else if (event === 'levelup') {
      controls.start({
        scale: [1, 1.3, 1],
        rotate: [0, 15, -15, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      })
    }
  }, [event, controls])

  return (
    <motion.div
      animate={controls}
      className={`${sizes[size]} select-none inline-block ${rtl ? 'flip-rtl' : ''}`}
      style={{ animation: event === 'idle' ? 'breathe 3s ease-in-out infinite' : 'none' }}
      aria-label={config.nameEn}
      role="img"
    >
      {config.emoji}
    </motion.div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/mascots/
git commit -m "feat: add age-specific Mascot component with animations"
```

---

## Task 9: Router + App Shell

**Files:**
- Create: `src/router.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `src/router.tsx`**

```tsx
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useUserStore, selectIsOnboarded } from './stores/user.store'
import { Landing } from './pages/Landing'
import { LanguageSelect } from './pages/LanguageSelect'
import { AgeSelect } from './pages/AgeSelect'
import { Hub } from './pages/Hub'
import { Settings } from './pages/Settings'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserStore()
  if (loading) return <div className="flex items-center justify-center h-screen text-4xl animate-breathe">🌟</div>
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUserStore()
  const isOnboarded = selectIsOnboarded({ profile } as any)
  if (loading) return null
  if (!isOnboarded) return <Navigate to="/onboarding/language" replace />
  return <>{children}</>
}

export function AppRouter() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />

        <Route path="/onboarding/language" element={
          <RequireAuth><LanguageSelect /></RequireAuth>
        } />
        <Route path="/onboarding/age" element={
          <RequireAuth><AgeSelect /></RequireAuth>
        } />

        <Route path="/hub" element={
          <RequireAuth><RequireOnboarding><Hub /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth><Settings /></RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Write `src/App.tsx`**

```tsx
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AppRouter } from './router'

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth()   // sets up Supabase auth listener
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-surface">
          <AppRouter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/router.tsx src/App.tsx
git commit -m "feat: add router with auth guard and onboarding guard"
```

---

## Task 10: Landing Page

**Files:**
- Create: `src/pages/Landing.tsx`

- [ ] **Step 1: Write `src/pages/Landing.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useUserStore, selectIsOnboarded } from '../stores/user.store'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/ui/PageTransition'

export function Landing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useUserStore()

  // Already signed in and onboarded → go to hub
  if (user && selectIsOnboarded({ profile } as any)) {
    navigate('/hub', { replace: true })
    return null
  }

  // Already signed in but not onboarded → go to onboarding
  if (user && !selectIsOnboarded({ profile } as any)) {
    navigate('/onboarding/language', { replace: true })
    return null
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding/language` },
    })
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Castle / storybook hero illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-8xl mb-6 select-none"
        >
          📚✨
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-4xl font-bold text-dark mb-3"
        >
          {t('landing_title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-dark/60 max-w-sm mb-10"
        >
          {t('landing_subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs flex flex-col gap-3"
        >
          <Button
            size="lg"
            fullWidth
            onClick={handleGoogleLogin}
          >
            🌟 {t('landing_login')}
          </Button>
        </motion.div>

        {/* Decorative stars */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {['✨', '⭐', '🌟', '💫', '✨'].map((star, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl opacity-30"
              style={{
                top: `${15 + i * 18}%`,
                left: i % 2 === 0 ? `${8 + i * 5}%` : 'auto',
                right: i % 2 !== 0 ? `${8 + i * 4}%` : 'auto',
              }}
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              {star}
            </motion.span>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Verify it renders**

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the landing page with a Google login button, floating stars, and a book emoji hero.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat: add Landing page with Google OAuth sign-in"
```

---

## Task 11: Onboarding — Language Select

**Files:**
- Create: `src/pages/LanguageSelect.tsx`

- [ ] **Step 1: Write `src/pages/LanguageSelect.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { PageTransition } from '../components/ui/PageTransition'
import { Card } from '../components/ui/Card'
import type { LearnLang } from '../types/profile'

const options: { lang: LearnLang; emoji: string; labelKey: string }[] = [
  { lang: 'ar', emoji: '🕌', labelKey: 'lang_select_arabic' },
  { lang: 'en', emoji: '🏰', labelKey: 'lang_select_english' },
]

export function LanguageSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setLearnLang } = useProfile()

  async function handlePick(lang: LearnLang) {
    await setLearnLang(lang)
    navigate('/onboarding/age')
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-dark mb-10 text-center"
        >
          {t('lang_select_title')}
        </motion.h2>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {options.map(({ lang, emoji, labelKey }, i) => (
            <motion.div
              key={lang}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card
                onClick={() => handlePick(lang)}
                className="flex items-center gap-4 p-5 hover:border-primary hover:border-2 transition-all"
              >
                <span className="text-5xl">{emoji}</span>
                <span className="font-display text-xl font-bold text-dark">
                  {t(labelKey)}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LanguageSelect.tsx
git commit -m "feat: add LanguageSelect onboarding step"
```

---

## Task 12: Onboarding — Age Select

**Files:**
- Create: `src/pages/AgeSelect.tsx`

- [ ] **Step 1: Write `src/pages/AgeSelect.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { PageTransition } from '../components/ui/PageTransition'
import { Card } from '../components/ui/Card'
import type { AgeGroup } from '../types/profile'
import { MASCOTS } from '../components/mascots/mascots.config'

const options: { age: AgeGroup; labelKey: string }[] = [
  { age: '3-5',  labelKey: 'age_3_5' },
  { age: '6-8',  labelKey: 'age_6_8' },
  { age: '9-12', labelKey: 'age_9_12' },
]

export function AgeSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setAgeGroup } = useProfile()

  async function handlePick(age: AgeGroup) {
    await setAgeGroup(age)
    navigate('/hub')
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-dark mb-10 text-center"
        >
          {t('age_select_title')}
        </motion.h2>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {options.map(({ age, labelKey }, i) => (
            <motion.div
              key={age}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card
                onClick={() => handlePick(age)}
                className="flex items-center gap-4 p-5 hover:border-primary hover:border-2 transition-all"
              >
                <span className="text-5xl">{MASCOTS[age].emoji}</span>
                <div>
                  <div className="font-display text-xl font-bold text-dark">
                    {t(labelKey)}
                  </div>
                  <div className="text-sm text-dark/50">
                    {MASCOTS[age].nameAr} / {MASCOTS[age].nameEn}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AgeSelect.tsx
git commit -m "feat: add AgeSelect onboarding step"
```

---

## Task 13: Games Hub Shell

**Files:**
- Create: `src/pages/Hub.tsx`
- Create: `src/games/registry.ts`

- [ ] **Step 1: Write `src/games/registry.ts`**

```ts
import type { GameConfig } from '../types/game'

// Games register themselves here. Empty for now — Phase 2 adds them.
const gameRegistry: GameConfig[] = []

export function registerGame(config: GameConfig) {
  if (!gameRegistry.find(g => g.id === config.id)) {
    gameRegistry.push(config)
  }
}

export function getGamesForUser(
  ageGroup: string,
  learnLang: string
): GameConfig[] {
  return gameRegistry.filter(
    g => g.ageGroups.includes(ageGroup as any) && g.learnLang === learnLang
  )
}

export { gameRegistry }
```

- [ ] **Step 2: Write `src/pages/Hub.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useUserStore, selectAgeGroup, selectLearnLang } from '../stores/user.store'
import { getGamesForUser } from '../games/registry'
import { Mascot } from '../components/mascots/Mascot'
import { Card } from '../components/ui/Card'
import { PageTransition } from '../components/ui/PageTransition'
import { MASCOTS } from '../components/mascots/mascots.config'

export function Hub() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useUserStore()
  const ageGroup = selectAgeGroup(useUserStore.getState())
  const learnLang = selectLearnLang(useUserStore.getState())

  if (!ageGroup || !learnLang) return null

  const games = getGamesForUser(ageGroup, learnLang)
  const isRtl = i18n.language === 'ar'

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-dark/50 font-body">
              {t('hub_level')} {1}
            </div>
            <div className="font-display text-lg font-bold text-dark">
              {profile?.display_name ?? '👤'}
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="text-2xl p-2 rounded-full hover:bg-dark/5 transition-colors"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>

        {/* Mascot greeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <Mascot ageGroup={ageGroup} event="idle" size="lg" rtl={isRtl} />
          <div className="mt-3 bg-primary/20 rounded-2xl px-4 py-2 text-sm font-bold text-dark text-center max-w-xs">
            {t(MASCOTS[ageGroup].greetingKey)}
          </div>
        </motion.div>

        {/* Games grid */}
        {games.length === 0 ? (
          <div className="text-center text-dark/40 mt-12">
            <div className="text-5xl mb-4">🎮</div>
            <p className="font-display text-lg">Games coming soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card
                  onClick={() => navigate(`/games/${game.id}`)}
                  className="flex flex-col items-center p-4 text-center relative"
                >
                  <span className="text-4xl mb-2">{game.icon}</span>
                  <div className="font-display font-bold text-sm text-dark">
                    {learnLang === 'ar' ? game.nameAr : game.nameEn}
                  </div>
                  <div className="text-xs text-dark/40 mt-1">
                    {game.estimatedMinutes} min
                  </div>
                  {game.isPremium && !profile?.is_premium && (
                    <div className="absolute top-2 end-2 text-xs bg-accent text-white rounded-full px-2 py-0.5">
                      {t('hub_locked')}
                    </div>
                  )}
                  {!game.isPremium && (
                    <div className="absolute top-2 start-2 text-xs bg-success text-white rounded-full px-2 py-0.5">
                      {t('hub_free_badge')}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/games/ src/pages/Hub.tsx
git commit -m "feat: add games registry and Hub shell"
```

---

## Task 14: Settings Page

**Files:**
- Create: `src/pages/Settings.tsx`

- [ ] **Step 1: Write `src/pages/Settings.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user.store'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageTransition } from '../components/ui/PageTransition'

export function Settings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useUserStore()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl p-2 rounded-full hover:bg-dark/5 transition-colors"
          >
            ←
          </button>
          <h1 className="font-display text-2xl font-bold text-dark">
            {t('settings_title')}
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <div className="text-sm text-dark/50 mb-1">{t('lang_select_title')}</div>
            <div className="font-bold font-display text-dark">
              {profile?.learn_lang === 'ar' ? t('lang_select_arabic') : t('lang_select_english')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/onboarding/language')}
            >
              {t('settings_change_lang')}
            </Button>
          </Card>

          <Card>
            <div className="text-sm text-dark/50 mb-1">{t('age_select_title')}</div>
            <div className="font-bold font-display text-dark">
              {profile?.age_group ?? '—'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/onboarding/age')}
            >
              {t('settings_change_age')}
            </Button>
          </Card>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleSignOut}
            className="mt-4"
          >
            {t('settings_signout')}
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat: add Settings page with sign-out and profile navigation"
```

---

## Task 15: Dockerfile + Railway Deploy

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `railway.json`

- [ ] **Step 1: Write `Dockerfile`**

```dockerfile
# Build stage
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

# Runtime stage — serve with nginx
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# SPA routing: all paths → index.html
RUN printf 'server {\n  listen 8080;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: Write `.dockerignore`**

```
node_modules
dist
.env*
.git
*.md
docs
```

- [ ] **Step 3: Write `railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "nginx -g 'daemon off;'",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

- [ ] **Step 4: Create Railway project**

1. Go to railway.app → New Project → Deploy from GitHub repo
2. Select the `kids-learning` repo (push it to GitHub first if not already)
3. Add environment variables in Railway dashboard:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Set the custom domain to `kalima.fun` in Railway → Settings → Domains

- [ ] **Step 5: Push repo to GitHub**

```bash
cd /home/khalid/workspace/kids-learning
gh repo create khalidjh/kalima-v2 --private --source=. --remote=origin --push
```

Or push to the existing `khalidjh/kalima` repo after archiving the old one:
```bash
# Archive old repo first via GitHub UI, then:
git remote add origin https://github.com/khalidjh/kalima.git
git push -u origin master
```

- [ ] **Step 6: Verify build locally**

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t kalima .

docker run -p 8080:8080 kalima
```

Open `http://localhost:8080` — should see the landing page. Navigate to `/hub` — should redirect to `/` (not logged in).

- [ ] **Step 7: Final commit**

```bash
git add Dockerfile .dockerignore railway.json
git commit -m "feat: add Dockerfile and Railway deployment config"
```

---

## Phase 1 Complete ✅

At the end of this plan you will have:
- ✅ Deployed React SPA at kalima.fun
- ✅ Google OAuth sign-in via Supabase
- ✅ Onboarding: language select + age select (saved to Supabase)
- ✅ Games Hub shell with mascot, empty game grid (ready for Phase 2)
- ✅ Settings page
- ✅ Storybook Magic design system (colors, fonts, animations)
- ✅ RTL-ready layout
- ✅ Arabic + English i18n

**Next:** Phase 2 — Core Games (Letter Tap AR/EN, Word Builder AR/EN, Word Match Race AR/EN)
