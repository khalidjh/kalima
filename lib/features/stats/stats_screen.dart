import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class StatsScreen extends StatelessWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإحصائيات'),
        backgroundColor: KalimaTheme.background,
        elevation: 2,
      ),
      body: Container(
        decoration: BoxDecoration(gradient: KalimaTheme.radialBackground),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overview stats
            Center(
              child: Text(
                'إحصائياتك',
                style: GoogleFonts.cairo(fontSize: 24, fontWeight: FontWeight.w900, color: KalimaTheme.accent),
              ),
            ).animate().fadeIn(duration: 400.ms),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _StatCard(value: '0', label: 'ألعاب', icon: Icons.games),
                _StatCard(value: '0%', label: 'فوز', icon: Icons.emoji_events),
                _StatCard(value: '0', label: 'التتابع', icon: Icons.local_fire_department),
                _StatCard(value: '0', label: 'أفضل', icon: Icons.star),
              ],
            ).animate().fadeIn(duration: 600.ms, delay: 200.ms).slideY(begin: 0.1, end: 0),
            const SizedBox(height: 32),
            // Guess distribution
            Text(
              'توزيع التخمينات — حروف',
              style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 12),
            for (var i = 1; i <= 6; i++)
              _GuessBar(guessNumber: i, count: 0, maxCount: 1, isCurrent: false)
                  .animate(delay: Duration(milliseconds: i * 100))
                  .fadeIn(duration: 300.ms)
                  .slideX(begin: -0.1, end: 0),
            const SizedBox(height: 32),
            // Calendar placeholder
            Text(
              'نشاطك هذا الشهر',
              style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 12),
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: KalimaTheme.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: KalimaTheme.border.withValues(alpha: 0.5)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  'ابدأ اللعب لتظهر إحصائياتك هنا',
                  style: GoogleFonts.cairo(fontSize: 14, color: KalimaTheme.textMuted),
                ),
              ),
            ).animate().fadeIn(duration: 600.ms, delay: 400.ms),
          ],
        ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  const _StatCard({required this.value, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      decoration: BoxDecoration(
        color: KalimaTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: KalimaTheme.border.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: KalimaTheme.accent, size: 20),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
          Text(label, style: GoogleFonts.cairo(fontSize: 11, color: KalimaTheme.textMuted)),
        ],
      ),
    );
  }
}

class _GuessBar extends StatelessWidget {
  final int guessNumber;
  final int count;
  final int maxCount;
  final bool isCurrent;
  const _GuessBar({
    required this.guessNumber,
    required this.count,
    required this.maxCount,
    required this.isCurrent,
  });

  @override
  Widget build(BuildContext context) {
    final pct = maxCount > 0 ? (count / maxCount * 100).round().clamp(8, 100) : 8;
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          SizedBox(
            width: 20,
            child: Text('$guessNumber', style: GoogleFonts.cairo(fontSize: 14, color: KalimaTheme.textMuted)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              height: 22,
              decoration: BoxDecoration(
                color: KalimaTheme.absent.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Align(
                alignment: Alignment.centerRight,
                child: FractionallySizedBox(
                  widthFactor: pct / 100,
                  child: Container(
                    decoration: BoxDecoration(
                      color: isCurrent ? KalimaTheme.correct : KalimaTheme.borderFilled,
                      borderRadius: BorderRadius.circular(6),
                      boxShadow: [
                        BoxShadow(
                          color: (isCurrent ? KalimaTheme.correct : KalimaTheme.borderFilled).withValues(alpha: 0.4),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: count > 0
                        ? Text('$count', style: GoogleFonts.cairo(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white))
                        : null,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
