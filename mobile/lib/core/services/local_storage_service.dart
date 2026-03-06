// Local storage service using shared_preferences for persistent data:
// - Auth session (persist logged-in user across app restarts)
// - Theme mode (light / dark preference)
// - CRUD: user-created listings, bids, registered users

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class LocalStorageService {
  LocalStorageService._();
  static final LocalStorageService instance = LocalStorageService._();

  static const _kUserData = 'auth_user_data';
  static const _kThemeMode = 'theme_mode';
  static const _kUserListings = 'user_listings';
  static const _kUserBids = 'user_bids';
  static const _kRegisteredUsers = 'registered_users';
  static const _kHasSeenOnboarding = 'has_seen_onboarding';

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

  // ── Registered users (signup → future login) ───────────────────────────

  Future<void> saveRegisteredUser(Map<String, dynamic> userData) async {
    final list = loadRegisteredUsers();
    list.removeWhere((u) => u['email'] == userData['email']);
    list.add(userData);
    await _p.setString(_kRegisteredUsers, jsonEncode(list));
  }

  List<Map<String, dynamic>> loadRegisteredUsers() {
    final raw = _p.getString(_kRegisteredUsers);
    if (raw == null) return [];
    try {
      return (jsonDecode(raw) as List)
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    } catch (_) {
      return [];
    }
  }

  /// Returns AppUser if email+password match a registered (signed-up) user.
  AppUser? loginRegisteredUser(String email, String password) {
    final users = loadRegisteredUsers();
    final match = users.where(
      (u) => u['email'] == email && u['password'] == password,
    );
    if (match.isEmpty) return null;
    try {
      return AppUser.fromMap(match.first);
    } catch (_) {
      return null;
    }
  }

  // ── Listings CRUD ─────────────────────────────────────────────────────────

  List<WasteListing> loadListings() {
    final raw = _p.getString(_kUserListings);
    if (raw == null) return [];
    try {
      return (jsonDecode(raw) as List)
          .map((e) => WasteListing.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> saveListings(List<WasteListing> listings) async {
    await _p.setString(_kUserListings, jsonEncode(listings.map((l) => l.toJson()).toList()));
  }

  // ── Bids CRUD ─────────────────────────────────────────────────────────────

  List<Bid> loadBids() {
    final raw = _p.getString(_kUserBids);
    if (raw == null) return [];
    try {
      return (jsonDecode(raw) as List)
          .map((e) => Bid.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> saveBids(List<Bid> bids) async {
    await _p.setString(_kUserBids, jsonEncode(bids.map((b) => b.toJson()).toList()));
  }
}
