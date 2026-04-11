import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // === Deep Premium Dark Background ===
  static const Color background = Color(0xFF080816);    // near-black with blue tint
  static const Color surface = Color(0xFF14142A);       // elevated surface
  static const Color surfaceLight = Color(0xFF1E1E3A); // lighter surface for contrast

  // === Game Tile States — rich saturated ===
  static const Color correct = Color(0xFF00E09E);       // vivid emerald green
  static const Color present = Color(0xFFFFB800);       // rich amber gold
  static const Color absent = Color(0xFF3A3A52);        // muted slate

  // === Accent & Card Colors ===
  static const Color accent = Color(0xFFCCFF00);        // lime brand
  static const Color cardTeal = Color(0xFF00D4FF);      // electric cyan
  static const Color cardCoral = Color(0xFFFF6B35);     // vivid orange-coral

  // === 3D Light Simulation ===
  static const Color highlightTop = Color(0xFFFFFFFF);
  static const Color shadowBottom = Color(0xFF000000);
  static const Color border = Color(0xFF2A2A3C);
  static const Color borderFilled = Color(0xFF565656);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF7A7A9A);

  static Color lighten(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness + amount).clamp(0, 1)).toColor();
  }

  static Color darken(Color c, double amount) {
    final hsl = HSLColor.fromColor(c);
    return hsl.withLightness((hsl.lightness - amount).clamp(0, 1)).toColor();
  }

  // Rich radial background with depth
  static RadialGradient get radialBackground => RadialGradient(
        center: const Alignment(0, -0.3),
        radius: 1.4,
        colors: [
          const Color(0xFF1A1A3A),
          const Color(0xFF0E0E20),
          background,
        ],
        stops: const [0.0, 0.5, 1.0],
      );

  // === 3D Tile Decoration — physical game piece feel ===
  static BoxDecoration tile3D({
    required Color color,
    required bool isRevealed,
    required bool hasLetter,
  }) {
    if (!hasLetter && !isRevealed) {
      // Empty tile — concave inset look
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            darken(surface, 0.02),
            surface,
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border.withValues(alpha: 0.5), width: 1.5),
        boxShadow: [
          // Inner shadow illusion via dark outer
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      );
    }

    if (!isRevealed && hasLetter) {
      // Filled but not yet revealed — raised neutral tile
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            lighten(surface, 0.08),
            surface,
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border(
          top: BorderSide(color: highlightTop.withValues(alpha: 0.12), width: 2),
          left: BorderSide(color: highlightTop.withValues(alpha: 0.06), width: 1),
          right: BorderSide(color: Colors.black.withValues(alpha: 0.15), width: 1),
          bottom: BorderSide(color: Colors.black.withValues(alpha: 0.3), width: 2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      );
    }

    // Revealed tile — full 3D colored piece with light simulation
    final topColor = lighten(color, 0.2);
    final bottomColor = darken(color, 0.15);

    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [topColor, color, bottomColor],
        stops: const [0.0, 0.4, 1.0],
      ),
      borderRadius: BorderRadius.circular(12),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: 0.25), width: 2),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.1), width: 1),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.15), width: 1),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.4), width: 2.5),
      ),
      boxShadow: [
        // Color glow beneath
        BoxShadow(
          color: color.withValues(alpha: 0.35),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
        // Hard shadow for depth
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.5),
          blurRadius: 8,
          offset: const Offset(0, 5),
        ),
      ],
    );
  }

  // Gloss overlay — simulates light reflection on top half of tile
  static BoxDecoration get tileGlossOverlay => BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.center,
          colors: [
            Colors.white.withValues(alpha: 0.15),
            Colors.white.withValues(alpha: 0.0),
          ],
        ),
      );

  // === 3D Keyboard Key — raised tactile button ===
  static BoxDecoration keyDecoration(Color bg) {
    final isColored = bg == correct || bg == present;
    final topColor = lighten(bg, isColored ? 0.15 : 0.1);
    final bottomColor = darken(bg, 0.12);

    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [topColor, bg, bottomColor],
        stops: const [0.0, 0.5, 1.0],
      ),
      borderRadius: BorderRadius.circular(8),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: isColored ? 0.3 : 0.15), width: 1.5),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.05), width: 0.5),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.5), width: 2),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.2), width: 0.5),
      ),
      boxShadow: [
        // Lift shadow
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.45),
          blurRadius: 4,
          offset: const Offset(0, 3),
        ),
        // Color bleed for state keys
        if (isColored)
          BoxShadow(
            color: bg.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
      ],
    );
  }

  // === Pressed/absent key — flat sunken look ===
  static BoxDecoration keyDecorationFlat(Color bg) {
    return BoxDecoration(
      color: bg,
      borderRadius: BorderRadius.circular(8),
      border: Border(
        top: BorderSide(color: Colors.black.withValues(alpha: 0.2), width: 1),
        bottom: BorderSide(color: highlightTop.withValues(alpha: 0.03), width: 0.5),
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.2),
          blurRadius: 2,
          offset: const Offset(0, 1),
        ),
      ],
    );
  }

  // === 3D Game Card — premium elevated look ===
  static BoxDecoration gameCardDecoration(Color color, {bool isLocked = false}) {
    if (isLocked) {
      return BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border.withValues(alpha: 0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      );
    }

    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          lighten(color, 0.12),
          color,
          darken(color, 0.1),
        ],
        stops: const [0.0, 0.5, 1.0],
      ),
      borderRadius: BorderRadius.circular(20),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: 0.25), width: 2),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.1), width: 1),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.15), width: 1),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.35), width: 2.5),
      ),
      boxShadow: [
        // Color glow
        BoxShadow(
          color: color.withValues(alpha: 0.3),
          blurRadius: 20,
          offset: const Offset(0, 6),
        ),
        // Hard shadow
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: 12,
          offset: const Offset(0, 8),
        ),
      ],
    );
  }

  // === Rawabet word chip — tactile raised chip ===
  static BoxDecoration wordChip3D({
    required bool isSelected,
    required bool isFlash,
  }) {
    if (isFlash) {
      return BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF6B2020), Color(0xFF4A1515)],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFF4444), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withValues(alpha: 0.4),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      );
    }

    if (isSelected) {
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            lighten(accent, 0.1),
            accent,
            darken(accent, 0.15),
          ],
          stops: const [0.0, 0.4, 1.0],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border(
          top: BorderSide(color: highlightTop.withValues(alpha: 0.35), width: 2),
          left: BorderSide(color: highlightTop.withValues(alpha: 0.15), width: 1),
          right: BorderSide(color: Colors.black.withValues(alpha: 0.15), width: 1),
          bottom: BorderSide(color: Colors.black.withValues(alpha: 0.4), width: 2.5),
        ),
        boxShadow: [
          BoxShadow(
            color: accent.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 8,
            offset: const Offset(0, 5),
          ),
        ],
      );
    }

    // Default unselected — subtle raised chip
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lighten(surfaceLight, 0.06),
          surfaceLight,
          darken(surfaceLight, 0.04),
        ],
        stops: const [0.0, 0.4, 1.0],
      ),
      borderRadius: BorderRadius.circular(12),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: 0.1), width: 1.5),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.04), width: 0.5),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.1), width: 0.5),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.3), width: 2),
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.4),
          blurRadius: 5,
          offset: const Offset(0, 3),
        ),
      ],
    );
  }

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
          foregroundColor: const Color(0xFF0A0A0A),
          textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          elevation: 6,
          shadowColor: accent.withValues(alpha: 0.4),
        ),
      ),
    );
  }
}
