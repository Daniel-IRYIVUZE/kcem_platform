import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class WasteBreakdownPieChart extends StatelessWidget {
  final Map<String, double> data;
  final List<Color>? colors;
  const WasteBreakdownPieChart({required this.data, this.colors, super.key});

  @override
  Widget build(BuildContext context) {
    final total = data.values.fold(0.0, (a, b) => a + b);
    final colorList = colors ?? [
      AppColors.primary,
      AppColors.accent,
      AppColors.info,
      AppColors.warning,
      AppColors.success,
      Colors.grey.shade400,
    ];
    int i = 0;
    return PieChart(
      PieChartData(
        sections: data.entries.map((e) {
          final color = colorList[i % colorList.length];
          final section = PieChartSectionData(
            color: color,
            value: e.value,
            title: total > 0 ? '${((e.value / total) * 100).toStringAsFixed(1)}%' : '',
            radius: 48,
            titleStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
          );
          i++;
          return section;
        }).toList(),
        sectionsSpace: 2,
        centerSpaceRadius: 32,
      ),
    );
  }
}
