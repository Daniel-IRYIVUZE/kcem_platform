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

  Future<void> _refresh() async {
    ref.read(bidsNotifierProvider.notifier).refresh();
    // Small delay to let the FutureProvider re-fire before we return
    await Future<void>.delayed(const Duration(milliseconds: 300));
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(recyclerBidsLoadingProvider);
    final listings = ref.watch(recyclerBidListingsProvider);
    final allBids = listings.expand((l) => l.bids).toList();
    final activeBids = allBids.where((b) => b.status == BidStatus.active).toList();
    final wonBids = allBids.where((b) => b.status == BidStatus.won).toList();
    final lostBids = allBids.where((b) => b.status == BidStatus.lost).toList();

    // Maps: bid ID → hotel name, min bid (price/unit), volume, unit
    final bidToHotel = <String, String>{};
    final bidToMinBid = <String, double>{};
    final bidToVolume = <String, double>{};
    final bidToUnit = <String, String>{};
    for (final listing in listings) {
      for (final bid in listing.bids) {
        bidToHotel[bid.id] = listing.businessName;
        bidToMinBid[bid.id] = listing.minBid;
        bidToVolume[bid.id] = listing.volume;
        bidToUnit[bid.id] = listing.unit;
      }
    }

    return Scaffold(
      backgroundColor: context.cBg,
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
      body: isLoading && allBids.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _BidListView(bids: activeBids, type: BidStatus.active, bidToHotel: bidToHotel, bidToMinBid: bidToMinBid, bidToVolume: bidToVolume, bidToUnit: bidToUnit),
                  _BidListView(bids: wonBids, type: BidStatus.won, bidToHotel: bidToHotel, bidToMinBid: bidToMinBid, bidToVolume: bidToVolume, bidToUnit: bidToUnit),
                  _LostBidsView(bids: lostBids, bidToHotel: bidToHotel, bidToMinBid: bidToMinBid, bidToVolume: bidToVolume, bidToUnit: bidToUnit),
                ],
              ),
            ),
    );
  }
}

class _BidListView extends ConsumerWidget {
  final List<Bid> bids;
  final BidStatus type;
  final Map<String, String> bidToHotel;
  final Map<String, double> bidToMinBid;
  final Map<String, double> bidToVolume;
  final Map<String, String> bidToUnit;
  const _BidListView({
    required this.bids,
    required this.type,
    required this.bidToHotel,
    required this.bidToMinBid,
    required this.bidToVolume,
    required this.bidToUnit,
  });

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
        final hotelName = bidToHotel[bid.id] ?? bid.recyclerName;
        final minBid = bidToMinBid[bid.id] ?? 0;
        final volume = bidToVolume[bid.id] ?? 0;
        final unit = bidToUnit[bid.id] ?? 'kg';
        final totalAmount = volume * minBid;
        final statusColor = type == BidStatus.won ? AppColors.primary : AppColors.info;
        final statusLabel = type == BidStatus.won ? 'Won' : 'Pending';
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: context.cSurf,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: type == BidStatus.won ? AppColors.primary.withValues(alpha: 0.3) : context.cBorder,
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
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.gavel, color: statusColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(hotelName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text(bid.note ?? 'Bid submitted', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  StatusBadge(label: statusLabel, type: type == BidStatus.won ? StatusType.success : StatusType.info),
                ],
              ),
              const SizedBox(height: 10),
              // Min Bid & Total Amount row
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Min Bid', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        Text(
                          'RWF ${_fmt(minBid)}/$unit',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('Total Amount', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        Text(
                          'RWF ${_fmt(totalAmount)}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Your bid: RWF ${_fmt(bid.amount)}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.accent)),
                  Text('Submitted ${_timeAgo(bid.createdAt)}', style: const TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                ],
              ),
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
    bool loading = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) => Padding(
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
                  onPressed: loading
                      ? null
                      : () async {
                          final newAmount = double.tryParse(ctrl.text.replaceAll(',', ''));
                          if (newAmount == null || newAmount <= 0) return;
                          setSheetState(() => loading = true);
                          try {
                            await ref.read(bidsNotifierProvider.notifier).increaseBid(bid.id, newAmount);
                            if (sheetCtx.mounted) Navigator.pop(sheetCtx);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Row(children: [
                                    Icon(Icons.gavel, color: Colors.white, size: 16),
                                    SizedBox(width: 8),
                                    Text('Bid revised successfully!'),
                                  ]),
                                  backgroundColor: AppColors.primary,
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            }
                          } catch (e) {
                            setSheetState(() => loading = false);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Failed to revise bid: $e'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                  child: loading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Submit Revised Bid', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
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

  String _fmt(double v) {
    if (v >= 1000000) return '${(v / 1000000).toStringAsFixed(1)}M';
    if (v >= 1000) return '${(v / 1000).toStringAsFixed(0)}K';
    return v.toStringAsFixed(0);
  }
}

class _LostBidsView extends StatelessWidget {
  final List<Bid> bids;
  final Map<String, String> bidToHotel;
  final Map<String, double> bidToMinBid;
  final Map<String, double> bidToVolume;
  final Map<String, String> bidToUnit;
  const _LostBidsView({
    required this.bids,
    required this.bidToHotel,
    required this.bidToMinBid,
    required this.bidToVolume,
    required this.bidToUnit,
  });

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
        final hotelName = bidToHotel[bid.id] ?? bid.recyclerName;
        final minBid = bidToMinBid[bid.id] ?? 0;
        final volume = bidToVolume[bid.id] ?? 0;
        final unit = bidToUnit[bid.id] ?? 'kg';
        final totalAmount = volume * minBid;
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: context.cSurf, borderRadius: BorderRadius.circular(16), border: Border.all(color: context.cBorder)),
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
                        Text(hotelName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text(bid.note ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                  const StatusBadge(label: 'Lost', type: StatusType.error),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Min Bid', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text('RWF ${_fmt(minBid)}/$unit', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ]),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      Text('Total Amount', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text('RWF ${_fmt(totalAmount)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
                    ]),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Your bid: RWF ${_fmt(bid.amount)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough)),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: context.cSurfAlt, borderRadius: BorderRadius.circular(8)),
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

  String _fmt(double v) {
    if (v >= 1000000) return '${(v / 1000000).toStringAsFixed(1)}M';
    if (v >= 1000) return '${(v / 1000).toStringAsFixed(0)}K';
    return v.toStringAsFixed(0);
  }
}
