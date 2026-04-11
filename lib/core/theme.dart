import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class KalimaTheme {
  // === Deep Premium Dark Background ===
  static const Color background = Color(0xFF07071A);    // near-black with deep navy
  static const Color surface = Color(0xFF12122E);       // elevated surface
  static const Color surfaceLight = Color(0xFF1C1C40); // lighter surface for contrast

  // === Game Tile States — rich saturated ===
  static const Color correct = Color(0xFF00E09E);       // vivid emerald green
  static const Color present = Color(0xFFFFB800);       // rich amber gold
  static const Color absent = Color(0xFF2E2E46);        // muted slate

  // === Accent & Card Colors ===
  static const Color accent = Color(0xFFCCFF00);        // lime brand
  static const Color cardTeal = Color(0xFF00D4FF);      // electric cyan
  static const Color cardCoral = Color(0xFFFF6B35);     // vivid orange-coral

  // === 3D Light Simulation ===
  static const Color highlightTop = Color(0xFFFFFFFF);
  static const Color shadowBottom = Color(0xFF000000);
  static const Color border = Color(0xFF252540);
  static const Color borderFilled = Color(0xFF565656);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF6A6A8A);

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
        center: const Alignment(0, -0.4),
        radius: 1.5,
        colors: [
          const Color(0xFF181836),
          const Color(0xFF0E0E22),
          background,
        ],
        stops: const [0.0, 0.45, 1.0],
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
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            darken(surface, 0.03),
            surface,
            lighten(surface, 0.01),
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border(
          top: BorderSide(color: Colors.black.withValues(alpha: 0.4), width: 1.5),
          left: BorderSide(color: Colors.black.withValues(alpha: 0.25), width: 1),
          right: BorderSide(color: highlightTop.withValues(alpha: 0.04), width: 0.5),
          bottom: BorderSide(color: highlightTop.withValues(alpha: 0.06), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 2,
            offset: const Offset(0, 1),
            spreadRadius: -1,
          ),
        ],
      );
    }

    if (!isRevealed && hasLetter) {
      // Filled but not yet revealed — raised neutral tile with strong 3D
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            lighten(surface, 0.14),
            lighten(surface, 0.06),
            surface,
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border(
          top: BorderSide(color: highlightTop.withValues(alpha: 0.22), width: 2),
          left: BorderSide(color: highlightTop.withValues(alpha: 0.10), width: 1),
          right: BorderSide(color: Colors.black.withValues(alpha: 0.20), width: 1),
          bottom: BorderSide(color: Colors.black.withValues(alpha: 0.45), width: 2.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.6),
            blurRadius: 8,
            offset: const Offset(0, 5),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 3,
            offset: const Offset(1, 2),
          ),
        ],
      );
    }

    // Revealed tile — full 3D colored piece with premium light simulation
    final topColor = lighten(color, 0.28);
    final midColor = lighten(color, 0.08);
    final bottomColor = darken(color, 0.20);

    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [topColor, midColor, color, bottomColor],
        stops: const [0.0, 0.25, 0.55, 1.0],
      ),
      borderRadius: BorderRadius.circular(12),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: 0.40), width: 2.5),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.16), width: 1.5),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.20), width: 1),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.50), width: 3),
      ),
      boxShadow: [
        // Strong color glow beneath
        BoxShadow(
          color: color.withValues(alpha: 0.55),
          blurRadius: 18,
          spreadRadius: 0,
          offset: const Offset(0, 6),
        ),
        // Wide ambient glow
        BoxShadow(
          color: color.withValues(alpha: 0.25),
          blurRadius: 32,
          spreadRadius: 2,
          offset: const Offset(0, 4),
        ),
        // Hard depth shadow
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.60),
          blurRadius: 10,
          offset: const Offset(0, 7),
        ),
        // Side shadow for 3D depth
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.25),
          blurRadius: 4,
          offset: const Offset(2, 3),
        ),
      ],
    );
  }

  // Gloss overlay — simulates convex light reflection on top half of tile
  static BoxDecoration get tileGlossOverlay => BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: const Alignment(0, 0.6),
          colors: [
            Colors.white.withValues(alpha: 0.22),
            Colors.white.withValues(alpha: 0.06),
            Colors.white.withValues(alpha: 0.0),
          ],
          stops: const [0.0, 0.4, 1.0],
        ),
      );

  // Specular spot highlight — the bright "shine" on top-left of tile
  static BoxDecoration get tileSpecularSpot => BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: RadialGradient(
          center: const Alignment(-0.3, -0.6),
          radius: 0.5,
          colors: [
            Colors.white.withValues(alpha: 0.18),
            Colors.white.withValues(alpha: 0.0),
          ],
        ),
      );

  // === 3D Keyboard Key — premium raised tactile button ===
  static BoxDecoration keyDecoration(Color bg) {
    final isColored = bg == correct || bg == present;
    final isAccent = bg == accent;
    final topColor = lighten(bg, isColored || isAccent ? 0.18 : 0.13);
    final bottomColor = darken(bg, 0.16);

    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [topColor, lighten(bg, 0.04), bg, bottomColor],
        stops: const [0.0, 0.2, 0.6, 1.0],
      ),
      borderRadius: BorderRadius.circular(9),
      border: Border(
        top: BorderSide(
          color: highlightTop.withValues(alpha: isColored || isAccent ? 0.40 : 0.22),
          width: 1.5,
        ),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.08), width: 0.5),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.55), width: 2.5),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.25), width: 0.5),
      ),
      boxShadow: [
        // Primary lift shadow
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.55),
          blurRadius: 4,
          offset: const Offset(0, 4),
        ),
        // Color bleed for state keys
        if (isColored || isAccent)
          BoxShadow(
            color: bg.withValues(alpha: 0.35),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
      ],
    );
  }

  // === Pressed/absent key — flat sunken look ===
  static BoxDecoration keyDecorationFlat(Color bg) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lighten(bg, 0.02),
          bg,
          darken(bg, 0.03),
        ],
      ),
      borderRadius: BorderRadius.circular(9),
      border: Border(
        top: BorderSide(color: Colors.black.withValues(alpha: 0.3), width: 1.5),
        bottom: BorderSide(color: highlightTop.withValues(alpha: 0.04), width: 0.5),
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

  // === 3D Game Card — ultra-premium elevated look ===
  static BoxDecoration gameCardDecoration(Color color, {bool isLocked = false}) {
    if (isLocked) {
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            lighten(surface, 0.04),
            surface,
          ],
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border(
          top: BorderSide(color: highlightTop.withValues(alpha: 0.08), width: 1),
          bottom: BorderSide(color: Colors.black.withValues(alpha: 0.3), width: 2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      );
    }

    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          lighten(color, 0.22),
          lighten(color, 0.08),
          color,
          darken(color, 0.14),
        ],
        stops: const [0.0, 0.25, 0.6, 1.0],
      ),
      borderRadius: BorderRadius.circular(22),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: 0.35), width: 2),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.18), width: 1.5),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.20), width: 1),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.45), width: 3),
      ),
      boxShadow: [
        // Strong color glow
        BoxShadow(
          color: color.withValues(alpha: 0.50),
          blurRadius: 32,
          spreadRadius: 0,
          offset: const Offset(0, 8),
        ),
        // Wide ambient color bloom
        BoxShadow(
          color: color.withValues(alpha: 0.22),
          blurRadius: 48,
          spreadRadius: 4,
          offset: const Offset(0, 6),
        ),
        // Hard depth shadow
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.50),
          blurRadius: 16,
          offset: const Offset(0, 12),
        ),
      ],
    );
  }

  // === Rawabet word chip — premium tactile raised chip ===
  static BoxDecoration wordChip3D({
    required bool isSelected,
    required bool isFlash,
  }) {
    if (isFlash) {
      return BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF7A1A1A), Color(0xFF4A0E0E)],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border(
          top: BorderSide(color: const Color(0xFFFF4444).withValues(alpha: 0.6), width: 1.5),
          bottom: BorderSide(color: Colors.black.withValues(alpha: 0.5), width: 2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withValues(alpha: 0.55),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: Colors.red.withValues(alpha: 0.25),
            blurRadius: 28,
            spreadRadius: 2,
          ),
        ],
      );
    }

    if (isSelected) {
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            lighten(accent, 0.14),
            lighten(accent, 0.04),
            accent,
            darken(accent, 0.12),
          ],
          stops: const [0.0, 0.2, 0.6, 1.0],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border(
          top: BorderSide(color: highlightTop.withValues(alpha: 0.45), width: 2),
          left: BorderSide(color: highlightTop.withValues(alpha: 0.20), width: 1.5),
          right: BorderSide(color: Colors.black.withValues(alpha: 0.20), width: 1),
          bottom: BorderSide(color: Colors.black.withValues(alpha: 0.50), width: 3),
        ),
        boxShadow: [
          BoxShadow(
            color: accent.withValues(alpha: 0.60),
            blurRadius: 22,
            offset: const Offset(0, 5),
          ),
          BoxShadow(
            color: accent.withValues(alpha: 0.28),
            blurRadius: 36,
            spreadRadius: 2,
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.45),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
      );
    }

    // Default unselected — strong raised chip
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          lighten(surfaceLight, 0.10),
          lighten(surfaceLight, 0.04),
          surfaceLight,
          darken(surfaceLight, 0.05),
        ],
        stops: const [0.0, 0.2, 0.6, 1.0],
      ),
      borderRadius: BorderRadius.circular(14),
      border: Border(
        top: BorderSide(color: highlightTop.withValues(alpha: 0.16), width: 1.5),
        left: BorderSide(color: highlightTop.withValues(alpha: 0.06), width: 0.5),
        right: BorderSide(color: Colors.black.withValues(alpha: 0.15), width: 0.5),
        bottom: BorderSide(color: Colors.black.withValues(alpha: 0.40), width: 2.5),
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.50),
          blurRadius: 7,
          offset: const Offset(0, 4),
        ),
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.20),
          blurRadius: 3,
          offset: const Offset(1, 2),
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
          elevation: 8,
          shadowColor: accent.withValues(alpha: 0.5),
        ),
      ),
    );
  }
}
