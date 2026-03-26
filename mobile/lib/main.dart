import 'dart:async';
import 'dart:ui' as ui;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/services/notification_service.dart';
import 'core/services/local_storage_service.dart';
import 'core/services/offline_sync_service.dart';
import 'core/providers/app_providers.dart';

void main() {
  // Queue lifecycle messages instead of discarding them — must happen before
  // WidgetsFlutterBinding.ensureInitialized() so engine events fired at
  // startup are buffered until runApp registers the real listener.
  ui.channelBuffers.resize('flutter/lifecycle', 100);

  // runZonedGuarded catches errors that escape Flutter's error handler,
  // including hot-restart artifacts (font-loading futures resolving after
  // the Dart state is torn down) and SchedulerBinding timing issues on web.
  runZonedGuarded(_init, (error, stack) {
    // Suppress known hot-restart / binding-init race conditions.
    final msg = error.toString();
    if (msg.contains('Binding has not yet been initialized') ||
        msg.contains('SchedulerBinding') ||
        msg.contains('ServicesBinding')) {
      return;
    }
    debugPrint('Uncaught error: $error\n$stack');
  });
}

Future<void> _init() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Suppress known hot-restart binding race errors that are reported via
  // FlutterError.onError (not caught by runZonedGuarded).
  final originalOnError = FlutterError.onError;
  FlutterError.onError = (details) {
    final msg = details.exceptionAsString();
    if (msg.contains('Binding has not yet been initialized') ||
        msg.contains('SchedulerBinding') ||
        msg.contains('ServicesBinding')) {
      return;
    }
    originalOnError?.call(details);
  };

  // Initialize Hive for offline storage
  await Hive.initFlutter();

  // Initialize offline sync queue (must be after Hive.initFlutter)
  await OfflineSyncService.init();

  // Initialize local (shared_preferences) storage — must be before runApp
  // so ThemeNotifier and AuthNotifier can read persisted values synchronously.
  await LocalStorageService.instance.init();

  // Initialize local notifications
  await NotificationService.instance.init();

  // Set preferred orientations (mobile only — throws on web)
  if (!kIsWeb) {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );
  }

  runApp(const ProviderScope(child: EcotradeApp()));
}

class EcotradeApp extends ConsumerWidget {
  const EcotradeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'Ecotrade',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
