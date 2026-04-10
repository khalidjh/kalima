import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // Brutalist colors
  static const Color background = Color(0xFFFFFFFF);  // white
  static const Color surface = Color(0xFFFFFFFF);     // white

  static Color lighten(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness + amount).clamp(0, 1)).toColor();
  }

  static Color darken(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness - amount).clamp(0, 1)).toColor();
  }
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
