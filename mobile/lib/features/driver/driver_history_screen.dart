import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';

class DriverHistoryScreen extends ConsumerStatefulWidget {
  const DriverHistoryScreen({super.key});

  @override
  ConsumerState<DriverHistoryScreen> createState() => _DriverHistoryScreenState();
}

class _DriverHistoryScreenState extends ConsumerState<DriverHistoryScreen> {
  String _filter = 'All';
  final List<String> _filters = ['All', 'This Week', 'This Month', 'Last Month'];

  static String _fmtRwf(num n) =>
      n.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');

  @override
  Widget build(BuildContext context) {
    final collections = ref.watch(driverCollectionsProvider);
    final completed = collections.where((c) => c.status == CollectionStatus.completed || c.status == CollectionStatus.verified).toList();
    final totalEarned = completed.fold<double>(0, (s, c) => s + c.earnings);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_download_outlined),
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Export report coming soon'), behavior: SnackBarBehavior.floating),
            ),
            tooltip: 'Export report',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((f) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setState(() => _filter = f),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: _filter == f ? AppColors.primary : AppColors.background,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: _filter == f ? AppColors.primary : AppColors.border),
                      ),
                      child: Text(
                        f,
                        style: TextStyle(
                          color: _filter == f ? Colors.white : AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                )).toList(),
              ),
            ),
          ),

          // Summary strip
          Container(
            color: AppColors.primaryLight,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _MiniStat(label: 'Collections', value: '${completed.length}'),
                _Divider(),
                _MiniStat(label: 'Total Earned', value: 'RWF ${_fmtRwf(totalEarned)}'),
                _Divider(),
                _MiniStat(label: 'Total Vol.', value: '${completed.fold<num>(0, (s, c) => s + c.volume).toStringAsFixed(0)} kg'),
              ],
            ),
          ),

          // Collection list
          Expanded(
            child: completed.isEmpty
                ? const Center(child: Text('No completed collections yet', style: TextStyle(color: AppColors.textSecondary)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: completed.length,
                    itemBuilder: (context, i) => _CollectionHistoryCard(
                      collection: completed[i],
                      onTap: () => _showDetail(context, completed[i]),
                    ).animate().fadeIn(delay: (i * 80).ms),
                  ),
          ),
        ],
      ),
    );
  }

  void _showDetail(BuildContext context, Collection c) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        builder: (_, ctrl) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: ctrl,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text(c.businessName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18))),
                  _StatusBadge(status: c.status.name),
                ],
              ),
              Text('${c.scheduledDate.day}/${c.scheduledDate.month}/${c.scheduledDate.year}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 16),
              _DetailRow(icon: Icons.recycling, label: 'Waste Type', value: c.wasteType.label),
              const SizedBox(height: 8),
              _DetailRow(icon: Icons.inventory_2, label: 'Volume', value: '${c.volume.toStringAsFixed(0)} kg'),
              const SizedBox(height: 8),
              _DetailRow(icon: Icons.location_on, label: 'Location', value: c.location),
              const SizedBox(height: 8),
              _DetailRow(icon: Icons.attach_money, label: 'Earnings', value: 'RWF ${_fmtRwf(c.earnings)}'),
            ],
          ),
        ),
      ),
    );
  }
}


class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
      ],
    );
  }
}

class _CollectionHistoryCard extends StatelessWidget {
  final Collection collection;
  final VoidCallback onTap;
  const _CollectionHistoryCard({required this.collection, required this.onTap});

  static String _fmtRwf(num n) =>
      n.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');

  @override
  Widget build(BuildContext context) {
    final earnings = collection.earnings;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 12)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.recycling, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(collection.businessName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      Text('${collection.scheduledDate.day}/${collection.scheduledDate.month}/${collection.scheduledDate.year}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
                _StatusBadge(status: collection.status.name),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _JobStat(icon: Icons.inventory_2_outlined, value: '${collection.volume.toStringAsFixed(0)} kg'),
                const SizedBox(width: 16),
                _JobStat(icon: Icons.recycling, value: collection.wasteType.label),
                if (earnings > 0) ...[
                  const Spacer(),
                  Text('RWF ${_fmtRwf(earnings)}', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary, fontSize: 16)),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final isCompleted = status == 'completed';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isCompleted ? AppColors.primaryLight : AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        isCompleted ? 'Completed' : 'Incomplete',
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 11,
          color: isCompleted ? AppColors.primary : AppColors.error,
        ),
      ),
    );
  }
}

class _JobStat extends StatelessWidget {
  final IconData icon;
  final String value;
  const _JobStat({required this.icon, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textSecondary),
        const SizedBox(width: 3),
        Text(value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
      ],
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  const _MiniStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary, fontSize: 15)),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 28, color: AppColors.border);
  }
}
