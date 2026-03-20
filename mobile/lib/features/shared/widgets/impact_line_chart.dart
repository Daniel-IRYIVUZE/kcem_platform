import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class ImpactLineChart extends StatelessWidget {
  final List<double> data;
  final List<String> labels;
  final Color? color;
  const ImpactLineChart({required this.data, required this.labels, this.color, super.key});

  @override
  Widget build(BuildContext context) {
    return LineChart(
      LineChartData(
        gridData: FlGridData(show: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                return idx >= 0 && idx < labels.length
                    ? Text(labels[idx], style: const TextStyle(fontSize: 11))
                    : const SizedBox.shrink();
              },
              reservedSize: 28,
            ),
          ),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        minY: 0,
        lineBarsData: [
          LineChartBarData(
            spots: [
              for (int i = 0; i < data.length; i++) FlSpot(i.toDouble(), data[i]),
            ],
            isCurved: true,
            color: color ?? AppColors.primary,
            barWidth: 3,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(show: true, color: (color ?? AppColors.primary).withOpacity(0.15)),
          ),
        ],
      ),
    );
  }
}
