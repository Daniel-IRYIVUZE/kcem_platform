import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';

/// Recycler: full-screen map showing all drivers' real-time GPS positions
/// and their assigned collection locations.
class DriverTrackingScreen extends ConsumerStatefulWidget {
  const DriverTrackingScreen({super.key});

  @override
  ConsumerState<DriverTrackingScreen> createState() =>
      _DriverTrackingScreenState();
}

class _DriverTrackingScreenState extends ConsumerState<DriverTrackingScreen> {
  final MapController _mapController = MapController();
  List<Map<String, dynamic>> _drivers = [];
  bool _loading = true;
  String? _error;
  Timer? _refreshTimer;

  static const LatLng _kigali = LatLng(-1.9441, 30.0619);

  @override
  void initState() {
    super.initState();
    _loadDrivers();
    // Refresh every 30 seconds for near-real-time tracking
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _loadDrivers(silent: true),
    );
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _loadDrivers({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final items = await ApiService.getMyRecyclerDrivers();
      if (mounted) {
        setState(() {
          _drivers = items.map((e) => e as Map<String, dynamic>).toList();
          _loading = false;
          _error = null;
        });
        _fitAllDrivers();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Could not load driver locations';
          _loading = false;
        });
      }
    }
  }

  void _fitAllDrivers() {
    final points = _driverPoints();
    if (points.isEmpty) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      // If all drivers are at the same point (e.g. all using Kigali fallback),
      // just centre there rather than fitting degenerate bounds.
      final distinct = points.toSet().toList();
      if (distinct.length == 1) {
        _mapController.move(distinct.first, 13);
      } else {
        final bounds = LatLngBounds.fromPoints(points);
        _mapController.fitCamera(
          CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(60)),
        );
      }
    });
  }

  LatLng _driverPoint(Map<String, dynamic> d) {
    if (d['current_lat'] != null && d['current_lng'] != null) {
      return LatLng(
        (d['current_lat'] as num).toDouble(),
        (d['current_lng'] as num).toDouble(),
      );
    }
    return _kigali;
  }

  List<LatLng> _driverPoints() =>
      _drivers.map(_driverPoint).toList();

  String _driverName(Map<String, dynamic> d) =>
      d['full_name'] as String? ??
      d['name'] as String? ??
      'Driver';

  bool _isAvailable(Map<String, dynamic> d) {
    if (d['is_available'] == true) return true;
    if (d['is_available'] == false) return false;
    return (d['status'] as String? ?? '') == 'available';
  }

  Color _driverColor(Map<String, dynamic> d) {
    if (_isAvailable(d)) return AppColors.primary;
    switch (d['status'] as String? ?? '') {
      case 'on_route': return AppColors.accent;
      default:         return AppColors.textSecondary;
    }
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
    final collections = ref.watch(recyclerCollectionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Tracking'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: () => _loadDrivers(),
          ),
          IconButton(
            icon: const Icon(Icons.fit_screen),
            tooltip: 'Fit all',
            onPressed: _fitAllDrivers,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.cloud_off_outlined,
                          size: 56, color: AppColors.textTertiary),
                      const SizedBox(height: 12),
                      Text(_error!,
                          style: const TextStyle(
                              color: AppColors.textSecondary)),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => _loadDrivers(),
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Summary bar
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      color: AppColors.primaryLight,
                      child: Row(
                        children: [
                          _SummaryChip(
                            icon: Icons.directions_car,
                            label: '${_drivers.length} Drivers',
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 12),
                          _SummaryChip(
                            icon: Icons.circle,
                            label:
                                '${_drivers.where(_isAvailable).length} Active',
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 12),
                          _SummaryChip(
                            icon: Icons.inventory_2_outlined,
                            label: '${collections.length} Jobs',
                            color: AppColors.accent,
                          ),
                        ],
                      ),
                    ),

                    // Map
                    Expanded(
                      child: Stack(
                        children: [
                          FlutterMap(
                            mapController: _mapController,
                            options: MapOptions(
                              initialCenter: _kigali,
                              initialZoom: 13,
                            ),
                            children: [
                              TileLayer(
                                urlTemplate:
                                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                userAgentPackageName: 'com.ecotrade.app',
                              ),

                              // Dashed distance lines between drivers
                              if (_drivers.length > 1)
                                PolylineLayer(
                                  polylines: [
                                    for (int i = 0; i < _drivers.length - 1; i++)
                                      for (int j = i + 1; j < _drivers.length; j++)
                                        Polyline(
                                          points: [
                                            _driverPoint(_drivers[i]),
                                            _driverPoint(_drivers[j]),
                                          ],
                                          color: const Color(0xFF0288D1),
                                          strokeWidth: 1.5,
                                          isDotted: true,
                                        ),
                                  ],
                                ),

                              // Collection destination markers (blue pins)
                              MarkerLayer(
                                markers: collections
                                    .where((c) =>
                                        c.destinationLat != null &&
                                        c.destinationLng != null)
                                    .map((c) => Marker(
                                          point: LatLng(
                                            c.destinationLat!,
                                            c.destinationLng!,
                                          ),
                                          width: 44,
                                          height: 44,
                                          child: Tooltip(
                                            message:
                                                '${c.businessName}\n${c.wasteType.label}',
                                            child: _CollectionPin(
                                                status: c.status.name),
                                          ),
                                        ))
                                    .toList(),
                              ),

                              // Driver markers — teardrop pins; Kigali fallback when no GPS
                              MarkerLayer(
                                markers: _drivers.map((d) {
                                  final point = _driverPoint(d);
                                  final name = _driverName(d);
                                  final color = _driverColor(d);
                                  return Marker(
                                    point: point,
                                    width: 100,
                                    height: 60,
                                    alignment: Alignment.bottomCenter,
                                    child: GestureDetector(
                                      onTap: () => _showDriverInfo(context, d),
                                      child: _DriverTearDropPin(
                                          name: name, color: color),
                                    ),
                                  );
                                }).toList(),
                              ),

                              const RichAttributionWidget(
                                attributions: [
                                  TextSourceAttribution(
                                      'OpenStreetMap contributors'),
                                ],
                              ),
                            ],
                          ),

                          // Legend + distance bar overlaid at map bottom
                          Positioned(
                            bottom: 0, left: 0, right: 0,
                            child: Container(
                              color: Colors.white.withValues(alpha: 0.93),
                              padding: const EdgeInsets.fromLTRB(12, 5, 12, 7),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (_drivers.length > 1)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 3),
                                      child: Wrap(
                                        spacing: 10,
                                        children: [
                                          for (int i = 0; i < _drivers.length - 1; i++)
                                            for (int j = i + 1; j < _drivers.length; j++)
                                              Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  ...List.generate(4, (k) => Container(
                                                    width: 4, height: 1.5,
                                                    margin: EdgeInsets.only(right: k < 3 ? 3 : 0),
                                                    color: const Color(0xFF0288D1),
                                                  )),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    '${_driverName(_drivers[i]).split(' ').first} ↔ '
                                                    '${_driverName(_drivers[j]).split(' ').first}: '
                                                    '${_haversineKm(_driverPoint(_drivers[i]), _driverPoint(_drivers[j])).toStringAsFixed(1)} km',
                                                    style: const TextStyle(fontSize: 10, color: Color(0xFF0288D1)),
                                                  ),
                                                ],
                                              ),
                                        ],
                                      ),
                                    ),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Wrap(
                                          spacing: 10,
                                          children: const [
                                            _TrackLegendDot(color: AppColors.primary, label: 'Available'),
                                            _TrackLegendDot(color: AppColors.accent, label: 'On Route'),
                                            _TrackLegendDot(color: AppColors.textSecondary, label: 'Off Duty'),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        '${_drivers.length} driver${_drivers.length == 1 ? '' : 's'} · ${collections.length} job${collections.length == 1 ? '' : 's'}',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF333333)),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Driver list at bottom
                    if (_drivers.isNotEmpty)
                      Container(
                        height: 100,
                        color: context.cSurf,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          itemCount: _drivers.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: 10),
                          itemBuilder: (context, i) {
                            final d = _drivers[i];
                            final available = _isAvailable(d);
                            final hasLoc = d['current_lat'] != null;
                            return GestureDetector(
                              onTap: () {
                                _mapController.move(_driverPoint(d), 14);
                                _showDriverInfo(context, d);
                              },
                              child: Container(
                                width: 130,
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: context.cSurfAlt,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: available
                                        ? AppColors.primary.withValues(alpha: 0.5)
                                        : context.cBorder,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.circle,
                                          size: 8,
                                          color: available
                                              ? AppColors.primary
                                              : AppColors.textTertiary,
                                        ),
                                        const SizedBox(width: 5),
                                        Expanded(
                                          child: Text(
                                            _driverName(d),
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 12),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      hasLoc ? 'Live location' : 'Kigali (est.)',
                                      style: TextStyle(
                                          fontSize: 11,
                                          color: hasLoc
                                              ? AppColors.textSecondary
                                              : AppColors.textTertiary),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                  ],
                ),
    );
  }

  void _showDriverInfo(BuildContext context, Map<String, dynamic> driver) {
    final name = _driverName(driver);
    final phone = driver['phone'] as String? ?? '—';
    final plate = driver['plate_number'] as String? ??
        driver['vehicle_plate'] as String? ??
        '—';
    final available = _isAvailable(driver);
    final lat = driver['current_lat'] != null
        ? (driver['current_lat'] as num).toStringAsFixed(5)
        : null;
    final lng = driver['current_lng'] != null
        ? (driver['current_lng'] as num).toStringAsFixed(5)
        : null;

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
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: available
                        ? AppColors.primaryLight
                        : AppColors.border,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.person,
                      color: available
                          ? AppColors.primary
                          : AppColors.textTertiary,
                      size: 26),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name,
                          style: const TextStyle(
                              fontWeight: FontWeight.w800, fontSize: 17)),
                      Text(
                        available ? 'Available' : 'Unavailable',
                        style: TextStyle(
                          fontSize: 13,
                          color: available
                              ? AppColors.primary
                              : AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _DetailRow(icon: Icons.phone_outlined, label: 'Phone', value: phone),
            const SizedBox(height: 8),
            _DetailRow(icon: Icons.directions_car_outlined, label: 'Plate', value: plate),
            if (lat != null && lng != null) ...[
              const SizedBox(height: 8),
              _DetailRow(
                icon: Icons.location_on_outlined,
                label: 'Last GPS',
                value: '$lat, $lng',
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _DriverTearDropPin extends StatelessWidget {
  final String name;
  final Color color;
  const _DriverTearDropPin({required this.name, required this.color});

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
          painter: _TrackPinPainter(color: color),
        ),
      ],
    );
  }
}

class _TrackPinPainter extends CustomPainter {
  final Color color;
  const _TrackPinPainter({required this.color});

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
        Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 1.8);
    canvas.drawCircle(Offset(r, r), r * 0.38,
        Paint()..color = Colors.white..style = PaintingStyle.fill);
  }

  @override
  bool shouldRepaint(_TrackPinPainter old) => old.color != color;
}

class _TrackLegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _TrackLegendDot({required this.color, required this.label});

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

class _CollectionPin extends StatelessWidget {
  final String status;
  const _CollectionPin({required this.status});

  Color get _color {
    switch (status) {
      case 'enRoute':
        return AppColors.accent;
      case 'completed':
        return AppColors.primary;
      default:
        return AppColors.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: _color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
      ),
      child: const Icon(Icons.inventory_2_outlined, color: Colors.white, size: 16),
    );
  }
}

class _SummaryChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _SummaryChip(
      {required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 5),
        Text(label,
            style: TextStyle(
                fontSize: 12, color: color, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Text('$label: ',
            style: const TextStyle(
                fontWeight: FontWeight.w600, fontSize: 13,
                color: AppColors.textSecondary)),
        Expanded(
          child: Text(value,
              style: const TextStyle(fontSize: 13),
              overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }
}
