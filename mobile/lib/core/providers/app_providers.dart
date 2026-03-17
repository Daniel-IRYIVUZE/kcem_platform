import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/data_service.dart';
import '../services/notification_service.dart';
import '../services/local_storage_service.dart';

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

  AuthState copyWith({AppUser? user, bool? isLoading, String? error}) =>
      AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error ?? this.error,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier()
      : super(AuthState(user: LocalStorageService.instance.loadUser()));

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Try real backend API first
      final response = await ApiService.login(email, password);
      final userMap = response['user'] as Map<String, dynamic>;
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
          );
        } else if (user.role == UserRole.recycler) {
          final recyclerData = await ApiService.getMyRecycler();
          user = user.copyWith(
            companyName: recyclerData['company_name'] as String?,
          );
        }
      } catch (_) {
        // Profile fetch failed, continue with basic user data
      }
      
      await LocalStorageService.instance.saveUser(user);
      state = AuthState(user: user);
      return true;
    } on ApiException catch (e) {
      // Fall back to demo users on API error (e.g., unauthorized / not found)
      final localUser = DataService.instance.login(email, password) ??
          LocalStorageService.instance.loginRegisteredUser(email, password);
      if (localUser != null) {
        await LocalStorageService.instance.saveUser(localUser);
        state = AuthState(user: localUser);
        return true;
      }
      state = AuthState(error: e.message);
      return false;
    } catch (_) {
      // Network / unexpected error — fall back to local demo users
      final localUser = DataService.instance.login(email, password) ??
          LocalStorageService.instance.loginRegisteredUser(email, password);
      if (localUser != null) {
        await LocalStorageService.instance.saveUser(localUser);
        state = AuthState(user: localUser);
        return true;
      }
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
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Try real API registration
      await ApiService.register({
        'full_name': name,
        'email': email,
        'phone': phone,
        'password': password,
        'role': role,
      });
      // After registration, log in to get tokens
      final loginResp = await ApiService.login(email, password);
      final userMap = loginResp['user'] as Map<String, dynamic>;
      final user = AppUser(
        id: (userMap['id'] as int).toString(),
        name: userMap['full_name'] as String? ?? name,
        email: userMap['email'] as String? ?? email,
        phone: userMap['phone'] as String? ?? phone,
        role: _mapRole(userMap['role'] as String? ?? role),
        verified: userMap['is_verified'] as bool? ?? false,
        greenScore: 10,
        businessName: businessName,
      );
      await LocalStorageService.instance.saveUser(user);
      await LocalStorageService.instance.markOnboardingSeen();
      state = AuthState(user: user);
      return true;
    } catch (_) {
      // Fall back to local registration
      final userRole = _mapRole(role);
      final user = AppUser(
        id: 'user-reg-${DateTime.now().millisecondsSinceEpoch}',
        name: name,
        email: email,
        phone: phone,
        role: userRole,
        businessName: businessName,
        verified: true,
        greenScore: 10,
      );
      final userData = user.toMap();
      userData['password'] = password;
      await LocalStorageService.instance.saveRegisteredUser(userData);
      await LocalStorageService.instance.saveUser(user);
      await LocalStorageService.instance.markOnboardingSeen();
      state = AuthState(user: user);
      return true;
    }
  }

  Future<void> logout() async {
    await LocalStorageService.instance.clearUser();
    state = const AuthState();
  }

  UserRole _mapRole(String role) {
    switch (role) {
      case 'recycler':
        return UserRole.recycler;
      case 'driver':
        return UserRole.driver;
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
      return CollectionStatus.enRoute;
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
    default:
      return CollectionStatus.missed;
  }
}

WasteListing _listingFromApi(Map<String, dynamic> j) {
  return WasteListing(
    id: (j['id'] as int).toString(),
    businessId: (j['hotel_id'] as int? ?? 0).toString(),
    businessName: j['hotel_name'] as String? ?? 'Hotel',
    wasteType: _mapWasteType(j['waste_type'] as String? ?? 'mixed'),
    volume: (j['volume'] as num? ?? 0).toDouble(),
    unit: j['unit'] as String? ?? 'kg',
    quality: WasteQuality.a,
    minBid: (j['min_bid'] as num? ?? j['minBid'] as num? ?? 0).toDouble(),
    status: _mapListingStatus(j['status'] as String? ?? 'open'),
    location: j['address'] as String? ?? '',
    latitude: (j['latitude'] as num?)?.toDouble(),
    longitude: (j['longitude'] as num?)?.toDouble(),
    createdAt: j['created_at'] != null
        ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
        : DateTime.now(),
  );
}

Collection _collectionFromApi(Map<String, dynamic> j) {
  return Collection(
    id: (j['id'] as int).toString(),
    listingId: (j['listing_id'] as int? ?? 0).toString(),
    businessName: j['hotel_name'] as String? ?? '',
    recyclerName: j['recycler_name'] as String? ?? '',
    driverId: j['driver_id'] != null ? (j['driver_id'] as int).toString() : null,
    wasteType: WasteType.mixed,
    volume: (j['actual_volume'] as num? ?? 0).toDouble(),
    status: _mapCollectionStatus(j['status'] as String? ?? 'scheduled'),
    scheduledDate: j['scheduled_date'] != null
        ? DateTime.tryParse(j['scheduled_date'] as String) ?? DateTime.now()
        : DateTime.now(),
    scheduledTime: j['scheduled_time'] as String? ?? '09:00',
    location: (j['hotel_address'] as String?) ?? (j['location'] as String?) ?? '',
    destinationLat: (j['listing_lat'] as num?)?.toDouble() ?? (j['hotel_lat'] as num?)?.toDouble(),
    destinationLng: (j['listing_lng'] as num?)?.toDouble() ?? (j['hotel_lng'] as num?)?.toDouble(),
    earnings: 0,
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

// ── Private API FutureProviders ───────────────────────────────────────────

final _apiOpenListingsProvider = FutureProvider<List<WasteListing>>((ref) async {
  try {
    final resp = await ApiService.getListings(status: 'open', limit: 50);
    final items = resp['items'] as List<dynamic>? ?? [];
    return items.map((j) => _listingFromApi(j as Map<String, dynamic>)).toList();
  } catch (_) {
    return DataService.instance.getOpenListings();
  }
});

final _apiMyListingsProvider = FutureProvider<List<WasteListing>>((ref) async {
  try {
    final items = await ApiService.getMyListings();
    return items.map((j) => _listingFromApi(j as Map<String, dynamic>)).toList();
  } catch (_) {
    final user = ref.read(authProvider).user;
    return DataService.instance.getListingsForBusiness(user?.id ?? '');
  }
});

final _apiMyCollectionsProvider = FutureProvider<List<Collection>>((ref) async {
  try {
    final items = await ApiService.getMyCollections();
    return items.map((j) => _collectionFromApi(j as Map<String, dynamic>)).toList();
  } catch (_) {
    return DataService.instance.getCollections();
  }
});

final _apiMyTransactionsProvider = FutureProvider<List<Transaction>>((ref) async {
  try {
    final items = await ApiService.getMyTransactions();
    return items.map((j) => _transactionFromApi(j as Map<String, dynamic>)).toList();
  } catch (_) {
    return DataService.instance.getTransactions();
  }
});

// ── Listings Providers ─────────────────────────────────────────────────────

final allListingsProvider = Provider<List<WasteListing>>(
  (ref) {
    ref.watch(listingsNotifierProvider);
    return ref.watch(_apiOpenListingsProvider).whenOrNull(data: (d) => d)
        ?? DataService.instance.getListings();
  },
);

final openListingsProvider = Provider<List<WasteListing>>(
  (ref) {
    ref.watch(listingsNotifierProvider);
    return ref.watch(_apiOpenListingsProvider).whenOrNull(data: (d) => d)
        ?? DataService.instance.getOpenListings();
  },
);

final businessListingsProvider = Provider<List<WasteListing>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  // Prefer live API data; fall back to local CRUD notifier
  return ref.watch(_apiMyListingsProvider).whenOrNull(data: (d) => d)
      ?? ref.watch(listingsNotifierProvider);
});

final recyclerBidListingsProvider = Provider<List<WasteListing>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return DataService.instance.getListingsWithBidsByRecycler(user.id);
});

// ── Collections Providers ─────────────────────────────────────────────────

final allCollectionsProvider = Provider<List<Collection>>(
  (ref) => ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d)
      ?? DataService.instance.getCollections(),
);

final businessCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  // API already returns only this user's collections
  return ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d)
      ?? DataService.instance.getCollectionsForBusiness(user.id);
});

final driverCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d)
      ?? DataService.instance.getCollectionsForDriver(user.id);
});

final recyclerCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d)
      ?? DataService.instance.getCollectionsForRecycler(user.displayName);
});

// ── Driver Route Provider ─────────────────────────────────────────────────

final driverRouteProvider = Provider<DriverRoute>(
  (ref) => DataService.instance.getTodayRoute(),
);

// ── Transactions Provider ─────────────────────────────────────────────────

final transactionsProvider = Provider<List<Transaction>>(
  (ref) => ref.watch(_apiMyTransactionsProvider).whenOrNull(data: (d) => d)
      ?? DataService.instance.getTransactions(),
);

// ── Notifications Provider ────────────────────────────────────────────────

class NotificationsNotifier extends StateNotifier<List<AppNotification>> {
  NotificationsNotifier() : super(DataService.instance.getNotifications());

  int get unreadCount => state.where((n) => !n.read).length;

  void markRead(String id) {
    DataService.instance.markNotificationRead(id);
    state = DataService.instance.getNotifications();
  }

  void markAllRead() {
    DataService.instance.markAllNotificationsRead();
    state = DataService.instance.getNotifications();
  }

  void add(AppNotification n) {
    DataService.instance.addNotification(n);
    state = DataService.instance.getNotifications();
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
  (ref) => NotificationsNotifier(),
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
  return DataService.instance.getBusinessStats(user.id);
});

final recyclerStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
  final apiCollections = ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d);
  final apiTransactions = ref.watch(_apiMyTransactionsProvider).whenOrNull(data: (d) => d);
  if (apiCollections != null) {
    final transactions = apiTransactions ?? [];
    return {
      'totalBids': 0,
      'activeBids': 0,
      'wonBids': apiCollections.length,
      'totalEarnings': transactions.fold<double>(0, (s, t) => s + t.amount),
      'pendingCollections': apiCollections
          .where((c) => c.status != CollectionStatus.completed && c.status != CollectionStatus.missed)
          .length,
    };
  }
  return DataService.instance.getRecyclerStats(user.id);
});

final driverStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
  final apiCollections = ref.watch(_apiMyCollectionsProvider).whenOrNull(data: (d) => d);
  if (apiCollections != null) {
    final completed = apiCollections.where((c) => c.status == CollectionStatus.completed).length;
    return {
      'todayStops': apiCollections.length,
      'completedStops': completed,
      'totalCollections': apiCollections.length,
      'completedCollections': completed,
      'totalEarnings': apiCollections.fold<double>(0, (s, c) => s + c.earnings),
      'todayEarnings': 0.0,
      'rating': user.rating,
    };
  }
  return DataService.instance.getDriverStats(user.id);
});

// ── Listings CRUD Notifier ────────────────────────────────────────────────

class ListingsNotifier extends StateNotifier<List<WasteListing>> {
  ListingsNotifier(String userId)
      : super(_initListings(userId));

  static List<WasteListing> _initListings(String userId) {
    final persisted = LocalStorageService.instance.loadListings();
    final service = DataService.instance.getListingsForBusiness(userId);
    final serviceIds = service.map((l) => l.id).toSet();
    final extra = persisted.where((l) => !serviceIds.contains(l.id)).toList();
    return [...service, ...extra];
  }

  Future<WasteListing> create({
    required String businessId,
    required String businessName,
    required WasteType wasteType,
    required double volume,
    required String unit,
    required WasteQuality quality,
    required double minBid,
    required String location,
    double? reservePrice,
    int auctionDuration = 24,
  }) async {
    final listing = WasteListing(
      id: 'listing-${DateTime.now().millisecondsSinceEpoch}',
      businessId: businessId,
      businessName: businessName,
      wasteType: wasteType,
      volume: volume,
      unit: unit,
      quality: quality,
      minBid: minBid,
      reservePrice: reservePrice,
      auctionDuration: auctionDuration,
      status: ListingStatus.open,
      location: location,
      createdAt: DateTime.now(),
    );
    DataService.instance.addListing(listing);
    state = [listing, ...state];
    final persisted = LocalStorageService.instance.loadListings();
    await LocalStorageService.instance.saveListings([listing, ...persisted]);
    return listing;
  }

  Future<void> update(WasteListing updated) async {
    DataService.instance.updateListing(updated);
    state = state.map((l) => l.id == updated.id ? updated : l).toList();
    await LocalStorageService.instance.saveListings(
      LocalStorageService.instance.loadListings()
          .map((l) => l.id == updated.id ? updated : l)
          .toList(),
    );
  }

  Future<void> delete(String id) async {
    DataService.instance.deleteListing(id);
    state = state.where((l) => l.id != id).toList();
    final persisted = LocalStorageService.instance.loadListings()
        .where((l) => l.id != id)
        .toList();
    await LocalStorageService.instance.saveListings(persisted);
  }

  Future<void> addBidToListing(Bid bid) async {
    DataService.instance.addBid(bid);
    state = state.map((l) {
      if (l.id != bid.listingId) return l;
      return WasteListing(
        id: l.id,
        businessId: l.businessId,
        businessName: l.businessName,
        wasteType: l.wasteType,
        volume: l.volume,
        unit: l.unit,
        quality: l.quality,
        photos: l.photos,
        minBid: l.minBid,
        reservePrice: l.reservePrice,
        auctionDuration: l.auctionDuration,
        autoAcceptAbove: l.autoAcceptAbove,
        status: l.status,
        bids: [...l.bids, bid],
        assignedRecycler: l.assignedRecycler,
        assignedDriver: l.assignedDriver,
        collectionDate: l.collectionDate,
        location: l.location,
        createdAt: l.createdAt,
      );
    }).toList();
    final bids = LocalStorageService.instance.loadBids();
    await LocalStorageService.instance.saveBids([...bids, bid]);
  }

  Future<void> acceptBid(String listingId, String bidId) async {
    state = state.map((l) {
      if (l.id != listingId) return l;
      final updatedBids = l.bids.map((b) => Bid(
        id: b.id,
        listingId: b.listingId,
        recyclerId: b.recyclerId,
        recyclerName: b.recyclerName,
        amount: b.amount,
        note: b.note,
        collectionPreference: b.collectionPreference,
        status: b.id == bidId ? BidStatus.won : BidStatus.lost,
        createdAt: b.createdAt,
      )).toList();
      return WasteListing(
        id: l.id,
        businessId: l.businessId,
        businessName: l.businessName,
        wasteType: l.wasteType,
        volume: l.volume,
        unit: l.unit,
        quality: l.quality,
        photos: l.photos,
        minBid: l.minBid,
        reservePrice: l.reservePrice,
        auctionDuration: l.auctionDuration,
        autoAcceptAbove: l.autoAcceptAbove,
        status: ListingStatus.assigned,
        bids: updatedBids,
        assignedRecycler: updatedBids.firstWhere((b) => b.id == bidId).recyclerName,
        assignedDriver: l.assignedDriver,
        collectionDate: l.collectionDate,
        location: l.location,
        createdAt: l.createdAt,
      );
    }).toList();
  }
}

final listingsNotifierProvider =
    StateNotifierProvider<ListingsNotifier, List<WasteListing>>((ref) {
  final userId = ref.watch(authProvider).user?.id ?? '';
  return ListingsNotifier(userId);
});

// ── Bids Notifier ─────────────────────────────────────────────────────────

class BidsNotifier extends StateNotifier<List<Bid>> {
  BidsNotifier(String recyclerId)
      : super(_initBids(recyclerId));

  static List<Bid> _initBids(String recyclerId) {
    final fromService = DataService.instance
        .getListings()
        .expand((l) => l.bids)
        .where((b) => b.recyclerId == recyclerId)
        .toList();
    final persisted = LocalStorageService.instance.loadBids()
        .where((b) => b.recyclerId == recyclerId)
        .toList();
    final ids = fromService.map((b) => b.id).toSet();
    return [...fromService, ...persisted.where((b) => !ids.contains(b.id))];
  }

  Future<Bid> placeBid({
    required String listingId,
    required String recyclerId,
    required String recyclerName,
    required double amount,
    String? note,
    String collectionPreference = 'flexible',
  }) async {
    // Try real API if listingId is numeric (came from backend)
    final numericId = int.tryParse(listingId);
    if (numericId != null) {
      try {
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
          createdAt: DateTime.now(),
        );
        state = [...state, bid];
        return bid;
      } catch (_) {
        // API failed — fall through to local
      }
    }
    // Fallback: local/demo storage
    final bid = Bid(
      id: 'bid-${DateTime.now().millisecondsSinceEpoch}',
      listingId: listingId,
      recyclerId: recyclerId,
      recyclerName: recyclerName,
      amount: amount,
      note: note,
      collectionPreference: collectionPreference,
      createdAt: DateTime.now(),
    );
    DataService.instance.addBid(bid);
    state = [...state, bid];
    final allBids = [...LocalStorageService.instance.loadBids(), bid];
    await LocalStorageService.instance.saveBids(allBids);
    return bid;
  }

  Future<void> withdrawBid(String bidId) async {
    final idx = state.indexWhere((b) => b.id == bidId);
    if (idx < 0) return;
    final b = state[idx];
    final withdrawn = Bid(
      id: b.id,
      listingId: b.listingId,
      recyclerId: b.recyclerId,
      recyclerName: b.recyclerName,
      amount: b.amount,
      note: b.note,
      collectionPreference: b.collectionPreference,
      status: BidStatus.withdrawn,
      createdAt: b.createdAt,
    );
    DataService.instance.updateBid(withdrawn);
    state = state.map((x) => x.id == bidId ? withdrawn : x).toList();
    final allBids = LocalStorageService.instance.loadBids()
        .map((x) => x.id == bidId ? withdrawn : x)
        .toList();
    await LocalStorageService.instance.saveBids(allBids);
  }
}

final bidsNotifierProvider =
    StateNotifierProvider<BidsNotifier, List<Bid>>((ref) {
  final userId = ref.watch(authProvider).user?.id ?? '';
  return BidsNotifier(userId);
});
