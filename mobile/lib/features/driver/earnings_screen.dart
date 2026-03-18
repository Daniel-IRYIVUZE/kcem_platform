import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';

class EarningsScreen extends ConsumerStatefulWidget {
  const EarningsScreen({super.key});

  @override
  ConsumerState<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends ConsumerState<EarningsScreen> {
  int _selectedPeriod = 1; // default: This Week
  final List<String> _periods = ['Today', 'This Week', 'This Month'];

  static String _fmtRwf(num n) {
    return n.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
  }

  List<Transaction> _filteredTransactions(List<Transaction> all) {
    final now = DateTime.now();
    switch (_selectedPeriod) {
      case 0: // Today
        return all.where((t) =>
            t.date.year == now.year &&
            t.date.month == now.month &&
            t.date.day == now.day).toList();
      case 1: // This Week
        final monday = now.subtract(Duration(days: now.weekday - 1));
        final weekStart = DateTime(monday.year, monday.month, monday.day);
        return all.where((t) => !t.date.isBefore(weekStart)).toList();
      case 2: // This Month
        return all.where((t) =>
            t.date.year == now.year && t.date.month == now.month).toList();
      default:
        return all;
    }
  }

  List<_BarData> _buildChartData(List<Transaction> filtered) {
    final now = DateTime.now();
    switch (_selectedPeriod) {
      case 0: // Today — 6 four-hour blocks
        const labels = ['0am', '4am', '8am', '12pm', '4pm', '8pm'];
        return List.generate(6, (i) {
          final sum = filtered
              .where((t) => t.date.hour >= i * 4 && t.date.hour < i * 4 + 4)
              .fold<double>(0, (s, t) => s + t.amount);
          return _BarData(labels[i], sum.toInt());
        });
      case 1: // This Week — Mon to Sun
        final monday = now.subtract(Duration(days: now.weekday - 1));
        final weekStart = DateTime(monday.year, monday.month, monday.day);
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return List.generate(7, (i) {
          final day = weekStart.add(Duration(days: i));
          final sum = filtered
              .where((t) =>
                  t.date.year == day.year &&
                  t.date.month == day.month &&
                  t.date.day == day.day)
              .fold<double>(0, (s, t) => s + t.amount);
          return _BarData(dayLabels[i], sum.toInt());
        });
      case 2: // This Month — 4 weekly buckets
        return List.generate(4, (i) {
          final dayStart = i * 7 + 1;
          final dayEnd = dayStart + 7;
          final sum = filtered
              .where((t) =>
                  t.date.year == now.year &&
                  t.date.month == now.month &&
                  t.date.day >= dayStart &&
                  t.date.day < dayEnd)
              .fold<double>(0, (s, t) => s + t.amount);
          return _BarData('W${i + 1}', sum.toInt());
        });
      default:
        return [const _BarData('-', 0)];
    }
  }

  @override
  Widget build(BuildContext context) {
    final stats = ref.watch(driverStatsProvider);
    final allTransactions = ref.watch(transactionsProvider);
    final totalEarnings = (stats['totalEarnings'] ?? 0) as num;

    final filteredTx = _filteredTransactions(allTransactions);
    final periodEarned = filteredTx.fold<double>(0, (s, t) => s + t.amount);
    final periodCount = filteredTx.length;
    final chartData = _buildChartData(filteredTx);
    const periodLabels = ['Today', 'This Week', 'This Month'];

    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
                padding: const EdgeInsets.fromLTRB(20, 80, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Earnings', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    const Text('Track your daily and weekly income', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  'RWF ${_fmtRwf(totalEarnings)}',
                                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton(
                          onPressed: () => _showWithdrawSheet(context, totalEarnings),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.primary,
                            minimumSize: const Size(0, 40),
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                          ),
                          child: const Text('Withdraw', style: TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              title: const Text('Earnings', style: TextStyle(color: Colors.white)),
              titlePadding: const EdgeInsets.only(left: 72, bottom: 16),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Period selector + summary cards
                  Row(
                    children: List.generate(_periods.length, (i) => Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPeriod = i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          margin: EdgeInsets.only(right: i < 2 ? 8 : 0),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedPeriod == i ? AppColors.primary : context.cSurf,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)],
                          ),
                          child: Text(
                            _periods[i],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: _selectedPeriod == i ? Colors.white : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    )),
                  ),
                  const SizedBox(height: 16),

                  // Summary row
                  Row(
                    children: [
                      Expanded(child: _SummaryCard(title: periodLabels[_selectedPeriod], amount: 'RWF ${_fmtRwf(periodEarned)}', subtitle: '$periodCount collections', icon: Icons.trending_up, color: AppColors.primary)),
                      const SizedBox(width: 10),
                      Expanded(child: _SummaryCard(title: 'All Time', amount: 'RWF ${_fmtRwf(totalEarnings)}', subtitle: 'total earnings', icon: Icons.account_balance_wallet, color: AppColors.info)),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Chart
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: context.cSurf,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: context.cBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${periodLabels[_selectedPeriod]} Earnings', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text('RWF ${_fmtRwf(periodEarned)} ${periodLabels[_selectedPeriod].toLowerCase()}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        const SizedBox(height: 20),
                        _BarChart(data: chartData),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms),

                  const SizedBox(height: 20),

                  Text(
                    filteredTx.isEmpty ? 'Transactions' : 'Transactions (${filteredTx.length})',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                  const SizedBox(height: 12),

                  if (filteredTx.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.receipt_long_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 8),
                            Text(
                              'No transactions for ${periodLabels[_selectedPeriod].toLowerCase()}',
                              style: const TextStyle(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ...filteredTx.map((t) => _RealTransactionTile(t: t)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showWithdrawSheet(BuildContext context, num totalEarnings) {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Withdraw Earnings', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 4),
            const Text('Funds transferred to your registered bank account', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 20),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Amount (RWF)',
                prefixText: 'RWF ',
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Available', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  Text('RWF ${_fmtRwf(totalEarnings)}', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final amount = double.tryParse(ctrl.text.replaceAll(',', '')) ?? 0;
                  Navigator.pop(context);
                  if (amount <= 0) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Please enter a valid amount'),
                        backgroundColor: AppColors.error,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text('Withdrawal of RWF ${amount.toStringAsFixed(0)} requested!'),
                        ],
                      ),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                child: const Text('Request Withdrawal', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String amount;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _SummaryCard({required this.title, required this.amount, required this.subtitle, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(height: 10),
          Text(title, style: TextStyle(color: context.cTextSec, fontSize: 12)),
          Text(amount, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: context.cText), overflow: TextOverflow.ellipsis, maxLines: 1),
          Text(subtitle, style: TextStyle(color: context.cTextSec, fontSize: 11)),
        ],
      ),
    );
  }
}

class _BarChart extends StatelessWidget {
  final List<_BarData> data;
  const _BarChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final maxVal = data.map((d) => d.value).reduce((a, b) => a > b ? a : b).toDouble();
    if (maxVal == 0) {
      return const SizedBox(
        height: 120,
        child: Center(
          child: Text('No data for this period', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        ),
      );
    }
    return SizedBox(
      height: 120,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: data.map((d) {
          final h = (d.value / maxVal) * 100;
          return Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  height: h,
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  decoration: BoxDecoration(
                    color: d.label == 'Sat' ? AppColors.primary : AppColors.primaryLight,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                  ),
                ),
                const SizedBox(height: 6),
                Text(d.label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _RealTransactionTile extends StatelessWidget {
  final Transaction t;
  const _RealTransactionTile({required this.t});

  static String _fmtRwf(num n) =>
      n.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');

  @override
  Widget build(BuildContext context) {
    final label = t.from;
    final detail = '${t.wasteType.label} · ${t.volume.toStringAsFixed(0)} kg';
    final amt = t.amount;
    final dateStr = '${t.date.day}/${t.date.month}/${t.date.year}';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.cBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: const BoxDecoration(
              color: AppColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.recycling, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text(detail, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '+RWF ${_fmtRwf(amt)}',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                  fontSize: 14,
                ),
              ),
              Text(dateStr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}

class _BarData {
  final String label;
  final int value;
  const _BarData(this.label, this.value);
}
