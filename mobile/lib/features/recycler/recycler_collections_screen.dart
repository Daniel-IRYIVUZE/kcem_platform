import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';

class RecyclerCollectionsScreen extends ConsumerStatefulWidget {
  const RecyclerCollectionsScreen({super.key});

  @override
  ConsumerState<RecyclerCollectionsScreen> createState() => _RecyclerCollectionsScreenState();
}

class _RecyclerCollectionsScreenState extends ConsumerState<RecyclerCollectionsScreen> {
  @override
  Widget build(BuildContext context) {
    final collections = ref.watch(recyclerCollectionsProvider);
    final pending = collections.where((c) => c.status == CollectionStatus.scheduled).toList();
    final assigned = collections.where((c) => c.status == CollectionStatus.enRoute).toList();
    final done = collections.where((c) => c.status == CollectionStatus.completed || c.status == CollectionStatus.verified || c.status == CollectionStatus.collected).toList();
    final Map<String, List<Collection>> kanbanData = {
      'Pending': pending,
      'Assigned': assigned,
      'Collected': done,
    };
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        title: const Text('Collections Board'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              String selectedFilter = 'All';
              showModalBottomSheet(
                context: context,
                backgroundColor: Theme.of(context).colorScheme.surface,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                builder: (ctx) => StatefulBuilder(
                  builder: (ctx, setModalState) => Padding(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Filter Collections', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 16),
                        const Text('By Status', style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          children: [
                            for (final f in ['All', 'Pending', 'Assigned', 'Collected'])
                              GestureDetector(
                                onTap: () => setModalState(() => selectedFilter = f),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    color: selectedFilter == f ? AppColors.primary : AppColors.primaryLight,
                                    border: Border.all(color: selectedFilter == f ? AppColors.primary : AppColors.border),
                                  ),
                                  child: Text(f, style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: selectedFilter == f ? Colors.white : AppColors.primary,
                                  )),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Row(children: [
                          Expanded(child: OutlinedButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Clear'),
                          )),
                          const SizedBox(width: 12),
                          Expanded(child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text('Showing: $selectedFilter collections'),
                                backgroundColor: AppColors.primary,
                                behavior: SnackBarBehavior.floating,
                              ));
                            },
                            child: const Text('Apply Filter'),
                          )),
                        ]),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Summary row
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
            child: Row(
              children: [
                _KanbanCount(label: 'Pending', count: pending.length, color: AppColors.accent),
                const SizedBox(width: 12),
                _KanbanCount(label: 'Assigned', count: assigned.length, color: AppColors.info),
                const SizedBox(width: 12),
                _KanbanCount(label: 'Collected', count: done.length, color: AppColors.primary),
              ],
            ),
          ),

          // Kanban board
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: kanbanData.entries.map((entry) {
                  return _KanbanColumn(
                    title: entry.key,
                    cards: entry.value,
                    color: entry.key == 'Pending'
                        ? AppColors.accent
                        : entry.key == 'Assigned'
                            ? AppColors.info
                            : AppColors.primary,
                    onAssign: entry.key == 'Pending'
                        ? (c) => _showAssignDriver(context, c)
                        : null,
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAssignDriver(BuildContext context, Collection col) {
    final drivers = ['Jean Paul Kagame', 'Marie Claire Uwera', 'Pierre Nkurunziza', 'Eric Mutabazi'];

    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Assign Driver', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(
              'For: ${col.businessName} - ${col.wasteType.label} ${col.volume.toStringAsFixed(0)} ${col.wasteType == WasteType.uco ? "L" : "kg"}',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            ...drivers.map((driver) => ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primaryLight,
                    child: Text(
                      driver.split(' ').map((e) => e[0]).take(2).join(),
                      style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
                    ),
                  ),
                  title: Text(driver),
                  subtitle: const Text('Available • 0 active jobs'),
                  trailing: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(minimumSize: const Size(70, 32)),
                    child: const Text('Assign'),
                  ),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                )),
          ],
        ),
      ),
    );
  }
}

class _KanbanCount extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _KanbanCount({required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text(
              '$count',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: color,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KanbanColumn extends StatelessWidget {
  final String title;
  final List<Collection> cards;
  final Color color;
  final Function(Collection)? onAssign;

  const _KanbanColumn({
    required this.title,
    required this.cards,
    required this.color,
    this.onAssign,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      margin: const EdgeInsets.only(right: 12, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: color,
                    fontSize: 14,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${cards.length}',
                    style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          ...cards.asMap().entries.map((e) {
            return _KanbanCard(
              data: e.value,
              color: color,
              onAssign: onAssign != null ? () => onAssign!(e.value) : null,
            )
                .animate()
                .slideY(begin: 0.2, duration: 300.ms, delay: (e.key * 80).ms)
                .fadeIn();
          }),
        ],
      ),
    );
  }
}

class _KanbanCard extends StatelessWidget {
  final Collection data;
  final Color color;
  final VoidCallback? onAssign;

  const _KanbanCard({required this.data, required this.color, this.onAssign});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(data.businessName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 4),
          Text(
            '${data.wasteType.label} ${data.volume.toStringAsFixed(0)} ${data.wasteType == WasteType.uco ? "L" : "kg"}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.access_time, size: 13, color: color),
              const SizedBox(width: 4),
              Text(data.scheduledTime, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 13, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(data.driverName ?? 'Unassigned', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
          if (onAssign != null) ...[
            const SizedBox(height: 10),
            GestureDetector(
              onTap: onAssign,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 7),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: color.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.person_add_outlined, size: 14, color: color),
                    const SizedBox(width: 6),
                    Text(
                      'Assign Driver',
                      style: TextStyle(
                        fontSize: 12,
                        color: color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
