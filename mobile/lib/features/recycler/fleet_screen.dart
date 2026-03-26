import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/widgets/offline_banner.dart';
import 'driver_tracking_screen.dart';

class FleetScreen extends ConsumerStatefulWidget {
  const FleetScreen({super.key});

  @override
  ConsumerState<FleetScreen> createState() => _FleetScreenState();
}

class _FleetScreenState extends ConsumerState<FleetScreen> {
  @override
  Widget build(BuildContext context) {
    final driversAsync = ref.watch(recyclerDriversProvider);

    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        title: const Text('Driver Fleet'),
      ),
      body: driversAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_outlined, size: 56, color: AppColors.textTertiary),
              const SizedBox(height: 12),
              const Text('Could not load drivers', style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => ref.invalidate(recyclerDriversProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (drivers) {
          final active = drivers.where((d) => _statusOf(d) == 'active').length;
          final idle = drivers.where((d) => _statusOf(d) == 'idle').length;
          final offline = drivers.length - active - idle;

          return Column(
            children: [
              const OfflineBanner(),
              // Fleet summary
              Container(
                margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    _FleetStat(value: '$active', label: 'Active', color: Colors.white),
                    _FleetDivider(),
                    _FleetStat(value: '$idle', label: 'Idle', color: Colors.white70),
                    _FleetDivider(),
                    _FleetStat(value: '$offline', label: 'Offline', color: Colors.white54),
                    _FleetDivider(),
                    _FleetStat(value: '${drivers.length}', label: 'Total', color: Colors.white),
                  ],
                ),
              ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),

              const SizedBox(height: 16),

              // Live fleet map preview
              GestureDetector(
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const DriverTrackingScreen()),
                ),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  height: 180,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Stack(
                      children: [
                        _FleetMapPreview(driverData: drivers),
                        // Tap overlay label
                        Positioned(
                          top: 10, left: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)],
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.my_location, size: 14, color: AppColors.primary),
                                SizedBox(width: 4),
                                Text('Live Fleet Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 10, right: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.open_in_full, size: 12, color: Colors.white),
                                SizedBox(width: 4),
                                Text('Full Map', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 80.ms).fadeIn(),

              const SizedBox(height: 16),

              if (drivers.isEmpty)
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.directions_car_outlined, size: 56, color: AppColors.textTertiary),
                        const SizedBox(height: 12),
                        const Text('No drivers in your fleet yet',
                            style: TextStyle(color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    itemCount: drivers.length,
                    itemBuilder: (context, index) {
                      return _DriverCard(driver: drivers[index])
                          .animate()
                          .slideY(begin: 0.15, duration: 300.ms, delay: (index * 60 + 160).ms)
                          .fadeIn();
                    },
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  String _statusOf(Map<String, dynamic> d) {
    // Handle legacy is_available flag
    if (d['is_available'] == true) return 'active';
    if (d['is_available'] == false) return 'offline';
    // Map DriverStatus enum values returned by /drivers/my-recycler
    switch (d['status'] as String? ?? '') {
      case 'available': return 'active';
      case 'on_route':  return 'idle';
      case 'off_duty':  return 'offline';
      default:          return 'idle';
    }
  }

}

// ─── Fleet Map Preview ────────────────────────────────────────────────────────

class _FleetMapPreview extends StatelessWidget {
  final List<Map<String, dynamic>> driverData;
  static const _kigali = LatLng(-1.9441, 30.0619);

  const _FleetMapPreview({required this.driverData});

  static Color _statusColor(Map<String, dynamic> d) {
    if (d['is_available'] == true) return AppColors.primary;
    switch (d['status'] as String? ?? '') {
      case 'available': return AppColors.primary;
      case 'on_route':  return AppColors.accent;
      default:          return AppColors.textSecondary;
    }
  }

  static LatLng _point(Map<String, dynamic> d) {
    if (d['current_lat'] != null && d['current_lng'] != null) {
      return LatLng(
        (d['current_lat'] as num).toDouble(),
        (d['current_lng'] as num).toDouble(),
      );
    }
    return _kigali;
  }

  static double _haversineKm(LatLng a, LatLng b) {
    const r = 6371.0;
    final dLat = (b.latitude - a.latitude) * math.pi / 180;
    final dLng = (b.longitude - a.longitude) * math.pi / 180;
    final h = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(a.latitude * math.pi / 180) *
            math.cos(b.latitude * math.pi / 180) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);
    return 2 * r * math.asin(math.sqrt(h.clamp(0.0, 1.0)));
  }

  @override
  Widget build(BuildContext context) {
    final points = driverData.map(_point).toList();

    // Dashed polylines + distance labels between distinct driver positions
    final polylines = <Polyline>[];
    final distanceLabels = <String>[];
    for (int i = 0; i < points.length - 1; i++) {
      for (int j = i + 1; j < points.length; j++) {
        polylines.add(Polyline(
          points: [points[i], points[j]],
          color: const Color(0xFF0288D1),
          strokeWidth: 1.5,
          isDotted: true,
        ));
        final km = _haversineKm(points[i], points[j]);
        final nameA = (driverData[i]['name'] ?? driverData[i]['full_name'] ?? 'D${i + 1}') as String;
        final nameB = (driverData[j]['name'] ?? driverData[j]['full_name'] ?? 'D${j + 1}') as String;
        distanceLabels.add(
            '${nameA.split(' ').first} ↔ ${nameB.split(' ').first}: ${km.toStringAsFixed(1)} km');
      }
    }

    return Stack(
      children: [
        FlutterMap(
          options: const MapOptions(
            initialCenter: _kigali,
            initialZoom: 12.5,
            interactionOptions: InteractionOptions(flags: InteractiveFlag.none),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.ecotrade.app',
            ),
            if (polylines.isNotEmpty) PolylineLayer(polylines: polylines),
            if (driverData.isNotEmpty)
              MarkerLayer(
                markers: driverData.asMap().entries.map((e) {
                  final d = e.value;
                  final name = d['name'] as String? ?? d['full_name'] as String? ?? 'Driver';
                  return Marker(
                    point: points[e.key],
                    width: 100,
                    height: 60,
                    alignment: Alignment.bottomCenter,
                    child: _DriverTearDrop(name: name, color: _statusColor(d)),
                  );
                }).toList(),
              ),
          ],
        ),

        // Legend + stats bar
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: Container(
            color: Colors.white.withValues(alpha: 0.93),
            padding: const EdgeInsets.fromLTRB(10, 5, 10, 7),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (distanceLabels.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 3),
                    child: Wrap(
                      spacing: 10,
                      children: distanceLabels.map((lbl) => Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ...List.generate(4, (i) => Container(
                            width: 4, height: 1.5,
                            margin: EdgeInsets.only(right: i < 3 ? 3 : 0),
                            color: const Color(0xFF0288D1),
                          )),
                          const SizedBox(width: 4),
                          Text(lbl, style: const TextStyle(fontSize: 10, color: Color(0xFF0288D1))),
                        ],
                      )).toList(),
                    ),
                  ),
                Row(
                  children: [
                    Expanded(
                      child: Wrap(
                        spacing: 10,
                        children: const [
                          _LegendDot(color: AppColors.primary, label: 'Available'),
                          _LegendDot(color: AppColors.accent, label: 'On Route'),
                          _LegendDot(color: AppColors.textSecondary, label: 'Off Duty'),
                        ],
                      ),
                    ),
                    Text(
                      '${driverData.length} driver${driverData.length == 1 ? '' : 's'}',
                      style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF333333)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Driver teardrop pin ───────────────────────────────────────────────────────

class _DriverTearDrop extends StatelessWidget {
  final String name;
  final Color color;
  const _DriverTearDrop({required this.name, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          constraints: const BoxConstraints(maxWidth: 90),
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: color.withValues(alpha: 0.4), width: 0.8),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 3)],
          ),
          child: Text(
            name.split(' ').first,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: 2),
        CustomPaint(
          size: const Size(24, 32),
          painter: _DriverPinPainter(color: color),
        ),
      ],
    );
  }
}

class _DriverPinPainter extends CustomPainter {
  final Color color;
  const _DriverPinPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final r = size.width / 2;
    final path = ui.Path()
      ..addOval(Rect.fromCircle(center: Offset(r, r), radius: r))
      ..moveTo(size.width * 0.3, r + r * 0.55)
      ..lineTo(r, size.height)
      ..lineTo(size.width * 0.7, r + r * 0.55)
      ..close();

    canvas.drawPath(path, Paint()..color = color..style = PaintingStyle.fill);
    canvas.drawPath(path,
        Paint()
          ..color = Colors.white
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.8);
    canvas.drawCircle(Offset(r, r), r * 0.38,
        Paint()..color = Colors.white..style = PaintingStyle.fill);
  }

  @override
  bool shouldRepaint(_DriverPinPainter old) => old.color != color;
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF333333))),
      ],
    );
  }
}

// ─── Fleet Summary Widgets ────────────────────────────────────────────────────

class _FleetStat extends StatelessWidget {
  final String value;
  final String label;
  final Color color;
  const _FleetStat({required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800)),
          ),
          Text(label, style: TextStyle(color: color.withValues(alpha: 0.8), fontSize: 12)),
        ],
      ),
    );
  }
}

class _FleetDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.2));
  }
}

// ─── Driver Card ──────────────────────────────────────────────────────────────

class _DriverCard extends StatelessWidget {
  final Map<String, dynamic> driver;
  const _DriverCard({required this.driver});

  /// Returns 'active' | 'idle' | 'offline' — used for color and stats counting.
  String get _driverStatus {
    if (driver['is_available'] == true) return 'active';
    if (driver['is_available'] == false) return 'offline';
    switch (driver['status'] as String? ?? '') {
      case 'available': return 'active';
      case 'on_route':  return 'idle';
      case 'off_duty':  return 'offline';
      default:          return 'idle';
    }
  }

  /// Human-readable badge label derived from the raw API status value.
  String get _statusLabel {
    final raw = driver['status'] as String? ?? '';
    if (raw.isNotEmpty) return raw.replaceAll('_', ' ').toUpperCase();
    return _driverStatus.toUpperCase();
  }

  Color get _statusColor {
    switch (_driverStatus) {
      case 'active': return AppColors.primary;
      case 'idle': return AppColors.accent;
      default: return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = driver['full_name'] as String?
        ?? driver['name'] as String?
        ?? 'Driver';
    final phone = driver['phone'] as String? ?? '—';
    final vehicleType = driver['vehicle_type'] as String? ?? driver['vehicle'] as String? ?? '';
    final vehiclePlate = driver['vehicle_plate'] as String? ?? driver['plate'] as String? ?? '';
    final vehicleStr = [vehicleType, vehiclePlate]
        .where((s) => s.isNotEmpty)
        .join(' • ');
    final rating = (driver['rating'] as num?)?.toStringAsFixed(1) ?? '—';
    final completedRoutes = driver['completed_routes'] as int? ?? 0;
    final location = driver['current_location'] as String?
        ?? driver['city'] as String?
        ?? 'Kigali';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Stack(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: _statusColor.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.person, color: _statusColor, size: 28),
                  ),
                  Positioned(
                    bottom: 1, right: 1,
                    child: Container(
                      width: 14, height: 14,
                      decoration: BoxDecoration(
                        color: _statusColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    if (vehicleStr.isNotEmpty)
                      Text(vehicleStr, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textTertiary),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(location,
                              style: const TextStyle(fontSize: 12, color: AppColors.textTertiary),
                              overflow: TextOverflow.ellipsis),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (rating != '—')
                    Row(
                      children: [
                        const Icon(Icons.star, color: AppColors.accent, size: 13),
                        const SizedBox(width: 2),
                        Text(rating, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      ],
                    ),
                  Text('$completedRoutes jobs', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  StatusBadge(
                    label: _statusLabel,
                    type: _driverStatus == 'active'
                        ? StatusType.success
                        : _driverStatus == 'idle'
                            ? StatusType.warning
                            : StatusType.neutral,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const DriverTrackingScreen()),
                  ),
                  icon: const Icon(Icons.my_location, size: 14),
                  label: const Text('Track'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: (phone.isNotEmpty && phone != '—')
                    ? () async {
                        final uri = Uri(scheme: 'tel', path: phone);
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri);
                        }
                      }
                    : null,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(36, 36),
                  padding: EdgeInsets.zero,
                ),
                child: const Icon(Icons.call, size: 16),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
