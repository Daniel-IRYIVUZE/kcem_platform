import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
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
    await Future.delayed(const Duration(milliseconds: 800));

    // Check built-in demo users first, then user-registered accounts
    final user = DataService.instance.login(email, password) ??
        LocalStorageService.instance.loginRegisteredUser(email, password);

    if (user != null) {
      await LocalStorageService.instance.saveUser(user);
      state = AuthState(user: user);
      return true;
    } else {
      state = const AuthState(error: 'Invalid email or password');
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
    await Future.delayed(const Duration(milliseconds: 1000));

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

    // Persist for future logins
    final userData = user.toMap();
    userData['password'] = password;
    await LocalStorageService.instance.saveRegisteredUser(userData);
    await LocalStorageService.instance.saveUser(user);
    await LocalStorageService.instance.markOnboardingSeen();

    state = AuthState(user: user);
    return true;
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

// ── Listings Providers ─────────────────────────────────────────────────────

final allListingsProvider = Provider<List<WasteListing>>(
  (ref) {
    // Watch listingsNotifierProvider to recompute when listings are mutated
    ref.watch(listingsNotifierProvider);
    return DataService.instance.getListings();
  },
);

final openListingsProvider = Provider<List<WasteListing>>(
  (ref) {
    ref.watch(listingsNotifierProvider);
    return DataService.instance.getOpenListings();
  },
);

final businessListingsProvider = Provider<List<WasteListing>>((ref) {
  final user = ref.watch(authProvider).user;
  // Watch listingsNotifierProvider to stay reactive to CRUD mutations
  final userListings = ref.watch(listingsNotifierProvider);
  if (user == null) return [];
  // Return the full state from the reactive notifier for business users
  return userListings;
});

final recyclerBidListingsProvider = Provider<List<WasteListing>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return DataService.instance.getListingsWithBidsByRecycler(user.id);
});

// ── Collections Providers ─────────────────────────────────────────────────

final allCollectionsProvider = Provider<List<Collection>>(
  (ref) => DataService.instance.getCollections(),
);

final businessCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return DataService.instance.getCollectionsForBusiness(user.id);
});

final driverCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return DataService.instance.getCollectionsForDriver(user.id);
});

final recyclerCollectionsProvider = Provider<List<Collection>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];
  return DataService.instance.getCollectionsForRecycler(user.displayName);
});

// ── Driver Route Provider ─────────────────────────────────────────────────

final driverRouteProvider = Provider<DriverRoute>(
  (ref) => DataService.instance.getTodayRoute(),
);

// ── Transactions Provider ─────────────────────────────────────────────────

final transactionsProvider = Provider<List<Transaction>>(
  (ref) => DataService.instance.getTransactions(),
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
  return DataService.instance.getBusinessStats(user.id);
});

final recyclerStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
  return DataService.instance.getRecyclerStats(user.id);
});

final driverStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final user = ref.watch(authProvider).user;
  if (user == null) return {};
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
