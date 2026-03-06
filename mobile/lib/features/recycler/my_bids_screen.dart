import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/shared_cards.dart';

class MyBidsScreen extends ConsumerStatefulWidget {
  const MyBidsScreen({super.key});

  @override
  ConsumerState<MyBidsScreen> createState() => _MyBidsScreenState();
}

class _MyBidsScreenState extends ConsumerState<MyBidsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

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
    final listings = ref.watch(recyclerBidListingsProvider);
    final allBids = listings.expand((l) => l.bids).toList();
    final activeBids = allBids.where((b) => b.status == BidStatus.active).toList();
    final wonBids = allBids.where((b) => b.status == BidStatus.won).toList();
    final lostBids = allBids.where((b) => b.status == BidStatus.lost).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Bids'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: 'Active (${activeBids.length})'),
            Tab(text: 'Won (${wonBids.length})'),
            Tab(text: 'Lost (${lostBids.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BidListView(bids: activeBids, type: BidStatus.active),
          _BidListView(bids: wonBids, type: BidStatus.won),
          _LostBidsView(bids: lostBids),
        ],
      ),
    );
  }
}

class _BidListView extends ConsumerWidget {
  final List<Bid> bids;
  final BidStatus type;
  const _BidListView({required this.bids, required this.type});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (bids.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              type == BidStatus.active ? Icons.gavel_outlined : Icons.check_circle_outline,
              size: 64, color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              type == BidStatus.active ? 'No active bids' : 'No won bids yet',
              style: const TextStyle(fontSize: 16, color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: bids.length,
      itemBuilder: (context, index) {
        final bid = bids[index];
        final statusColor = type == BidStatus.won ? AppColors.primary : AppColors.info;
        final statusLabel = type == BidStatus.won ? 'Won' : 'Pending';
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: type == BidStatus.won ? AppColors.primary.withOpacity(0.3) : AppColors.border,
              width: type == BidStatus.won ? 1.5 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.gavel, color: statusColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(bid.recyclerName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text(bid.note ?? 'Bid submitted', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('RWF ${bid.amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.primary)),
                      StatusBadge(label: statusLabel, type: type == BidStatus.won ? StatusType.success : StatusType.info),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text('Submitted ${_timeAgo(bid.createdAt)}', style: const TextStyle(fontSize: 12, color: AppColors.textTertiary)),
              if (type == BidStatus.active) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _confirmWithdraw(context, ref, bid),
                        style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38), foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)),
                        child: const Text('Withdraw'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _showReviseBid(context, ref, bid),
                        style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                        child: const Text('Revise Bid'),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ).animate().slideY(begin: 0.15, duration: 300.ms, delay: (index * 60).ms).fadeIn();
      },
    );
  }

  void _confirmWithdraw(BuildContext context, WidgetRef ref, Bid bid) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Withdraw Bid?', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text('Withdraw your bid of RWF ${bid.amount.toStringAsFixed(0)}? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(bidsNotifierProvider.notifier).withdrawBid(bid.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Bid withdrawn'),
                    backgroundColor: AppColors.error,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Withdraw', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showReviseBid(BuildContext context, WidgetRef ref, Bid bid) {
    final ctrl = TextEditingController(text: bid.amount.toStringAsFixed(0));
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Revise Bid', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            const Text('Enter your new bid amount', style: TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              decoration: InputDecoration(
                prefixText: 'RWF ',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Row(
                          children: [
                            Icon(Icons.gavel, color: Colors.white, size: 16),
                            SizedBox(width: 8),
                            Text('Bid revised successfully!'),
                          ],
                        ),
                        backgroundColor: AppColors.primary,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                child: const Text('Submit Revised Bid', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
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

class _LostBidsView extends StatelessWidget {
  final List<Bid> bids;
  const _LostBidsView({required this.bids});

  @override
  Widget build(BuildContext context) {
    if (bids.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.thumb_up_outlined, size: 64, color: AppColors.textTertiary),
            SizedBox(height: 16),
            Text('No lost bids!', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: bids.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: const Row(
              children: [
                Icon(Icons.lightbulb_outline, color: Color(0xFF92400E), size: 20),
                SizedBox(width: 10),
                Expanded(child: Text('Analyze losing bids to improve your future offers', style: TextStyle(fontSize: 13, color: Color(0xFF92400E)))),
              ],
            ),
          );
        }
        final bid = bids[index - 1];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.close, color: AppColors.error, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(bid.recyclerName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text(bid.note ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('RWF ${bid.amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough)),
                      const StatusBadge(label: 'Lost', type: StatusType.error),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8)),
                child: const Row(
                  children: [
                    Icon(Icons.emoji_events, size: 16, color: AppColors.accent),
                    SizedBox(width: 6),
                    Text('Bid was not competitive', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ],
          ),
        ).animate().slideY(begin: 0.15, duration: 300.ms, delay: ((index - 1) * 60).ms).fadeIn();
      },
    );
  }
}
