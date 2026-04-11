# Forge Brief — Kalima Flutter Full Design Audit + Redesign

## Context
Kalima (كلمة) is an Arabic daily word games app (Wordle + Connections). Flutter + Riverpod. 
Target: Arabic speakers, mobile-first, fun satisfying game experience.

## Current Problems
- Flat, generic look — no 3D depth, no polish, no WOW factor
- Cards look like boring UI, not a fun mobile game
- Tiles lack tactile 3D feel (think candy crush / 2048 tiles)
- No satisfying micro-interactions or juice
- Colors are muted, not vibrant and exciting
- Keyboard looks flat and lifeless

## Design Direction: 3D Fun Polished Mobile Game

**Reference:** Think Candy Crush, 2048, NY Times Games — but Arabic, modern, and PREMIUM.

### Aesthetic: "Playful Luxury"
- Dark background with subtle depth (not flat black)
- 3D-style tiles with light reflection, shadows, rounded edges
- Vibrant saturated colors (teal, coral, golden, purple, lime)
- Satisfying haptics + animations on every interaction
- Particle effects on wins (confetti ✅ already have)
- Tiles that feel PHYSICAL — like you can touch them

### Must-Have Design Elements

#### 1. Home Screen
- "كلمة" title: large, bold, with subtle 3D shadow effect
- Game cards: 3D elevated look, vibrant gradient backgrounds, icon with glow
- حروف card: Teal/cyan gradient with playful icon
- روابط card: Coral/pink gradient with grid icon  
- Smooth staggered entrance animations
- Bottom nav: frosted glass effect, colored active indicator

#### 2. Game Board (حروف - Wordle)
- Tiles: 3D look with top highlight + bottom shadow (like physical tiles)
  - Empty: dark with subtle inner border, slightly concave look
  - Filled (not revealed): raised look, white/light letter, subtle shadow
  - Correct: vibrant green with 3D depth, slight bounce on reveal
  - Present: warm amber with 3D depth
  - Absent: muted dark, pressed-down look
- Flip animation should feel satisfying (already exists, enhance with scale bounce)
- Win celebration: confetti (have it) + tile bounce wave + screen flash

#### 3. Keyboard
- Keys should look like raised 3D buttons
- Slight bounce/scale on tap (already have scale 0.95, enhance to 0.9 + shadow change)
- Correct key: vibrant green raised button
- Present key: warm amber raised button
- Absent key: flat/pressed look, reduced opacity
- Enter key: accent color, wider, prominent
- Delete key: subtle, secondary

#### 4. Rawabet (Connections)
- Word chips: 3D elevated look, satisfying tap animation
- Selected: lift up + scale + color change
- Correct group: celebrate with color fill animation
- 4 groups = 4 vibrant colors (teal, coral, purple, golden)

#### 5. General Polish
- All transitions: smooth 300ms curves
- Haptic feedback on every tap (already have some)
- Loading states: skeleton shimmer, not spinners
- Error states: gentle shake (already have for invalid words)
- Typography: Cairo font, w900 for game elements, w700 for UI

### Color Palette (3D Polished)
```dart
// Background
static const Color background = Color(0xFF0A0A1A);     // deep dark navy
static const Color surface = Color(0xFF1C1C3A);        // elevated surface

// Game tile states
static const Color correct = Color(0xFF2DD4A8);        // vibrant teal-green
static const Color present = Color(0xFFFBBF24);        // warm golden yellow
static const Color absent = Color(0xFF374151);         // muted dark blue-gray

// Accent colors
static const Color accent = Color(0xFFCCFF00);         // lime (brand)
static const Color cardTeal = Color(0xFF06B6D4);       // cyan for حروف
static const Color cardCoral = Color(0xFFF97316);      // coral for روابط

// 3D effects
static const Color highlightTop = Color(0xFFFFFFFF);   // top edge light (8% opacity)
static const Color shadowBottom = Color(0xFF000000);   // bottom shadow (40% opacity)
```

### 3D Tile Recipe
Each game tile should have:
1. Main color fill
2. Top edge: 2px lighter gradient (simulates light from above)
3. Bottom edge: 2px darker gradient (simulates shadow below)
4. Outer shadow: BoxShadow with 3-4px offset, blur 6-8
5. Border radius: 10-12px
6. Inner highlight: subtle gradient overlay top 50% (white 8% → transparent)

### Files to Update

1. **lib/core/theme.dart** — Complete rewrite with 3D design system
   - New color palette
   - 3D tile decoration builder (parameterized)
   - 3D key decoration builder
   - Card decoration builder with gradient + shadow
   - Shimmer effect for loading
   - Keep lighten/darken helpers

2. **lib/features/home/home_screen.dart** — 3D cards, entrance animations
   - Gradient card backgrounds (teal/coral)
   - 3D elevated card look with shadow
   - Staggered slide-up entrance with bounce
   - Bottom nav with frosted glass

3. **lib/features/hurouf/hurouf_screen.dart** — 3D tiles, enhanced keyboard
   - Replace tile decoration with 3D version
   - Enhanced flip animation with scale bounce at end
   - 3D keyboard keys
   - Win celebration enhancement

4. **lib/features/rawabet/rawabet_screen.dart** — 3D word chips
   - Elevated chip look
   - Tap animation (lift + scale)
   - Group reveal animation

5. **lib/features/stats/stats_screen.dart** — Polish
   - Dark cards with 3D depth
   - Numbers with bold typography

6. **lib/features/settings/settings_screen.dart** — Polish
   - Dark theme consistent with rest

### Quality Gate
```bash
export PATH=$PATH:/home/khalid/flutter/bin
cd /home/khalid/.openclaw/workspace/kalima/app
flutter analyze
```
Must be 0 issues.

### Commit & Push
```bash
git add -A
git commit -m "design: full 3D polished redesign — WOW factor mobile game feel"
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_kalima" git push origin main
```

## IMPORTANT
- Keep ALL game logic intact — only visual changes
- Keep keyboard tap fix (single GestureDetector)
- Keep confetti celebration
- Keep haptic feedback
- Read each file BEFORE editing
- This is a COMPLETE redesign — be bold, make it stunning
