import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/utils/cat_date_utils.dart';
import '../../core/utils/pdf_report_service.dart';

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

  List<Collection> _applyFilter(List<Collection> list) {
    final now = DateTime.now();
    switch (_filter) {
      case 'This Week':
        final monday = now.subtract(Duration(days: now.weekday - 1));
        final weekStart = DateTime(monday.year, monday.month, monday.day);
        return list.where((c) => !c.scheduledDate.isBefore(weekStart)).toList();
      case 'This Month':
        return list.where((c) =>
            c.scheduledDate.year == now.year &&
            c.scheduledDate.month == now.month).toList();
      case 'Last Month':
        final lm = now.month == 1
            ? DateTime(now.year - 1, 12)
            : DateTime(now.year, now.month - 1);
        return list.where((c) =>
            c.scheduledDate.year == lm.year &&
            c.scheduledDate.month == lm.month).toList();
      default:
        return list; // 'All'
    }
  }

  @override
  Widget build(BuildContext context) {
    final collections = ref.watch(driverCollectionsProvider);
    final allCompleted = collections.where((c) => c.status == CollectionStatus.completed || c.status == CollectionStatus.verified).toList();
    final completed = _applyFilter(allCompleted);
    final totalEarned = completed.fold<double>(0, (s, c) => s + c.earnings);
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        title: const Text('History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf_outlined),
            tooltip: 'Download PDF Report',
            onPressed: () async {
              if (completed.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('No collections to export for this period'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
                return;
              }
              try {
                await PdfReportService.exportDriverHistory(
                  collections: completed,
                  period: _filter,
                );
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to generate PDF: $e'),
                      backgroundColor: AppColors.error,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          Container(
            color: context.cSurf,
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
                        color: _filter == f ? AppColors.primary : context.cBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: _filter == f ? AppColors.primary : context.cBorder),
                      ),
                      child: Text(
                        f,
                        style: TextStyle(
                          color: _filter == f ? Colors.white : context.cTextSec,
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
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: ctrl,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(color: context.cBorder, borderRadius: BorderRadius.circular(2)),
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
              Text(CatDateUtils.formatDate(c.scheduledDate), style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
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
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: context.cBorder),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.recycling, color: AppColors.primary, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(collection.businessName,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      _JobStat(icon: Icons.inventory_2_outlined, value: '${collection.volume.toStringAsFixed(0)} kg'),
                      const SizedBox(width: 10),
                      _JobStat(icon: Icons.recycling, value: collection.wasteType.label),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (earnings > 0)
                  Text('RWF ${_fmtRwf(earnings)}',
                      style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary, fontSize: 13)),
                Text(
                  CatDateUtils.formatDate(collection.scheduledDate),
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
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
        color: isCompleted ? AppColors.primaryLight : AppColors.error.withValues(alpha: 0.1),
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
    return Container(width: 1, height: 28, color: context.cBorder);
  }
}
