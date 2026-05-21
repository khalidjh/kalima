# Kalima Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Kalima codebase scaffolding — a deployed React SPA with design system, routing, i18n + RTL, Supabase client, sound layer, and Railway deployment — so subsequent phases can build features on top.

**Architecture:** A Vite + React 18 + TypeScript SPA. Tailwind handles styling via the Storybook Magic design tokens. React Router v6 owns navigation. i18next manages UI strings and switches `dir="rtl"` based on `learn_lang`. Zustand holds global state (user profile, sound prefs). Supabase JS client lives in `lib/`; auth UI is Phase 2. Howler.js wraps audio behind a `useSound` hook. Vitest + React Testing Library cover everything testable. Production builds are served from a tiny Node static server inside a Docker image deployed to Railway.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, React Router v6, i18next + react-i18next, Zustand, @supabase/supabase-js, Howler.js, Framer Motion (installed but not yet used), Vitest, @testing-library/react, Docker, Railway.

**Working directory:** `/home/khalid/workspace/kids-learning` (currently contains only `docs/` and a git history with the design spec). Work directly on `master`.

**Reference spec:** `docs/superpowers/specs/2026-05-21-kalima-design.md`

---

## File Structure

End-of-phase tree (only the paths this plan creates):

```
kids-learning/
├── Dockerfile
├── .dockerignore
├── railway.toml
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── .env.example
├── index.html
├── server.mjs                       # production static server
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                     # app entry, providers
    ├── App.tsx                      # router shell
    ├── index.css                    # tailwind directives + font imports
    ├── vite-env.d.ts
    ├── env.ts                       # validates VITE_* env vars
    ├── i18n/
    │   ├── index.ts                 # i18next config
    │   ├── locales/ar.json
    │   └── locales/en.json
    ├── lib/
    │   ├── supabase.ts              # supabase client singleton
    │   └── sound.ts                 # howler wrapper
    ├── hooks/
    │   ├── useDirection.ts          # syncs <html dir> with learn_lang
    │   └── useSound.ts              # exposes play(eventKey)
    ├── stores/
    │   ├── userStore.ts             # Zustand: profile, learn_lang, ui_lang
    │   └── soundStore.ts            # Zustand: muted toggle
    ├── components/
    │   ├── Button.tsx
    │   └── Card.tsx
    ├── pages/
    │   ├── Landing.tsx              # stub
    │   ├── Onboarding.tsx           # stub
    │   ├── Hub.tsx                  # stub
    │   ├── Game.tsx                 # stub
    │   ├── Trophies.tsx             # stub
    │   └── Settings.tsx             # stub
    └── test/
        └── setup.ts                 # RTL + jest-dom + i18n test init
```

Subsequent phases will add `games/`, real page bodies, `components/Mascot.tsx`, etc.

---

## Task 1: Initialize Vite + React + TypeScript scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `public/favicon.svg`, `.gitignore`

- [ ] **Step 1: Run `npm create vite@latest` in the workspace**

```bash
cd /home/khalid/workspace/kids-learning
npm create vite@latest . -- --template react-ts
# When prompted "Directory not empty", choose "Ignore files and continue"
```

Expected: Vite generates `package.json`, `tsconfig*.json`, `vite.config.ts`, `index.html`, `src/`, `public/`, `.gitignore`. `docs/` is preserved.

- [ ] **Step 2: Install scaffold dependencies**

```bash
cd /home/khalid/workspace/kids-learning
npm install
```

Expected: `node_modules/` populated, `package-lock.json` created.

- [ ] **Step 3: Replace `src/App.tsx` with a minimal shell**

```tsx
// src/App.tsx
export default function App() {
  return (
    <main>
      <h1>Kalima</h1>
    </main>
  );
}
```

- [ ] **Step 4: Replace `src/index.css` with an empty stub (Tailwind comes in Task 3)**

```css
/* src/index.css */
/* Tailwind directives added in Task 3 */
```

- [ ] **Step 5: Replace `src/main.tsx`**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Update `index.html` `<title>` and remove Vite branding**

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Kalima</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Replace `public/favicon.svg` with a placeholder yellow star**

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD60A">
  <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.18 22 12 17.27 5.82 22l2.37-8.14L2 9.36h7.61z"/>
</svg>
```

- [ ] **Step 8: Run dev server, confirm it boots**

```bash
cd /home/khalid/workspace/kids-learning
npm run dev -- --port 5173
```

Expected: `Local: http://localhost:5173` printed. Open it (or curl `http://localhost:5173`) and confirm the HTML shell loads. Stop the dev server (Ctrl+C).

- [ ] **Step 9: Verify the production build**

```bash
npm run build
```

Expected: `dist/` directory created with `index.html` + bundled `assets/`. No build errors.

- [ ] **Step 10: Commit**

```bash
cd /home/khalid/workspace/kids-learning
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html src/ public/ .gitignore
git commit -m "feat(phase-1): scaffold Vite + React + TypeScript

Initialize Kalima frontend with the standard Vite react-ts template.
This is the empty shell that subsequent tasks build on."
```

---

## Task 2: Add Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/App.test.tsx`
- Modify: `package.json` (add scripts), `tsconfig.json` (add `vitest/globals` types)

- [ ] **Step 1: Install test dependencies**

```bash
cd /home/khalid/workspace/kids-learning
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Add `vitest/globals` to `tsconfig.json` types**

Locate the `compilerOptions` block in `tsconfig.json` and add (or extend) the `types` field:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

- [ ] **Step 5: Add `test` and `test:watch` scripts to `package.json`**

In `package.json`, in the `"scripts"` object, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 6: Write a failing smoke test against `App`**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Kalima heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /kalima/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the test, confirm it passes**

```bash
cd /home/khalid/workspace/kids-learning
npm test
```

Expected: 1 passing test, no failures.

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts src/test/ src/App.test.tsx tsconfig.json package.json package-lock.json
git commit -m "feat(phase-1): add Vitest + React Testing Library

Smoke test confirms the test runner works."
```

---

## Task 3: Add Tailwind with design tokens + fonts

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`
- Modify: `src/index.css`, `index.html`

- [ ] **Step 1: Install Tailwind and PostCSS**

```bash
cd /home/khalid/workspace/kids-learning
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

Expected: `tailwind.config.js` and `postcss.config.js` created. (We'll rename the Tailwind config to `.ts` next.)

- [ ] **Step 2: Replace `tailwind.config.js` with `tailwind.config.ts` using the Storybook Magic palette**

Delete `tailwind.config.js`. Create `tailwind.config.ts`:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFD60A',
        secondary: '#4361EE',
        accent: '#F72585',
        success: '#06D6A0',
        warning: '#FB8500',
        surface: '#FFFBF0',
        ink: '#1A1A2E',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', '"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
        arabic: ['"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 14px -2px rgba(26, 26, 46, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Replace `src/index.css` with Tailwind directives + font imports**

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Baloo+Bhaijaan+2:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { font-family: theme('fontFamily.body'); color: theme('colors.ink'); background: theme('colors.surface'); }
  html[lang='ar'] { font-family: theme('fontFamily.arabic'); }
  h1, h2, h3, h4 { font-family: theme('fontFamily.display'); }
}
```

- [ ] **Step 4: Write a failing test that a Tailwind utility class is applied**

```tsx
// src/App.test.tsx — replace existing test with:
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Kalima heading with display font class', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /kalima/i });
    expect(heading).toHaveClass('font-display');
  });
});
```

- [ ] **Step 5: Run test, confirm it fails**

```bash
npm test
```

Expected: FAIL — heading has no `font-display` class.

- [ ] **Step 6: Update `src/App.tsx` to apply the class**

```tsx
// src/App.tsx
export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <h1 className="font-display text-4xl text-ink">Kalima</h1>
    </main>
  );
}
```

- [ ] **Step 7: Run test, confirm it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 8: Sanity-check the dev server renders styled output**

```bash
npm run dev -- --port 5173
```

Open `http://localhost:5173` — heading should be rendered with Baloo 2 font on warm parchment background. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add tailwind.config.ts postcss.config.js src/index.css src/App.tsx src/App.test.tsx package.json package-lock.json
git rm tailwind.config.js 2>/dev/null || true
git commit -m "feat(phase-1): add Tailwind with Storybook Magic palette + fonts

Design tokens (primary/secondary/accent/success/warning/surface/ink),
Baloo 2 + Nunito + Baloo Bhaijaan 2 fonts loaded from Google Fonts."
```

---

## Task 4: Add ESLint + Prettier

**Files:**
- Create: `.eslintrc.cjs`, `.prettierrc`

- [ ] **Step 1: Install linters**

```bash
cd /home/khalid/workspace/kids-learning
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier
```

- [ ] **Step 2: Create `.eslintrc.cjs`**

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist', 'node_modules'],
};
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

- [ ] **Step 4: Add `lint` and `format` scripts to `package.json`**

In `package.json` `"scripts"`:

```json
"lint": "eslint src --ext .ts,.tsx",
"format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
```

- [ ] **Step 5: Run lint and format, fix any issues**

```bash
cd /home/khalid/workspace/kids-learning
npm run format
npm run lint
```

Expected: Both succeed with no errors.

- [ ] **Step 6: Commit**

```bash
git add .eslintrc.cjs .prettierrc package.json package-lock.json src/
git commit -m "chore(phase-1): add ESLint + Prettier configs"
```

---

## Task 5: Add React Router with stub routes

**Files:**
- Create: `src/pages/Landing.tsx`, `src/pages/Onboarding.tsx`, `src/pages/Hub.tsx`, `src/pages/Game.tsx`, `src/pages/Trophies.tsx`, `src/pages/Settings.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Install React Router**

```bash
cd /home/khalid/workspace/kids-learning
npm install react-router-dom@^6
```

- [ ] **Step 2: Create page stubs (one file each)**

```tsx
// src/pages/Landing.tsx
export default function Landing() {
  return <section data-testid="landing-page"><h1 className="font-display text-4xl">Kalima</h1></section>;
}
```

```tsx
// src/pages/Onboarding.tsx
export default function Onboarding() {
  return <section data-testid="onboarding-page"><h2 className="font-display text-2xl">Onboarding</h2></section>;
}
```

```tsx
// src/pages/Hub.tsx
export default function Hub() {
  return <section data-testid="hub-page"><h2 className="font-display text-2xl">Games Hub</h2></section>;
}
```

```tsx
// src/pages/Game.tsx
import { useParams } from 'react-router-dom';
export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  return <section data-testid="game-page"><h2 className="font-display text-2xl">Game: {gameId}</h2></section>;
}
```

```tsx
// src/pages/Trophies.tsx
export default function Trophies() {
  return <section data-testid="trophies-page"><h2 className="font-display text-2xl">Trophy Room</h2></section>;
}
```

```tsx
// src/pages/Settings.tsx
export default function Settings() {
  return <section data-testid="settings-page"><h2 className="font-display text-2xl">Settings</h2></section>;
}
```

- [ ] **Step 3: Rewrite `src/App.tsx` as a router shell**

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import Game from './pages/Game';
import Trophies from './pages/Trophies';
import Settings from './pages/Settings';

export default function App() {
  return (
    <main className="min-h-screen bg-surface">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/trophies" element={<Trophies />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </main>
  );
}
```

- [ ] **Step 4: Wrap the app in `BrowserRouter` in `src/main.tsx`**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 5: Write failing routing tests**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App routing', () => {
  it.each([
    ['/', 'landing-page'],
    ['/onboarding', 'onboarding-page'],
    ['/hub', 'hub-page'],
    ['/trophies', 'trophies-page'],
    ['/settings', 'settings-page'],
  ])('renders %s -> %s', (path, testId) => {
    renderAt(path);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders game page with gameId param', () => {
    renderAt('/game/letter-tap-ar');
    expect(screen.getByTestId('game-page')).toHaveTextContent('letter-tap-ar');
  });
});
```

- [ ] **Step 6: Run tests, confirm all pass**

```bash
npm test
```

Expected: 6 passing tests.

- [ ] **Step 7: Commit**

```bash
git add src/pages/ src/App.tsx src/main.tsx src/App.test.tsx package.json package-lock.json
git commit -m "feat(phase-1): add React Router with stub routes

Routes: / /onboarding /hub /game/:gameId /trophies /settings.
All routes are stubs — bodies arrive in later phases."
```

---

## Task 6: Add i18n (i18next) with AR/EN strings and `dir` switching

**Files:**
- Create: `src/i18n/index.ts`, `src/i18n/locales/ar.json`, `src/i18n/locales/en.json`, `src/hooks/useDirection.ts`, `src/hooks/useDirection.test.tsx`
- Modify: `src/main.tsx`, `src/pages/Landing.tsx`

- [ ] **Step 1: Install i18next**

```bash
cd /home/khalid/workspace/kids-learning
npm install i18next react-i18next i18next-browser-languagedetector
```

- [ ] **Step 2: Create locale files**

```json
// src/i18n/locales/en.json
{
  "landing": {
    "tagline": "Learn letters, words, and wonder.",
    "cta_start": "Start Learning"
  },
  "common": {
    "loading": "Loading…"
  }
}
```

```json
// src/i18n/locales/ar.json
{
  "landing": {
    "tagline": "تعلّم الحروف والكلمات والدهشة.",
    "cta_start": "ابدأ التعلّم"
  },
  "common": {
    "loading": "جارٍ التحميل…"
  }
}
```

- [ ] **Step 3: Create i18n config**

```ts
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ar from './locales/ar.json';

export const SUPPORTED_LANGS = ['ar', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    supportedLngs: SUPPORTED_LANGS,
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

- [ ] **Step 4: Import i18n once at app entry**

Modify `src/main.tsx`, adding the import before `App`:

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 5: Write a failing test for the `useDirection` hook**

```tsx
// src/hooks/useDirection.test.tsx
import { renderHook, act } from '@testing-library/react';
import i18n from '../i18n';
import { useDirection } from './useDirection';

describe('useDirection', () => {
  afterEach(async () => {
    await i18n.changeLanguage('ar');
  });

  it('sets html dir="rtl" and lang when language is ar', async () => {
    await act(async () => {
      await i18n.changeLanguage('ar');
    });
    renderHook(() => useDirection());
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('sets html dir="ltr" and lang when language is en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    renderHook(() => useDirection());
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });
});
```

- [ ] **Step 6: Run the test, confirm it fails (hook does not exist)**

```bash
npm test -- useDirection
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement `useDirection`**

```ts
// src/hooks/useDirection.ts
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);
}
```

- [ ] **Step 8: Run the test, confirm it passes**

```bash
npm test -- useDirection
```

Expected: PASS (2 tests).

- [ ] **Step 9: Use the hook in `App` and render translated strings on Landing**

Modify `src/App.tsx`:

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useDirection } from './hooks/useDirection';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import Game from './pages/Game';
import Trophies from './pages/Trophies';
import Settings from './pages/Settings';

export default function App() {
  useDirection();
  return (
    <main className="min-h-screen bg-surface">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/trophies" element={<Trophies />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </main>
  );
}
```

Modify `src/pages/Landing.tsx`:

```tsx
// src/pages/Landing.tsx
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <section data-testid="landing-page" className="px-6 py-12">
      <h1 className="font-display text-5xl text-ink">Kalima</h1>
      <p className="mt-4 text-lg">{t('landing.tagline')}</p>
    </section>
  );
}
```

- [ ] **Step 10: Run the full test suite, confirm everything passes**

```bash
npm test
```

Expected: All tests green.

- [ ] **Step 11: Commit**

```bash
git add src/i18n/ src/hooks/ src/main.tsx src/App.tsx src/pages/Landing.tsx package.json package-lock.json
git commit -m "feat(phase-1): add i18n with AR/EN locales + dir switching

useDirection() hook keeps <html dir> in sync with i18next language.
Defaults to Arabic (RTL). Strings live in src/i18n/locales/."
```

---

## Task 7: Add Zustand stores (user + sound skeletons)

**Files:**
- Create: `src/stores/userStore.ts`, `src/stores/userStore.test.ts`, `src/stores/soundStore.ts`, `src/stores/soundStore.test.ts`

- [ ] **Step 1: Install Zustand**

```bash
cd /home/khalid/workspace/kids-learning
npm install zustand
```

- [ ] **Step 2: Write failing test for `userStore`**

```ts
// src/stores/userStore.test.ts
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      profile: null,
      learnLang: null,
      uiLang: 'ar',
      ageGroup: null,
      isPremium: false,
    });
  });

  it('has correct defaults', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.learnLang).toBeNull();
    expect(state.uiLang).toBe('ar');
    expect(state.ageGroup).toBeNull();
    expect(state.isPremium).toBe(false);
  });

  it('updates learnLang via setLearnLang', () => {
    useUserStore.getState().setLearnLang('en');
    expect(useUserStore.getState().learnLang).toBe('en');
  });

  it('updates ageGroup via setAgeGroup', () => {
    useUserStore.getState().setAgeGroup('6-8');
    expect(useUserStore.getState().ageGroup).toBe('6-8');
  });

  it('resets via reset()', () => {
    useUserStore.getState().setLearnLang('en');
    useUserStore.getState().setAgeGroup('9-12');
    useUserStore.getState().reset();
    expect(useUserStore.getState().learnLang).toBeNull();
    expect(useUserStore.getState().ageGroup).toBeNull();
  });
});
```

- [ ] **Step 3: Run test, confirm it fails**

```bash
npm test -- userStore
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `userStore`**

```ts
// src/stores/userStore.ts
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
  setProfile: (p: Profile | null) => void;
  setLearnLang: (l: Lang) => void;
  setUiLang: (l: Lang) => void;
  setAgeGroup: (a: AgeGroup) => void;
  setPremium: (v: boolean) => void;
  reset: () => void;
}

const defaults = {
  profile: null,
  learnLang: null,
  uiLang: 'ar' as Lang,
  ageGroup: null,
  isPremium: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...defaults,
      setProfile: (profile) => set({ profile }),
      setLearnLang: (learnLang) => set({ learnLang }),
      setUiLang: (uiLang) => set({ uiLang }),
      setAgeGroup: (ageGroup) => set({ ageGroup }),
      setPremium: (isPremium) => set({ isPremium }),
      reset: () => set(defaults),
    }),
    { name: 'kalima.user' },
  ),
);
```

- [ ] **Step 5: Run tests, confirm they pass**

```bash
npm test -- userStore
```

Expected: PASS (4 tests).

- [ ] **Step 6: Write failing test for `soundStore`**

```ts
// src/stores/soundStore.test.ts
import { useSoundStore } from './soundStore';

describe('soundStore', () => {
  beforeEach(() => {
    useSoundStore.setState({ muted: false });
  });

  it('defaults to unmuted', () => {
    expect(useSoundStore.getState().muted).toBe(false);
  });

  it('toggles via toggle()', () => {
    useSoundStore.getState().toggle();
    expect(useSoundStore.getState().muted).toBe(true);
    useSoundStore.getState().toggle();
    expect(useSoundStore.getState().muted).toBe(false);
  });

  it('sets muted via setMuted()', () => {
    useSoundStore.getState().setMuted(true);
    expect(useSoundStore.getState().muted).toBe(true);
  });
});
```

- [ ] **Step 7: Run test, confirm it fails**

```bash
npm test -- soundStore
```

Expected: FAIL — module not found.

- [ ] **Step 8: Implement `soundStore`**

```ts
// src/stores/soundStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  muted: boolean;
  toggle: () => void;
  setMuted: (v: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      muted: false,
      toggle: () => set({ muted: !get().muted }),
      setMuted: (muted) => set({ muted }),
    }),
    { name: 'kalima.sound' },
  ),
);
```

- [ ] **Step 9: Run tests, confirm they pass**

```bash
npm test
```

Expected: All tests green.

- [ ] **Step 10: Commit**

```bash
git add src/stores/ package.json package-lock.json
git commit -m "feat(phase-1): add Zustand userStore + soundStore

Both stores persist to localStorage. userStore holds profile, learn/ui
language, age group, premium flag. soundStore holds the mute toggle."
```

---

## Task 8: Add typed env loader and Supabase client

**Files:**
- Create: `src/env.ts`, `src/lib/supabase.ts`, `src/lib/supabase.test.ts`, `.env.example`
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: Install Supabase JS client**

```bash
cd /home/khalid/workspace/kids-learning
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create `.env.example`**

```
# .env.example
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

- [ ] **Step 3: Declare env types in `src/vite-env.d.ts`**

Replace the file's contents:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Create `src/env.ts` with runtime validation**

```ts
// src/env.ts
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: required('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('VITE_SUPABASE_ANON_KEY'),
};
```

- [ ] **Step 5: Write a failing test for the Supabase client**

```ts
// src/lib/supabase.test.ts
import { supabase } from './supabase';

describe('supabase client', () => {
  it('exposes auth and from()', () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});
```

Vitest reads `.env.test` automatically; create `.env.test` so the validator doesn't throw during tests:

```
# .env.test
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-anon-key
```

- [ ] **Step 6: Run test, confirm it fails**

```bash
npm test -- supabase
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement `src/lib/supabase.ts`**

```ts
// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';

export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
```

- [ ] **Step 8: Run tests, confirm they pass**

```bash
npm test
```

Expected: All green.

- [ ] **Step 9: Add `.env*` to `.gitignore` (keep `.env.example`)**

Verify `.gitignore` already contains:

```
.env
.env.local
.env.*.local
```

If it doesn't (or doesn't include `.env.test`), append:

```
.env
.env.local
.env.test
```

Note: `.env.example` is not ignored — it's tracked.

- [ ] **Step 10: Commit**

```bash
git add src/env.ts src/lib/supabase.ts src/lib/supabase.test.ts src/vite-env.d.ts .env.example .gitignore package.json package-lock.json
git commit -m "feat(phase-1): add typed env loader + Supabase client

env.ts validates VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at boot.
supabase.ts exports a singleton client used by auth and DB calls."
```

---

## Task 9: Add Howler sound layer with useSound hook

**Files:**
- Create: `src/lib/sound.ts`, `src/hooks/useSound.ts`, `src/hooks/useSound.test.tsx`

- [ ] **Step 1: Install Howler**

```bash
cd /home/khalid/workspace/kids-learning
npm install howler
npm install -D @types/howler
```

- [ ] **Step 2: Create the sound registry**

```ts
// src/lib/sound.ts
import { Howl } from 'howler';

export type SoundKey =
  | 'correct'
  | 'wrong'
  | 'session_complete'
  | 'button_tap'
  | 'level_up'
  | 'streak_milestone';

// Asset paths are placeholders — actual files will be added in Phase 3
// (the game engine phase). The keys defined here are the contract.
const SOURCES: Record<SoundKey, string[]> = {
  correct: ['/sounds/correct.mp3'],
  wrong: ['/sounds/wrong.mp3'],
  session_complete: ['/sounds/session_complete.mp3'],
  button_tap: ['/sounds/button_tap.mp3'],
  level_up: ['/sounds/level_up.mp3'],
  streak_milestone: ['/sounds/streak_milestone.mp3'],
};

const cache = new Map<SoundKey, Howl>();

export function getSound(key: SoundKey): Howl {
  let howl = cache.get(key);
  if (!howl) {
    howl = new Howl({ src: SOURCES[key], preload: false, volume: 0.6 });
    cache.set(key, howl);
  }
  return howl;
}

export function playSound(key: SoundKey, muted: boolean): void {
  if (muted) return;
  getSound(key).play();
}

// Test helper — clears the memoized Howl instances.
export function __resetSoundCache(): void {
  cache.clear();
}
```

- [ ] **Step 3: Write failing test for `useSound`**

```tsx
// src/hooks/useSound.test.tsx
import { renderHook } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { useSoundStore } from '../stores/soundStore';
import { __resetSoundCache } from '../lib/sound';
import { useSound } from './useSound';

const mocks = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({ play: mocks.play })),
}));

describe('useSound', () => {
  beforeEach(() => {
    mocks.play.mockClear();
    useSoundStore.setState({ muted: false });
    __resetSoundCache();
  });

  it('plays sound when unmuted', () => {
    const { result } = renderHook(() => useSound());
    result.current.play('button_tap');
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it('does not play when muted', () => {
    useSoundStore.setState({ muted: true });
    const { result } = renderHook(() => useSound());
    result.current.play('button_tap');
    expect(mocks.play).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run test, confirm it fails**

```bash
npm test -- useSound
```

Expected: FAIL — hook does not exist.

- [ ] **Step 5: Implement `useSound`**

```ts
// src/hooks/useSound.ts
import { useCallback } from 'react';
import { playSound, type SoundKey } from '../lib/sound';
import { useSoundStore } from '../stores/soundStore';

export function useSound() {
  const muted = useSoundStore((s) => s.muted);
  const play = useCallback((key: SoundKey) => playSound(key, muted), [muted]);
  return { play, muted };
}
```

- [ ] **Step 6: Run tests, confirm they pass**

```bash
npm test
```

Expected: All green.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sound.ts src/hooks/useSound.ts src/hooks/useSound.test.tsx package.json package-lock.json
git commit -m "feat(phase-1): add Howler sound layer + useSound hook

Sound keys are the public contract (correct, wrong, session_complete,
button_tap, level_up, streak_milestone). Mute state is honored from
soundStore. Audio assets are added in Phase 3."
```

---

## Task 10: Add Button + Card UI primitives

**Files:**
- Create: `src/components/Button.tsx`, `src/components/Button.test.tsx`, `src/components/Card.tsx`, `src/components/Card.test.tsx`
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Install Framer Motion** (used by Button for tap scale)

```bash
cd /home/khalid/workspace/kids-learning
npm install framer-motion
```

- [ ] **Step 2: Write failing test for `Button`**

```tsx
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tap me</Button>);
    await userEvent.click(screen.getByRole('button', { name: /tap me/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the primary variant by default', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('applies the accent variant when specified', () => {
    render(<Button variant="accent">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test, confirm it fails**

```bash
npm test -- Button
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `Button`**

```tsx
// src/components/Button.tsx
import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-ink hover:brightness-95',
  secondary: 'bg-secondary text-white hover:brightness-110',
  accent: 'bg-accent text-white hover:brightness-110',
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={[
        'inline-flex items-center justify-center',
        'min-h-[48px] px-6 rounded-full',
        'font-display text-lg font-semibold',
        'shadow-card transition-[filter,opacity]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
```

- [ ] **Step 5: Run tests, confirm they pass**

```bash
npm test -- Button
```

Expected: PASS (4 tests).

- [ ] **Step 6: Write failing test for `Card`**

```tsx
// src/components/Card.test.tsx
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children with surface styling', () => {
    render(<Card><p>Inside</p></Card>);
    const inside = screen.getByText('Inside');
    const card = inside.closest('[data-testid="card"]');
    expect(card).not.toBeNull();
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('bg-surface');
  });
});
```

- [ ] **Step 7: Run test, confirm it fails**

```bash
npm test -- Card
```

Expected: FAIL — module not found.

- [ ] **Step 8: Implement `Card`**

```tsx
// src/components/Card.tsx
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      data-testid="card"
      className={['rounded-2xl bg-surface shadow-card p-6', className].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 9: Wire the Button into the Landing page**

```tsx
// src/pages/Landing.tsx
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <section data-testid="landing-page" className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-6xl text-ink">Kalima</h1>
      <p className="text-xl text-ink/80 text-center max-w-md">{t('landing.tagline')}</p>
      <Button variant="primary">{t('landing.cta_start')}</Button>
    </section>
  );
}
```

- [ ] **Step 10: Run the full suite, confirm all green**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add src/components/ src/pages/Landing.tsx package.json package-lock.json
git commit -m "feat(phase-1): add Button + Card primitives, wire Landing CTA

Button uses Framer Motion tap-scale and variants primary/secondary/accent.
Card is the parchment surface used by hub tiles and modals."
```

---

## Task 11: Dockerize and add Railway config

**Files:**
- Create: `server.mjs`, `Dockerfile`, `.dockerignore`, `railway.toml`
- Modify: `package.json` (add `start` and `serve` deps)

- [ ] **Step 1: Install the production static server**

```bash
cd /home/khalid/workspace/kids-learning
npm install express compression
npm install -D @types/express @types/compression
```

- [ ] **Step 2: Create `server.mjs`**

```js
// server.mjs
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const distDir = path.join(__dirname, 'dist');

const app = express();
app.use(compression());

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.use(express.static(distDir, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// SPA fallback: everything else returns index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Kalima listening on :${port}`);
});
```

- [ ] **Step 3: Add `start` script to `package.json`**

In `package.json` `"scripts"`:

```json
"start": "node server.mjs"
```

- [ ] **Step 4: Create `Dockerfile`**

```dockerfile
# Dockerfile
# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite build-time env: Railway injects VITE_* vars at deploy
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server.mjs ./
EXPOSE 8080
CMD ["node", "server.mjs"]
```

- [ ] **Step 5: Create `.dockerignore`**

```
# .dockerignore
node_modules
dist
.git
.env
.env.*
!.env.example
docs
.superpowers
coverage
*.log
```

- [ ] **Step 6: Create `railway.toml`**

```toml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "node server.mjs"
healthcheckPath = "/healthz"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
```

- [ ] **Step 7: Build the Docker image locally to verify**

```bash
cd /home/khalid/workspace/kids-learning
docker build \
  --build-arg VITE_SUPABASE_URL=https://example.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=placeholder \
  -t kalima:phase-1 .
```

Expected: build completes with no errors. Final image tagged `kalima:phase-1`.

- [ ] **Step 8: Run the container and hit the healthcheck**

```bash
docker run --rm -d -p 8080:8080 --name kalima-test kalima:phase-1
sleep 2
curl -sf http://localhost:8080/healthz
curl -sf http://localhost:8080/ | head -5
docker stop kalima-test
```

Expected: `/healthz` returns `ok`. `/` returns the Kalima HTML shell.

- [ ] **Step 9: Commit**

```bash
git add server.mjs Dockerfile .dockerignore railway.toml package.json package-lock.json
git commit -m "feat(phase-1): add Dockerfile + Railway deploy config

Multi-stage build: Vite build + Node 20 Alpine runtime. Express serves
dist/ with compression, SPA fallback, and /healthz for Railway's
healthcheck. railway.toml pins the dockerfile builder."
```

- [ ] **Step 10: Push to Railway (manual / out of band)**

This step is performed by Khalid via the Railway dashboard (or `railway up` CLI):
1. Create a new Railway project named `kalima`.
2. Link the repo and select the `master` branch.
3. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (real values from the Supabase project, which Phase 2 sets up — for now placeholder values are fine since auth isn't wired yet).
4. Set the custom domain to `kalima.fun`.
5. Trigger a deploy.
6. Verify `https://kalima.fun/healthz` returns `ok` and `https://kalima.fun/` shows the Kalima landing page.

No commit for this step — it's a deploy action, not a code change.

---

## Final Verification

- [ ] **Step 1: Run the full test suite**

```bash
cd /home/khalid/workspace/kids-learning
npm test
```

Expected: All tests pass (Button × 4, Card × 1, Landing/App routing × 6, useDirection × 2, userStore × 4, soundStore × 3, useSound × 2, supabase × 1 = ~23 tests).

- [ ] **Step 2: Run the linter**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: clean build into `dist/`.

- [ ] **Step 4: Confirm deployed site is live**

```bash
curl -sf https://kalima.fun/healthz
```

Expected: `ok`.

---

## Phase 1 Exit Criteria

When all tasks are done:
- `npm run dev` boots a styled landing page with translated tagline and tappable CTA
- Language toggles between AR (RTL) and EN (LTR) and `<html dir>` updates
- All routes (`/`, `/onboarding`, `/hub`, `/game/:gameId`, `/trophies`, `/settings`) resolve to their stubs
- Supabase client instantiates without throwing when env vars are set
- `useSound()` plays a sound when unmuted, silent when muted
- Production Docker image builds and serves the SPA with a passing `/healthz`
- The app is deployed and reachable at `https://kalima.fun`

The codebase is now ready for Phase 2 (Auth & Onboarding) to add Google sign-in, profile persistence, and the language/age selection flow.
