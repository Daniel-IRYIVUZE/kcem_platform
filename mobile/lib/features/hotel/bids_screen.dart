import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/models/models.dart';
import '../shared/widgets/eco_button.dart';

class BidsScreen extends ConsumerStatefulWidget {
  const BidsScreen({super.key});

  @override
  ConsumerState<BidsScreen> createState() => _BidsScreenState();
}

class _BidsScreenState extends ConsumerState<BidsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _sortBy = 'Highest Price';

  String get sortBy => _sortBy;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final listings = ref.watch(businessListingsProvider);
    final allBids = listings.expand((l) => l.bids).toList();
    // Sort bids
    final sorted = List<Bid>.from(allBids);
    if (_sortBy == 'Highest Price') {
      sorted.sort((a, b) => b.amount.compareTo(a.amount));
    } else if (_sortBy == 'Lowest Price') {
      sorted.sort((a, b) => a.amount.compareTo(b.amount));
    } else {
      sorted.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
    final activeBids = sorted.where((b) => b.status == BidStatus.active).toList();
    final wonBids = sorted.where((b) => b.status == BidStatus.won).toList();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Bids Received'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort),
            onSelected: (v) => setState(() => _sortBy = v),
            itemBuilder: (_) => [
              'Highest Price',
              'Lowest Price',
              'Most Recent',
              'Highest Rated',
            ].map((s) => PopupMenuItem(value: s, child: Text(s))).toList(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: 'All (${sorted.length})'),
            Tab(text: 'Active (${activeBids.length})'),
            Tab(text: 'Accepted (${wonBids.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BidsList(bids: sorted),
          _BidsList(bids: activeBids),
          wonBids.isEmpty
              ? const _EmptyState(
                  icon: Icons.check_circle_outline,
                  title: 'No accepted bids yet',
                  subtitle: 'Accept a bid to start a collection',
                )
              : _BidsList(bids: wonBids),
        ],
      ),
    );
  }
}

class _BidsList extends StatelessWidget {
  final List<Bid> bids;
  const _BidsList({required this.bids});

  @override
  Widget build(BuildContext context) {
    if (bids.isEmpty) {
      return const _EmptyState(
        icon: Icons.search_off,
        title: 'No bids here',
        subtitle: 'Check back later',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: bids.length,
      itemBuilder: (context, index) {
        return _BidCard(bid: bids[index])
            .animate()
            .slideY(begin: 0.15, duration: 300.ms, delay: (index * 60).ms)
            .fadeIn();
      },
    );
  }
}

class _BidCard extends ConsumerWidget {
  final Bid bid;
  const _BidCard({required this.bid});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.factory_outlined, size: 22, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      bid.recyclerName,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.star, color: AppColors.accent, size: 14),
                        const SizedBox(width: 3),
                        Text(
                          bid.collectionPreference,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'RWF ${bid.amount.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                      color: AppColors.primary,
                    ),
                  ),
                  Text(
                    _timeAgo(bid.createdAt),
                    style: const TextStyle(fontSize: 11, color: AppColors.textTertiary),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.recycling, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 6),
                Text(
                  bid.collectionPreference,
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          if (bid.note != null) ...[
            const SizedBox(height: 8),
            Text(
              '"${bid.note}"',
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                fontStyle: FontStyle.italic,
                height: 1.5,
              ),
            ),
          ],

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: EcoButton(
                  label: 'Accept',
                  height: 40,
                  onPressed: () => _showAcceptDialog(context, ref, bid),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: EcoButton(
                  label: 'Decline',
                  height: 40,
                  isOutlined: true,
                  backgroundColor: AppColors.error,
                  onPressed: () => _showDeclineDialog(context, ref, bid),
                ),
              ),
              const SizedBox(width: 10),
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: IconButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Chat with ${bid.recyclerName} — coming soon'),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat_bubble_outline, size: 18),
                  padding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showDeclineDialog(BuildContext context, WidgetRef ref, Bid bid) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Decline Bid?'),
        content: Text('Decline bid from ${bid.recyclerName}? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Bid from ${bid.recyclerName} declined'),
                  backgroundColor: AppColors.error,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Decline', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAcceptDialog(BuildContext context, WidgetRef ref, Bid bid) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Accept Bid?'),
        content: Text('Accept bid from ${bid.recyclerName} for RWF ${bid.amount.toStringAsFixed(0)}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(listingsNotifierProvider.notifier).acceptBid(bid.listingId, bid.id);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Bid from ${bid.recyclerName} accepted!'),
                  backgroundColor: AppColors.primary,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: const Text('Accept'),
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

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 56, color: AppColors.textTertiary),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
