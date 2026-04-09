import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // Original colors
  static const Color background = Color(0xFF0F0F1A);
  static const Color surface = Color(0xFF1A1A2E);
  static const Color accent = Color(0xFFCCFF00);
  static const Color correct = Color(0xFF538D4E);
  static const Color present = Color(0xFFB59F3B);
  static const Color absent = Color(0xFF3A3A3C);
  static const Color border = Color(0xFF2A2A3C);
  static const Color borderFilled = Color(0xFF565656);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF818384);

  // Premium gradient colors
  static const Color gradientCenter = Color(0xFF3D1F00);
  static const Color gradientMid = Color(0xFF2A0E3A);
  static const Color gradientEdge = Color(0xFF120525);

  static Color lighten(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness + amount).clamp(0, 1)).toColor();
  }

  static Color darken(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness - amount).clamp(0, 1)).toColor();
  }

  // Radial gradient background
  static RadialGradient get radialBackground => const RadialGradient(
        center: Alignment.center,
        radius: 0.8,
        colors: [
          Color(0xFF3D1F00), // warm amber center
          Color(0xFF2A0E3A), // deep purple mid
          Color(0xFF120525), // dark purple edge
        ],
        stops: [0.0, 0.5, 1.0],
      );

  // Premium keyboard key decoration
  static BoxDecoration keyDecoration(Color bg) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(8),
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lighten(bg, 0.1),
          bg,
          darken(bg, 0.15),
        ],
        stops: const [0.0, 0.5, 1.0],
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: 4,
          offset: const Offset(0, 3),
        ),
      ],
    );
  }

  // Game card decoration with glow
  static BoxDecoration gameCardDecoration(Color color, {bool isLocked = false}) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topRight,
        end: Alignment.bottomLeft,
        colors: [
          color.withValues(alpha: isLocked ? 0.08 : 0.2),
          color.withValues(alpha: isLocked ? 0.02 : 0.05),
        ],
      ),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(
        color: color.withValues(alpha: isLocked ? 0.1 : 0.35),
        width: 1.5,
      ),
      boxShadow: [
        BoxShadow(
          color: color.withValues(alpha: isLocked ? 0.05 : 0.15),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.3),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  // Tile 3D decoration for hurouf
  static BoxDecoration tile3D({
    required Color color,
    required bool isRevealed,
    required bool hasLetter,
  }) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      gradient: isRevealed
          ? LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                lighten(color, 0.15),
                color,
                darken(color, 0.2),
              ],
              stops: const [0.0, 0.5, 1.0],
            )
          : null,
      color: isRevealed ? null : (hasLetter ? surface : surface.withValues(alpha: 0.5)),
      border: Border.all(
        color: isRevealed
            ? lighten(color, 0.3).withValues(alpha: 0.6)
            : hasLetter
                ? borderFilled
                : border.withValues(alpha: 0.5),
        width: hasLetter && !isRevealed ? 2 : 1.5,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: isRevealed ? 8 : 4,
          offset: Offset(0, isRevealed ? 4 : 2),
        ),
        if (isRevealed)
          BoxShadow(
            color: color.withValues(alpha: 0.35),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
      ],
    );
  }

  // Gloss overlay for tiles
  static BoxDecoration get tileGlossOverlay => BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.center,
          colors: [
            Colors.white.withValues(alpha: 0.15),
            Colors.white.withValues(alpha: 0.0),
          ],
          stops: const [0.0, 0.5],
        ),
      );

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
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
        iconTheme: const IconThemeData(color: textPrimary),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 4,
        shadowColor: Colors.black.withValues(alpha: 0.3),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: const Color(0xFF0F0F1A),
          textStyle: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        ),
      ),
    );
  }
}
