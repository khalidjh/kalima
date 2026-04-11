import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:confetti/confetti.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
// ignore: unnecessary_import
import 'dart:async';
import '../../core/theme.dart';
import '../../core/rawabet_data.dart';

class RawabetState {
  final List<String> tiles;
  final List<String> selected;
  final List<RawabetCategory> foundCategories;
  final int mistakes;
  final String gameStatus; // playing, won, lost
  final List<String> shakingTiles;
  final List<String> flashWrongTiles;
  final List<String> bounceTiles;
  final List<String> flippingTiles;
  final bool isChecking;

  const RawabetState({
    this.tiles = const [],
    this.selected = const [],
    this.foundCategories = const [],
    this.mistakes = 0,
    this.gameStatus = 'playing',
    this.shakingTiles = const [],
    this.flashWrongTiles = const [],
    this.bounceTiles = const [],
    this.flippingTiles = const [],
    this.isChecking = false,
  });

  RawabetState copyWith({
    List<String>? tiles,
    List<String>? selected,
    List<RawabetCategory>? foundCategories,
    int? mistakes,
    String? gameStatus,
    List<String>? shakingTiles,
    List<String>? flashWrongTiles,
    List<String>? bounceTiles,
    List<String>? flippingTiles,
    bool? isChecking,
  }) =>
      RawabetState(
        tiles: tiles ?? this.tiles,
        selected: selected ?? this.selected,
        foundCategories: foundCategories ?? this.foundCategories,
        mistakes: mistakes ?? this.mistakes,
        gameStatus: gameStatus ?? this.gameStatus,
        shakingTiles: shakingTiles ?? this.shakingTiles,
        flashWrongTiles: flashWrongTiles ?? this.flashWrongTiles,
        bounceTiles: bounceTiles ?? this.bounceTiles,
        flippingTiles: flippingTiles ?? this.flippingTiles,
        isChecking: isChecking ?? this.isChecking,
      );
}

class RawabetNotifier extends Notifier<RawabetState> {
  late RawabetPuzzle puzzle;

  @override
  RawabetState build() {
    puzzle = getDailyRawabetPuzzle();
    return RawabetState(
      tiles: _shuffle(puzzle.categories.expand((c) => c.words).toList()),
    );
  }

  static List<String> _shuffle(List<String> list) {
    final a = List<String>.from(list);
    for (var i = a.length - 1; i > 0; i--) {
      final j = Random().nextInt(i + 1);
      final tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  void toggleTile(String word) {
    if (state.gameStatus != 'playing' || state.isChecking) return;
    HapticFeedback.lightImpact();
    if (state.selected.contains(word)) {
      state = state.copyWith(selected: state.selected.where((w) => w != word).toList());
    } else if (state.selected.length < 4) {
      state = state.copyWith(selected: [...state.selected, word]);
    }
  }

  void shuffle() {
    if (state.gameStatus != 'playing') return;
    state = state.copyWith(tiles: _shuffle(state.tiles));
  }

  void deselectAll() {
    state = state.copyWith(selected: []);
  }

  void check() {
    if (state.selected.length != 4 || state.gameStatus != 'playing' || state.isChecking) return;

    RawabetCategory? matched;
    try {
      matched = puzzle.categories
          .where((cat) => !state.foundCategories.any((f) => f.name == cat.name))
          .firstWhere((cat) {
            final catWords = cat.words.toSet();
            final selWords = state.selected.toSet();
            return catWords.length == selWords.length && catWords.containsAll(selWords);
          });
    } catch (e) {
      matched = null;
    }

    if (matched != null) {
      HapticFeedback.mediumImpact();
      // Bounce then flip then reveal
      state = state.copyWith(bounceTiles: List.from(state.selected), isChecking: true);

      Future.delayed(const Duration(milliseconds: 300), () {
        state = state.copyWith(bounceTiles: [], flippingTiles: List.from(state.selected));

        Future.delayed(const Duration(milliseconds: 500), () {
          final newFound = [...state.foundCategories, matched!];
          final remaining = state.tiles.where((w) => !matched!.words.contains(w)).toList();

          final isWin = newFound.length == 4;
          state = state.copyWith(
            foundCategories: newFound,
            flippingTiles: [],
            selected: [],
            tiles: remaining,
            isChecking: false,
            gameStatus: isWin ? 'won' : 'playing',
          );

          if (isWin) {
            HapticFeedback.mediumImpact();
          }
        });
      });
    } else {
      // Wrong answer
      HapticFeedback.heavyImpact();

      // Check one away (for future "one away" hint feature)
      // ignore: unused_local_variable
      final oneAway = puzzle.categories.any((cat) {
        if (state.foundCategories.any((f) => f.name == cat.name)) return false;
        return cat.words.where((w) => state.selected.contains(w)).length == 3;
      });

      state = state.copyWith(
        shakingTiles: List.from(state.selected),
        flashWrongTiles: List.from(state.selected),
        isChecking: true,
      );

      Future.delayed(const Duration(milliseconds: 500), () {
        final newMistakes = state.mistakes + 1;
        final isLoss = newMistakes >= 4;

        state = state.copyWith(
          shakingTiles: [],
          flashWrongTiles: [],
          selected: [],
          mistakes: newMistakes,
          isChecking: false,
          gameStatus: isLoss ? 'lost' : 'playing',
        );
      });
    }
  }

  String? getOneAwayMessage() {
    if (state.selected.length != 4) return null;
    final oneAway = puzzle.categories.any((cat) {
      if (state.foundCategories.any((f) => f.name == cat.name)) return false;
      return cat.words.where((w) => state.selected.contains(w)).length == 3;
    });
    return oneAway ? 'واحد قريب! 🤏' : null;
  }

  RawabetPuzzle get puzzleData => puzzle;
}

final rawabetProvider = NotifierProvider<RawabetNotifier, RawabetState>(
  RawabetNotifier.new,
);

// --- UI ---

class RawabetScreen extends ConsumerStatefulWidget {
  const RawabetScreen({super.key});
  @override
  ConsumerState<RawabetScreen> createState() => _RawabetScreenState();
}

class _RawabetScreenState extends ConsumerState<RawabetScreen> {
  late ConfettiController _confettiController;
  String? _toast;
  bool _showResult = false;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(rawabetProvider);
    final notifier = ref.read(rawabetProvider.notifier);

    ref.listen<RawabetState>(rawabetProvider, (prev, next) {
      if (prev?.gameStatus == 'playing' && next.gameStatus == 'won') {
        _confettiController.play();
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) setState(() => _showResult = true);
        });
      }
      if (prev?.gameStatus == 'playing' && next.gameStatus == 'lost') {
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) setState(() => _showResult = true);
        });
      }
      // Show one-away toast
      if (next.flashWrongTiles.isNotEmpty && prev?.flashWrongTiles.isEmpty == true) {
        final msg = notifier.getOneAwayMessage();
        if (msg != null) {
          setState(() => _toast = msg);
          Future.delayed(const Duration(milliseconds: 1800), () {
            if (mounted) setState(() => _toast = null);
          });
        }
      }
    });

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: KalimaTheme.radialBackground),
        child: SafeArea(
          child: Stack(
          children: [
            Column(
              children: [
                _buildHeader(state),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Column(
                      children: [
                        // Found categories
                        for (final cat in state.foundCategories)
                          _FoundCategoryRow(category: cat)
                              .animate()
                              .fadeIn(duration: 400.ms)
                              .slideY(begin: -0.1, end: 0),
                        // Missed categories (lost)
                        if (state.gameStatus == 'lost')
                          for (final cat in notifier.puzzle.categories
                              .where((c) => !state.foundCategories.any((f) => f.name == c.name)))
                            _FoundCategoryRow(category: cat, dimmed: true)
                                .animate()
                                .fadeIn(duration: 400.ms),
                        // Grid
                        if (state.gameStatus == 'playing' && state.tiles.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: _buildGrid(state),
                          ),
                        const SizedBox(height: 16),
                        // Actions
                        if (state.gameStatus == 'playing')
                          _buildActions(state, notifier),
                        if (state.gameStatus != 'playing')
                          Padding(
                            padding: const EdgeInsets.only(top: 16),
                            child: SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => setState(() => _showResult = true),
                                child: const Text('عرض النتيجة'),
                              ),
                            ),
                          ),
                        const SizedBox(height: 8),
                        Text(
                          'اختر ٤ كلمات لها رابط مشترك واضغط "تحقق"',
                          style: GoogleFonts.cairo(fontSize: 12, color: KalimaTheme.textMuted),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Confetti
            Align(
              alignment: Alignment.topCenter,
              child: ConfettiWidget(
                confettiController: _confettiController,
                blastDirection: pi / 2,
                blastDirectionality: BlastDirectionality.explosive,
                colors: const [KalimaTheme.accent, KalimaTheme.correct, KalimaTheme.present, Colors.white],
              ),
            ),
            // Toast
            if (_toast != null)
              Positioned(
                bottom: 120,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          KalimaTheme.lighten(KalimaTheme.surface, 0.05),
                          KalimaTheme.surface,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      border: Border(
                        top: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 1),
                      ),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.6), blurRadius: 16, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Text(
                      _toast!,
                      style: GoogleFonts.cairo(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ).animate().fadeIn(duration: 200.ms).then().fadeOut(delay: 1400.ms, duration: 400.ms),
              ),
            // Result overlay
            if (_showResult) _buildResultOverlay(state),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildHeader(RawabetState state) {
    const maxMistakes = 4;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: KalimaTheme.border.withValues(alpha: 0.5))),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: KalimaTheme.textPrimary),
            onPressed: () => context.pop(),
          ),
          Expanded(
            child: Text(
              'روابط',
              textAlign: TextAlign.center,
              style: GoogleFonts.cairo(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: KalimaTheme.cardCoral,
                shadows: [
                  Shadow(color: KalimaTheme.cardCoral.withValues(alpha: 0.5), blurRadius: 16),
                  Shadow(color: KalimaTheme.cardCoral.withValues(alpha: 0.2), blurRadius: 32),
                ],
              ),
            ),
          ),
          Row(
            children: [
              for (var i = 0; i < maxMistakes; i++)
                Container(
                  width: 11,
                  height: 11,
                  margin: const EdgeInsets.symmetric(horizontal: 2.5),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: i < state.mistakes
                        ? KalimaTheme.cardCoral
                        : KalimaTheme.border,
                    border: i < state.mistakes ? null : Border.all(
                      color: KalimaTheme.border.withValues(alpha: 0.5),
                      width: 1,
                    ),
                    boxShadow: i < state.mistakes ? [
                      BoxShadow(
                        color: KalimaTheme.cardCoral.withValues(alpha: 0.55),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ] : null,
                  ),
                ),
              const SizedBox(width: 8),
              Icon(Icons.help_outline, color: KalimaTheme.textMuted, size: 20),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGrid(RawabetState state) {
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 1.35,
      children: state.tiles.map((word) {
        final isSelected = state.selected.contains(word);
        final isShaking = state.shakingTiles.contains(word);
        final isFlash = state.flashWrongTiles.contains(word);
        final isBounce = state.bounceTiles.contains(word);

        return GestureDetector(
          onTap: () => ref.read(rawabetProvider.notifier).toggleTile(word),
          child: AnimatedSlide(
            // Lift upward when selected
            offset: isSelected ? const Offset(0, -0.08) : Offset.zero,
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOut,
            child: AnimatedScale(
              scale: isSelected ? 1.08 : 1.0,
              duration: const Duration(milliseconds: 160),
              curve: Curves.easeOut,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeInOut,
                decoration: KalimaTheme.wordChip3D(
                  isSelected: isSelected,
                  isFlash: isFlash,
                ),
                child: Stack(
                  children: [
                    // Top gloss overlay on all chips
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        height: 18,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.white.withValues(alpha: isSelected ? 0.30 : 0.12),
                              Colors.white.withValues(alpha: 0.0),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Center(
                      child: state.flippingTiles.contains(word)
                          ? Opacity(
                              opacity: 0,
                              child: Text(
                                word,
                                textAlign: TextAlign.center,
                                style: GoogleFonts.cairo(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            )
                          : Text(
                              word,
                              textAlign: TextAlign.center,
                              style: GoogleFonts.cairo(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: isSelected
                                    ? const Color(0xFF0A0A0A)
                                    : Colors.white,
                                shadows: isSelected
                                    ? null
                                    : [
                                        Shadow(
                                          color: Colors.black.withValues(alpha: 0.5),
                                          blurRadius: 3,
                                          offset: const Offset(0, 1),
                                        ),
                                      ],
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        )
            .animate(target: isShaking ? 1 : 0)
            .shake(hz: 5, offset: const Offset(6, 0))
            .then()
            .animate(target: isBounce ? 1 : 0)
            .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 200.ms);
      }).toList(),
    );
  }

  Widget _buildActions(RawabetState state, RawabetNotifier notifier) {
    final isReady = state.selected.length == 4;
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => notifier.shuffle(),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: KalimaTheme.border.withValues(alpha: 0.8), width: 1),
              foregroundColor: KalimaTheme.textMuted,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.shuffle, size: 16),
                const SizedBox(width: 6),
                Text('خلط', style: GoogleFonts.cairo(fontSize: 14, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: OutlinedButton(
            onPressed: state.selected.isNotEmpty ? () => notifier.deselectAll() : null,
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: KalimaTheme.border.withValues(alpha: 0.8), width: 1),
              foregroundColor: KalimaTheme.textMuted,
              disabledForegroundColor: KalimaTheme.textMuted.withValues(alpha: 0.3),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: Text('إلغاء التحديد', style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 2,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: isReady
                  ? [
                      BoxShadow(
                        color: KalimaTheme.accent.withValues(alpha: 0.50),
                        blurRadius: 20,
                        spreadRadius: 2,
                        offset: const Offset(0, 4),
                      ),
                      BoxShadow(
                        color: KalimaTheme.accent.withValues(alpha: 0.22),
                        blurRadius: 36,
                        spreadRadius: 4,
                      ),
                    ]
                  : [],
            ),
            child: ElevatedButton(
              onPressed: isReady ? () => notifier.check() : null,
              style: ElevatedButton.styleFrom(
                disabledBackgroundColor: KalimaTheme.accent.withValues(alpha: 0.25),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, size: 18),
                  const SizedBox(width: 6),
                  Text('تحقق', style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResultOverlay(RawabetState state) {
    return GestureDetector(
      onTap: () => setState(() => _showResult = false),
      child: Container(
        color: Colors.black.withValues(alpha: 0.85),
        child: Center(
          child: Container(
            width: MediaQuery.of(context).size.width * 0.9,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  KalimaTheme.lighten(KalimaTheme.surface, 0.05),
                  KalimaTheme.surface,
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border(
                top: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 1),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.6),
                  blurRadius: 24,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close, color: KalimaTheme.textPrimary),
                      onPressed: () => setState(() => _showResult = false),
                    ),
                  ],
                ),
                Text(
                  state.gameStatus == 'won' ? '🎉 أحسنت!' : '😢 حظ أوفر',
                  style: GoogleFonts.cairo(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 16),
                for (final cat in ref.read(rawabetProvider.notifier).puzzle.categories)
                  _FoundCategoryRow(
                    category: cat,
                    dimmed: !state.foundCategories.any((f) => f.name == cat.name),
                  ),
                const SizedBox(height: 16),
                Text(
                  'الأخطاء: ${state.mistakes}/4',
                  style: GoogleFonts.cairo(fontSize: 16, color: KalimaTheme.textMuted),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FoundCategoryRow extends StatelessWidget {
  final RawabetCategory category;
  final bool dimmed;
  const _FoundCategoryRow({required this.category, this.dimmed = false});

  Color _bgColor() {
    switch (category.color) {
      case CategoryColor.yellow:
        return const Color(0xFFF5C842);
      case CategoryColor.green:
        return const Color(0xFF4ADE80);
      case CategoryColor.blue:
        return const Color(0xFF60A5FA);
      case CategoryColor.red:
        return const Color(0xFFF5820A);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _bgColor();
    final topColor = Color.lerp(Colors.white, color, 0.5)!;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        gradient: dimmed
            ? LinearGradient(colors: [color.withValues(alpha: 0.6), color.withValues(alpha: 0.5)])
            : LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [topColor, color, KalimaTheme.darken(color, 0.12)],
                stops: const [0.0, 0.4, 1.0],
              ),
        borderRadius: BorderRadius.circular(14),
        border: Border(
          top: BorderSide(
            color: dimmed ? Colors.transparent : Colors.white.withValues(alpha: 0.35),
            width: 1.5,
          ),
          left: BorderSide(
            color: dimmed ? Colors.transparent : Colors.white.withValues(alpha: 0.15),
            width: 1,
          ),
          right: BorderSide(color: color, width: 4),
          bottom: BorderSide(
            color: Colors.black.withValues(alpha: dimmed ? 0.1 : 0.30),
            width: 2.5,
          ),
        ),
        boxShadow: dimmed
            ? null
            : [
                BoxShadow(
                  color: color.withValues(alpha: 0.40),
                  blurRadius: 14,
                  offset: const Offset(0, 5),
                ),
                BoxShadow(
                  color: color.withValues(alpha: 0.18),
                  blurRadius: 24,
                  spreadRadius: 2,
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.25),
                  blurRadius: 8,
                  offset: const Offset(0, 6),
                ),
              ],
      ),
      child: Opacity(
        opacity: dimmed ? 0.5 : 1.0,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              category.name,
              style: GoogleFonts.cairo(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: Colors.black,
                shadows: dimmed
                    ? null
                    : [
                        Shadow(
                          color: Colors.white.withValues(alpha: 0.3),
                          blurRadius: 4,
                        ),
                      ],
              ),
            ),
            const SizedBox(height: 2),
            Text(
              category.words.join(' · '),
              style: GoogleFonts.cairo(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.black.withValues(alpha: 0.75),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
