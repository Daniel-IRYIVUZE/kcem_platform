import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
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
import '../../core/utils/cat_date_utils.dart';

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

  String _greeting() => CatDateUtils.greeting();

  String _fmt(dynamic val) {
    final n = (val ?? 0).toDouble();
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toStringAsFixed(0);
  }

  String _scoreLevel(int score) {
    if (score >= 80) return 'Eco Master';
    if (score >= 60) return 'Eco Champion';
    if (score >= 40) return 'Eco Starter';
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

  String _timeAgo(DateTime dt) => CatDateUtils.timeAgo(dt);
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

// ─── Listing Card (List Mode) ─────────────────────────────────────────────────

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

  void _showDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ListingDetailSheet(listing: listing),
    );
  }

  @override
  Widget build(BuildContext context) {
    final imageUrls = getAbsoluteImageUrls(listing.photos);
    final hasImage = imageUrls.isNotEmpty;
    final canEdit = listing.status == ListingStatus.open ||
        listing.status == ListingStatus.draft;
    final canDelete = listing.status == ListingStatus.open ||
        listing.status == ListingStatus.draft ||
        listing.status == ListingStatus.expired;
    final pickup = listing.collectionDate;
    final pickupText = pickup != null ? CatDateUtils.formatDate(pickup) : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Left: image strip ─────────────────────────────────────
              SizedBox(
                width: 84,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    hasImage
                        ? Image.network(
                            imageUrls.first,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _ListImgPlaceholder(icon: _wasteIcon),
                          )
                        : _ListImgPlaceholder(icon: _wasteIcon),
                    // Photo count
                    if (imageUrls.length > 1)
                      Positioned(
                        bottom: 5, right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.55),
                            borderRadius: BorderRadius.circular(7),
                          ),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.photo_library_outlined, color: Colors.white, size: 9),
                            const SizedBox(width: 2),
                            Text('${imageUrls.length}',
                                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600)),
                          ]),
                        ),
                      ),
                  ],
                ),
              ),

              // ── Right: details ────────────────────────────────────────
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status pill + price
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _statusColor,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(_statusLabel,
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                          ),
                          const Spacer(),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('RWF ${listing.minBid.toStringAsFixed(0)}',
                                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 13)),
                              const Text('min bid', style: TextStyle(color: AppColors.primary, fontSize: 9)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),

                      // Waste type + volume
                      Text(listing.wasteType.label,
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: context.cText)),
                      Text('${listing.volume.toStringAsFixed(0)} ${listing.unit}  ·  ${listing.quality.label}',
                          style: TextStyle(fontSize: 12, color: context.cTextSec)),
                      const SizedBox(height: 6),

                      // Info chips
                      Wrap(spacing: 5, runSpacing: 4, children: [
                        _MiniChip(
                          icon: Icons.gavel,
                          label: '${listing.activeBidCount} bid${listing.activeBidCount == 1 ? '' : 's'}',
                          color: listing.activeBidCount > 0 ? AppColors.success : AppColors.textTertiary,
                        ),
                        if (pickupText != null)
                          _MiniChip(icon: Icons.calendar_today_outlined, label: pickupText, color: AppColors.accent),
                        _MiniChip(icon: Icons.location_on_outlined, label: listing.location, color: AppColors.textSecondary),
                      ]),

                      if (listing.description != null && listing.description!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(listing.description!,
                            style: TextStyle(fontSize: 11, color: context.cTextSec, height: 1.3),
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],

                      // QR section (compact embed)
                      if (listing.qrToken != null) ...[
                        const SizedBox(height: 8),
                        _QrCodeSection(listing: listing),
                      ],

                      const SizedBox(height: 8),

                      // Action row: eye, edit, delete
                      Row(
                        children: [
                          _ActionIconBtn(
                            icon: Icons.remove_red_eye_outlined,
                            tooltip: 'View Details',
                            color: AppColors.primary,
                            onTap: () => _showDetail(context),
                          ),
                          if (canEdit) ...[
                            const SizedBox(width: 6),
                            _ActionIconBtn(
                              icon: Icons.edit_outlined,
                              tooltip: 'Edit',
                              color: AppColors.info,
                              onTap: onEdit,
                            ),
                          ],
                          const Spacer(),
                          if (canDelete)
                            _ActionIconBtn(
                              icon: Icons.delete_outline,
                              tooltip: 'Delete',
                              color: AppColors.error,
                              onTap: onDelete,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── QR Code Section (embedded in listing card) ───────────────────────────────
class _QrCodeSection extends StatelessWidget {
  final WasteListing listing;
  const _QrCodeSection({required this.listing});

  /// Build a JSON payload containing both the lookup token and human-readable metadata.
  String get _qrPayload => jsonEncode({
    't': listing.qrToken,                         // backend lookup key
    'l': int.tryParse(listing.id) ?? listing.id,  // listing ID
    'h': listing.businessName,                    // hotel/business name
    'w': listing.wasteType.label,                 // waste type
    'v': listing.volume,                          // volume
    'u': listing.unit,                            // unit (kg / liters)
  });

  void _showFullDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (_) => _QrFullDialog(listing: listing),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showFullDialog(context),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.primary.withValues(alpha: 0.20),
          ),
        ),
        child: Row(
          children: [
            // Small QR preview
            Container(
              width: 72,
              height: 72,
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.15),
                ),
              ),
              child: QrImageView(
                data: _qrPayload,
                version: QrVersions.auto,
                size: 60,
                backgroundColor: Colors.white,
              ),
            ),
            const SizedBox(width: 14),
            // Text info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.qr_code_2_rounded,
                          size: 15, color: AppColors.primary),
                      const SizedBox(width: 5),
                      const Text(
                        'Collection QR Code',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Show to the driver when they arrive to verify pickup.',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.primary.withValues(alpha: 0.70),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.open_in_full_rounded,
                          size: 11, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        'Tap to enlarge',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary.withValues(alpha: 0.85),
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

// ─── Full-Screen QR Dialog ────────────────────────────────────────────────────
class _QrFullDialog extends StatelessWidget {
  final WasteListing listing;
  const _QrFullDialog({required this.listing});

  String get _qrPayload => jsonEncode({
    't': listing.qrToken,
    'l': int.tryParse(listing.id) ?? listing.id,
    'h': listing.businessName,
    'w': listing.wasteType.label,
    'v': listing.volume,
    'u': listing.unit,
  });

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final dialogWidth = (mq.size.width * 0.90).clamp(0.0, 360.0);
    final qrSize = (dialogWidth - 48).clamp(160.0, 280.0);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      insetPadding: EdgeInsets.symmetric(
        horizontal: (mq.size.width - dialogWidth) / 2,
        vertical: 24,
      ),
      child: SizedBox(
        width: dialogWidth,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
              decoration: const BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.qr_code_2_rounded,
                        color: AppColors.primary, size: 32),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Collection QR Code',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Show this to the driver when they arrive',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.primary.withValues(alpha: 0.75),
                    ),
                  ),
                ],
              ),
            ),

            // QR code
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
              child: Container(
                width: qrSize,
                height: qrSize,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: QrImageView(
                  data: _qrPayload,
                  version: QrVersions.auto,
                  size: qrSize - 24,
                  backgroundColor: Colors.white,
                ),
              ),
            ),

            // Token chip
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 14, 24, 0),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: context.cSurfAlt,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: context.cBorder),
                ),
                child: Row(
                  children: [
                    Icon(Icons.key_rounded, size: 13, color: context.cTextSec),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        '${listing.wasteType.label} · ${listing.volume.toStringAsFixed(0)} ${listing.unit} · ${listing.businessName}',
                        style: TextStyle(
                          fontSize: 11,
                          color: context.cTextSec,
                          letterSpacing: 0.3,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 2,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Close button
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 18, 24, 24),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text(
                    'Close',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── List-mode image placeholder ─────────────────────────────────────────────

class _ListImgPlaceholder extends StatelessWidget {
  final IconData icon;
  const _ListImgPlaceholder({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primaryLight,
      child: Center(
        child: Icon(icon, size: 30, color: AppColors.primary.withValues(alpha: 0.55)),
      ),
    );
  }
}

// ─── Mini info chip ───────────────────────────────────────────────────────────

class _MiniChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _MiniChip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.09),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
              maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

// ─── Action icon button ───────────────────────────────────────────────────────

class _ActionIconBtn extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final Color color;
  final VoidCallback onTap;
  const _ActionIconBtn({required this.icon, required this.tooltip, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withValues(alpha: 0.22)),
          ),
          child: Icon(icon, size: 16, color: color),
        ),
      ),
    );
  }
}

// ─── Listing Detail Sheet ─────────────────────────────────────────────────────

class _ListingDetailSheet extends StatelessWidget {
  final WasteListing listing;
  const _ListingDetailSheet({required this.listing});

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
    final pickup = listing.collectionDate;

    return DraggableScrollableSheet(
      initialChildSize: 0.72,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (ctx, scrollCtrl) {
        return Container(
          decoration: BoxDecoration(
            color: context.cSurf,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Drag handle
              Padding(
                padding: const EdgeInsets.only(top: 10, bottom: 4),
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: context.cBorder,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(_wasteIcon, color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(listing.wasteType.label,
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: context.cText)),
                          Text('${listing.volume.toStringAsFixed(0)} ${listing.unit}  ·  ${listing.quality.label}',
                              style: TextStyle(fontSize: 12, color: context.cTextSec)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _statusColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(_statusLabel,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ),
              const Divider(height: 20, indent: 20, endIndent: 20),
              // Scrollable body
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                  children: [
                    // Photo strip
                    if (imageUrls.isNotEmpty) ...[
                      SizedBox(
                        height: 120,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: imageUrls.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (_, idx) => ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              imageUrls[idx],
                              width: 120, height: 120, fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 120, height: 120,
                                color: AppColors.primaryLight,
                                child: Icon(_wasteIcon, color: AppColors.primary, size: 36),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Details
                    _DetailItem(icon: Icons.location_on_outlined, label: 'Location', value: listing.location),
                    _DetailItem(icon: Icons.monetization_on_outlined, label: 'Min Bid', value: 'RWF ${listing.minBid.toStringAsFixed(0)}'),
                    if (listing.reservePrice != null)
                      _DetailItem(icon: Icons.price_check, label: 'Reserve Price', value: 'RWF ${listing.reservePrice!.toStringAsFixed(0)}'),
                    if (listing.autoAcceptAbove != null)
                      _DetailItem(icon: Icons.auto_awesome, label: 'Auto-accept Above', value: 'RWF ${listing.autoAcceptAbove!.toStringAsFixed(0)}'),
                    _DetailItem(icon: Icons.timer_outlined, label: 'Auction Duration', value: '${listing.auctionDuration}h'),
                    if (pickup != null)
                      _DetailItem(icon: Icons.calendar_today_outlined, label: 'Pickup Date', value: CatDateUtils.formatDate(pickup)),
                    _DetailItem(icon: Icons.calendar_month_outlined, label: 'Listed', value: CatDateUtils.formatDateTime(listing.createdAt)),
                    if (listing.description != null && listing.description!.isNotEmpty)
                      _DetailItem(icon: Icons.notes_outlined, label: 'Description', value: listing.description!),
                    if (listing.notes != null && listing.notes!.isNotEmpty)
                      _DetailItem(icon: Icons.sticky_note_2_outlined, label: 'Notes', value: listing.notes!),

                    // Bids
                    if (listing.bids.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Text('Bids (${listing.bids.length})',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      const SizedBox(height: 8),
                      ...listing.bids.map((bid) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: context.cSurfAlt,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: context.cBorder),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.recycling, size: 16, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(bid.recyclerName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                  if (bid.note != null)
                                    Text(bid.note!, style: TextStyle(fontSize: 11, color: context.cTextSec), maxLines: 1, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                            Text('RWF ${bid.amount.toStringAsFixed(0)}',
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primary)),
                          ],
                        ),
                      )),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

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
}

// ─── Detail row helper ────────────────────────────────────────────────────────

class _DetailItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailItem({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 15, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          SizedBox(
            width: 110,
            child: Text(label,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ),
          Expanded(
            child: Text(value,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: context.cText)),
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


