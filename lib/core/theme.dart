import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // 3D Polished Mobile Game Aesthetic
  
  // Backgrounds & Surface
  static const Color background = Color(0xFF0A0A1A);    // deep dark navy
  static const Color surface = Color(0xFF1C1C3A);       // elevated surface
  
  // Game Tile States — vibrant 3D
  static const Color correct = Color(0xFF2DD4A8);       // vibrant teal-green
  static const Color present = Color(0xFFFBBF24);       // warm golden yellow
  static const Color absent = Color(0xFF4B5563);        // muted dark slate
  
  // Accent & Card Colors
  static const Color accent = Color(0xFFCCFF00);        // lime brand
  static const Color cardTeal = Color(0xFF06B6D4);      // cyan for حروف
  static const Color cardCoral = Color(0xFFF97316);     // coral for روابط
  
  // 3D Effects
  static const Color highlightTop = Color(0xFFFFFFFF);  // top edge light
  static const Color shadowBottom = Color(0xFF000000);  // bottom shadow
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
  static RadialGradient get radialBackground => RadialGradient(
        center: Alignment.center,
        radius: 1.2,
        colors: [
          const Color(0xFF1A1A3A),
          background,
        ],
      );

  // 3D Tile Decoration — main game element
  static BoxDecoration tile3D({
    required Color color,
    required bool isRevealed,
    required bool hasLetter,
  }) {
    if (!hasLetter && !isRevealed) {
      // Empty tile — subtle concave look
      return BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border, width: 1.5),
        boxShadow: [
          // Outer subtle shadow
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      );
    }

    // Filled or revealed tile — 3D convex look
    return BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(12),
      // Top highlight for 3D effect
      border: Border(
        top: BorderSide(
          color: highlightTop.withValues(alpha: isRevealed ? 0.15 : 0.08),
          width: 2,
        ),
        left: BorderSide(
          color: highlightTop.withValues(alpha: 0.05),
          width: 1,
        ),
      ),
      boxShadow: [
        // Top edge light
        if (isRevealed)
          BoxShadow(
            color: color.withValues(alpha: 0.4),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        // Bottom & outer shadow (3D depth)
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: 8,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  // 3D Keyboard Key Decoration — raised button look
  static BoxDecoration keyDecoration(Color bg) {
    return BoxDecoration(
      color: bg,
      borderRadius: BorderRadius.circular(10),
      // Top highlight
      border: Border(
        top: BorderSide(
          color: highlightTop.withValues(alpha: 0.2),
          width: 1.5,
        ),
      ),
      boxShadow: [
        // Outer shadow for raised look
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.35),
          blurRadius: 6,
          offset: const Offset(0, 3),
        ),

      ],
    );
  }

  // 3D Game Card Decoration — elevated with gradient
  static BoxDecoration gameCardDecoration(Color color, {bool isLocked = false}) {
    return BoxDecoration(
      gradient: isLocked
          ? null
          : LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                lighten(color, 0.15),
                color,
              ],
            ),
      color: isLocked ? surface : null,
      borderRadius: BorderRadius.circular(18),
      // Border accent
      border: Border.all(
        color: isLocked
            ? border.withValues(alpha: 0.3)
            : color.withValues(alpha: 0.6),
        width: 2,
      ),
      boxShadow: [
        // Color glow (subtle)
        if (!isLocked)
          BoxShadow(
            color: color.withValues(alpha: 0.2),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        // Main shadow
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.25),
          blurRadius: 12,
          offset: const Offset(0, 6),
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
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: const Color(0xFF0A0A1A),
          textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          elevation: 4,
          shadowColor: accent.withValues(alpha: 0.3),
        ),
      ),
    );
  }
}
