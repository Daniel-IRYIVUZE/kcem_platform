import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/models/models.dart';
import '../../core/router/app_router.dart';
import '../shared/widgets/shared_cards.dart';

class CollectionsScreen extends ConsumerStatefulWidget {
  const CollectionsScreen({super.key});

  @override
  ConsumerState<CollectionsScreen> createState() => _CollectionsScreenState();
}

class _CollectionsScreenState extends ConsumerState<CollectionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;


  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final collections = ref.watch(businessCollectionsProvider);
    final scheduled = collections.where((c) =>
        c.status != CollectionStatus.completed &&
        c.status != CollectionStatus.missed).toList();
    final history = collections.where((c) =>
        c.status == CollectionStatus.completed ||
        c.status == CollectionStatus.missed).toList();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Collections'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: 'Scheduled (${scheduled.length})'),
            Tab(text: 'History (${history.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _ScheduledList(collections: scheduled),
          _HistoryList(history: history),
        ],
      ),
    );
  }
}

class _ScheduledList extends StatelessWidget {
  final List<Collection> collections;
  const _ScheduledList({required this.collections});

  @override
  Widget build(BuildContext context) {
    if (collections.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_shipping_outlined, size: 56, color: AppColors.textTertiary),
            SizedBox(height: 12),
            Text('No scheduled collections', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: collections.length,
      itemBuilder: (context, index) {
        return _CollectionCard(collection: collections[index])
            .animate()
            .slideY(begin: 0.15, duration: 300.ms, delay: (index * 80).ms)
            .fadeIn();
      },
    );
  }
}

class _CollectionCard extends StatelessWidget {
  final Collection collection;
  const _CollectionCard({required this.collection});

  Color get _statusColor {
    switch (collection.status) {
      case CollectionStatus.scheduled: return AppColors.primary;
      case CollectionStatus.enRoute: return AppColors.accent;
      default: return AppColors.textSecondary;
    }
  }

  String get _statusLabel {
    switch (collection.status) {
      case CollectionStatus.scheduled: return 'Scheduled';
      case CollectionStatus.enRoute: return 'En Route';
      case CollectionStatus.collected: return 'Collected';
      case CollectionStatus.verified: return 'Verified';
      default: return 'Pending';
    }
  }

  @override
  Widget build(BuildContext context) {
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
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.local_shipping, color: _statusColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      collection.driverName ?? collection.recyclerName,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                    Text(
                      '${collection.scheduledDate.day}/${collection.scheduledDate.month} at ${collection.scheduledTime}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              StatusBadge(
                label: _statusLabel,
                type: collection.status == CollectionStatus.scheduled
                    ? StatusType.success
                    : collection.status == CollectionStatus.enRoute
                        ? StatusType.warning
                        : StatusType.neutral,
              ),
            ],
          ),

          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.recycling, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${collection.wasteType.label} • ${collection.volume.toStringAsFixed(0)} ${collection.volume > 50 ? 'kg' : 'liters'}',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              if (collection.status == CollectionStatus.enRoute) ...[  
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.accentLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.access_time, color: AppColors.accent, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'En route to you',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.push(AppRoutes.driverNavigation),
                  icon: const Icon(Icons.my_location, size: 16),
                  label: const Text('Track'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 40),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Calling driver...'),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                icon: const Icon(Icons.call, size: 16),
                label: const Text('Call'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 40),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HistoryList extends StatelessWidget {
  final List<Collection> history;
  const _HistoryList({required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 56, color: AppColors.textTertiary),
            SizedBox(height: 12),
            Text('No collection history', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final item = history[index];
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
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.check_circle_outline, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.driverName ?? item.recyclerName,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    Text(
                      '${item.wasteType.label} • ${item.scheduledDate.day}/${item.scheduledDate.month}/${item.scheduledDate.year}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Text(
                'RWF ${item.earnings.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ).animate().slideY(begin: 0.15, duration: 300.ms, delay: (index * 60).ms).fadeIn();
      },
    );
  }
}
