# Forge Brief — Kalima Flutter App Fixes

**Priority 1: Fix broken game logic (keyboard taps not registering)**
**Priority 2: Apply Brutalist UI redesign**

---

## Problem 1: Keyboard Taps Not Working

**Issue:** In `lib/features/hurouf/hurouf_screen.dart`, the `_buildKeyboard()` method has nested `GestureDetector` widgets that interfere with tap propagation:

```dart
GestureDetector(
  onTapDown: disabled ? null : (_) { notifier.onKey(letter); },
  child: _KeyPressBuilder(...),  // <-- This nests another GestureDetector
)
```

The `_KeyPressBuilder` has its own `GestureDetector` that doesn't call `notifier.onKey()`. This breaks the tap chain.

**Fix:** Remove the nested `_KeyPressBuilder` complexity. Use a simple `StatefulWidget` with `onTapDown/onTapUp` only for visual feedback.

Replace the entire `buildKey()` function with:

```dart
Widget buildKey(String letter, {double flex = 1}) {
  final st = keyStates[letter];
  Color bg = KalimaTheme.surface;
  Color fg = Colors.white;
  
  if (st == LetterState.correct) {
    bg = KalimaTheme.correct;
  } else if (st == LetterState.present) {
    bg = KalimaTheme.present;
  } else if (st == LetterState.absent) {
    bg = const Color(0xFF1A1500);
    fg = const Color(0xFF4A3F00);
  }

  return Expanded(
    flex: (flex * 10).round(),
    child: Padding(
      padding: const EdgeInsets.all(2),
      child: GestureDetector(
        onTapDown: disabled ? null : (_) {
          HapticFeedback.lightImpact();
          notifier.onKey(letter);
        },
        child: Container(
          height: 48,
          decoration: BoxDecoration(
            color: bg,
            border: Border.all(color: Colors.black, width: 2),
            boxShadow: [BoxShadow(color: Colors.black, offset: Offset(3, 3))],
          ),
          child: Center(
            child: Text(
              letter,
              style: GoogleFonts.cairo(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: fg,
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
```

Remove the entire `_KeyPressBuilder` class — not needed.

---

## Problem 2: Design Still Has Old Look

**Issue:** `lib/core/theme.dart` uses gradients, blurs, and glows. Need full Brutalist redesign.

**Fix:** Replace `theme.dart` with:

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // Brutalist colors
  static const Color background = Color(0xFFFFFFFF);  // white
  static const Color surface = Color(0xFFFFFFFF);     // white
  static const Color accent = Color(0xFFCCFF00);      // lime
  static const Color correct = Color(0xFF000000);     // black
  static const Color present = Color(0xFF999999);     // gray
  static const Color absent = Color(0xFFCCCCCC);      // light gray
  static const Color border = Color(0xFF000000);      // black
  static const Color borderFilled = Color(0xFF000000);
  static const Color textPrimary = Color(0xFF000000); // black
  static const Color textMuted = Color(0xFF666666);   // dark gray

  // Brutalist: no gradients, solid colors only
  static RadialGradient get radialBackground => const RadialGradient(
        center: Alignment.center,
        radius: 0.8,
        colors: [
          Color(0xFFFFFFFF), // white throughout
          Color(0xFFFFFFFF),
          Color(0xFFFFFFFF),
        ],
      );

  // Brutal key decoration: 3px border, 4px offset shadow, no gradient
  static BoxDecoration keyDecoration(Color bg) {
    return BoxDecoration(
      color: bg,
      border: Border.all(color: Colors.black, width: 3),
      boxShadow: [
        BoxShadow(
          color: Colors.black,
          blurRadius: 0,  // NO BLUR
          offset: const Offset(4, 4),
        ),
      ],
    );
  }

  // Game card decoration: 3px border, offset shadow
  static BoxDecoration gameCardDecoration(Color color, {bool isLocked = false}) {
    return BoxDecoration(
      color: Colors.white,
      border: Border.all(
        color: isLocked ? Colors.black.withValues(alpha: 0.3) : Color(0xFFCCFF00),
        width: 3,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black,
          blurRadius: 0,  // NO BLUR
          offset: const Offset(4, 4),
        ),
      ],
    );
  }

  // Tile decoration: 3px border, 4px shadow
  static BoxDecoration tile3D({
    required Color color,
    required bool isRevealed,
    required bool hasLetter,
  }) {
    return BoxDecoration(
      color: isRevealed ? color : Colors.white,
      border: Border.all(color: Colors.black, width: 3),
      boxShadow: [
        BoxShadow(
          color: Colors.black,
          blurRadius: 0,
          offset: const Offset(4, 4),
        ),
      ],
    );
  }

  // NO gloss overlay
  static BoxDecoration get tileGlossOverlay => BoxDecoration();

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.light(
        primary: accent,
        surface: surface,
        error: Color(0xFFFF0000),
      ),
      textTheme: GoogleFonts.cairoTextTheme(
        ThemeData.light().textTheme,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.cairo(
          fontSize: 20,
          fontWeight: FontWeight.w900,
          color: textPrimary,
        ),
        iconTheme: const IconThemeData(color: textPrimary),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(0),
          side: const BorderSide(color: Colors.black, width: 3),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Color(0xFFCCFF00),
          foregroundColor: Colors.black,
          textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(0),
            side: const BorderSide(color: Colors.black, width: 3),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
      ),
    );
  }
}
```

---

## Priority Order

1. **Delete `_KeyPressBuilder` class** (bottom of hurouf_screen.dart)
2. **Rewrite `buildKey()` function** — simple, no nesting
3. **Replace entire `theme.dart`** with Brutalist version above
4. Test in simulator:
   - Tap keyboard keys → must add letters to current row
   - Tap Enter → must submit guess
   - Tap Delete → must remove last letter
   - Visual: white bg, 3px black borders, 4px black shadows, no blur/glow
5. `flutter analyze` must be 0 errors
6. Commit & push

---

## Success Criteria

✅ Keyboard taps work (letters appear in current row)
✅ All UI elements have 3px black borders
✅ All shadows are 4px offset, no blur
✅ Background is white (#FFFFFF), text is black
✅ #CCFF00 appears ONLY on accent borders/buttons, never as glow
✅ No gradients, no blur filters
✅ font-weight: 900 on all headers/buttons
✅ Game logic fully functional
✅ Flutter analyze: 0 issues
✅ Pushed to main branch
