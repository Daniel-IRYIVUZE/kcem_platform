import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'api_service.dart';

/// Queues write operations when offline and replays them on reconnect.
/// Queued actions expire after [_ttl] (24 hours) and are purged automatically.
class OfflineSyncService {
  static const _boxName = 'sync_queue';
  static const _ttl = Duration(hours: 24);
  static Box? _box;
  static StreamSubscription? _connectivitySub;
  static bool _isSyncing = false;

  // Callback to notify UI when sync state changes (set by OfflineBanner)
  static void Function()? onSyncStateChanged;

  /// Call once at app startup (after Hive.initFlutter).
  /// Safe to call multiple times (e.g. on hot restart) — cancels any
  /// existing connectivity subscription before creating a new one.
  static Future<void> init() async {
    await _connectivitySub?.cancel();
    _connectivitySub = null;
    _isSyncing = false;

    _box = await Hive.openBox(_boxName);
    _purgeExpired(); // clean up stale entries from previous sessions
    _connectivitySub = Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        _replayQueue();
      }
    });
  }

  static Future<void> dispose() async {
    await _connectivitySub?.cancel();
    await _box?.close();
  }

  /// Queue a write operation for offline replay.
  /// [method]: 'POST', 'PATCH', 'PUT', 'DELETE'
  /// [path]: relative API path, e.g. '/collections/5/advance'
  /// [body]: JSON-encodable map, or null
  static Future<void> queue(String method, String path, [Map<String, dynamic>? body]) async {
    final box = _box;
    if (box == null) return;
    final op = jsonEncode({
      'method': method,
      'path': path,
      'body': body,
      'ts': DateTime.now().toIso8601String(),
    });
    await box.add(op);
  }

  /// Number of pending operations not yet synced to the backend.
  static int get pendingCount {
    final box = _box;
    if (box == null) return 0;
    // Count only non-expired entries
    int count = 0;
    for (final key in box.keys) {
      final raw = box.get(key);
      if (raw == null) continue;
      try {
        final op = jsonDecode(raw as String) as Map<String, dynamic>;
        final ts = DateTime.tryParse(op['ts'] as String? ?? '');
        if (ts != null && DateTime.now().difference(ts) < _ttl) count++;
      } catch (_) {}
    }
    return count;
  }

  /// Remove queued operations that are older than 24 hours.
  static Future<void> _purgeExpired() async {
    final box = _box;
    if (box == null) return;
    final keysToDelete = <dynamic>[];
    for (final key in box.keys) {
      final raw = box.get(key);
      if (raw == null) {
        keysToDelete.add(key);
        continue;
      }
      try {
        final op = jsonDecode(raw as String) as Map<String, dynamic>;
        final ts = DateTime.tryParse(op['ts'] as String? ?? '');
        if (ts == null || DateTime.now().difference(ts) >= _ttl) {
          keysToDelete.add(key);
        }
      } catch (_) {
        keysToDelete.add(key);
      }
    }
    for (final key in keysToDelete) {
      await box.delete(key);
    }
  }

  /// Replay all queued operations in order. Expired entries are dropped first.
  static Future<void> _replayQueue() async {
    final box = _box;
    if (box == null || _isSyncing || box.isEmpty) return;
    _isSyncing = true;
    onSyncStateChanged?.call();
    try {
      await _purgeExpired();
      final keys = box.keys.toList();
      for (final key in keys) {
        final raw = box.get(key);
        if (raw == null) continue;
        final op = jsonDecode(raw as String) as Map<String, dynamic>;
        final method = op['method'] as String;
        final path = op['path'] as String;
        final body = op['body'] as Map<String, dynamic>?;
        bool success = false;
        try {
          if (method == 'POST') {
            await ApiService.post(path, body: body ?? {});
            success = true;
          } else if (method == 'PATCH') {
            await ApiService.patch(path, body: body ?? {});
            success = true;
          } else if (method == 'PUT') {
            await ApiService.put(path, body: body ?? {});
            success = true;
          } else if (method == 'DELETE') {
            await ApiService.delete(path);
            success = true;
          }
        } catch (_) {
          // Leave in queue to retry next time
        }
        if (success) await box.delete(key);
      }
    } finally {
      _isSyncing = false;
      onSyncStateChanged?.call();
    }
  }

  /// Force a sync attempt (call when coming online or after login)
  static Future<void> syncNow() => _replayQueue();

  /// Returns true if a sync is currently in progress.
  static bool get isSyncing => _isSyncing;
}
