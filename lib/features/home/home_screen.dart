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
        color: KalimaTheme.background,
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
          const SizedBox(height: 24),
          // Clean title — no glow, no shimmer
          Text(
            'كلمة',
            style: GoogleFonts.cairo(
              fontSize: 48,
              fontWeight: FontWeight.w900,
              color: KalimaTheme.accent,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'ألعاب كلمات يومية',
            style: GoogleFonts.cairo(
              fontSize: 15,
              color: KalimaTheme.textMuted,
            ),
          ),
          const SizedBox(height: 36),
          // Game cards
          _GameCard(
            title: 'حروف',
            subtitle: 'خمّن الكلمة المخفية',
            icon: Icons.text_fields_rounded,
            color: KalimaTheme.correct,
            badge: 'حزورة #${_getPuzzleNumber()}',
            onTap: () => context.push('/hurouf'),
          ).animate().fadeIn(duration: 400.ms),
          const SizedBox(height: 12),
          _GameCard(
            title: 'روابط',
            subtitle: 'صنّف الكلمات إلى مجموعات',
            icon: Icons.grid_view_rounded,
            color: KalimaTheme.present,
            badge: 'تحدي يومي',
            onTap: () => context.push('/rawabet'),
          ).animate(delay: 100.ms).fadeIn(duration: 400.ms),
          const SizedBox(height: 12),
          _GameCard(
            title: 'قريباً',
            subtitle: 'ألعاب جديدة في الطريق',
            icon: Icons.lock_outline_rounded,
            color: KalimaTheme.absent,
            onTap: null,
          ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
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
        color: KalimaTheme.surface,
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

class _GameCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String? badge;
  final VoidCallback? onTap;

  const _GameCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    this.badge,
    this.onTap,
  });

  @override
  State<_GameCard> createState() => _GameCardState();
}

class _GameCardState extends State<_GameCard> {
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
        child: Container(
          height: 130,
          decoration: BoxDecoration(
            color: KalimaTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: isLocked
                ? Border.all(color: KalimaTheme.border, width: 1)
                : Border.all(color: widget.color.withValues(alpha: 0.5), width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
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
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: isLocked ? KalimaTheme.textMuted : Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.subtitle,
                        style: GoogleFonts.cairo(
                          fontSize: 13,
                          color: KalimaTheme.textMuted,
                        ),
                      ),
                      if (widget.badge != null && !isLocked) ...[
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: widget.color.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            widget.badge!,
                            style: GoogleFonts.cairo(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
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
                    color: widget.color.withValues(alpha: isLocked ? 0.08 : 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    widget.icon,
                    size: 28,
                    color: widget.color.withValues(alpha: isLocked ? 0.3 : 0.9),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
