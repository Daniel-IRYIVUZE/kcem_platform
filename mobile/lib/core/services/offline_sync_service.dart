import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'api_service.dart';

/// Queues write operations when offline and replays them on reconnect.
class OfflineSyncService {
  static const _boxName = 'sync_queue';
  static Box? _box;
  static StreamSubscription? _connectivitySub;
  static bool _isSyncing = false;

  /// Call once at app startup (after Hive.initFlutter)
  static Future<void> init() async {
    _box = await Hive.openBox(_boxName);
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
    final op = jsonEncode({'method': method, 'path': path, 'body': body, 'ts': DateTime.now().toIso8601String()});
    await box.add(op);
  }

  static int get pendingCount => _box?.length ?? 0;

  /// Replay all queued operations in order.
  static Future<void> _replayQueue() async {
    final box = _box;
    if (box == null || _isSyncing || box.isEmpty) return;
    _isSyncing = true;
    try {
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
    }
  }

  /// Force a sync attempt (call when coming online or after login)
  static Future<void> syncNow() => _replayQueue();
}
