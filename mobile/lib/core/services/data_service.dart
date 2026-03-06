// Data service — seeds in-memory demo data matching frontend dataStore.ts
// Demo credentials from AuthContext.tsx:
//   hotel@millecollines.rw / hotel123
//   recycler@greenenergy.rw / recycler123
//   driver@ecotrade.rw / driver123
//   admin@ecotrade.rw / admin123

import '../models/models.dart';

class DataService {
  DataService._();
  static final DataService instance = DataService._();

  // ── Demo Users ────────────────────────────────────────────────────────────
  static final List<AppUser> _demoUsers = [
    const AppUser(
      id: 'user-admin-1',
      name: 'Admin User',
      email: 'admin@ecotrade.rw',
      phone: '+250788000001',
      role: UserRole.admin,
      greenScore: 100,
    ),
    const AppUser(
      id: 'user-business-1',
      name: 'Hotel Manager',
      email: 'hotel@millecollines.rw',
      phone: '+250788000002',
      role: UserRole.business,
      businessName: 'Hôtel des Mille Collines',
      greenScore: 82,
    ),
    const AppUser(
      id: 'user-recycler-1',
      name: 'Recycler Manager',
      email: 'recycler@greenenergy.rw',
      phone: '+250788000003',
      role: UserRole.recycler,
      companyName: 'GreenEnergy Recyclers Ltd',
      rating: 4.8,
      greenScore: 91,
    ),
    const AppUser(
      id: 'user-driver-1',
      name: 'Jean Pierre Habimana',
      email: 'driver@ecotrade.rw',
      phone: '+250788000004',
      role: UserRole.driver,
      vehicleType: 'Toyota Dyna',
      vehiclePlate: 'RAD 456B',
      rating: 4.9,
      completedRoutes: 128,
      greenScore: 74,
    ),
  ];

  // ── Demo Listings ─────────────────────────────────────────────────────────
  final List<WasteListing> _listings = [
    WasteListing(
      id: 'listing-001',
      businessId: 'user-business-1',
      businessName: 'Hôtel des Mille Collines',
      wasteType: WasteType.uco,
      volume: 120,
      unit: 'liters',
      quality: WasteQuality.a,
      minBid: 25000,
      reservePrice: 35000,
      auctionDuration: 24,
      autoAcceptAbove: 40000,
      status: ListingStatus.open,
      location: 'KN 5 Rd, Kigali',
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      bids: [
        Bid(
          id: 'bid-001',
          listingId: 'listing-001',
          recyclerId: 'user-recycler-1',
          recyclerName: 'GreenEnergy Recyclers Ltd',
          amount: 32000,
          note: 'Can collect tomorrow morning',
          collectionPreference: 'morning',
          status: BidStatus.active,
          createdAt: DateTime.now().subtract(const Duration(hours: 4)),
        ),
        Bid(
          id: 'bid-002',
          listingId: 'listing-001',
          recyclerId: 'user-recycler-2',
          recyclerName: 'EcoRwanda Solutions',
          amount: 29000,
          collectionPreference: 'flexible',
          status: BidStatus.active,
          createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        ),
      ],
    ),
    WasteListing(
      id: 'listing-002',
      businessId: 'user-business-1',
      businessName: 'Hôtel des Mille Collines',
      wasteType: WasteType.glass,
      volume: 80,
      unit: 'kg',
      quality: WasteQuality.b,
      minBid: 8000,
      auctionDuration: 48,
      status: ListingStatus.assigned,
      assignedRecycler: 'user-recycler-1',
      assignedDriver: 'user-driver-1',
      collectionDate: DateTime.now().add(const Duration(days: 1)),
      location: 'KN 5 Rd, Kigali',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      bids: [
        Bid(
          id: 'bid-003',
          listingId: 'listing-002',
          recyclerId: 'user-recycler-1',
          recyclerName: 'GreenEnergy Recyclers Ltd',
          amount: 10500,
          collectionPreference: 'afternoon',
          status: BidStatus.won,
          createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 6)),
        ),
      ],
    ),
    WasteListing(
      id: 'listing-003',
      businessId: 'user-business-2',
      businessName: 'Kigali Serena Hotel',
      wasteType: WasteType.paperCardboard,
      volume: 200,
      unit: 'kg',
      quality: WasteQuality.a,
      minBid: 15000,
      auctionDuration: 24,
      status: ListingStatus.open,
      location: 'KN 3 Ave, Kigali',
      createdAt: DateTime.now().subtract(const Duration(hours: 10)),
      bids: [],
    ),
    WasteListing(
      id: 'listing-004',
      businessId: 'user-business-3',
      businessName: 'Radisson Blu Hotel',
      wasteType: WasteType.uco,
      volume: 95,
      unit: 'liters',
      quality: WasteQuality.b,
      minBid: 20000,
      auctionDuration: 36,
      status: ListingStatus.open,
      location: 'KG 7 Ave, Kigali',
      createdAt: DateTime.now().subtract(const Duration(hours: 14)),
      bids: [
        Bid(
          id: 'bid-004',
          listingId: 'listing-004',
          recyclerId: 'user-recycler-1',
          recyclerName: 'GreenEnergy Recyclers Ltd',
          amount: 22000,
          note: 'Ready for immediate collection',
          collectionPreference: 'morning',
          status: BidStatus.active,
          createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        ),
      ],
    ),
    WasteListing(
      id: 'listing-005',
      businessId: 'user-business-1',
      businessName: 'Hôtel des Mille Collines',
      wasteType: WasteType.mixed,
      volume: 60,
      unit: 'kg',
      quality: WasteQuality.c,
      minBid: 5000,
      auctionDuration: 24,
      status: ListingStatus.completed,
      location: 'KN 5 Rd, Kigali',
      createdAt: DateTime.now().subtract(const Duration(days: 7)),
      bids: [],
    ),
  ];

  // ── Demo Collections ──────────────────────────────────────────────────────
  final List<Collection> _collections = [
    Collection(
      id: 'col-001',
      listingId: 'listing-002',
      businessName: 'Hôtel des Mille Collines',
      businessAddress: 'KN 5 Rd, Kigali',
      recyclerName: 'GreenEnergy Recyclers Ltd',
      driverName: 'Jean Pierre Habimana',
      driverId: 'user-driver-1',
      wasteType: WasteType.glass,
      volume: 80,
      status: CollectionStatus.scheduled,
      scheduledDate: DateTime.now().add(const Duration(days: 1)),
      scheduledTime: '09:00',
      location: 'KN 5 Rd, Kigali',
      earnings: 10500,
    ),
    Collection(
      id: 'col-002',
      listingId: 'listing-005',
      businessName: 'Hôtel des Mille Collines',
      businessAddress: 'KN 5 Rd, Kigali',
      recyclerName: 'GreenEnergy Recyclers Ltd',
      driverName: 'Jean Pierre Habimana',
      driverId: 'user-driver-1',
      wasteType: WasteType.mixed,
      volume: 60,
      status: CollectionStatus.completed,
      scheduledDate: DateTime.now().subtract(const Duration(days: 7)),
      scheduledTime: '14:00',
      completedAt: DateTime.now().subtract(const Duration(days: 7, hours: -2)),
      actualWeight: 58.5,
      rating: 4.8,
      notes: 'Smooth collection, well-sorted waste',
      location: 'KN 5 Rd, Kigali',
      earnings: 5000,
    ),
    Collection(
      id: 'col-003',
      listingId: 'listing-003',
      businessName: 'Kigali Serena Hotel',
      businessAddress: 'KN 3 Ave, Kigali',
      recyclerName: 'GreenEnergy Recyclers Ltd',
      driverName: 'Jean Pierre Habimana',
      driverId: 'user-driver-1',
      wasteType: WasteType.paperCardboard,
      volume: 200,
      status: CollectionStatus.enRoute,
      scheduledDate: DateTime.now(),
      scheduledTime: '11:00',
      location: 'KN 3 Ave, Kigali',
      earnings: 15000,
    ),
  ];

  // ── Demo Driver Route ─────────────────────────────────────────────────────
  final DriverRoute _todayRoute = DriverRoute(
    id: 'route-today',
    driverId: 'user-driver-1',
    date: DateTime.now(),
    totalDistance: 18.4,
    estimatedEarnings: 35000,
    status: RouteStatus.inProgress,
    stops: [
      RouteStop(
        id: 'stop-001',
        businessName: 'Hôtel des Mille Collines',
        location: 'KN 5 Rd, Kigali',
        wasteType: WasteType.glass,
        volume: 80,
        eta: '09:00',
        status: RouteStopStatus.completed,
        contactPerson: 'Robert Kagame',
        contactPhone: '+250788111001',
        specialInstructions: 'Ring bell at service entrance',
        actualWeight: 78.5,
        completedAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      RouteStop(
        id: 'stop-002',
        businessName: 'Kigali Serena Hotel',
        location: 'KN 3 Ave, Kigali',
        wasteType: WasteType.paperCardboard,
        volume: 200,
        eta: '11:00',
        status: RouteStopStatus.collecting,
        contactPerson: 'Marie Claire',
        contactPhone: '+250788111002',
        specialInstructions: 'Access via side gate',
      ),
      RouteStop(
        id: 'stop-003',
        businessName: 'Radisson Blu Hotel',
        location: 'KG 7 Ave, Kigali',
        wasteType: WasteType.uco,
        volume: 95,
        eta: '13:30',
        status: RouteStopStatus.pending,
        contactPerson: 'Jean Paul',
        contactPhone: '+250788111003',
      ),
    ],
  );

  // ── Demo Transactions ─────────────────────────────────────────────────────
  final List<Transaction> _transactions = [
    Transaction(
      id: 'txn-001',
      date: DateTime.now().subtract(const Duration(days: 7)),
      from: 'Hôtel des Mille Collines',
      to: 'GreenEnergy Recyclers Ltd',
      wasteType: WasteType.mixed,
      volume: 60,
      amount: 5000,
      fee: 250,
      status: TransactionStatus.completed,
      listingId: 'listing-005',
    ),
    Transaction(
      id: 'txn-002',
      date: DateTime.now().subtract(const Duration(days: 14)),
      from: 'Kigali Serena Hotel',
      to: 'GreenEnergy Recyclers Ltd',
      wasteType: WasteType.uco,
      volume: 110,
      amount: 31000,
      fee: 1550,
      status: TransactionStatus.completed,
      listingId: 'listing-old-1',
    ),
    Transaction(
      id: 'txn-003',
      date: DateTime.now().subtract(const Duration(days: 21)),
      from: 'Radisson Blu Hotel',
      to: 'GreenEnergy Recyclers Ltd',
      wasteType: WasteType.paperCardboard,
      volume: 180,
      amount: 18000,
      fee: 900,
      status: TransactionStatus.completed,
      listingId: 'listing-old-2',
    ),
  ];

  // ── Demo Notifications ────────────────────────────────────────────────────
  final List<AppNotification> _notifications = [
    AppNotification(
      id: 'notif-001',
      type: NotificationType.bid,
      title: 'New Bid Received',
      message: 'GreenEnergy Recyclers placed a bid of RWF 32,000 on your UCO listing',
      time: DateTime.now().subtract(const Duration(hours: 4)),
      read: false,
    ),
    AppNotification(
      id: 'notif-002',
      type: NotificationType.collection,
      title: 'Pickup Scheduled',
      message: 'Your glass waste collection is confirmed for tomorrow at 09:00',
      time: DateTime.now().subtract(const Duration(hours: 12)),
      read: false,
    ),
    AppNotification(
      id: 'notif-003',
      type: NotificationType.payment,
      title: 'Payment Confirmed',
      message: 'RWF 5,000 has been processed for your mixed waste collection',
      time: DateTime.now().subtract(const Duration(days: 7)),
      read: true,
    ),
    AppNotification(
      id: 'notif-004',
      type: NotificationType.alert,
      title: 'Green Score Updated',
      message: 'Your green score increased to 82! Keep up the great work.',
      time: DateTime.now().subtract(const Duration(days: 3)),
      read: true,
    ),
    AppNotification(
      id: 'notif-005',
      type: NotificationType.system,
      title: 'Driver En Route',
      message: 'Jean Pierre is on the way to collect your paper-cardboard waste',
      time: DateTime.now().subtract(const Duration(minutes: 30)),
      read: false,
    ),
  ];

  // ── Auth ──────────────────────────────────────────────────────────────────
  static const Map<String, String> _credentials = {
    'admin@ecotrade.rw': 'admin123',
    'hotel@millecollines.rw': 'hotel123',
    'recycler@greenenergy.rw': 'recycler123',
    'driver@ecotrade.rw': 'driver123',
  };

  AppUser? login(String email, String password) {
    final lower = email.toLowerCase().trim();
    if (_credentials[lower] == password) {
      return _demoUsers.firstWhere((u) => u.email == lower);
    }
    return null;
  }

  // ── Listings ──────────────────────────────────────────────────────────────
  List<WasteListing> getListings() => List.unmodifiable(_listings);

  List<WasteListing> getListingsForBusiness(String businessId) =>
      _listings.where((l) => l.businessId == businessId).toList();

  List<WasteListing> getOpenListings() =>
      _listings.where((l) => l.status == ListingStatus.open).toList();

  List<WasteListing> getListingsWithBidsByRecycler(String recyclerId) =>
      _listings.where((l) => l.bids.any((b) => b.recyclerId == recyclerId)).toList();

  WasteListing? getListingById(String id) =>
      _listings.cast<WasteListing?>().firstWhere((l) => l?.id == id, orElse: () => null);

  // ── Collections ───────────────────────────────────────────────────────────
  List<Collection> getCollections() => List.unmodifiable(_collections);

  List<Collection> getCollectionsForBusiness(String businessId) =>
      _collections.where((c) {
        final listing = getListingById(c.listingId);
        return listing?.businessId == businessId;
      }).toList();

  List<Collection> getCollectionsForDriver(String driverId) =>
      _collections.where((c) => c.driverId == driverId).toList();

  List<Collection> getCollectionsForRecycler(String recyclerName) =>
      _collections.where((c) => c.recyclerName == recyclerName).toList();

  // ── Driver Route ──────────────────────────────────────────────────────────
  DriverRoute getTodayRoute() => _todayRoute;

  // ── Transactions ──────────────────────────────────────────────────────────
  List<Transaction> getTransactions() => List.unmodifiable(_transactions);

  List<Transaction> getTransactionsForUser(String userDisplayName) =>
      _transactions.where((t) => t.from == userDisplayName || t.to == userDisplayName).toList();

  // ── Notifications ─────────────────────────────────────────────────────────
  List<AppNotification> getNotifications() => List.unmodifiable(_notifications);

  int getUnreadCount() => _notifications.where((n) => !n.read).length;

  void markNotificationRead(String id) {
    final n = _notifications.firstWhere((n) => n.id == id, orElse: () => _notifications.first);
    n.read = true;
  }

  void markAllNotificationsRead() {
    for (final n in _notifications) {
      n.read = true;
    }
  }

  void addNotification(AppNotification n) {
    _notifications.insert(0, n);
    if (_notifications.length > 50) _notifications.removeLast();
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  Map<String, dynamic> getBusinessStats(String businessId) {
    final listings = getListingsForBusiness(businessId);
    final totalVolume = listings.fold<double>(0, (s, l) => s + l.volume);
    final completed = listings.where((l) => l.status == ListingStatus.completed).length;
    final totalEarnings = getTransactionsForUser('Hôtel des Mille Collines')
        .fold<double>(0, (s, t) => s + t.amount);
    return {
      'totalListings': listings.length,
      'activeListings': listings.where((l) => l.status == ListingStatus.open).length,
      'completedCollections': completed,
      'totalVolume': totalVolume,
      'totalEarnings': totalEarnings,
      'pendingBids': listings.fold<int>(0, (s, l) => s + l.activeBidCount),
    };
  }

  Map<String, dynamic> getRecyclerStats(String recyclerId) {
    final bids = _listings
        .expand((l) => l.bids)
        .where((b) => b.recyclerId == recyclerId)
        .toList();
    final wonBids = bids.where((b) => b.status == BidStatus.won).length;
    final earnings = getTransactionsForUser('GreenEnergy Recyclers Ltd')
        .fold<double>(0, (s, t) => s + t.amount);
    return {
      'totalBids': bids.length,
      'activeBids': bids.where((b) => b.status == BidStatus.active).length,
      'wonBids': wonBids,
      'totalEarnings': earnings,
      'pendingCollections': getCollectionsForRecycler('GreenEnergy Recyclers Ltd')
          .where((c) => c.status != CollectionStatus.completed)
          .length,
    };
  }

  Map<String, dynamic> getDriverStats(String driverId) {
    final cols = getCollectionsForDriver(driverId);
    final completed = cols.where((c) => c.status == CollectionStatus.completed).length;
    final earnings = cols.fold<double>(0, (s, c) => s + c.earnings);
    final route = getTodayRoute();
    return {
      'todayStops': route.stops.length,
      'completedStops': route.completedStops,
      'totalCollections': cols.length,
      'completedCollections': completed,
      'totalEarnings': earnings,
      'todayEarnings': route.estimatedEarnings,
      'rating': 4.9,
    };
  }

  // ── Listings CRUD ─────────────────────────────────────────────────────────

  void addListing(WasteListing listing) {
    _listings.insert(0, listing);
  }

  void updateListing(WasteListing updated) {
    final index = _listings.indexWhere((l) => l.id == updated.id);
    if (index >= 0) _listings[index] = updated;
  }

  void deleteListing(String id) {
    _listings.removeWhere((l) => l.id == id);
  }

  // ── Bids CRUD ─────────────────────────────────────────────────────────────

  void addBid(Bid bid) {
    final idx = _listings.indexWhere((l) => l.id == bid.listingId);
    if (idx < 0) return;
    final listing = _listings[idx];
    final updatedBids = List<Bid>.from(listing.bids)..add(bid);
    _listings[idx] = WasteListing(
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
      bids: updatedBids,
      assignedRecycler: listing.assignedRecycler,
      assignedDriver: listing.assignedDriver,
      collectionDate: listing.collectionDate,
      location: listing.location,
      createdAt: listing.createdAt,
    );
  }

  void updateBid(Bid updated) {
    final listingIdx = _listings.indexWhere((l) => l.id == updated.listingId);
    if (listingIdx < 0) return;
    final listing = _listings[listingIdx];
    final updatedBids = listing.bids.map((b) => b.id == updated.id ? updated : b).toList();
    _listings[listingIdx] = WasteListing(
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
      bids: updatedBids,
      assignedRecycler: listing.assignedRecycler,
      assignedDriver: listing.assignedDriver,
      collectionDate: listing.collectionDate,
      location: listing.location,
      createdAt: listing.createdAt,
    );
  }

  void deleteBid(String listingId, String bidId) {
    final idx = _listings.indexWhere((l) => l.id == listingId);
    if (idx < 0) return;
    final listing = _listings[idx];
    final updatedBids = listing.bids.where((b) => b.id != bidId).toList();
    _listings[idx] = WasteListing(
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
      bids: updatedBids,
      assignedRecycler: listing.assignedRecycler,
      assignedDriver: listing.assignedDriver,
      collectionDate: listing.collectionDate,
      location: listing.location,
      createdAt: listing.createdAt,
    );
  }

  // ── Collections CRUD ──────────────────────────────────────────────────────

  void addCollection(Collection collection) {
    _collections.insert(0, collection);
  }

  void updateCollectionStatus(String id, CollectionStatus newStatus) {
    final idx = _collections.indexWhere((c) => c.id == id);
    if (idx < 0) return;
    final c = _collections[idx];
    _collections[idx] = Collection(
      id: c.id,
      listingId: c.listingId,
      businessName: c.businessName,
      businessAddress: c.businessAddress,
      recyclerName: c.recyclerName,
      driverName: c.driverName,
      driverId: c.driverId,
      wasteType: c.wasteType,
      volume: c.volume,
      status: newStatus,
      scheduledDate: c.scheduledDate,
      scheduledTime: c.scheduledTime,
      completedAt: newStatus == CollectionStatus.completed ? DateTime.now() : c.completedAt,
      proofPhotos: c.proofPhotos,
      actualWeight: c.actualWeight,
      rating: c.rating,
      notes: c.notes,
      location: c.location,
      earnings: c.earnings,
    );
  }
}
