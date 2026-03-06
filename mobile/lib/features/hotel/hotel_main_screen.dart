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
          ? const _HotelHomeTab()
          : _selectedIndex == 1
              ? const _ListWasteTab()
              : _selectedIndex == 2
                  ? const _BidsTab()
                  : _selectedIndex == 3
                      ? const _CollectionsTab()
                      : const _HotelProfileTab(),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) => setState(() => _selectedIndex = index),
          backgroundColor: AppColors.surface,
          elevation: 0,
          destinations: _navItems
              .map((item) => NavigationDestination(
                    icon: Icon(item.icon),
                    selectedIcon: Icon(item.activeIcon),
                    label: item.label,
                  ))
              .toList(),
        ),
      ),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () => setState(() => _selectedIndex = 1),
              icon: const Icon(Icons.add),
              label: const Text(
                'List Waste',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
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
  const _HotelHomeTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final stats = ref.watch(businessStatsProvider);
    final listings = ref.watch(businessListingsProvider);
    final unread = ref.watch(unreadCountProvider);
    final initials = (user?.displayName ?? 'H').substring(0, 1).toUpperCase();
    final greeting = _greeting();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: AppColors.surface,
            floating: true,
            expandedHeight: 70,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              title: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '$greeting 👋',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Text(
                        user?.displayName ?? 'Hotel',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.notifications_outlined, color: AppColors.textPrimary),
                        onPressed: () => context.push(AppRoutes.notifications),
                      ),
                      if (unread > 0)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.error,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.primaryLight,
                    child: Text(
                      initials,
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Offline banner
                const OfflineBanner(),
                if (true) const SizedBox(height: 4),

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
                  childAspectRatio: 1.4,
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
                  onAction: () {},
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

class _EmptyListings extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 36, color: AppColors.textTertiary),
          const SizedBox(height: 8),
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
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            listing.wasteType == WasteType.uco
                ? Icons.water_drop_outlined
                : listing.wasteType == WasteType.glass
                    ? Icons.wine_bar_outlined
                    : listing.wasteType == WasteType.paperCardboard
                        ? Icons.article_outlined
                        : Icons.delete_outline,
            size: 28,
            color: AppColors.primary,
          ),
          const Spacer(),
          Text(
            listing.wasteType.label,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
          ),
          const SizedBox(height: 2),
          Text(
            '${listing.volume.toStringAsFixed(0)} ${listing.unit}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.gavel, size: 12, color: AppColors.primary),
              const SizedBox(width: 4),
              Text(
                '${listing.activeBidCount} bids',
                style: const TextStyle(
                  fontSize: 12,
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
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
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

// ─── List Waste Tab ───────────────────────────────────────────────────────────
class _ListWasteTab extends StatelessWidget {
  const _ListWasteTab();

  @override
  Widget build(BuildContext context) {
    return const ListWasteScreen();
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


