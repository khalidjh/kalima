import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإعدادات'),
        backgroundColor: KalimaTheme.background,
        elevation: 2,
      ),
      body: Container(
        decoration: BoxDecoration(gradient: KalimaTheme.radialBackground),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SettingsSection(title: 'عام', children: [
                _SettingsTile(
                  icon: Icons.dark_mode,
                  title: 'الوضع الداكن',
                  subtitle: 'مفعّل دائماً',
                  trailing: Switch(
                    value: true,
                    onChanged: null,
                    activeThumbColor: KalimaTheme.accent,
                  ),
                ),
                _SettingsTile(
                  icon: Icons.notifications,
                  title: 'الإشعارات',
                  subtitle: 'تذكير باللغز اليومي',
                  trailing: Switch(
                    value: false,
                    onChanged: (v) {},
                    activeThumbColor: KalimaTheme.accent,
                  ),
                ),
                _SettingsTile(
                  icon: Icons.language,
                  title: 'اللغة',
                  subtitle: 'العربية',
                  trailing: const Icon(Icons.chevron_left, color: KalimaTheme.textMuted),
                ),
              ]),
              const SizedBox(height: 24),
              _SettingsSection(title: 'حول', children: [
                _SettingsTile(
                  icon: Icons.info,
                  title: 'كلمة',
                  subtitle: 'الإصدار 1.0.0',
                  trailing: const SizedBox.shrink(),
                ),
                _SettingsTile(
                  icon: Icons.favorite,
                  title: 'صُنع بـ ❤️',
                  subtitle: 'منصة ألعاب كلمات عربية',
                  trailing: const SizedBox.shrink(),
                ),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _SettingsSection({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 12, right: 4),
          child: Text(
            title,
            style: GoogleFonts.cairo(fontSize: 14, fontWeight: FontWeight.w700, color: KalimaTheme.accent.withValues(alpha: 0.8)),
          ),
        ),
        Container(
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
          child: Column(children: children),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget trailing;
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: KalimaTheme.accent.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: KalimaTheme.accent, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white)),
                Text(subtitle, style: GoogleFonts.cairo(fontSize: 13, color: KalimaTheme.textMuted)),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }
}
