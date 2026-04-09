import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/theme.dart';
import 'features/home/home_screen.dart';
import 'features/hurouf/hurouf_screen.dart';
import 'features/rawabet/rawabet_screen.dart';
import 'features/stats/stats_screen.dart';
import 'features/settings/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);
  runApp(const ProviderScope(child: KalimaApp()));
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomeScreen(), routes: [
      GoRoute(path: 'hurouf', builder: (context, state) => const HuroufScreen()),
      GoRoute(path: 'rawabet', builder: (context, state) => const RawabetScreen()),
      GoRoute(path: 'stats', builder: (context, state) => const StatsScreen()),
      GoRoute(path: 'settings', builder: (context, state) => const SettingsScreen()),
    ]),
  ],
);

class KalimaApp extends StatelessWidget {
  const KalimaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'كلمة',
      debugShowCheckedModeBanner: false,
      theme: KalimaTheme.darkTheme,
      routerConfig: _router,
      locale: const Locale('ar'),
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
