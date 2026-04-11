
import 'dart:ui';
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
    return Stack(
      children: [
        // Decorative background orbs — colored glow blobs for depth
        IgnorePointer(
          child: Positioned.fill(
            child: Stack(
              children: [
                Positioned(
                  top: -30,
                  right: -70,
                  child: Container(
                    width: 280,
                    height: 280,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          KalimaTheme.cardTeal.withValues(alpha: 0.14),
                          KalimaTheme.cardTeal.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 200,
                  left: -90,
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          KalimaTheme.cardCoral.withValues(alpha: 0.11),
                          KalimaTheme.cardCoral.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 40,
                  right: -50,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          KalimaTheme.accent.withValues(alpha: 0.07),
                          KalimaTheme.accent.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Main scrollable content
        SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            children: [
              const SizedBox(height: 28),
              // Title with glow shadow
              Container(
                decoration: BoxDecoration(
                  boxShadow: [
                    BoxShadow(
                      color: KalimaTheme.accent.withValues(alpha: 0.3),
                      blurRadius: 30,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color(0xFFFFFFFF),
                      Color(0xFFEEFFCC),
                      Color(0xFFCCFF00),
                      Color(0xFFFFFFDD),
                    ],
                    stops: [0.0, 0.3, 0.65, 1.0],
                  ).createShader(bounds),
                  child: Text(
                    'كلمة',
                    style: GoogleFonts.cairo(
                      fontSize: 56,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      shadows: const [
                        Shadow(color: Colors.black, blurRadius: 8, offset: Offset(0, 4)),
                      ],
                    ),
                  ),
                ),
              )
                  .animate()
                  .fadeIn(duration: 500.ms)
                  .scale(begin: const Offset(0.85, 0.85), end: const Offset(1.0, 1.0), duration: 600.ms, curve: Curves.elasticOut),
              const SizedBox(height: 6),
              Text(
                'ألعاب كلمات يومية',
                style: GoogleFonts.cairo(
                  fontSize: 15,
                  color: KalimaTheme.textMuted,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
              const SizedBox(height: 44),
              // Game cards
              _GameCard(
                title: 'حروف',
                subtitle: 'خمّن الكلمة المخفية',
                icon: Icons.text_fields_rounded,
                color: KalimaTheme.cardTeal,
                badge: 'حزورة #${_getPuzzleNumber()}',
                onTap: () => context.push('/hurouf'),
              )
                  .animate()
                  .fadeIn(duration: 500.ms, curve: Curves.easeOut)
                  .slideY(begin: 0.25, end: 0, duration: 650.ms, curve: Curves.elasticOut),
              const SizedBox(height: 18),
              _GameCard(
                title: 'روابط',
                subtitle: 'صنّف الكلمات إلى مجموعات',
                icon: Icons.grid_view_rounded,
                color: KalimaTheme.cardCoral,
                badge: 'تحدي يومي',
                onTap: () => context.push('/rawabet'),
              )
                  .animate(delay: 100.ms)
                  .fadeIn(duration: 500.ms, curve: Curves.easeOut)
                  .slideY(begin: 0.25, end: 0, duration: 650.ms, curve: Curves.elasticOut),
              const SizedBox(height: 18),
              _GameCard(
                title: 'قريباً',
                subtitle: 'ألعاب جديدة في الطريق',
                icon: Icons.lock_outline_rounded,
                color: KalimaTheme.surface,
                badge: null,
                onTap: null,
              )
                  .animate(delay: 200.ms)
                  .fadeIn(duration: 500.ms, curve: Curves.easeOut)
                  .slideY(begin: 0.25, end: 0, duration: 650.ms, curve: Curves.elasticOut),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
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
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: KalimaTheme.background.withValues(alpha: 0.82),
            border: Border(
              top: BorderSide(
                color: KalimaTheme.border.withValues(alpha: 0.6),
                width: 0.5,
              ),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: NavigationBar(
            backgroundColor: Colors.transparent,
            indicatorColor: KalimaTheme.accent.withValues(alpha: 0.18),
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
        ),
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
      onTapUp: widget.onTap != null
          ? (_) {
              setState(() => _pressed = false);
              widget.onTap!();
            }
          : null,
      onTapCancel: widget.onTap != null ? () => setState(() => _pressed = false) : null,
      child: AnimatedScale(
        scale: _pressed ? 0.93 : 1.0,
        duration: const Duration(milliseconds: 100),
        curve: Curves.easeOut,
        child: Container(
          height: 155,
          decoration: KalimaTheme.gameCardDecoration(widget.color, isLocked: isLocked),
          child: Stack(
            children: [
              // Diagonal gloss streak — specular reflection
              if (!isLocked)
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: const Alignment(0.4, 0.9),
                          colors: [
                            Colors.white.withValues(alpha: 0.22),
                            Colors.white.withValues(alpha: 0.08),
                            Colors.white.withValues(alpha: 0.0),
                          ],
                          stops: const [0.0, 0.3, 0.7],
                        ),
                      ),
                    ),
                  ),
                ),
              // Specular spot highlight
              if (!isLocked)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                    child: Container(
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.white.withValues(alpha: 0.12),
                            Colors.white.withValues(alpha: 0.0),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(22),
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
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                              color: isLocked ? KalimaTheme.textMuted : Colors.white,
                              letterSpacing: -0.5,
                              shadows: isLocked
                                  ? null
                                  : const [
                                      Shadow(
                                        color: Colors.black,
                                        blurRadius: 8,
                                        offset: Offset(0, 3),
                                      ),
                                    ],
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            widget.subtitle,
                            style: GoogleFonts.cairo(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isLocked
                                  ? KalimaTheme.textMuted
                                  : Colors.white.withValues(alpha: 0.88),
                              shadows: isLocked
                                  ? null
                                  : [
                                      Shadow(
                                        color: Colors.black.withValues(alpha: 0.4),
                                        blurRadius: 4,
                                      ),
                                    ],
                            ),
                          ),
                          if (widget.badge != null && !isLocked) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.35),
                                borderRadius: BorderRadius.circular(10),
                                border: Border(
                                  top: BorderSide(
                                    color: Colors.white.withValues(alpha: 0.16),
                                    width: 1,
                                  ),
                                  bottom: BorderSide(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    width: 1,
                                  ),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Text(
                                widget.badge!,
                                style: GoogleFonts.cairo(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Icon container with layered glow
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: isLocked
                                ? null
                                : LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      Colors.white.withValues(alpha: 0.22),
                                      Colors.white.withValues(alpha: 0.08),
                                    ],
                                  ),
                            color: isLocked
                                ? Colors.white.withValues(alpha: 0.04)
                                : null,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: isLocked ? 0.04 : 0.20),
                              width: 1.5,
                            ),
                            boxShadow: isLocked
                                ? null
                                : [
                                    BoxShadow(
                                      color: widget.color.withValues(alpha: 0.45),
                                      blurRadius: 20,
                                    ),
                                    BoxShadow(
                                      color: Colors.white.withValues(alpha: 0.10),
                                      blurRadius: 8,
                                      offset: const Offset(0, -2),
                                    ),
                                  ],
                          ),
                          child: Icon(
                            widget.icon,
                            size: 34,
                            color: isLocked ? KalimaTheme.textMuted : Colors.white,
                            shadows: isLocked
                                ? null
                                : [
                                    Shadow(
                                      color: Colors.black.withValues(alpha: 0.4),
                                      blurRadius: 6,
                                    ),
                                  ],
                          ),
                        ),
                        if (!isLocked) ...[
                          const SizedBox(height: 8),
                          Icon(
                            Icons.chevron_left_rounded,
                            color: Colors.white.withValues(alpha: 0.6),
                            size: 20,
                          ),
                        ],
                      ],
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
