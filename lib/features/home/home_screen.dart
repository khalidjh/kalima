import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: KalimaTheme.radialBackground),
        child: SafeArea(
          child: _currentIndex == 0
              ? _buildHomeContent()
              : _currentIndex == 1
                  ? _buildStatsPlaceholder()
                  : _buildSettingsPlaceholder(),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildHomeContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Logo with glow
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: KalimaTheme.accent.withValues(alpha: 0.3),
                  blurRadius: 60,
                  spreadRadius: 20,
                ),
              ],
            ),
            child: Text(
              'كلمة',
              style: GoogleFonts.cairo(
                fontSize: 52,
                fontWeight: FontWeight.w900,
                color: KalimaTheme.accent,
                shadows: [
                  Shadow(
                    color: KalimaTheme.accent.withValues(alpha: 0.6),
                    blurRadius: 40,
                  ),
                ],
              ),
            ),
          )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .shimmer(duration: const Duration(seconds: 2), color: KalimaTheme.accent.withValues(alpha: 0.3)),
          const SizedBox(height: 4),
          Text(
            'ألعاب كلمات يومية',
            style: GoogleFonts.cairo(
              fontSize: 16,
              color: KalimaTheme.textMuted,
              shadows: [
                Shadow(
                  color: Colors.black.withValues(alpha: 0.5),
                  blurRadius: 8,
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
          // Game cards
          _PremiumGameCard(
            title: 'حروف',
            subtitle: 'خمّن الكلمة المخفية',
            icon: Icons.text_fields_rounded,
            color: KalimaTheme.correct,
            score: 'حزورة #${_getPuzzleNumber()}',
            onTap: () => context.push('/hurouf'),
          ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),
          _PremiumGameCard(
            title: 'روابط',
            subtitle: 'صنّف الكلمات إلى مجموعات',
            icon: Icons.grid_view_rounded,
            color: KalimaTheme.present,
            score: 'تحدي يومي',
            onTap: () => context.push('/rawabet'),
          ).animate(delay: 150.ms).fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),
          _PremiumGameCard(
            title: 'قريباً',
            subtitle: 'ألعاب جديدة في الطريق',
            icon: Icons.lock_outline_rounded,
            color: KalimaTheme.absent,
            onTap: null,
          ).animate(delay: 300.ms).fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
        ],
      ),
    );
  }

  int _getPuzzleNumber() {
    final now = DateTime.now();
    final epoch = DateTime(2025, 1, 1);
    return now.difference(epoch).inDays + 1;
  }

  Widget _buildStatsPlaceholder() {
    WidgetsBinding.instance.addPostFrameCallback((_) => context.push('/stats'));
    return const Center(child: CircularProgressIndicator(color: KalimaTheme.accent));
  }

  Widget _buildSettingsPlaceholder() {
    WidgetsBinding.instance.addPostFrameCallback((_) => context.push('/settings'));
    return const Center(child: CircularProgressIndicator(color: KalimaTheme.accent));
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [KalimaTheme.surface, Color(0xFF0F0F1A)],
        ),
        border: Border(top: BorderSide(color: KalimaTheme.border, width: 1)),
      ),
      child: NavigationBar(
        backgroundColor: Colors.transparent,
        indicatorColor: KalimaTheme.accent.withValues(alpha: 0.15),
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: [
          NavigationDestination(
            icon: Icon(Icons.home_outlined, color: KalimaTheme.textMuted),
            selectedIcon: Icon(Icons.home_rounded, color: KalimaTheme.accent),
            label: 'الرئيسية',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined, color: KalimaTheme.textMuted),
            selectedIcon: Icon(Icons.bar_chart_rounded, color: KalimaTheme.accent),
            label: 'الإحصائيات',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined, color: KalimaTheme.textMuted),
            selectedIcon: Icon(Icons.settings_rounded, color: KalimaTheme.accent),
            label: 'الإعدادات',
          ),
        ],
      ),
    );
  }
}

class _PremiumGameCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String? score;
  final VoidCallback? onTap;

  const _PremiumGameCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    this.score,
    this.onTap,
  });

  @override
  State<_PremiumGameCard> createState() => _PremiumGameCardState();
}

class _PremiumGameCardState extends State<_PremiumGameCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final isLocked = widget.onTap == null;
    return GestureDetector(
      onTapDown: widget.onTap != null ? (_) => setState(() => _pressed = true) : null,
      onTapUp: widget.onTap != null ? (_) { setState(() => _pressed = false); widget.onTap!(); } : null,
      onTapCancel: widget.onTap != null ? () => setState(() => _pressed = false) : null,
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 150,
          decoration: KalimaTheme.gameCardDecoration(widget.color, isLocked: isLocked),
          child: Stack(
            children: [
              // Gloss overlay
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.center,
                    colors: [
                      Colors.white.withValues(alpha: 0.06),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
              // Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            widget.title,
                            style: GoogleFonts.cairo(
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              color: isLocked ? KalimaTheme.textMuted : Colors.white,
                              shadows: [
                                Shadow(
                                  color: widget.color.withValues(alpha: 0.4),
                                  blurRadius: 12,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.subtitle,
                            style: GoogleFonts.cairo(
                              fontSize: 14,
                              color: KalimaTheme.textMuted,
                            ),
                          ),
                          if (widget.score != null && !isLocked) ...[
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    widget.color.withValues(alpha: 0.3),
                                    widget.color.withValues(alpha: 0.1),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                widget.score!,
                                style: GoogleFonts.cairo(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: widget.color,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            widget.color.withValues(alpha: isLocked ? 0.1 : 0.3),
                            widget.color.withValues(alpha: 0.05),
                          ],
                        ),
                      ),
                      child: Icon(
                        widget.icon,
                        size: 36,
                        color: widget.color.withValues(alpha: isLocked ? 0.3 : 0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
