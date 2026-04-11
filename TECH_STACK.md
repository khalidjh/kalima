# Kalima Flutter — Tech Stack & Libraries

## Core Framework
- **Flutter 3.x** (Dart) — iOS + Android + Web
- **Firebase** — auth, Firestore, FCM, analytics (same project: kalima-85c92)

## Animation & Interaction Libraries
Every pixel matters. These make the difference between "meh" and "wow":

### Tile / Card Animations (Wordle grid, Connections cards)
- **`flutter_animate`** — declarative animations, chainable, zero boilerplate
- Built-in `AnimatedContainer`, `AnimatedSwitcher`, `TweenAnimationBuilder` for tile flips
- Custom `Transform.flip` + `AnimatedBuilder` for Wordle-style 3D tile reveal

### Celebration / Win Effects
- **`confetti`** package — burst on puzzle solve, color-matched to Kalima brand (#CCFF00)
- **`flutter_sparkler`** or custom particle effects for streaks

### Haptic Feedback
- **`haptic_feedback`** package — consistent iOS + Android haptics
  - `lightImpact` — key press
  - `mediumImpact` — tile flip
  - `heavyImpact` — wrong answer
  - `success` pattern — puzzle solved

### Micro-interactions
- **`rive`** — stateful interactive animations (loading spinner, mascot, onboarding)
- Built-in `GestureDetector` for swipe-to-reveal, long-press hints

### Page Transitions
- **`page_transition`** or custom `PageRoute` with shared element transitions
- Hero animations between game select → game play

### Shimmer & Loading
- **`shimmer`** — skeleton loading for puzzle fetch

## State Management
- **`riverpod`** — reactive, testable, scalable
- **`flutter_hooks`** + `hooks_riverpod` — clean widget lifecycle

## Navigation
- **`go_router`** — declarative routing, deep links

## RTL / Arabic
- Flutter's built-in `TextDirection.rtl` + `Directionality` widget
- **`bidi`** package for complex bidi text if needed
- Cairo font loaded via `google_fonts` or bundled assets

## Data & Auth
- **`cloud_firestore`** — puzzles, stats, user data
- **`firebase_auth`** — Google login
- **`shared_preferences`** — local cache, offline play
- **`firebase_messaging`** — push notifications (daily puzzle reminders)

## Payments
- **`moyasar`** SDK or WebView checkout for Kalima Pro
- RevenueCat if expanding to App Store subscriptions later

## Analytics
- **`firebase_analytics`** — events, funnels
- **`plausible`** — privacy-friendly web analytics

## Testing
- **`flutter_test`** — unit + widget tests
- **`integration_test`** — full game flow tests
- **`golden_toolkit`** — pixel-perfect screenshot tests

## Design Tokens
- **Background:** #0F0F1A (dark)
- **Accent:** #CCFF00 (lime yellow)
- **Correct (green):** #538D4E
- **Present (yellow):** #B59F3B
- **Absent (gray):** #3A3A3C
- **Font:** Cairo (Arabic-optimized)
- **Corner radius:** 8px tiles, 12px cards, 16px modals
