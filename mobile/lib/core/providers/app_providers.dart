import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/notification_service.dart';
import '../services/local_storage_service.dart';
import '../services/offline_sync_service.dart';

// ── Theme Provider ─────────────────────────────────────────────────────────

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier()
      : super(LocalStorageService.instance.loadTheme() == 'dark'
            ? ThemeMode.dark
            : ThemeMode.light);

  bool get isDark => state == ThemeMode.dark;

  void toggle() {
    final next = state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    state = next;
    LocalStorageService.instance.saveTheme(next == ThemeMode.dark ? 'dark' : 'light');
  }

  void setDark(bool dark) {
    state = dark ? ThemeMode.dark : ThemeMode.light;
    LocalStorageService.instance.saveTheme(dark ? 'dark' : 'light');
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>(
  (ref) => ThemeNotifier(),
);

// ── Auth Provider ──────────────────────────────────────────────────────────

class AuthState {
  final AppUser? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isLoggedIn => user != null;
  UserRole? get role => user?.role;

  AuthState copyWith({AppUser? user, bool? isLoading, String? error, bool clearError = false}) =>
      AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier()
      : super(AuthState(user: LocalStorageService.instance.loadUser()));

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);

    // ── Check connectivity before attempting API call ────────────────────────
    final connectivity = await Connectivity().checkConnectivity();
    final isOffline = connectivity == ConnectivityResult.none;

    if (isOffline) {
      // Offline login: restore cached session if the email matches
      final cached = LocalStorageService.instance.loadUser();
      if (cached != null && cached.email.toLowerCase() == email.toLowerCase()) {
        state = AuthState(user: cached);
        return true;
      }
      state = const AuthState(
        error: 'You are offline. Please connect to the internet to sign in '
            'for the first time, or use the same account previously logged in '
            'on this device.',
      );
      return false;
    }

    // ── Online: authenticate against the backend ─────────────────────────────
    try {
      final response = await ApiService.login(email, password);
      Map<String, dynamic> userMap;
      if (response['user'] is Map<String, dynamic>) {
        userMap = response['user'] as Map<String, dynamic>;
      } else {
        final me = await ApiService.getCurrentUser();
        userMap = me;
      }
      var user = AppUser(
        id: (userMap['id'] as int).toString(),
        name: userMap['full_name'] as String? ?? email,
        email: userMap['email'] as String? ?? email,
        phone: userMap['phone'] as String? ?? '',
        role: _mapRole(userMap['role'] as String? ?? 'business'),
        verified: userMap['is_verified'] as bool? ?? false,
        greenScore: 0,
      );

      // Enrich user with role-specific profile data
      try {
        if (user.role == UserRole.business) {
          final hotelData = await ApiService.getMyHotel();
          user = user.copyWith(
            businessName: hotelData['hotel_name'] as String?,
            greenScore: (hotelData['green_score'] as num?)?.toInt() ?? 0,
          );
        } else if (user.role == UserRole.recycler) {
          final recyclerData = await ApiService.getMyRecycler();
          user = user.copyWith(
            companyName: recyclerData['company_name'] as String?,
            greenScore: (recyclerData['green_score'] as num?)?.toInt() ?? 0,
          );
        } else if (user.role == UserRole.driver) {
          final driverData = await ApiService.getMyDriver();
          user = user.copyWith(
            rating: (driverData['rating'] as num?)?.toDouble() ?? 0.0,
          );
        }
      } catch (_) {
        // Profile fetch failed — continue with basic user data
      }

      // Persist session and mark cache as fresh (24-hour validity)
      await LocalStorageService.instance.saveUser(user);
      await LocalStorageService.instance.markSynced();

      // Replay any pending offline actions now that we are authenticated
      OfflineSyncService.syncNow();

      state = AuthState(user: user);
      return true;
    } on ApiException catch (e) {
      final message = e.message.trim();
      state = AuthState(error: message.isEmpty ? 'Login failed. Please try again.' : message);
      return false;
    } catch (_) {
      state = const AuthState(error: 'Login failed. Check your credentials and connection.');
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String role,
    String? businessName,
    String? address,
    double? latitude,
    double? longitude,
    String? tinNumber,
    String? licenseNumber,
    String? hotelName,
    String? companyName,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      // Register user account
      await ApiService.register({
        'full_name': name,
        'email': email,
        'phone': phone,
        'password': password,
        'role': role,
      });
      // Log in to get tokens
      final loginResp = await ApiService.login(email, password);
      final userMap = loginResp['user'] as Map<String, dynamic>;
      var user = AppUser(
        id: (userMap['id'] as int).toString(),
        name: userMap['full_name'] as String? ?? name,
        email: userMap['email'] as String? ?? email,
        phone: userMap['phone'] as String? ?? phone,
        role: _mapRole(userMap['role'] as String? ?? role),
        verified: userMap['is_verified'] as bool? ?? false,
        greenScore: 0,
        businessName: businessName,
      );

      // Create role-specific profile
      try {
        final effectiveAddress = address?.isNotEmpty == true ? address! : 'Kigali, Rwanda';
        if (role == 'business') {
          final hotelData = await ApiService.createMyHotel({
            'hotel_name': hotelName?.isNotEmpty == true ? hotelName! : businessName ?? name,
            'address': effectiveAddress,
            if (latitude != null) 'latitude': latitude,
            if (longitude != null) 'longitude': longitude,
            if (tinNumber?.isNotEmpty == true) 'tin_number': tinNumber,
          });
          user = user.copyWith(
            businessName: hotelData['hotel_name'] as String?,
            greenScore: (hotelData['green_score'] as num?)?.toInt() ?? 0,
          );
        } else if (role == 'recycler') {
          final recyclerData = await ApiService.createMyRecycler({
            'company_name': companyName?.isNotEmpty == true ? companyName! : businessName ?? name,
            'address': effectiveAddress,
            if (latitude != null) 'latitude': latitude,
            if (longitude != null) 'longitude': longitude,
            if (tinNumber?.isNotEmpty == true) 'tin_number': tinNumber,
            if (licenseNumber?.isNotEmpty == true) 'license_number': licenseNumber,
          });
          user = user.copyWith(
            companyName: recyclerData['company_name'] as String?,
            greenScore: (recyclerData['green_score'] as num?)?.toInt() ?? 0,
          );
        }
      } catch (_) {
        // Profile creation failed — user can complete it in settings
      }

      await LocalStorageService.instance.saveUser(user);
      await LocalStorageService.instance.markOnboardingSeen();
      state = AuthState(user: user);
      return true;
    } on ApiException catch (e) {
      state = AuthState(error: e.message);
      return false;
    } catch (_) {
      state = const AuthState(error: 'Registration failed. Please check your connection and try again.');
      return false;
    }
  }

  Future<void> logout() async {
    await LocalStorageService.instance.clearUser();
    state = const AuthState();
  }

  UserRole _mapRole(String role) {
    switch (role) {
      case 'admin':
        return UserRole.admin;
      case 'business':
      case 'hotel':
        return UserRole.business;
      case 'recycler':
        return UserRole.recycler;
      case 'driver':
        return UserRole.driver;
      case 'individual':
        return UserRole.individual;
      default:
        return UserRole.business;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);

// ── API Data Mapping Helpers ──────────────────────────────────────────────

WasteType _mapWasteType(String s) {
  switch (s.toLowerCase()) {
    case 'uco':
      return WasteType.uco;
    case 'glass':
      return WasteType.glass;
    case 'paper/cardboard':
    case 'paper_cardboard':
    case 'paper':
      return WasteType.paperCardboard;
    case 'plastic':
      return WasteType.plastic;
    case 'metal':
      return WasteType.metal;
    case 'organic':
      return WasteType.organic;
    case 'electronic':
      return WasteType.electronic;
    case 'textile':
      return WasteType.textile;
    case 'other':
      return WasteType.other;
    default:
      return WasteType.mixed;
  }
}

ListingStatus _mapListingStatus(String s) {
  switch (s.toLowerCase()) {
    case 'open':
      return ListingStatus.open;
    case 'accepting':
    case 'assigned':
      return ListingStatus.assigned;
    case 'collected':
      return ListingStatus.collected;
    case 'completed':
      return ListingStatus.completed;
    case 'expired':
      return ListingStatus.expired;
    case 'cancelled':
      return ListingStatus.cancelled;
    case 'draft':
      return ListingStatus.draft;
    default:
      return ListingStatus.open;
  }
}

CollectionStatus _mapCollectionStatus(String s) {
  switch (s.toLowerCase()) {
    case 'scheduled':
      return CollectionStatus.scheduled;
    case 'accepted':
    case 'assigned':
    case 'en_route':
    case 'arrived':
    case 'confirmed':
      return CollectionStatus.enRoute;
    case 'collected':
      return CollectionStatus.collected;
    case 'verified':
      return CollectionStatus.verified;
    case 'completed':
      return CollectionStatus.completed;
    case 'failed':
    case 'cancelled':
      return CollectionStatus.missed;
    default:
      return CollectionStatus.missed;
  }
}

/// Extracts photo URLs from a listing API response.
/// Handles both `images` (array of {id, url, is_primary}) and `image_url` (single string).
List<String> _extractListingPhotos(Map<String, dynamic> j) {
  // Prefer the `images` array (full image objects from the backend)
  final images = j['images'];
  if (images is List && images.isNotEmpty) {
    final urls = images
        .whereType<Map>()
        .map((img) => img['url'] as String? ?? '')
        .where((url) => url.isNotEmpty)
        .toList();
    if (urls.isNotEmpty) return urls;
  }
  // Fall back to single image_url field
  final imageUrl = j['image_url'] as String?;
  if (imageUrl != null && imageUrl.isNotEmpty) return [imageUrl];
  return [];
}

WasteListing _listingFromApi(Map<String, dynamic> j) {
  return WasteListing(
    id: (j['id'] as int).toString(),
    businessId: (j['hotel_id'] as int? ?? 0).toString(),
    businessName: j['hotel_name'] as String? ?? 'Hotel',
    wasteType: _mapWasteType(j['waste_type'] as String? ?? 'mixed'),
    volume: (j['volume'] as num? ?? 0).toDouble(),
    unit: j['unit'] as String? ?? 'kg',
    quality: _mapWasteQuality(j['quality'] as String? ?? ''),
    photos: _extractListingPhotos(j),
    minBid: (j['min_bid'] as num? ?? j['minBid'] as num? ?? 0).toDouble(),
    status: _mapListingStatus(j['status'] as String? ?? 'open'),
    location: j['address'] as String? ?? j['location'] as String? ?? '',
    latitude: (j['latitude'] as num?)?.toDouble(),
    longitude: (j['longitude'] as num?)?.toDouble(),
    createdAt: j['created_at'] != null
        ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
        : DateTime.now(),
    collectionDate: j['collection_window_start'] != null
        ? DateTime.tryParse(j['collection_window_start'] as String)
        : null,
    description: j['description'] as String?,
    notes: j['notes'] as String?,
  );
}

WasteQuality _mapWasteQuality(String s) {
  switch (s.toLowerCase()) {
    case 'a': return WasteQuality.a;
    case 'b': return WasteQuality.b;
    case 'c': return WasteQuality.c;
    default:  return WasteQuality.a;
  }
}

Collection _collectionFromApi(Map<String, dynamic> j) {
  return Collection(
    id: (j['id'] as int).toString(),
    listingId: (j['listing_id'] as int? ?? 0).toString(),
    businessName: j['hotel_name'] as String? ?? '',
    businessAddress: (j['hotel_address'] as String?) ?? (j['location'] as String?),
    recyclerName: j['recycler_name'] as String? ?? '',
    driverName: j['driver_name'] as String?,
    driverId: j['driver_id'] != null ? (j['driver_id'] as int).toString() : null,
    wasteType: _mapWasteType(j['waste_type'] as String? ?? 'mixed'),
    volume: (j['actual_volume'] as num? ?? j['volume'] as num? ?? 0).toDouble(),
    status: _mapCollectionStatus(j['status'] as String? ?? 'scheduled'),
    scheduledDate: j['scheduled_date'] != null
        ? DateTime.tryParse(j['scheduled_date'] as String) ?? DateTime.now()
        : DateTime.now(),
    scheduledTime: j['scheduled_time'] as String? ?? '09:00',
    completedAt: j['completed_at'] != null
        ? DateTime.tryParse(j['completed_at'] as String)
        : null,
    actualWeight: (j['actual_volume'] as num?)?.toDouble(),
    notes: (j['notes'] as String? ?? j['driver_notes'] as String?)?.trim().isNotEmpty == true
        ? (j['notes'] as String? ?? j['driver_notes'] as String?)
        : null,
    location: (j['hotel_address'] as String?) ?? (j['location'] as String?) ?? '',
    destinationLat: (j['listing_lat'] as num?)?.toDouble() ?? (j['hotel_lat'] as num?)?.toDouble(),
    destinationLng: (j['listing_lng'] as num?)?.toDouble() ?? (j['hotel_lng'] as num?)?.toDouble(),
    earnings: (j['earnings'] as num? ?? 0).toDouble(),
    contactPhone: j['hotel_phone'] as String?,
    driverPhone: j['driver_phone'] as String?,
  );
}

Transaction _transactionFromApi(Map<String, dynamic> j) {
  final statusStr = (j['status'] as String? ?? 'completed').toLowerCase();
  return Transaction(
    id: (j['id'] as int).toString(),
    date: j['created_at'] != null
        ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
        : DateTime.now(),
    from: j['hotel_id'] != null ? (j['hotel_id'] as int).toString() : '',
    to: j['recycler_id'] != null ? (j['recycler_id'] as int).toString() : '',
    wasteType: WasteType.mixed,
    volume: 0,
    amount: (j['gross_amount'] as num? ?? 0).toDouble(),
    fee: (j['platform_fee'] as num? ?? 0).toDouble(),
    status: TransactionStatus.values.firstWhere(
      (e) => e.name == statusStr,
      orElse: () => TransactionStatus.completed,
    ),
    listingId: j['listing_id'] != null ? (j['listing_id'] as int).toString() : '',
  );
}

BidStatus _mapBidStatus(String s) {
  switch (s.toLowerCase()) {
    case 'accepted':
      return BidStatus.won;
    case 'rejected':
    case 'outbid':
      return BidStatus.lost;
    case 'withdrawn':
      return BidStatus.withdrawn;
    default:
      return BidStatus.active;
  }
}

Bid _bidFromApi(Map<String, dynamic> j, {String? recyclerName}) {
  // Prefer the recycler_name field from the API; fall back to the passed name
  final name = (j['recycler_name'] as String?)?.isNotEmpty == true
      ? j['recycler_name'] as String
      : (recyclerName?.isNotEmpty == true ? recyclerName! : 'Unknown Recycler');
  return Bid(
    id: (j['id'] as int? ?? 0).toString(),
    listingId: (j['listing_id'] as int? ?? 0).toString(),
    recyclerId: (j['recycler_id'] as int? ?? 0).toString(),
    recyclerName: name,
    amount: (j['amount'] as num? ?? 0).toDouble(),
    note: j['notes'] as String?,
    collectionPreference: j['notes'] as String? ?? 'flexible',
    status: _mapBidStatus(j['status'] as String? ?? 'active'),
    createdAt: j['created_at'] != null
        ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
        : DateTime.now(),
    recyclerRating: (j['recycler_rating'] as num?)?.toDouble(),
    recyclerLicense: j['recycler_license'] as String?,
  );
}

// Raw bid JSON provider — preserves enriched listing fields (hotel_name, waste_type, volume, unit)
// returned by the /bids/mine endpoint.
final _apiMyBidsRawProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final items = await ApiService.getMyBids();
    return items.map((j) => j as Map<String, dynamic>).toList();
  } catch (_) {
    return [];
  }
});

NotificationType _mapNotificationType(String s) {
  switch (s.toLowerCase()) {
    case 'new_bid':
    case 'bid_accepted':
    case 'bid_rejected':
      return NotificationType.bid;
    case 'collection_scheduled':
    case 'driver_en_route':
    case 'collection_completed':
      return NotificationType.collection;
    case 'payment_received':
    case 'payment_sent':
      return NotificationType.payment;
    case 'new_message':
      return NotificationType.message;
    default:
      return NotificationType.system;
  }
}

AppNotification _notificationFromApi(Map<String, dynamic> j) {
  return AppNotification(
    id: (j['id'] as int? ?? 0).toString(),
    type: _mapNotificationType(j['type'] as String? ?? 'system'),
    title: j['title'] as String? ?? 'Notification',
    message: j['body'] as String? ?? '',
    time: j['created_at'] != null
        ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
        : DateTime.now(),
    read: j['is_read'] as bool? ?? false,
    link: j['link'] as String?,
  );
}

String _wasteTypeToApi(WasteType type) {
  switch (type) {
    case WasteType.uco:
      return 'UCO';
    case WasteType.glass:
      return 'Glass';
    case WasteType.paperCardboard:
      return 'Paper/Cardboard';
    case WasteType.plastic:
      return 'Plastic';
    case WasteType.metal:
      return 'Metal';
    case WasteType.organic:
      return 'Organic';
    case WasteType.electronic:
      return 'Electronic';
    case WasteType.textile:
      return 'Textile';
    case WasteType.mixed:
      return 'Mixed';
    case WasteType.other:
      return 'Other';
  }
}

// ── Private API FutureProviders ───────────────────────────────────────────

// How long Hive offline cache entries remain valid.
const _kHiveCacheTtlHours = 24;

/// Wraps raw data in a timestamped envelope before writing to Hive.
String _hiveEncode(dynamic data) =>
    jsonEncode({'ts': DateTime.now().millisecondsSinceEpoch, 'data': data});

/// Returns the cached payload if it exists and is still fresh, otherwise null.
dynamic _hiveDecode(String? raw) {
  if (raw == null) return null;
  try {
    final envelope = jsonDecode(raw) as Map<String, dynamic>;
    final ts = envelope['ts'] as int?;
    if (ts == null) return envelope; // legacy entry without ts — use as-is once
    final ageHours = (DateTime.now().millisecondsSinceEpoch - ts) / 3600000;
    if (ageHours > _kHiveCacheTtlHours) return null; // expired
    return envelope['data'];
  } catch (_) {
    return null;
  }
}

final _apiOpenListingsProvider = FutureProvider<List<WasteListing>>((ref) async {
  const cacheKey = 'cached_open_listings';
  try {
    final resp = await ApiService.getListings(status: 'open', limit: 50);
    final items = resp['items'] as List<dynamic>? ?? [];
    final mapped = items.map((j) => _listingFromApi(j as Map<String, dynamic>)).toList();
    // Persist to Hive cache for offline access
    try {
      final box = await Hive.openBox<String>('app_cache');
      await box.put(cacheKey, _hiveEncode(items));
    } catch (_) {}
    return mapped;
  } catch (_) {
    // Return cached listings when offline (if still fresh)
    try {
      final box = await Hive.openBox<String>('app_cache');
      final items = _hiveDecode(box.get(cacheKey)) as List?;
      if (items != null) {
        return items.map((j) => _listingFromApi(j as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return <WasteListing>[];
  }
});

final _apiMyListingsProvider = FutureProvider<List<WasteListing>>((ref) async {
  try {
    final items = await ApiService.getMyListings();
    return items.map((j) => _listingFromApi(j as Map<String, dynamic>)).toList();
  } catch (_) {
    return <WasteListing>[];
  }
});

final _apiMyListingsWithBidsProvider = FutureProvider<List<WasteListing>>((ref) async {
  final listings = await ref.watch(_apiMyListingsProvider.future);
  final withBids = await Future.wait(listings.map((listing) async {
    final listingId = int.tryParse(listing.id);
    if (listingId == null) return listing;
    try {
      final bidsJson = await ApiService.getListingBids(listingId);
      final bids = bidsJson
          .map((j) => _bidFromApi(j as Map<String, dynamic>))
          .toList();
      return WasteListing(
        id: listing.id,
        businessId: listing.businessId,
        businessName: listing.businessName,
        wasteType: listing.wasteType,
        volume: listing.volume,
        unit: listing.unit,
        quality: listing.quality,
        photos: listing.photos,
        minBid: listing.minBid,
        reservePrice: listing.reservePrice,
        auctionDuration: listing.auctionDuration,
        autoAcceptAbove: listing.autoAcceptAbove,
        status: listing.status,
        bids: bids,
        assignedRecycler: listing.assignedRecycler,
        assignedDriver: listing.assignedDriver,
        collectionDate: listing.collectionDate,
        location: listing.location,
        latitude: listing.latitude,
        longitude: listing.longitude,
        createdAt: listing.createdAt,
      );
    } catch (_) {
      return listing;
    }
  }));
  return withBids;
});

final _apiMyBidsProvider = FutureProvider<List<Bid>>((ref) async {
  try {
    final items = await ApiService.getMyBids();
    return items
        .map((j) => _bidFromApi(j as Map<String, dynamic>))
        .toList();
  } catch (_) {
    return <Bid>[];
  }
});

final _apiMyCollectionsProvider = FutureProvider<List<Collection>>((ref) async {
  const cacheKey = 'cached_collections';
  try {
    final items = await ApiService.getMyCollections();
    final mapped = items.map((j) => _collectionFromApi(j as Map<String, dynamic>)).toList();
    // Persist to Hive cache so we can read offline
    try {
      final box = await Hive.openBox<String>('app_cache');
      await box.put(cacheKey, _hiveEncode(items));
    } catch (_) {}
    return mapped;
  } catch (_) {
    // Try returning cached data when offline (if still fresh)
    try {
      final box = await Hive.openBox<String>('app_cache');
      final items = _hiveDecode(box.get(cacheKey)) as List?;
      if (items != null) {
        return items.map((j) => _collectionFromApi(j as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return <Collection>[];
  }
});

final _apiMyTransactionsProvider = FutureProvider<List<Transaction>>((ref) async {
  try {
    final items = await ApiService.getMyTransactions();
    return items.map((j) => _transactionFromApi(j as Map<String, dynamic>)).toList();
  } catch (_) {
    return <Transaction>[];
  }
});

final _apiNotificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  try {
    final items = await ApiService.getNotifications();
    return items
        .map((j) => _notificationFromApi(j as Map<String, dynamic>))
        .toList();
  } catch (_) {
    return <AppNotification>[];
  }
});

// ── Public Contact Info Provider ───────────────────────────────────────────

/// Support contact details (email, phone, platform name) fetched from the backend.
/// Falls back to defaults so the support screen always renders.
final contactInfoProvider = FutureProvider<Map<String, String>>((ref) async {
  try {
    final data = await ApiService.getContactInfo();
    return {
      'supportEmail': (data['supportEmail'] as String?) ?? 'support@ecotrade.rw',
      'supportPhone': (data['supportPhone'] as String?) ?? '+250 780 162 164',
      'platformName': (data['platformName'] as String?) ?? 'EcoTrade Rwanda',
    };
  } catch (_) {
    return {
      'supportEmail': 'support@ecotrade.rw',
      'supportPhone': '+250 780 162 164',
      'platformName': 'EcoTrade Rwanda',
    };
  }
});

// ── Role-specific Profile Providers ───────────────────────────────────────

/// All drivers from /drivers/ — used in fleet management and driver assignment.
final driversProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final items = await ApiService.getDrivers();
    return items.map((j) => j as Map<String, dynamic>).toList();
  } catch (_) {
    return [];
  }
});

/// Recycler-specific driver fleet from /drivers/my-recycler — includes current_lat/current_lng
/// for real-time location tracking on the fleet map.
final recyclerDriversProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final user = ref.watch(authProvider).user;
  if (user == null || user.role != UserRole.recycler) return [];
  try {
    final items = await ApiService.getMyRecyclerDrivers();
    return items.map((j) => j as Map<String, dynamic>).toList();
  } catch (_) {
    return [];
  }
});

/// Hotel profile data from /hotels/me — provides address, TIN, city, etc.
final hotelProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final user = ref.watch(authProvider).user;
  if (user == null || user.role != UserRole.business) return {};
  try {
    return await ApiService.getMyHotel();
  } catch (_) {
    return {};
  }
});

/// Driver profile data from /drivers/me — provides license number, vehicle, location, etc.
final driverProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final user = ref.watch(authProvider).user;
  if (user == null || user.role != UserRole.driver) return {};
  try {
    return await ApiService.getMyDriver();
  } catch (_) {
    return {};
  }
});

/// Recycler profile data from /recyclers/me — provides company name, TIN, city, etc.
final recyclerProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final user = ref.watch(authProvider).user;
  if (user == null || user.role != UserRole.recycler) return {};
  try {
    return await ApiService.getMyRecycler();
  } catch (_) {
    return {};
  }
});

// ── Listings Providers ─────────────────────────────────────────────────────

final allListingsProvider = Provider<List<WasteListing>>(
  (ref) {
    ref.watch(listingsNotifierProvider);
    return ref.watch(_apiOpenListingsProvider).whenOrNull(data: (d) => d)
        ?? <WasteListing>[];
  },
);

final openListingsProvider = Provider<List<WasteListing>>(
  (ref) {
    ref.watch(listingsNotifierProvider);
    return ref.watch(_apiOpenListingsProvider).whenOrNull(data: (d) => d)
        ?? <WasteListing>[];
  },
);

final businessListingsProvider = Provider<List<WasteListing>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  ref.watch(listingsNotifierProvider);
  return ref.watch(_apiMyListingsWithBidsProvider).whenOrNull(data: (d) => d) ?? [];
});

final recyclerBidListingsProvider = Provider<List<WasteListing>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  final bids = ref.watch(_apiMyBidsProvider).whenOrNull(data: (d) => d) ?? [];
  final rawBids = ref.watch(_apiMyBidsRawProvider).whenOrNull(data: (d) => d) ?? [];

  // Build per-listing metadata from the enriched raw JSON (hotel_name, waste_type, volume, unit)
  // then attach the mapped Bid objects to each listing.
  final listingMeta = <String, Map<String, dynamic>>{};
  final listingBids = <String, List<Bid>>{};

  for (int i = 0; i < bids.length; i++) {
    final bid = bids[i];
    final raw = i < rawBids.length ? rawBids[i] : <String, dynamic>{};
    final key = bid.listingId;
    listingMeta.putIfAbsent(key, () => {
      'hotel_name': raw['hotel_name'] ?? '',
      'waste_type': raw['waste_type'] ?? 'mixed',
      'volume': raw['volume'] ?? 0,
      'unit': raw['unit'] ?? 'kg',
      'min_bid': raw['min_bid'] ?? 0,
      'first_bid': bid,
    });
    listingBids.putIfAbsent(key, () => []).add(bid);
  }

  return listingMeta.entries.map((entry) {
    final meta = entry.value;
    final first = meta['first_bid'] as Bid;
    return WasteListing(
      id: entry.key,
      businessId: '',
      businessName: meta['hotel_name'] as String? ?? '',
      wasteType: _mapWasteType(meta['waste_type'] as String? ?? 'mixed'),
      volume: (meta['volume'] as num? ?? 0).toDouble(),
      unit: meta['unit'] as String? ?? 'kg',
      quality: WasteQuality.a,
      minBid: (meta['min_bid'] as num? ?? 0).toDouble(),
      status: ListingStatus.open,
      bids: listingBids[entry.key] ?? [],
      location: '',
      createdAt: first.createdAt,
    );
  }).toList();
});

// ── Collections Providers ─────────────────────────────────────────────────

final allCollectionsProvider = Provider<List<Collection>>(
  (ref) => ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d)
  ?? <Collection>[],
);

final businessCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d) ?? [];
});

final driverCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d) ?? [];
});

final recyclerCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d) ?? [];
});

/// True while the recycler's bids are being fetched from the API.
final recyclerBidsLoadingProvider = Provider<bool>(
    (ref) => ref.watch(_apiMyBidsProvider).isLoading);

/// True while the recycler's collections are being fetched from the API.
final recyclerCollectionsLoadingProvider = Provider<bool>(
    (ref) => ref.watch(_apiMyCollectionsProvider).isLoading);

// ── Driver Route Provider ─────────────────────────────────────────────────

final driverRouteProvider = Provider<DriverRoute>(
  (ref) {
    final userId = ref.watch(authProvider).user?.id ?? '';
    final collections = ref.watch(driverCollectionsProvider);
    RouteStopStatus toStopStatus(CollectionStatus status) {
      switch (status) {
        case CollectionStatus.scheduled:
          return RouteStopStatus.pending;
        case CollectionStatus.enRoute:
          return RouteStopStatus.arrived;
        case CollectionStatus.collected:
          return RouteStopStatus.collecting;
        case CollectionStatus.completed:
          return RouteStopStatus.completed;
        case CollectionStatus.verified:
          return RouteStopStatus.completed;
        case CollectionStatus.missed:
          return RouteStopStatus.skipped;
      }
    }

    final stops = collections
        .map(
          (collection) => RouteStop(
            id: collection.id,
            businessName: collection.businessName,
            location: collection.location,
            wasteType: collection.wasteType,
            volume: collection.volume,
            eta: collection.scheduledTime,
            status: toStopStatus(collection.status),
            contactPerson: collection.businessName,
            contactPhone: collection.contactPhone ?? '',
          ),
        )
        .toList();

    final completed = stops.where((s) => s.status == RouteStopStatus.completed).length;
    return DriverRoute(
      id: 'route-${DateTime.now().toIso8601String().split('T').first}',
      driverId: userId,
      date: DateTime.now(),
      stops: stops,
      status: completed == stops.length && stops.isNotEmpty
          ? RouteStatus.completed
          : stops.any((s) => s.status != RouteStopStatus.pending)
              ? RouteStatus.inProgress
              : RouteStatus.pending,
      totalDistance: 0,
      estimatedEarnings: collections.fold<double>(0, (sum, item) => sum + item.earnings),
    );
  },
);

// ── Transactions Provider ─────────────────────────────────────────────────

final transactionsProvider = Provider<List<Transaction>>(
  (ref) => ref.watch(_apiMyTransactionsProvider).whenOrNull(data: (d) => d)
  ?? <Transaction>[],
);

// ── Notifications Provider ────────────────────────────────────────────────

class NotificationsNotifier extends StateNotifier<List<AppNotification>> {
  NotificationsNotifier(this.ref) : super(const []) {
    _refresh();
  }

  final Ref ref;

  Future<void> _refresh() async {
    final notifications = await ref.read(_apiNotificationsProvider.future);
    state = notifications;
  }

  int get unreadCount => state.where((n) => !n.read).length;

  Future<void> markRead(String id) async {
    final numericId = int.tryParse(id);
    if (numericId == null) return;
    await ApiService.markNotificationAsRead(numericId);
    state = state
        .map((n) => n.id == id
            ? AppNotification(
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                time: n.time,
                read: true,
                link: n.link,
                meta: n.meta,
              )
            : n)
        .toList();
  }

  Future<void> markAllRead() async {
    await ApiService.markAllNotificationsAsRead();
    state = state
        .map((n) => AppNotification(
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              time: n.time,
              read: true,
              link: n.link,
              meta: n.meta,
            ))
        .toList();
  }

  void add(AppNotification n) {
    state = [n, ...state];
    NotificationService.instance.showNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: n.title,
      body: n.message,
      type: n.type,
    );
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, List<AppNotification>>(
  (ref) => NotificationsNotifier(ref),
);

final unreadCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => !n.read).length;
});

// ── Stats Providers ───────────────────────────────────────────────────────

final businessStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
  // Compute from real API data when available, else fall back to DataService
  final apiListings = ref.watch(_apiMyListingsProvider).whenOrNull(data: (d) => d);
  final apiCollections = ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d);
  final apiTransactions = ref.watch(_apiMyTransactionsProvider).whenOrNull(data: (d) => d);
  if (apiListings != null) {
    final collections = apiCollections ?? [];
    final transactions = apiTransactions ?? [];
    return {
      'totalListings': apiListings.length,
      'activeListings': apiListings.where((l) => l.status == ListingStatus.open).length,
      'completedCollections': collections.where((c) => c.status == CollectionStatus.completed).length,
      'totalVolume': apiListings.fold<double>(0, (s, l) => s + l.volume),
      'totalEarnings': transactions.fold<double>(0, (s, t) => s + t.amount),
      'pendingBids': apiListings.fold<int>(0, (s, l) => s + l.activeBidCount),
    };
  }
  return {
    'totalListings': 0,
    'activeListings': 0,
    'completedCollections': 0,
    'totalVolume': 0.0,
    'totalEarnings': 0.0,
    'pendingBids': 0,
  };
});

final recyclerStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
  final apiCollections = ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d);
  final apiTransactions = ref.watch(_apiMyTransactionsProvider).whenOrNull(data: (d) => d);
  final apiBids = ref.watch(_apiMyBidsProvider).whenOrNull(data: (d) => d);
  if (apiCollections != null) {
    final transactions = apiTransactions ?? [];
    final bids = apiBids ?? [];
    final activeBids = bids.where((b) => b.status == BidStatus.active).length;
    final wonBids = apiCollections
        .where((c) =>
            c.status == CollectionStatus.collected ||
            c.status == CollectionStatus.verified ||
            c.status == CollectionStatus.completed)
        .length;
    final totalEarnings = apiCollections.fold<double>(0, (s, c) => s + c.earnings);
    return {
      'totalBids': bids.length,
      'activeBids': activeBids,
      'wonBids': wonBids,
      'totalEarnings': totalEarnings > 0
          ? totalEarnings
          : transactions.fold<double>(0, (s, t) => s + t.amount),
      'pendingCollections': apiCollections
          .where((c) =>
              c.status != CollectionStatus.completed &&
              c.status != CollectionStatus.missed)
          .length,
    };
  }
  return {
    'totalBids': 0,
    'activeBids': 0,
    'wonBids': 0,
    'totalEarnings': 0.0,
    'pendingCollections': 0,
  };
});

final driverStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
  final apiCollections = ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d);
  if (apiCollections != null) {
    final today = DateTime.now();
    final todayCollections = apiCollections.where((c) {
      final d = c.scheduledDate;
      return d.year == today.year && d.month == today.month && d.day == today.day;
    }).toList();
    final completedCols = apiCollections.where((c) => c.status == CollectionStatus.completed).toList();
    final completed = completedCols.length;
    final todayCompleted = todayCollections.where((c) => c.status == CollectionStatus.completed).length;
    // Only count actual weight from truly completed collections
    final totalVolume = completedCols.fold<double>(
      0, (s, c) => s + (c.actualWeight ?? c.volume));
    return {
      'todayStops': todayCollections.length,
      'completedStops': todayCompleted,
      'totalCollections': apiCollections.length,
      'completedCollections': completed,
      'totalVolume': totalVolume,
      'totalEarnings': apiCollections.fold<double>(0, (s, c) => s + c.earnings),
      'todayEarnings': todayCollections.fold<double>(0, (s, c) => s + c.earnings),
      'rating': user.rating,
    };
  }
  return {
    'todayStops': 0,
    'completedStops': 0,
    'totalCollections': 0,
    'completedCollections': 0,
    'totalVolume': 0.0,
    'totalEarnings': 0.0,
    'todayEarnings': 0.0,
    'rating': user.rating,
  };
});

// ── Listings CRUD Notifier ────────────────────────────────────────────────

class ListingsNotifier extends StateNotifier<List<WasteListing>> {
  ListingsNotifier(this.ref) : super(const []);

  final Ref ref;

  Future<WasteListing> create({
    required String businessId,
    required String businessName,
    required WasteType wasteType,
    required double volume,
    required String unit,
    required WasteQuality quality,
    required double minBid,
    required String location,
    String? description,
    String? collectionDate,
    String? collectionTime,
    String? specialInstructions,
    double? reservePrice,
    int auctionDuration = 24,
  }) async {
    // Build collection window datetimes matching web frontend logic:
    // start = pickup date+time, end = start + 2 hours
    String? collectionWindowStart;
    String? collectionWindowEnd;
    if (collectionDate != null && collectionDate.isNotEmpty) {
      final timeStr = (collectionTime != null && collectionTime.isNotEmpty)
          ? collectionTime
          : '09:00';
      final start = DateTime.tryParse('${collectionDate}T$timeStr:00');
      if (start != null) {
        collectionWindowStart = start.toUtc().toIso8601String();
        collectionWindowEnd = start.add(const Duration(hours: 2)).toUtc().toIso8601String();
      }
    }

    // expires_at = 30 days from now (matching web frontend)
    final expiresAt = DateTime.now().add(const Duration(days: 30)).toUtc().toIso8601String();

    final response = await ApiService.createListing({
      'title': '${wasteType.label} ${volume.toStringAsFixed(0)}$unit from $businessName',
      'waste_type': _wasteTypeToApi(wasteType),
      'volume': volume,
      'unit': unit,
      'min_bid': minBid,
      'address': location,
      'description': description ?? '${quality.label} quality listing by $businessName',
      if (collectionWindowStart != null) 'collection_window_start': collectionWindowStart,
      if (collectionWindowEnd != null) 'collection_window_end': collectionWindowEnd,
      if (specialInstructions != null && specialInstructions.isNotEmpty) 'notes': specialInstructions,
      'expires_at': expiresAt,
      'is_urgent': auctionDuration <= 12,
    });
    final listing = _listingFromApi(response);
    ref.invalidate(_apiMyListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
    return listing;
  }

  Future<void> update(WasteListing updated) async {
    final listingId = int.tryParse(updated.id);
    if (listingId == null) {
      throw Exception('Invalid listing id');
    }
    // Build collection window from collectionDate if present
    String? collectionWindowStart;
    String? collectionWindowEnd;
    if (updated.collectionDate != null) {
      collectionWindowStart = updated.collectionDate!.toUtc().toIso8601String();
      collectionWindowEnd = updated.collectionDate!
          .add(const Duration(hours: 2))
          .toUtc()
          .toIso8601String();
    }

    await ApiService.updateListing(listingId, {
      'waste_type': _wasteTypeToApi(updated.wasteType),
      'volume': updated.volume,
      'unit': updated.unit,
      'min_bid': updated.minBid,
      'address': updated.location,
      'status': updated.status.name,
      'title': '${updated.wasteType.label} ${updated.volume.toStringAsFixed(0)}${updated.unit}',
      if (updated.description != null) 'description': updated.description,
      if (updated.notes != null) 'notes': updated.notes,
      if (collectionWindowStart != null) 'collection_window_start': collectionWindowStart,
      if (collectionWindowEnd != null) 'collection_window_end': collectionWindowEnd,
    });
    ref.invalidate(_apiMyListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
  }

  Future<void> delete(String id) async {
    final listingId = int.tryParse(id);
    if (listingId == null) {
      throw Exception('Invalid listing id');
    }
    await ApiService.deleteListing(listingId);
    // Clear the Hive offline cache so the deleted listing doesn't reappear
    // when the app is used offline after this deletion.
    try {
      final box = await Hive.openBox<String>('app_cache');
      await box.delete('cached_open_listings');
    } catch (_) {}
    ref.invalidate(_apiMyListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
  }

  /// Re-fetches all listing providers — call after image uploads complete
  /// so photos appear without requiring a manual pull-to-refresh.
  void refresh() {
    ref.invalidate(_apiMyListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
  }

  Future<void> addBidToListing(Bid bid) async {
    if (bid.id.isEmpty) return;
    ref.invalidate(_apiMyListingsWithBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
    ref.invalidate(_apiMyBidsProvider);
  }

  Future<void> acceptBid(String listingId, String bidId) async {
    if (listingId.isEmpty) {
      throw Exception('Invalid listing id');
    }
    final bidNumericId = int.tryParse(bidId);
    if (bidNumericId == null) {
      throw Exception('Invalid bid id');
    }
    await ApiService.acceptBid(bidNumericId);
    ref.invalidate(_apiMyListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
    ref.invalidate(_apiMyBidsProvider);
  }
}

final listingsNotifierProvider =
    StateNotifierProvider<ListingsNotifier, List<WasteListing>>((ref) {
  return ListingsNotifier(ref);
});

// ── Bids Notifier ─────────────────────────────────────────────────────────

class BidsNotifier extends StateNotifier<List<Bid>> {
  BidsNotifier(this.ref) : super(const []);

  final Ref ref;

  Future<Bid> placeBid({
    required String listingId,
    required String recyclerId,
    required String recyclerName,
    required double amount,
    String? note,
    String collectionPreference = 'flexible',
  }) async {
    final numericId = int.tryParse(listingId);
    if (numericId == null) {
      throw Exception('Invalid listing id');
    }

    final resp = await ApiService.placeBid(
      listingId: numericId,
      amount: amount,
      notes: note,
    );
    final bid = Bid(
      id: (resp['id'] as int? ?? DateTime.now().millisecondsSinceEpoch).toString(),
      listingId: listingId,
      recyclerId: recyclerId,
      recyclerName: recyclerName,
      amount: amount,
      note: note,
      collectionPreference: collectionPreference,
      status: _mapBidStatus(resp['status'] as String? ?? 'active'),
      createdAt: resp['created_at'] != null
          ? DateTime.tryParse(resp['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
    state = [...state, bid];
    ref.invalidate(_apiMyBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
    return bid;
  }

  Future<void> withdrawBid(String bidId) async {
    final bidNumericId = int.tryParse(bidId);
    if (bidNumericId == null) {
      throw Exception('Invalid bid id');
    }
    await ApiService.withdrawBid(bidNumericId);
    state = state
        .map((x) => x.id == bidId
            ? Bid(
                id: x.id,
                listingId: x.listingId,
                recyclerId: x.recyclerId,
                recyclerName: x.recyclerName,
                amount: x.amount,
                note: x.note,
                collectionPreference: x.collectionPreference,
                status: BidStatus.withdrawn,
                createdAt: x.createdAt,
              )
            : x)
        .toList();
    ref.invalidate(_apiMyBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
  }

  Future<void> increaseBid(String bidId, double newAmount) async {
    final bidNumericId = int.tryParse(bidId);
    if (bidNumericId == null) throw Exception('Invalid bid id');
    await ApiService.increaseBid(bidNumericId, newAmount);
    state = state
        .map((x) => x.id == bidId
            ? Bid(
                id: x.id,
                listingId: x.listingId,
                recyclerId: x.recyclerId,
                recyclerName: x.recyclerName,
                amount: newAmount,
                note: x.note,
                collectionPreference: x.collectionPreference,
                status: x.status,
                createdAt: x.createdAt,
              )
            : x)
        .toList();
    ref.invalidate(_apiMyBidsProvider);
    ref.invalidate(_apiOpenListingsProvider);
    ref.invalidate(_apiMyListingsWithBidsProvider);
  }

  /// Re-fetches bids from the API.
  void refresh() {
    ref.invalidate(_apiMyBidsProvider);
    ref.invalidate(_apiMyBidsRawProvider);
  }
}

final bidsNotifierProvider =
    StateNotifierProvider<BidsNotifier, List<Bid>>((ref) {
  return BidsNotifier(ref);
});

// ── Collections CRUD Notifier ─────────────────────────────────────────────

class CollectionsNotifier extends StateNotifier<List<Collection>> {
  CollectionsNotifier(this.ref) : super(const []);

  final Ref ref;

  /// Invalidates the collections cache — used after driver assignment or
  /// any external mutation that doesn't go through advanceStatus.
  Future<void> refresh() async {
    ref.invalidate(_apiMyCollectionsProvider);
  }

  /// Advances the collection to the next status in the backend workflow.
  /// Queues offline when there is no connectivity; refreshes data after success.
  Future<Map<String, dynamic>> advanceStatus(
    int collectionId, {
    double? actualWeight,
    String? notes,
  }) async {
    try {
      final result = await ApiService.advanceCollectionStatus(
        collectionId,
        actualWeight: actualWeight,
        notes: notes,
      );
      ref.invalidate(_apiMyCollectionsProvider);
      return result;
    } catch (e) {
      // Queue for offline sync if it looks like a network error
      final msg = e.toString().toLowerCase();
      if (msg.contains('socket') || msg.contains('connection') ||
          msg.contains('network') || msg.contains('timeout') ||
          msg.contains('unreachable')) {
        await OfflineSyncService.queue(
          'POST',
          '/collections/$collectionId/advance',
          {
            if (actualWeight != null) 'actual_weight': actualWeight,
            if (notes != null) 'notes': notes,
          },
        );
        return {};
      }
      rethrow;
    }
  }
}

final collectionsNotifierProvider =
    StateNotifierProvider<CollectionsNotifier, List<Collection>>((ref) {
  return CollectionsNotifier(ref);
});

// ── Messages Provider ─────────────────────────────────────────────────────

/// Fetches the current user's conversations from the backend.
/// Returns raw JSON maps so callers can render sender name, subject, etc.
final messagesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final items = await ApiService.getConversations();
    return items.map((j) => j as Map<String, dynamic>).toList();
  } catch (_) {
    return [];
  }
});

// ── Support Tickets Provider ──────────────────────────────────────────────

class SupportTicketsNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  SupportTicketsNotifier(this.ref) : super(const []) {
    _load();
  }

  final Ref ref;

  Future<void> _load() async {
    try {
      final items = await ApiService.getSupportTickets();
      state = items.map((j) => j as Map<String, dynamic>).toList();
    } catch (_) {}
  }

  Future<void> refresh() => _load();

  Future<Map<String, dynamic>> submit({
    required String subject,
    required String message,
  }) async {
    final result = await ApiService.createSupportTicket(
      subject: subject,
      message: message,
    );
    await _load();
    return result;
  }
}

final supportTicketsNotifierProvider =
    StateNotifierProvider<SupportTicketsNotifier, List<Map<String, dynamic>>>(
  (ref) => SupportTicketsNotifier(ref),
);
