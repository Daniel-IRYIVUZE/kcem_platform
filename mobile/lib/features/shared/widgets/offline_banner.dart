import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/offline_sync_service.dart';

class OfflineBanner extends StatefulWidget {
  const OfflineBanner({super.key});

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner> {
  bool _isOffline = false;
  bool _isSyncing = false;
  Timer? _syncTimer;

  @override
  void initState() {
    super.initState();
    _checkConnectivity();
    Connectivity().onConnectivityChanged.listen((result) {
      final wasOffline = _isOffline;
      setState(() => _isOffline = result == ConnectivityResult.none);
      if (wasOffline && !_isOffline && OfflineSyncService.pendingCount > 0) {
        _startSync();
      }
    });
  }

  Future<void> _checkConnectivity() async {
    final result = await Connectivity().checkConnectivity();
    if (mounted) setState(() => _isOffline = result == ConnectivityResult.none);
  }

  Future<void> _startSync() async {
    if (!mounted) return;
    setState(() => _isSyncing = true);
    await OfflineSyncService.syncNow();
    _syncTimer?.cancel();
    _syncTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isSyncing = false);
    });
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isOffline && !_isSyncing) return const SizedBox.shrink();

    final isSync = !_isOffline && _isSyncing;
    final color = isSync ? const Color(0xFF065F46) : const Color(0xFFD97706);
    final bg = isSync ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7);
    final border = isSync ? const Color(0xFF6EE7B7) : const Color(0xFFFDE68A);
    final icon = isSync ? Icons.sync : Icons.wifi_off;
    final msg = isSync
        ? 'Back online — syncing ${OfflineSyncService.pendingCount} pending action(s)…'
        : 'You\'re offline — changes will sync when connected';

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          isSync
              ? SizedBox(
                  width: 18, height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: color),
                )
              : Icon(icon, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(msg, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

class OfflineIndicatorIcon extends StatelessWidget {
  const OfflineIndicatorIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Offline mode — data cached locally',
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: AppColors.accentLight,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(
          Icons.cloud_off_outlined,
          color: AppColors.accent,
          size: 18,
        ),
      ),
    );
  }
}
