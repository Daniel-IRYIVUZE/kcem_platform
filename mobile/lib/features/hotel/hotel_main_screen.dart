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
    final initials = (user?.displayName ?? 'H').substring(0, 1).toUpperCase();
    final greeting = _greeting();
    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: context.cSurf,
            floating: true,
            toolbarHeight: 72,
            automaticallyImplyLeading: false,
            flexibleSpace: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  children: [
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '$greeting,',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w400,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            user?.displayName ?? 'Hotel',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
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
                    PopupMenuButton<String>(
                      onSelected: (val) {
                        if (val == 'profile') onGoToProfile?.call();
                        if (val == 'logout') ref.read(authProvider.notifier).logout();
                      },
                      offset: const Offset(0, 44),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      tooltip: 'Account',
                      itemBuilder: (_) => [
                        const PopupMenuItem(
                          value: 'profile',
                          child: Row(children: [
                            Icon(Icons.settings_outlined, size: 18),
                            SizedBox(width: 10),
                            Text('Settings & Profile'),
                          ]),
                        ),
                        const PopupMenuDivider(),
                        const PopupMenuItem(
                          value: 'logout',
                          child: Row(children: [
                            Icon(Icons.logout, color: Colors.red, size: 18),
                            SizedBox(width: 10),
                            Text('Sign Out', style: TextStyle(color: Colors.red)),
                          ]),
                        ),
                      ],
                      child: CircleAvatar(
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
                    ),
                  ],
                ),
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

class _ManageListingsView extends ConsumerWidget {
  final VoidCallback onAdd;
  final ValueChanged<WasteListing> onEdit;
  const _ManageListingsView({required this.onAdd, required this.onEdit});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listings = ref.watch(businessListingsProvider);
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        backgroundColor: context.cSurf,
        elevation: 0,
        title: Text(
          'My Listings',
          style: TextStyle(color: context.cText, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: onAdd,
        icon: const Icon(Icons.add),
        label: const Text('', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: listings.isEmpty
          ? _EmptyManageState(onAdd: onAdd)
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
              itemCount: listings.length,
              itemBuilder: (context, index) {
                final l = listings[index];
                return _ManageListingCard(
                  listing: l,
                  onEdit: () => onEdit(l),
                  onDelete: () => _confirmDelete(context, ref, l),
                )
                    .animate()
                    .slideY(begin: 0.15, duration: 300.ms, delay: (index * 60).ms)
                    .fadeIn();
              },
            ),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, WasteListing listing) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Listing?'),
        content: Text(
            'Permanently remove the "${listing.wasteType.label}" listing? This cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(listingsNotifierProvider.notifier).delete(listing.id);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Row(children: [
                    Icon(Icons.delete_outline, color: Colors.white, size: 18),
                    SizedBox(width: 10),
                    Text('Listing deleted'),
                  ]),
                  backgroundColor: AppColors.error,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            style:
                ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Delete',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

class _ManageListingCard extends StatelessWidget {
  final WasteListing listing;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _ManageListingCard(
      {required this.listing,
      required this.onEdit,
      required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final statusColor = listing.status == ListingStatus.open
        ? AppColors.primary
        : listing.status == ListingStatus.assigned
            ? AppColors.accent
            : AppColors.textTertiary;
    final statusLabel = listing.status == ListingStatus.open
        ? 'Open'
        : listing.status == ListingStatus.assigned
            ? 'Assigned'
            : listing.status.name[0].toUpperCase() +
                listing.status.name.substring(1);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: context.cPrimaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  listing.wasteType == WasteType.glass
                      ? Icons.wine_bar_outlined
                      : listing.wasteType == WasteType.paperCardboard
                          ? Icons.article_outlined
                          : Icons.delete_outline,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      listing.wasteType.label,
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          color: context.cText),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${listing.volume.toStringAsFixed(0)} ${listing.unit}  ·  ${listing.quality.label}',
                      style:
                          TextStyle(fontSize: 13, color: context.cTextSec),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 16,
            runSpacing: 4,
            children: [
              _InfoChip(
                  icon: Icons.gavel_outlined,
                  label: '${listing.activeBidCount} bids',
                  color: context.cTextSec),
              _InfoChip(
                  icon: Icons.payments_outlined,
                  label:
                      'Min RWF ${listing.minBid.toStringAsFixed(0)}',
                  color: context.cTextSec),
              _InfoChip(
                  icon: Icons.location_on_outlined,
                  label: listing.location,
                  color: context.cTextSec),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_outlined, size: 16),
                  label: const Text('Edit'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline, size: 16),
                  label: const Text('Delete'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: const BorderSide(color: AppColors.error),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _InfoChip(
      {required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 12, color: color)),
      ],
    );
  }
}

class _EmptyManageState extends StatelessWidget {
  final VoidCallback onAdd;
  const _EmptyManageState({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: context.cPrimaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.inventory_2_outlined,
                  size: 40, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            Text(
              'No listings yet',
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: context.cText),
            ),
            const SizedBox(height: 8),
            Text(
              'Create your first waste listing to start receiving bids from recyclers.',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 14, color: context.cTextSec, height: 1.5),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add),
              label: const Text('Create First Listing',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
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


