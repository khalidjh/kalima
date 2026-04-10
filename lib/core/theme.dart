import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // Dark vibrant colors
  static const Color background = Color(0xFF0F0C00);
  static const Color surface = Color(0xFF1A1A2E);
  static const Color accent = Color(0xFFCCFF00);
  static const Color correct = Color(0xFF4ECDC4);   // vibrant teal
  static const Color present = Color(0xFFFFE66D);   // bright yellow
  static const Color absent = Color(0xFF45B7D1);    // sky blue
  static const Color border = Color(0xFF2A2A3C);
  static const Color borderFilled = Color(0xFF565656);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF818384);

  static Color lighten(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness + amount).clamp(0, 1)).toColor();
  }

  static Color darken(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness - amount).clamp(0, 1)).toColor();
  }

  // Subtle radial gradient for atmosphere
  static RadialGradient get radialBackground => const RadialGradient(
        center: Alignment.center,
        radius: 0.8,
        colors: [
          Color(0xFF1A1A2E),
          Color(0xFF0F0C00),
        ],
      );

  // Keyboard key decoration
  static BoxDecoration keyDecoration(Color bg) {
    return BoxDecoration(
      color: bg,
      borderRadius: BorderRadius.circular(8),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.3),
          blurRadius: 2,
          offset: const Offset(0, 2),
        ),
      ],
    );
  }

  // Game card decoration
  static BoxDecoration gameCardDecoration(Color color, {bool isLocked = false}) {
    return BoxDecoration(
      color: surface,
      borderRadius: BorderRadius.circular(14),
      border: Border(
        left: BorderSide(
          color: isLocked ? color.withValues(alpha: 0.2) : accent,
          width: 3,
        ),
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.2),
          blurRadius: 8,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  // Tile decoration — vibrant flat, rounded
  static BoxDecoration tile3D({
    required Color color,
    required bool isRevealed,
    required bool hasLetter,
  }) {
    return BoxDecoration(
      color: isRevealed ? color : (hasLetter ? surface : surface.withValues(alpha: 0.5)),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(
        color: isRevealed
            ? lighten(color, 0.2)
            : hasLetter
                ? borderFilled
                : border.withValues(alpha: 0.5),
        width: 2,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.25),
          blurRadius: 3,
          offset: const Offset(0, 2),
        ),
      ],
    );
  }

  // No gloss overlay
  static BoxDecoration get tileGlossOverlay => const BoxDecoration();

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.dark(
        primary: accent,
        surface: surface,
        error: Color(0xFFFF4444),
      ),
      textTheme: GoogleFonts.cairoTextTheme(
        ThemeData.dark().textTheme,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
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
}
