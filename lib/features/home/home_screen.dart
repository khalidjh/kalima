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
          const SizedBox(height: 24),
          // Title with layered glow
          Stack(
            alignment: Alignment.center,
            children: [
              // Glow layer
              Text(
                'كلمة',
                style: GoogleFonts.cairo(
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                  foreground: Paint()
                    ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20)
                    ..color = KalimaTheme.accent.withValues(alpha: 0.3),
                ),
              ),
              // Main text with shadow depth
              Text(
                'كلمة',
                style: GoogleFonts.cairo(
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  shadows: [
                    Shadow(
                      color: KalimaTheme.accent.withValues(alpha: 0.5),
                      blurRadius: 30,
                    ),
                    const Shadow(
                      color: Colors.black,
                      blurRadius: 4,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'ألعاب كلمات يومية',
            style: GoogleFonts.cairo(
              fontSize: 15,
              color: KalimaTheme.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 40),
          // Game cards with premium 3D elevation
          _GameCard(
            title: 'حروف',
            subtitle: 'خمّن الكلمة المخفية',
            icon: Icons.text_fields_rounded,
            color: KalimaTheme.cardTeal,
            badge: 'حزورة #${_getPuzzleNumber()}',
            onTap: () => context.push('/hurouf'),
          )
              .animate()
              .fadeIn(duration: 600.ms, curve: Curves.easeOut)
              .slideY(begin: 0.15, end: 0, duration: 700.ms, curve: Curves.elasticOut),
          const SizedBox(height: 16),
          _GameCard(
            title: 'روابط',
            subtitle: 'صنّف الكلمات إلى مجموعات',
            icon: Icons.grid_view_rounded,
            color: KalimaTheme.cardCoral,
            badge: 'تحدي يومي',
            onTap: () => context.push('/rawabet'),
          )
              .animate(delay: 120.ms)
              .fadeIn(duration: 600.ms, curve: Curves.easeOut)
              .slideY(begin: 0.15, end: 0, duration: 700.ms, curve: Curves.elasticOut),
          const SizedBox(height: 16),
          _GameCard(
            title: 'قريباً',
            subtitle: 'ألعاب جديدة في الطريق',
            icon: Icons.lock_outline_rounded,
            color: KalimaTheme.surface,
            badge: null,
            onTap: null,
          )
              .animate(delay: 240.ms)
              .fadeIn(duration: 600.ms, curve: Curves.easeOut)
              .slideY(begin: 0.15, end: 0, duration: 700.ms, curve: Curves.elasticOut),
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
        color: KalimaTheme.surface.withValues(alpha: 0.92),
        border: Border(top: BorderSide(color: KalimaTheme.border.withValues(alpha: 0.5), width: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
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
        scale: _pressed ? 0.95 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          height: 140,
          decoration: KalimaTheme.gameCardDecoration(widget.color, isLocked: isLocked),
          child: Stack(
            children: [
              // Gloss overlay on active cards
              if (!isLocked)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: const Alignment(0.5, 1.0),
                        colors: [
                          Colors.white.withValues(alpha: 0.15),
                          Colors.white.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
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
                              fontSize: 30,
                              fontWeight: FontWeight.w900,
                              color: isLocked ? KalimaTheme.textMuted : Colors.white,
                              shadows: isLocked ? null : [
                                Shadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 4, offset: const Offset(0, 2)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.subtitle,
                            style: GoogleFonts.cairo(
                              fontSize: 13,
                              color: isLocked
                                  ? KalimaTheme.textMuted
                                  : Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                          if (widget.badge != null && !isLocked) ...[
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.1),
                                  width: 0.5,
                                ),
                              ),
                              child: Text(
                                widget.badge!,
                                style: GoogleFonts.cairo(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    // Icon with glow ring
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: isLocked ? 0.05 : 0.12),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: isLocked ? 0.03 : 0.15),
                          width: 1,
                        ),
                        boxShadow: isLocked ? null : [
                          BoxShadow(
                            color: widget.color.withValues(alpha: 0.3),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: Icon(
                        widget.icon,
                        size: 32,
                        color: isLocked
                            ? KalimaTheme.textMuted
                            : Colors.white,
                        shadows: isLocked ? null : [
                          Shadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 4),
                        ],
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
