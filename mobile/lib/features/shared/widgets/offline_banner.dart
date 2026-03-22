import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/offline_sync_service.dart';

/// A banner that reflects the current network state.
///
/// When [showOnlineState] is true (default: false), the widget also renders
/// a green "Online" badge instead of being invisible while connected — useful
/// on the login page so users always see their connectivity status.
class OfflineBanner extends StatefulWidget {
  final bool showOnlineState;
  const OfflineBanner({super.key, this.showOnlineState = false});

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner> {
  bool _isOffline = false;
  bool _isSyncing = false;
  Timer? _syncTimer;
  StreamSubscription? _connectivitySub;

  @override
  void initState() {
    super.initState();
    _checkConnectivity();
    _connectivitySub = Connectivity().onConnectivityChanged.listen((result) {
      final wasOffline = _isOffline;
      if (mounted) setState(() => _isOffline = result == ConnectivityResult.none);
      if (wasOffline && !_isOffline && OfflineSyncService.pendingCount > 0) {
        _startSync();
      }
    });
    // Subscribe to sync state changes from OfflineSyncService
    OfflineSyncService.onSyncStateChanged = () {
      if (mounted) setState(() => _isSyncing = OfflineSyncService.isSyncing);
    };
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
    _connectivitySub?.cancel();
    // Only clear the callback if we set it (avoid clobbering another widget)
    OfflineSyncService.onSyncStateChanged = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Determine what state to show
    final isSync = !_isOffline && _isSyncing;
    final isOnlineClean = !_isOffline && !_isSyncing;

    // When online and calm: only render if caller wants the "Online" badge
    if (isOnlineClean && !widget.showOnlineState) return const SizedBox.shrink();

    late Color color;
    late Color bg;
    late Color border;
    late IconData icon;
    late String msg;

    if (isSync) {
      color = const Color(0xFF065F46);
      bg = const Color(0xFFD1FAE5);
      border = const Color(0xFF6EE7B7);
      icon = Icons.sync;
      msg = 'Back online — syncing ${OfflineSyncService.pendingCount} pending action(s)…';
    } else if (_isOffline) {
      color = const Color(0xFFD97706);
      bg = const Color(0xFFFEF3C7);
      border = const Color(0xFFFDE68A);
      icon = Icons.wifi_off;
      msg = 'You\'re offline — changes will sync when connected';
    } else {
      // Online clean state — shown only when showOnlineState == true
      color = const Color(0xFF065F46);
      bg = const Color(0xFFD1FAE5);
      border = const Color(0xFF6EE7B7);
      icon = Icons.wifi;
      msg = 'Online';
    }

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
          if (isSync)
            SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2, color: color),
            )
          else
            Icon(icon, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              msg,
              style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500),
            ),
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
