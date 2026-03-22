import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/models/models.dart';
import '../../core/router/app_router.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/widgets/offline_banner.dart';
import 'list_waste_screen.dart';
import 'bids_screen.dart';
import 'collections_screen.dart';
import 'hotel_profile_screen.dart';
import '../../core/utils/image_url.dart';

class HotelMainScreen extends ConsumerStatefulWidget {
  final Widget child;
  const HotelMainScreen({super.key, required this.child});

  @override
  ConsumerState<HotelMainScreen> createState() => _HotelMainScreenState();
}

class _HotelMainScreenState extends ConsumerState<HotelMainScreen> {
  int _selectedIndex = 0;

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home'),
    _NavItem(icon: Icons.add_circle_outline, activeIcon: Icons.add_circle, label: 'List Waste'),
    _NavItem(icon: Icons.gavel_outlined, activeIcon: Icons.gavel, label: 'Bids'),
    _NavItem(icon: Icons.local_shipping_outlined, activeIcon: Icons.local_shipping, label: 'Pickups'),
    _NavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _selectedIndex == 0
          ? _HotelHomeTab(
              onGoToProfile: () => setState(() => _selectedIndex = 4),
              onGoToListings: () => setState(() => _selectedIndex = 1),
            )
          : _selectedIndex == 1
              ? const _ListWasteTab()
              : _selectedIndex == 2
                  ? const _BidsTab()
                  : _selectedIndex == 3
                      ? const _CollectionsTab()
                      : const _HotelProfileTab(),
      bottomNavigationBar: Builder(builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: ctx.cSurf,
          border: Border(top: BorderSide(color: ctx.cBorder)),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) => setState(() => _selectedIndex = index),
          backgroundColor: ctx.cSurf,
          elevation: 0,
          destinations: _navItems
              .map((item) => NavigationDestination(
                    icon: Icon(item.icon),
                    selectedIcon: Icon(item.activeIcon),
                    label: item.label,
                  ))
              .toList(),
        ),
      )),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () => setState(() => _selectedIndex = 1),
              tooltip: 'List Waste',
              child: const Icon(Icons.add, size: 28),
            )
          : null,
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({required this.icon, required this.activeIcon, required this.label});
}

// ─── Hotel Home Tab ───────────────────────────────────────────────────────────
class _HotelHomeTab extends ConsumerWidget {
  final VoidCallback? onGoToProfile;
  final VoidCallback? onGoToListings;
  const _HotelHomeTab({this.onGoToProfile, this.onGoToListings});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final stats = ref.watch(businessStatsProvider);
    final listings = ref.watch(businessListingsProvider);
    final unread = ref.watch(unreadCountProvider);
    final initials = (user?.displayName ?? 'H').trim().split(' ').take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '').join();
    final greeting = _greeting();
    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          // ── Gradient header ───────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0E7490), Color(0xFF0891B2), Color(0xFF06B6D4)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(greeting, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13)),
                                const SizedBox(height: 2),
                                Text(
                                  user?.displayName ?? 'Hotel',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                                  maxLines: 1, overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: const Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.circle, color: Color(0xFF69F0AE), size: 8),
                              SizedBox(width: 5),
                              Text('Active', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                            ]),
                          ),
                          const SizedBox(width: 8),
                          Stack(
                            children: [
                              GestureDetector(
                                onTap: () => context.push(AppRoutes.notifications),
                                child: Container(
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                                ),
                              ),
                              if (unread > 0)
                                Positioned(
                                  right: 4, top: 4,
                                  child: Container(
                                    width: 8, height: 8,
                                    decoration: const BoxDecoration(color: Color(0xFFFF5252), shape: BoxShape.circle),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(width: 8),
                          PopupMenuButton<String>(
                            onSelected: (val) {
                              if (val == 'profile') onGoToProfile?.call();
                              if (val == 'logout') ref.read(authProvider.notifier).logout();
                            },
                            offset: const Offset(0, 48),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            tooltip: 'Account',
                            itemBuilder: (_) => [
                              const PopupMenuItem(value: 'profile', child: Row(children: [
                                Icon(Icons.settings_outlined, size: 18),
                                SizedBox(width: 10), Text('Settings & Profile'),
                              ])),
                              const PopupMenuDivider(),
                              const PopupMenuItem(value: 'logout', child: Row(children: [
                                Icon(Icons.logout, color: Colors.red, size: 18),
                                SizedBox(width: 10), Text('Sign Out', style: TextStyle(color: Colors.red)),
                              ])),
                            ],
                            child: CircleAvatar(
                              radius: 22,
                              backgroundColor: Colors.white.withValues(alpha: 0.2),
                              child: Text(initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Stats strip inside header
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _HotelHeaderStat(
                              label: 'Green Score',
                              value: '${user?.greenScore ?? 0}',
                              icon: Icons.eco_outlined,
                            ),
                            _HotelStatDivider(),
                            _HotelHeaderStat(
                              label: 'Listings',
                              value: '${stats['activeListings'] ?? 0}',
                              icon: Icons.inventory_2_outlined,
                            ),
                            _HotelStatDivider(),
                            _HotelHeaderStat(
                              label: 'Pending Bids',
                              value: '${stats['pendingBids'] ?? 0}',
                              icon: Icons.gavel_outlined,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 350.ms),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Offline banner
                const OfflineBanner(),
                const SizedBox(height: 4),

                // Green Score
                GreenScoreCard(
                  score: (user?.greenScore ?? 0).toDouble(),
                  level: _scoreLevel(user?.greenScore ?? 0),
                ).animate().slideY(begin: 0.2, duration: 400.ms).fadeIn(),

                const SizedBox(height: 20),

                // Stats grid
                const SectionHeader(title: 'This Month', actionLabel: 'View All'),
                const SizedBox(height: 12),

                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.15,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    StatCard(
                      title: 'Total Revenue',
                      value: 'RWF ${_fmt(stats['totalEarnings'] ?? 0)}',
                      icon: Icons.account_balance_wallet_outlined,
                      iconColor: AppColors.accent,
                      iconBg: AppColors.accentLight,
                    ),
                    StatCard(
                      title: 'Active Listings',
                      value: '${stats['activeListings'] ?? 0}',
                      icon: Icons.inventory_2_outlined,
                      iconColor: AppColors.primary,
                    ),
                    StatCard(
                      title: 'Pending Bids',
                      value: '${stats['pendingBids'] ?? 0}',
                      icon: Icons.gavel_outlined,
                      iconColor: AppColors.info,
                      iconBg: const Color(0xFFDBEAFE),
                    ),
                    StatCard(
                      title: 'Collections',
                      value: '${stats['completedCollections'] ?? 0}',
                      icon: Icons.eco_outlined,
                      iconColor: AppColors.primaryDark,
                    ),
                  ],
                ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 100.ms).fadeIn(),

                const SizedBox(height: 24),

                // Active Listings
                SectionHeader(
                  title: 'Active Listings',
                  actionLabel: 'See All',
                  onAction: onGoToListings,
                ),
                const SizedBox(height: 12),

                if (listings.isEmpty)
                  _EmptyListings()
                else
                  SizedBox(
                    height: 160,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: listings.where((l) => l.status == ListingStatus.open || l.status == ListingStatus.assigned).length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final active = listings.where((l) => l.status == ListingStatus.open || l.status == ListingStatus.assigned).toList();
                        if (index >= active.length) return const SizedBox.shrink();
                        return _WasteListingCard(listing: active[index]);
                      },
                    ),
                  ).animate().slideX(begin: 0.2, duration: 400.ms, delay: 200.ms).fadeIn(),

                const SizedBox(height: 24),

                // Recent bids from all listings
                const SectionHeader(title: 'Recent Bids', actionLabel: 'View All'),
                const SizedBox(height: 12),

                ...listings
                    .expand((l) => l.bids)
                    .take(3)
                    .map((bid) => _BidNotificationCard(bid: bid)),

                const SizedBox(height: 24),

                // Upcoming collections link
                const SectionHeader(title: 'Upcoming Pickups'),
                const SizedBox(height: 12),

                // CTA: List new waste
                ElevatedButton.icon(
                  onPressed: onGoToListings,
                  icon: const Icon(Icons.add_circle_outline, size: 20),
                  label: const Text('List New Waste'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    elevation: 2,
                  ),
                ).animate().slideY(begin: 0.2, duration: 350.ms, delay: 300.ms).fadeIn(),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String _fmt(dynamic val) {
    final n = (val ?? 0).toDouble();
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toStringAsFixed(0);
  }

  String _scoreLevel(int score) {
    if (score >= 90) return 'Eco Master';
    if (score >= 75) return 'Eco Champion';
    if (score >= 55) return 'Eco Starter';
    return 'Eco Beginner';
  }
}

// ─── Hotel header stat widget ─────────────────────────────────────────────────
class _HotelHeaderStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _HotelHeaderStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 18),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 20)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11)),
      ],
    );
  }
}

class _HotelStatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(height: 36, width: 1, color: Colors.white.withValues(alpha: 0.25));
  }
}

class _EmptyListings extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 36, color: AppColors.textTertiary),
          SizedBox(height: 8),
          Text('No active listings yet', style: TextStyle(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _WasteListingCard extends StatelessWidget {
  final WasteListing listing;
  const _WasteListingCard({required this.listing});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ListingThumb(listing: listing),
          const SizedBox(height: 8),
          Text(
            listing.wasteType.label,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: context.cText,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            '${listing.volume.toStringAsFixed(0)} ${listing.unit}',
            style: TextStyle(fontSize: 11, color: context.cTextSec),
          ),
          const Spacer(),
          Row(
            children: [
              const Icon(Icons.gavel, size: 11, color: AppColors.primary),
              const SizedBox(width: 3),
              Text(
                '${listing.activeBidCount} bids',
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Shared thumbnail widget — shows up to 4 photos in a horizontal scroll,
/// or a category icon when the listing has no photos.
class _ListingThumb extends StatelessWidget {
  final WasteListing listing;
  const _ListingThumb({required this.listing});

  IconData get _icon {
    switch (listing.wasteType) {
      case WasteType.uco:            return Icons.water_drop_outlined;
      case WasteType.glass:          return Icons.wine_bar_outlined;
      case WasteType.paperCardboard: return Icons.article_outlined;
      default:                       return Icons.delete_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final urls = getAbsoluteImageUrls(listing.photos).take(4).toList();

    if (urls.isEmpty) {
      return Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: context.cPrimaryLight,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(_icon, color: AppColors.primary, size: 22),
      );
    }

    return SizedBox(
      height: 60,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        shrinkWrap: true,
        itemCount: urls.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (context, idx) => ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.network(
            urls[idx],
            width: 60,
            height: 60,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: AppColors.primaryLight,
              width: 60,
              height: 60,
              child: Icon(_icon, color: AppColors.primary, size: 22),
            ),
          ),
        ),
      ),
    );
  }
}

class _BidNotificationCard extends StatelessWidget {
  final Bid bid;
  const _BidNotificationCard({required this.bid});

  @override
  Widget build(BuildContext context) {
    final ago = _timeAgo(bid.createdAt);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.cBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: context.cPrimaryLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.recycling, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        bid.recyclerName,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                    ),
                    Text(
                      'RWF ${bid.amount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        bid.note ?? 'Bid submitted',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      ago,
                      style: const TextStyle(fontSize: 11, color: AppColors.textTertiary),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

// ─── List Waste Tab (Manage Listings CRUD) ───────────────────────────────────

class _ListWasteTab extends ConsumerStatefulWidget {
  const _ListWasteTab();

  @override
  ConsumerState<_ListWasteTab> createState() => _ListWasteTabState();
}

class _ListWasteTabState extends ConsumerState<_ListWasteTab> {
  bool _showingForm = false;
  WasteListing? _editingListing;

  @override
  Widget build(BuildContext context) {
    if (_showingForm) {
      return ListWasteScreen(
        existingListing: _editingListing,
        onDone: () => setState(() {
          _showingForm = false;
          _editingListing = null;
        }),
      );
    }
    return _ManageListingsView(
      onAdd: () => setState(() {
        _editingListing = null;
        _showingForm = true;
      }),
      onEdit: (l) => setState(() {
        _editingListing = l;
        _showingForm = true;
      }),
    );
  }
}

// ─── Redesigned My Listings View ─────────────────────────────────────────────

class _ManageListingsView extends ConsumerStatefulWidget {
  final VoidCallback onAdd;
  final ValueChanged<WasteListing> onEdit;
  const _ManageListingsView({required this.onAdd, required this.onEdit});

  @override
  ConsumerState<_ManageListingsView> createState() => _ManageListingsViewState();
}

class _ManageListingsViewState extends ConsumerState<_ManageListingsView> {
  String _activeFilter = 'All';
  static const _filters = ['All', 'Open', 'Assigned', 'Completed', 'Expired'];

  Future<void> _onRefresh() async {
    ref.read(listingsNotifierProvider.notifier).refresh();
    await Future.delayed(const Duration(milliseconds: 600));
  }

  List<WasteListing> _applyFilter(List<WasteListing> all) {
    if (_activeFilter == 'All') return all;
    return all.where((l) {
      switch (_activeFilter) {
        case 'Open':      return l.status == ListingStatus.open;
        case 'Assigned':  return l.status == ListingStatus.assigned;
        case 'Completed': return l.status == ListingStatus.completed;
        case 'Expired':   return l.status == ListingStatus.expired;
        default:          return true;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final all = ref.watch(businessListingsProvider);
    final listings = _applyFilter(all);

    final counts = {
      'All':       all.length,
      'Open':      all.where((l) => l.status == ListingStatus.open).length,
      'Assigned':  all.where((l) => l.status == ListingStatus.assigned).length,
      'Completed': all.where((l) => l.status == ListingStatus.completed).length,
      'Expired':   all.where((l) => l.status == ListingStatus.expired).length,
    };

    return Scaffold(
      backgroundColor: context.cBg,
      body: NestedScrollView(
        headerSliverBuilder: (ctx, _) => [
          SliverAppBar(
            backgroundColor: context.cSurf,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            floating: true,
            snap: true,
            titleSpacing: 20,
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0E7490), Color(0xFF06B6D4)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.inventory_2_outlined, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 10),
                Text(
                  'My Listings',
                  style: TextStyle(
                    color: context.cText,
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${all.length}',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: FilledButton.icon(
                  onPressed: widget.onAdd,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('New', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(52),
              child: _FilterBar(
                activeFilter: _activeFilter,
                filters: _filters,
                counts: counts,
                onChanged: (f) => setState(() => _activeFilter = f),
              ),
            ),
          ),
        ],
        body: RefreshIndicator(
          onRefresh: _onRefresh,
          color: AppColors.primary,
          child: listings.isEmpty
              ? _EmptyManageState(onAdd: widget.onAdd, filter: _activeFilter)
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 110),
                  itemCount: listings.length,
                  itemBuilder: (context, i) => _ManageListingCard(
                    key: ValueKey(listings[i].id),
                    listing: listings[i],
                    onEdit: () => widget.onEdit(listings[i]),
                    onDelete: () => _confirmDelete(context, listings[i]),
                  )
                      .animate()
                      .slideY(begin: 0.1, duration: 280.ms, delay: (i * 50).ms)
                      .fadeIn(),
                ),
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, WasteListing listing) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(children: [
          Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 22),
          SizedBox(width: 8),
          Text('Delete Listing?', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
        ]),
        content: Text(
          'Remove "${listing.wasteType.label}" (${listing.volume.toStringAsFixed(0)} ${listing.unit}) permanently?\n\nThis cannot be undone.',
          style: const TextStyle(height: 1.5),
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.pop(ctx),
            style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('Cancel'),
          ),
          FilledButton.icon(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ref.read(listingsNotifierProvider.notifier).delete(listing.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: const Row(children: [
                      Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                      SizedBox(width: 10),
                      Text('Listing deleted successfully'),
                    ]),
                    backgroundColor: AppColors.success,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ));
                }
              } catch (_) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: const Text('Failed to delete listing'),
                    backgroundColor: AppColors.error,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ));
                }
              }
            },
            icon: const Icon(Icons.delete_outline, size: 16),
            label: const Text('Delete', style: TextStyle(fontWeight: FontWeight.w700)),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

class _FilterBar extends StatelessWidget {
  final String activeFilter;
  final List<String> filters;
  final Map<String, int> counts;
  final ValueChanged<String> onChanged;

  const _FilterBar({
    required this.activeFilter,
    required this.filters,
    required this.counts,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        itemCount: filters.length,
        itemBuilder: (context, i) {
          final f = filters[i];
          final active = f == activeFilter;
          final count = counts[f] ?? 0;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => onChanged(f),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: active ? AppColors.primary : context.cSurf,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: active ? AppColors.primary : context.cBorder),
                  boxShadow: active
                      ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.25), blurRadius: 6, offset: const Offset(0, 2))]
                      : [],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      f,
                      style: TextStyle(
                        color: active ? Colors.white : context.cTextSec,
                        fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                    if (count > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: active
                              ? Colors.white.withValues(alpha: 0.25)
                              : AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$count',
                          style: TextStyle(
                            color: active ? Colors.white : AppColors.primary,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

class _ManageListingCard extends StatelessWidget {
  final WasteListing listing;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ManageListingCard({
    super.key,
    required this.listing,
    required this.onEdit,
    required this.onDelete,
  });

  Color get _statusColor {
    switch (listing.status) {
      case ListingStatus.open:      return AppColors.primary;
      case ListingStatus.assigned:  return AppColors.accent;
      case ListingStatus.completed: return AppColors.success;
      case ListingStatus.collected: return AppColors.success;
      case ListingStatus.cancelled: return AppColors.error;
      case ListingStatus.expired:   return AppColors.textTertiary;
      default:                      return AppColors.textSecondary;
    }
  }

  String get _statusLabel {
    switch (listing.status) {
      case ListingStatus.open:      return 'Open';
      case ListingStatus.assigned:  return 'Assigned';
      case ListingStatus.collected: return 'Collected';
      case ListingStatus.completed: return 'Completed';
      case ListingStatus.cancelled: return 'Cancelled';
      case ListingStatus.expired:   return 'Expired';
      default:                      return 'Draft';
    }
  }

  IconData get _wasteIcon {
    switch (listing.wasteType) {
      case WasteType.uco:            return Icons.water_drop_outlined;
      case WasteType.glass:          return Icons.wine_bar_outlined;
      case WasteType.paperCardboard: return Icons.article_outlined;
      case WasteType.plastic:        return Icons.recycling;
      case WasteType.metal:          return Icons.hardware_outlined;
      case WasteType.organic:        return Icons.eco_outlined;
      case WasteType.electronic:     return Icons.devices_outlined;
      case WasteType.textile:        return Icons.checkroom_outlined;
      default:                       return Icons.category_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final imageUrls = getAbsoluteImageUrls(listing.photos);
    final hasImage = imageUrls.isNotEmpty;
    final canEdit = listing.status == ListingStatus.open ||
        listing.status == ListingStatus.draft;
    final pickup = listing.collectionDate;
    final pickupText = pickup != null
        ? '${pickup.day}/${pickup.month}/${pickup.year}'
        : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.cBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Hero image ────────────────────────────────────────────
            Stack(
              children: [
                hasImage
                    ? Image.network(
                        imageUrls.first,
                        height: 170,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _ImagePlaceholder(icon: _wasteIcon),
                      )
                    : _ImagePlaceholder(icon: _wasteIcon),
                // Status badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: _statusColor,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: _statusColor.withValues(alpha: 0.45),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      _statusLabel,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                // Photo count badge
                if (imageUrls.length > 1)
                  Positioned(
                    bottom: 10,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.55),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.photo_library_outlined, color: Colors.white, size: 13),
                        const SizedBox(width: 4),
                        Text(
                          '${imageUrls.length}',
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ]),
                    ),
                  ),
              ],
            ),

            // ── Card body ─────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type + volume row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(9),
                        decoration: BoxDecoration(
                          color: context.cPrimaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(_wasteIcon, color: AppColors.primary, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              listing.wasteType.label,
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                                color: context.cText,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${listing.volume.toStringAsFixed(0)} ${listing.unit}  ·  ${listing.quality.label}',
                              style: TextStyle(fontSize: 13, color: context.cTextSec),
                            ),
                          ],
                        ),
                      ),
                      // Min bid pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'RWF ${listing.minBid.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                            const Text(
                              'min bid',
                              style: TextStyle(color: AppColors.primary, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Stats strip
                  Row(
                    children: [
                      _InfoPill(
                        icon: Icons.gavel,
                        label: '${listing.activeBidCount} bid${listing.activeBidCount == 1 ? '' : 's'}',
                        color: listing.activeBidCount > 0 ? AppColors.success : AppColors.textTertiary,
                      ),
                      if (pickupText != null) ...[
                        const SizedBox(width: 8),
                        _InfoPill(
                          icon: Icons.calendar_today_outlined,
                          label: pickupText,
                          color: AppColors.accent,
                        ),
                      ],
                      if (listing.location.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Flexible(
                          child: _InfoPill(
                            icon: Icons.location_on_outlined,
                            label: listing.location,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),

                  if (listing.description != null && listing.description!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Text(
                      listing.description!,
                      style: TextStyle(fontSize: 13, color: context.cTextSec, height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  const SizedBox(height: 14),

                  // Action row
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: canEdit ? onEdit : null,
                          icon: const Icon(Icons.edit_outlined, size: 15),
                          label: Text(
                            canEdit ? 'Edit' : 'View',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: BorderSide(
                              color: canEdit ? AppColors.primary : context.cBorder,
                            ),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: onDelete,
                          icon: const Icon(Icons.delete_outline, size: 15),
                          label: const Text(
                            'Delete',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.error,
                            side: BorderSide(color: AppColors.error.withValues(alpha: 0.5)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  final IconData icon;
  const _ImagePlaceholder({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 170,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFCFFAFE), Color(0xFFE0F2FE)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 52, color: AppColors.primary.withValues(alpha: 0.45)),
          const SizedBox(height: 6),
          Text(
            'No photo',
            style: TextStyle(color: AppColors.primary.withValues(alpha: 0.55), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _InfoPill({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              label,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Empty State ──────────────────────────────────────────────────────────────

class _EmptyManageState extends StatelessWidget {
  final VoidCallback onAdd;
  final String filter;
  const _EmptyManageState({required this.onAdd, this.filter = 'All'});

  @override
  Widget build(BuildContext context) {
    final isFiltered = filter != 'All';
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.65,
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary.withValues(alpha: 0.15), AppColors.primaryLight],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isFiltered ? Icons.filter_list_off : Icons.inventory_2_outlined,
                    size: 44,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  isFiltered ? 'No $filter listings' : 'No listings yet',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: context.cText),
                ),
                const SizedBox(height: 8),
                Text(
                  isFiltered
                      ? 'You have no $filter listings. Try selecting a different filter.'
                      : 'Create your first waste listing\nto start receiving bids from recyclers.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: context.cTextSec, height: 1.55),
                ),
                const SizedBox(height: 28),
                if (!isFiltered)
                  ElevatedButton.icon(
                    onPressed: onAdd,
                    icon: const Icon(Icons.add, size: 20),
                    label: const Text('Create First Listing', style: TextStyle(fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BidsTab extends StatelessWidget {
  const _BidsTab();

  @override
  Widget build(BuildContext context) {
    return const BidsScreen();
  }
}

class _CollectionsTab extends StatelessWidget {
  const _CollectionsTab();

  @override
  Widget build(BuildContext context) {
    return const CollectionsScreen();
  }
}

class _HotelProfileTab extends StatelessWidget {
  const _HotelProfileTab();

  @override
  Widget build(BuildContext context) {
    return const HotelProfileScreen();
  }
}


