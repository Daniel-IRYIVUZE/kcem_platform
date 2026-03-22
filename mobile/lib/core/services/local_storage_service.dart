// Local storage service using shared_preferences for persistent data:
// - Auth session (persist logged-in user across app restarts)
// - Theme mode (light / dark preference)

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class LocalStorageService {
  LocalStorageService._();
  static final LocalStorageService instance = LocalStorageService._();

  static const _kUserData = 'auth_user_data';
  static const _kThemeMode = 'theme_mode';
  static const _kHasSeenOnboarding = 'has_seen_onboarding';
  static const _kLastSync = 'last_api_sync_ts'; // Unix ms timestamp

  late SharedPreferences _prefs;
  bool _initialized = false;

  // ── Init ─────────────────────────────────────────────────────────────────

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _initialized = true;
  }

  SharedPreferences get _p {
    if (!_initialized) throw StateError('LocalStorageService.init() not called');
    return _prefs;
  }

  // ── Auth ─────────────────────────────────────────────────────────────────

  // Only persist user session locally, never from database
  Future<void> saveUser(AppUser user) async {
    await _p.setString(_kUserData, jsonEncode(user.toMap()));
  }

  AppUser? loadUser() {
    final raw = _p.getString(_kUserData);
    if (raw == null) return null;
    try {
      return AppUser.fromMap(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearUser() async {
    await _p.remove(_kUserData);
  }

  // ── Onboarding ────────────────────────────────────────────────────────────

  bool get hasSeenOnboarding => _p.getBool(_kHasSeenOnboarding) ?? false;

  Future<void> markOnboardingSeen() async {
    await _p.setBool(_kHasSeenOnboarding, true);
  }

  // ── Theme ─────────────────────────────────────────────────────────────────

  String loadTheme() => _p.getString(_kThemeMode) ?? 'light';

  Future<void> saveTheme(String mode) async {
    await _p.setString(_kThemeMode, mode);
  }

  // ── Sync timestamp (24-hour cache validity) ────────────────────────────────

  /// Records the current time as the last successful backend sync.
  Future<void> markSynced() async {
    await _p.setInt(_kLastSync, DateTime.now().millisecondsSinceEpoch);
  }

  /// Returns true if cached data is still within the 24-hour window.
  bool get isCacheValid {
    final ts = _p.getInt(_kLastSync);
    if (ts == null) return false;
    return DateTime.now().millisecondsSinceEpoch - ts < const Duration(hours: 24).inMilliseconds;
  }

  /// When was data last synced (null if never).
  DateTime? get lastSyncTime {
    final ts = _p.getInt(_kLastSync);
    if (ts == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(ts);
  }
}
