# Forge Brief — Kalima Flutter Theme Update

Update `lib/core/theme.dart` to match this new design direction. Keep existing helper methods (lighten/darken).

## Design Direction: Dark + Vibrant + Polished

**NOT brutalist. NOT white.** Think polished mobile puzzle game.

### Colors
```dart
static const Color background = Color(0xFF0F0C00);    // deep dark
static const Color surface = Color(0xFF1A1A2E);       // dark navy card bg
static const Color accent = Color(0xFFCCFF00);         // lime accent (buttons, highlights)
static const Color correct = Color(0xFF22A65A);        // green — correct letter
static const Color present = Color(0xFFF5820A);        // amber — present letter
static const Color absent = Color(0xFF3A3A3C);         // dark gray — absent letter
static const Color border = Color(0xFF2A2A3C);
static const Color borderFilled = Color(0xFF565656);
static const Color textPrimary = Color(0xFFFFFFFF);
static const Color textMuted = Color(0xFF818384);
```

### Tile Style
- Border radius: 8-10px (NOT sharp 0, NOT pill 50)
- Colored tiles: vibrant flat colors, no gradients
- Empty tiles: dark surface (#1A1A2E) with subtle border
- Revealed tiles: solid correct/present/absent color, bold white text
- Subtle shadow: `BoxShadow(color: Colors.black26, blurRadius: 2, offset: Offset(0, 2))` — minimal depth, no glow

### Keyboard Style
- Key border radius: 6-8px
- Default key: surface color bg, white text, w700
- Correct key: green bg, white text, w900
- Present key: amber bg, white text, w900
- Absent key: dark gray bg, muted text
- Subtle pressed state: scale(0.95) + slightly darker bg

### Card Style (home screen game cards)
- Dark surface bg (#1A1A2E)
- Border radius: 12-16px
- Accent left border: 3px #CCFF00
- Subtle elevation shadow (no glow)

### Buttons
- Primary: #CCFF00 bg, black text, w900, border radius 10px
- No hard brutal shadows, use subtle elevation instead

### Typography
- Headers: Cairo font, w900, white
- Body: Cairo font, w500, white/muted
- Tile letters: Cairo font, w900, white, large (20-24px)

### RadialGradient background (for game screens)
Keep a subtle radial gradient for atmosphere:
```dart
static RadialGradient get radialBackground => const RadialGradient(
  center: Alignment.center,
  radius: 0.8,
  colors: [
    Color(0xFF1A1A2E),  // dark navy center
    Color(0xFF0F0C00),  // deep dark edge
  ],
);
```

### Remove these brutalist things
- NO white background
- NO 3px solid black borders
- NO 4px offset hard shadows
- NO sharp corners (0 radius)

### Keep
- lighten() and darken() helper methods
- tile3D() method (update to new style)
- keyDecoration() method (update to new style)
- gameCardDecoration() method (update to new style)
- tileGlossOverlay (can be empty/transparent)

### Flutter ThemeData
```dart
ThemeData get darkTheme {
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: background,
    colorScheme: const ColorScheme.dark(
      primary: accent,
      surface: surface,
      error: Color(0xFFFF4444),
    ),
    textTheme: GoogleFonts.cairoTextTheme(ThemeData.dark().textTheme),
    appBarTheme: AppBarTheme(
      backgroundColor: background,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w900, color: textPrimary),
      iconTheme: const IconThemeData(color: textPrimary),
    ),
    cardTheme: CardThemeData(
      color: surface,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: accent,
        foregroundColor: const Color(0xFF0F0C00),
        textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      ),
    ),
  );
}
```

## Files to update
1. `lib/core/theme.dart` — replace entirely with new theme
2. `lib/features/hurouf/hurouf_screen.dart` — update any hardcoded brutal styles to use new theme
3. `lib/features/home/home_screen.dart` — update cards if needed
4. `lib/features/rawabet/rawabet_screen.dart` — update if needed

## Quality Gate
```bash
export PATH=$PATH:/home/khalid/flutter/bin
cd /home/khalid/.openclaw/workspace/kalima/app
flutter analyze
```
Must be 0 issues.

## Commit & Push
```bash
git add -A
git commit -m "design: dark vibrant polished theme — mobile puzzle game style"
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_kalima" git push origin main
```
