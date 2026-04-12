# Kalima Web — Tech Stack & Libraries

## Core Framework
- **Next.js 14** (TypeScript) — React framework, static + serverless on Vercel
- **Tailwind CSS** — utility-first styling
- **Firebase** — auth, Firestore, FCM, analytics (project: kalima-85c92)

## Animation & Interaction
Every pixel matters. These make the difference between "meh" and "wow":

### Tile / Card Animations (Wordle grid, Connections cards)
- **Framer Motion** or CSS keyframes — tile flips, color reveals, shake on wrong guess
- CSS `transform` + `transition` for 3D tile reveal effects

### Celebration / Win Effects
- CSS confetti or lightweight JS confetti library — burst on puzzle solve, color-matched to Kalima brand (#6B35C8)
- Custom particle effects for streaks

### Micro-interactions
- CSS transitions for hover states, focus rings, button presses
- `GestureEvent` / touch handlers for swipe-to-reveal, long-press hints

### Page Transitions
- Next.js layout transitions with CSS animations
- Shared element transitions between game select and game play

### Shimmer & Loading
- CSS shimmer / skeleton loading for puzzle fetch

## State Management
- **React Context** + **useState/useReducer** — lightweight, built-in
- Server components where applicable (Next.js App Router)

## Navigation
- **Next.js App Router** — file-based routing, deep links, SEO-friendly URLs

## RTL / Arabic
- `dir="rtl"` at document level
- Tailwind RTL utilities (`rtl:` variant)
- IBM Plex Arabic via Google Fonts

## Data & Auth
- **Firebase Auth** — Google login
- **Cloud Firestore** — puzzles, stats, user data
- **localStorage** — local cache, offline play
- **Firebase Cloud Messaging** — push notifications (daily puzzle reminders via service worker)

## Payments
- **Moyasar** SDK / checkout for Kalima Pro (mada, STC Pay)

## Analytics
- **Google Analytics** (via Firebase) — events, funnels
- **Plausible** — privacy-friendly web analytics

## PWA
- Service worker for offline support and push notifications
- Web app manifest for installability (Add to Home Screen)
- Designed as a Progressive Web App — no native app needed

## Testing
- **Jest** / **Vitest** — unit tests
- **React Testing Library** — component tests
- **Playwright** or **Cypress** — end-to-end game flow tests

## Design Tokens
- **Background:** #141218 (dark) / #FAF9F7 (light)
- **Primary:** #6B35C8 (Kalima Purple)
- **Correct (green):** #3DAA7A (Minted)
- **Present (yellow):** #D4A017 (Saffron)
- **Absent (gray):** #6B6475 (Slate)
- **Accent:** #E8604C (Coral)
- **Font:** IBM Plex Arabic (Arabic), Inter (English)
- **Corner radius:** 8px tiles, 12px cards, 16px modals
