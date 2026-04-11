import 'dart:math';
import 'package:vector_math/vector_math_64.dart' show Vector3;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:confetti/confetti.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/theme.dart';
import '../../core/words.dart';
import '../../core/rawabet_data.dart' show getPuzzleNumber;

enum LetterState { correct, present, absent, empty, tbd }

// --- Game Logic ---

class HuroufState {
  final List<String> guesses;
  final String answer;
  final String currentGuess;
  final String gameStatus; // playing, won, lost
  final bool shakeCurrentRow;
  final bool revealComplete;
  final int? winningRow;

  const HuroufState({
    this.guesses = const [],
    required this.answer,
    this.currentGuess = '',
    this.gameStatus = 'playing',
    this.shakeCurrentRow = false,
    this.revealComplete = true,
    this.winningRow,
  });

  HuroufState copyWith({
    List<String>? guesses,
    String? currentGuess,
    String? gameStatus,
    bool? shakeCurrentRow,
    bool? revealComplete,
    int? winningRow,
  }) =>
      HuroufState(
        guesses: guesses ?? this.guesses,
        answer: answer,
        currentGuess: currentGuess ?? this.currentGuess,
        gameStatus: gameStatus ?? this.gameStatus,
        shakeCurrentRow: shakeCurrentRow ?? this.shakeCurrentRow,
        revealComplete: revealComplete ?? this.revealComplete,
        winningRow: winningRow ?? this.winningRow,
      );
}

List<LetterState> evaluateGuess(String guess, String answer) {
  final gc = guess.runes.toList();
  final ac = answer.runes.toList();
  final result = List<LetterState>.filled(5, LetterState.absent);
  final counts = <int, int>{};

  for (var i = 0; i < 5; i++) {
    if (gc[i] == ac[i]) {
      result[i] = LetterState.correct;
    } else {
      counts[ac[i]] = (counts[ac[i]] ?? 0) + 1;
    }
  }
  for (var i = 0; i < 5; i++) {
    if (result[i] == LetterState.correct) continue;
    if (counts[gc[i]] != null && counts[gc[i]]! > 0) {
      result[i] = LetterState.present;
      counts[gc[i]] = counts[gc[i]]! - 1;
    }
  }
  return result;
}

Map<String, LetterState> getKeyboardStates(List<String> guesses, String answer) {
  final states = <String, LetterState>{};
  for (final guess in guesses) {
    final eval = evaluateGuess(guess, answer);
    final chars = guess.runes.toList();
    for (var i = 0; i < chars.length; i++) {
      final letter = String.fromCharCode(chars[i]);
      final current = states[letter];
      final next = eval[i];
      if (current == LetterState.correct) continue;
      if (next == LetterState.correct) {
        states[letter] = LetterState.correct;
      } else if (next == LetterState.present) {
        states[letter] = LetterState.present;
      } else if (current == null) {
        states[letter] = LetterState.absent;
      }
    }
  }
  return states;
}

class HuroufNotifier extends Notifier<HuroufState> {
  @override
  HuroufState build() => HuroufState(
    answer: _getTodaysAnswer(),
  );

  static String _getTodaysAnswer() {
    final n = getPuzzleNumber();
    return answerWords[(n - 1) % answerWords.length];
  }

  void onKey(String key) {
    if (state.gameStatus != 'playing') return;
    if (!state.revealComplete) return;
    if (state.currentGuess.runes.length < 5) {
      HapticFeedback.lightImpact();
      state = state.copyWith(currentGuess: state.currentGuess + key);
    }
  }

  void onDelete() {
    if (state.gameStatus != 'playing') return;
    if (state.currentGuess.isNotEmpty) {
      HapticFeedback.lightImpact();
      state = state.copyWith(
        currentGuess: state.currentGuess.runes
            .take(state.currentGuess.runes.length - 1)
            .map((r) => String.fromCharCode(r))
            .join(),
      );
    }
  }

  void onEnter() {
    if (state.gameStatus != 'playing' || !state.revealComplete) return;
    final guess = state.currentGuess;
    if (guess.runes.length != 5) {
      // Shake to indicate incomplete
      state = state.copyWith(shakeCurrentRow: true);
      HapticFeedback.heavyImpact();
      Future.delayed(const Duration(milliseconds: 500), () {
        state = state.copyWith(shakeCurrentRow: false);
      });
      return;
    }

    // Check if valid word (for now, accept any 5-letter Arabic string)
    if (!validGuesses.contains(guess) && !answerWords.contains(guess)) {
      state = state.copyWith(shakeCurrentRow: true);
      HapticFeedback.heavyImpact();
      Future.delayed(const Duration(milliseconds: 500), () {
        state = state.copyWith(shakeCurrentRow: false);
      });
      return;
    }

    final newGuesses = [...state.guesses, guess];
    final isWin = guess == state.answer;
    final isLoss = newGuesses.length >= 6 && !isWin;

    state = state.copyWith(
      currentGuess: '',
      guesses: newGuesses,
      shakeCurrentRow: false,
      revealComplete: false,
      gameStatus: isWin ? 'won' : isLoss ? 'lost' : 'playing',
      winningRow: isWin ? newGuesses.length - 1 : null,
    );

    // After reveal animation completes
    final revealMs = 5 * 300 + 300;
    Future.delayed(Duration(milliseconds: revealMs), () {
      if (isWin) {
        HapticFeedback.mediumImpact();
      }
      state = state.copyWith(revealComplete: true);
    });
  }
}

final huroufProvider = NotifierProvider<HuroufNotifier, HuroufState>(
  HuroufNotifier.new,
);

// --- UI ---

class HuroufScreen extends ConsumerStatefulWidget {
  const HuroufScreen({super.key});
  @override
  ConsumerState<HuroufScreen> createState() => _HuroufScreenState();
}

class _HuroufScreenState extends ConsumerState<HuroufScreen> {
  late ConfettiController _confettiController;
  bool _showStatsModal = false;
  // ignore: unused_field
  final bool _revealed = false;

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
    final gameState = ref.watch(huroufProvider);

    ref.listen<HuroufState>(huroufProvider, (prev, next) {
      if (prev?.gameStatus == 'playing' && next.gameStatus == 'won' && next.revealComplete) {
        _confettiController.play();
        HapticFeedback.mediumImpact();
        Future.delayed(const Duration(milliseconds: 1800), () {
          if (mounted) setState(() => _showStatsModal = true);
        });
      }
      if (prev?.gameStatus == 'playing' && next.gameStatus == 'lost' && next.revealComplete) {
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) setState(() => _showStatsModal = true);
        });
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
                _buildHeader(gameState),
                Expanded(child: _buildBoard(gameState)),
                _buildKeyboard(gameState),
                const SizedBox(height: 8),
              ],
            ),
            Align(
              alignment: Alignment.topCenter,
              child: ConfettiWidget(
                confettiController: _confettiController,
                blastDirection: pi / 2,
                blastDirectionality: BlastDirectionality.explosive,
                colors: const [KalimaTheme.accent, KalimaTheme.correct, KalimaTheme.present, Colors.white],
              ),
            ),
              if (_showStatsModal)
                _StatsModal(
                  state: gameState,
                  onClose: () => setState(() => _showStatsModal = false),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(HuroufState state) {
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
              'حروف',
              textAlign: TextAlign.center,
              style: GoogleFonts.cairo(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: KalimaTheme.cardTeal,
                shadows: [
                  Shadow(color: KalimaTheme.cardTeal.withValues(alpha: 0.5), blurRadius: 16),
                  Shadow(color: KalimaTheme.cardTeal.withValues(alpha: 0.2), blurRadius: 32),
                ],
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.bar_chart_rounded, color: KalimaTheme.textPrimary),
            onPressed: () => setState(() => _showStatsModal = true),
          ),
        ],
      ),
    );
  }

  Widget _buildBoard(HuroufState state) {
    final rows = <_RowData>[];

    // Completed guesses
    for (var i = 0; i < state.guesses.length; i++) {
      final chars = state.guesses[i].runes.map((r) => String.fromCharCode(r)).toList();
      final eval = evaluateGuess(state.guesses[i], state.answer);
      rows.add(_RowData(
        letters: chars,
        states: eval,
        animate: true,
        isShaking: false,
        isWinRow: state.winningRow == i,
      ));
    }

    // Current guess row
    if (state.guesses.length < 6 && state.gameStatus == 'playing') {
      final chars = state.currentGuess.runes.map((r) => String.fromCharCode(r)).toList();
      final letters = List.generate(5, (i) => i < chars.length ? chars[i] : '');
      final st = List.generate(5, (i) => chars.length > i ? LetterState.tbd : LetterState.empty);
      rows.add(_RowData(
        letters: letters,
        states: st,
        animate: false,
        isShaking: state.shakeCurrentRow,
        isWinRow: false,
      ));
    }

    // Empty rows
    while (rows.length < 6) {
      rows.add(_RowData(
        letters: List.filled(5, ''),
        states: List.filled(5, LetterState.empty),
        animate: false,
        isShaking: false,
        isWinRow: false,
      ));
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < rows.length; i++)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: _TileRow(data: rows[i], rowIndex: i),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildKeyboard(HuroufState state) {
    final keyStates = getKeyboardStates(state.guesses, state.answer);
    final disabled = state.gameStatus != 'playing' || !state.revealComplete;

    const row1 = ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'];
    const row2 = ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك'];
    const row3 = ['ذ', 'د', 'ز', 'ر', 'و', 'ط', 'ظ'];
    const row4 = ['ة', 'ى', 'إ', 'أ', 'آ', 'ء', 'ئ', 'ؤ'];

    final notifier = ref.read(huroufProvider.notifier);

    Widget buildKey(String letter, {double flex = 1}) {
      final st = keyStates[letter];
      Color bg = const Color(0xFF20203E);
      Color fg = Colors.white;
      bool isAbsent = false;

      if (st == LetterState.correct) {
        bg = KalimaTheme.correct;
      } else if (st == LetterState.present) {
        bg = KalimaTheme.present;
      } else if (st == LetterState.absent) {
        bg = const Color(0xFF111124);
        fg = const Color(0xFF3A3A58);
        isAbsent = true;
      }

      return Expanded(
        flex: (flex * 10).round(),
        child: Padding(
          padding: const EdgeInsets.all(2),
          child: _KeyButton(
            onTap: disabled ? null : () {
              HapticFeedback.lightImpact();
              notifier.onKey(letter);
            },
            child: Container(
              height: 50,
              decoration: isAbsent
                  ? KalimaTheme.keyDecorationFlat(bg)
                  : KalimaTheme.keyDecoration(bg),
              child: Stack(
                children: [
                  // Top gloss on non-absent keys
                  if (!isAbsent)
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        height: 20,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(9)),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.white.withValues(alpha: 0.18),
                              Colors.white.withValues(alpha: 0.0),
                            ],
                          ),
                        ),
                      ),
                    ),
                  Center(
                    child: Text(
                      letter,
                      style: GoogleFonts.cairo(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: fg,
                        shadows: isAbsent ? null : [
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
      );
    }

    Widget buildActionKey(String label, VoidCallback onTap, {Color? bg}) {
      final isEnter = label == 'إدخال';
      final keyBg = bg ?? KalimaTheme.surface;
      return Expanded(
        flex: 16,
        child: Padding(
          padding: const EdgeInsets.all(2),
          child: _KeyButton(
            onTap: disabled ? null : onTap,
            child: Container(
              height: 50,
              decoration: KalimaTheme.keyDecoration(keyBg),
              child: Stack(
                children: [
                  // Top gloss
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 20,
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(9)),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.white.withValues(alpha: isEnter ? 0.25 : 0.15),
                            Colors.white.withValues(alpha: 0.0),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Center(
                    child: Text(
                      label,
                      style: GoogleFonts.cairo(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: isEnter ? const Color(0xFF0A0A0A) : KalimaTheme.textPrimary,
                        shadows: [
                          Shadow(
                            color: Colors.black.withValues(alpha: 0.4),
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
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(children: row1.map((l) => buildKey(l)).toList()),
          const SizedBox(height: 2),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(children: row2.map((l) => buildKey(l)).toList()),
          ),
          const SizedBox(height: 2),
          Row(children: [
            buildActionKey('إدخال', () => notifier.onEnter(), bg: KalimaTheme.accent),
            ...row3.map((l) => buildKey(l)),
            buildActionKey('حذف', () => notifier.onDelete()),
          ]),
          const SizedBox(height: 2),
          Row(children: row4.map((l) => buildKey(l)).toList()),
        ],
      ),
    );
  }
}

// Stateful keyboard key with pressed visual feedback
class _KeyButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;

  const _KeyButton({required this.child, this.onTap});

  @override
  State<_KeyButton> createState() => _KeyButtonState();
}

class _KeyButtonState extends State<_KeyButton> {
  bool _pressed = false;

  void _handlePress() {
    if (widget.onTap == null) return;
    setState(() => _pressed = true);
    widget.onTap!();
    Future.delayed(const Duration(milliseconds: 120), () {
      if (mounted) setState(() => _pressed = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onTap != null ? (_) => _handlePress() : null,
      child: AnimatedScale(
        scale: _pressed ? 0.86 : 1.0,
        duration: const Duration(milliseconds: 70),
        curve: Curves.easeOut,
        child: widget.child,
      ),
    );
  }
}

class _RowData {
  final List<String> letters;
  final List<LetterState> states;
  final bool animate;
  final bool isShaking;
  final bool isWinRow;
  const _RowData({
    required this.letters,
    required this.states,
    required this.animate,
    required this.isShaking,
    required this.isWinRow,
  });
}

class _TileRow extends StatelessWidget {
  final _RowData data;
  final int rowIndex;
  const _TileRow({required this.data, required this.rowIndex});

  @override
  Widget build(BuildContext context) {
    Widget row = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (var i = 0; i < 5; i++)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: _Tile(
              letter: data.letters[i],
              state: data.states[i],
              animate: data.animate,
              delay: i * 300,
              isWinBounce: data.isWinRow,
              winDelay: 600 + i * 100,
            ),
          ),
      ],
    );

    if (data.isShaking) {
      row = _ShakeAnimation(child: row);
    }

    return row;
  }
}

class _Tile extends StatefulWidget {
  final String letter;
  final LetterState state;
  final bool animate;
  final int delay;
  final bool isWinBounce;
  final int winDelay;

  const _Tile({
    required this.letter,
    required this.state,
    this.animate = false,
    this.delay = 0,
    this.isWinBounce = false,
    this.winDelay = 0,
  });

  @override
  State<_Tile> createState() => _TileState();
}

class _TileState extends State<_Tile> with TickerProviderStateMixin {
  late AnimationController _flipController;
  late AnimationController _popController;
  late Animation<double> _popScale;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _popController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _popScale = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.18), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 1.18, end: 0.94), weight: 30),
      TweenSequenceItem(tween: Tween(begin: 0.94, end: 1.0), weight: 30),
    ]).animate(CurvedAnimation(parent: _popController, curve: Curves.easeOut));

    if (widget.animate && widget.state != LetterState.empty && widget.state != LetterState.tbd) {
      Future.delayed(Duration(milliseconds: widget.delay), () {
        if (mounted) {
          _flipController.forward();
        }
      });
    }
  }

  @override
  void didUpdateWidget(covariant _Tile old) {
    super.didUpdateWidget(old);
    if (widget.animate && !old.animate && widget.state != LetterState.empty) {
      Future.delayed(Duration(milliseconds: widget.delay), () {
        if (mounted) _flipController.forward();
      });
    }
    // Pop animation when letter is typed
    if (widget.letter.isNotEmpty && old.letter.isEmpty && widget.state == LetterState.tbd) {
      _popController.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _flipController.dispose();
    _popController.dispose();
    super.dispose();
  }

  Color _getColor() {
    switch (widget.state) {
      case LetterState.correct:
        return KalimaTheme.correct;
      case LetterState.present:
        return KalimaTheme.present;
      case LetterState.absent:
        return KalimaTheme.absent;
      case LetterState.tbd:
        return KalimaTheme.surface;
      case LetterState.empty:
        return Colors.transparent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tileSize = (MediaQuery.of(context).size.width - 24 - 30) / 5;

    final isRevealed = widget.state == LetterState.correct ||
        widget.state == LetterState.present ||
        widget.state == LetterState.absent;

    Widget tile = Container(
      width: tileSize,
      height: tileSize,
      decoration: KalimaTheme.tile3D(
        color: _getColor(),
        isRevealed: isRevealed,
        hasLetter: widget.letter.isNotEmpty,
      ),
      child: Stack(
        children: [
          // Gloss light reflection overlay
          if (isRevealed || widget.letter.isNotEmpty)
            Positioned.fill(
              child: Container(decoration: KalimaTheme.tileGlossOverlay),
            ),
          // Specular spot highlight on revealed tiles
          if (isRevealed)
            Positioned.fill(
              child: Container(decoration: KalimaTheme.tileSpecularSpot),
            ),
          Center(
            child: Text(
              widget.letter,
              style: GoogleFonts.cairo(
                fontSize: tileSize * 0.46,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                shadows: [
                  Shadow(
                    color: Colors.black.withValues(alpha: isRevealed ? 0.6 : 0.35),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    // Letter pop animation on type
    if (widget.state == LetterState.tbd) {
      tile = ScaleTransition(scale: _popScale, child: tile);
    }

    // Flip animation on reveal
    if (widget.animate && widget.state != LetterState.empty && widget.state != LetterState.tbd) {
      tile = AnimatedBuilder(
        animation: _flipController,
        builder: (context, child) {
          final angle = _flipController.value * pi;
          final scaleY = cos(angle).abs();
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()..scaleByVector3(Vector3(1.0, scaleY, 1.0)),
            child: child,
          );
        },
        child: tile,
      );
    }

    // Win bounce with elastic curve — more dramatic
    if (widget.isWinBounce) {
      tile = tile
          .animate()
          .scale(
            begin: const Offset(1.0, 1.0),
            end: const Offset(1.28, 1.28),
            duration: 280.ms,
            delay: Duration(milliseconds: widget.winDelay),
            curve: Curves.easeOut,
          )
          .then()
          .scale(
            begin: const Offset(1.28, 1.28),
            end: const Offset(1.0, 1.0),
            duration: 420.ms,
            curve: Curves.elasticOut,
          );
    }

    return tile;
  }
}

class _ShakeAnimation extends StatefulWidget {
  final Widget child;
  const _ShakeAnimation({required this.child});
  @override
  State<_ShakeAnimation> createState() => _ShakeAnimationState();
}

class _ShakeAnimationState extends State<_ShakeAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final offset = sin(_controller.value * pi * 4) * 8;
        return Transform.translate(offset: Offset(offset, 0), child: child);
      },
      child: widget.child,
    );
  }
}

// Stats Modal
class _StatsModal extends StatelessWidget {
  final HuroufState state;
  final VoidCallback onClose;
  const _StatsModal({required this.state, required this.onClose});

  @override
  Widget build(BuildContext context) {
    // Simple stats for now — would be persisted in production
    final gamesPlayed = state.gameStatus != 'playing' ? 1 : 0;
    final gamesWon = state.gameStatus == 'won' ? 1 : 0;
    final winPct = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).round() : 0;

    return GestureDetector(
      onTap: onClose,
      child: Container(
        color: Colors.black.withValues(alpha: 0.85),
        child: Center(
          child: GestureDetector(
            onTap: () {},
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
                        onPressed: onClose,
                      ),
                    ],
                  ),
                  Text(
                    'الإحصائيات',
                    style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _statBox('$gamesPlayed', 'لُعبت'),
                      _statBox('$winPct', '% فوز'),
                      _statBox('0', 'التتابع'),
                      _statBox('0', 'أفضل تتابع'),
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (state.gameStatus == 'won')
                    Text('🎉 أحسنت!', style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.bold, color: KalimaTheme.correct)),
                  if (state.gameStatus == 'lost')
                    Column(
                      children: [
                        Text('الإجابة كانت:', style: GoogleFonts.cairo(fontSize: 16, color: KalimaTheme.textMuted)),
                        const SizedBox(height: 4),
                        Text(state.answer, style: GoogleFonts.cairo(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      ],
                    ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        final emoji = _generateShareEmoji(state);
                        SharePlus.instance.share(ShareParams(text: emoji));
                      },
                      child: const Text('مشاركة 📤'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _statBox(String value, String label) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.cairo(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
        Text(label, style: GoogleFonts.cairo(fontSize: 12, color: KalimaTheme.textMuted)),
      ],
    );
  }

  String _generateShareEmoji(HuroufState state) {
    final n = getPuzzleNumber();
    final buffer = StringBuffer('كلمة حروف #$n ');
    if (state.gameStatus == 'won') {
      buffer.write('${state.guesses.length}/6\n');
    } else {
      buffer.write('X/6\n');
    }
    for (final guess in state.guesses) {
      final eval = evaluateGuess(guess, state.answer);
      for (final s in eval) {
        switch (s) {
          case LetterState.correct:
            buffer.write('🟩');
          case LetterState.present:
            buffer.write('🟨');
          case LetterState.absent:
            buffer.write('⬛');
          default:
            buffer.write('⬜');
        }
      }
      buffer.write('\n');
    }
    return buffer.toString();
  }
}

class StarPath extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final points = <Offset>[];

    for (int i = 0; i < 10; i++) {
      final angle = (i * 36 - 90) * pi / 180;
      final r = i % 2 == 0 ? radius : radius * 0.4;
      points.add(Offset(
        center.dx + r * cos(angle),
        center.dy + r * sin(angle),
      ));
    }

    final path = Path();
    path.addPolygon(points, true);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
