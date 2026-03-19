import 'dart:async';
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
      if (points.length == 1) {
        _mapController.move(points.first, 14);
      } else {
        final bounds = LatLngBounds.fromPoints(points);
        _mapController.fitCamera(
          CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(60)),
        );
      }
    });
  }

  List<LatLng> _driverPoints() {
    return _drivers
        .where((d) => d['current_lat'] != null && d['current_lng'] != null)
        .map((d) => LatLng(
              (d['current_lat'] as num).toDouble(),
              (d['current_lng'] as num).toDouble(),
            ))
        .toList();
  }

  String _driverName(Map<String, dynamic> d) =>
      d['full_name'] as String? ??
      d['name'] as String? ??
      'Driver';

  bool _isAvailable(Map<String, dynamic> d) =>
      d['is_available'] as bool? ?? false;

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
                      child: FlutterMap(
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

                          // Driver markers
                          MarkerLayer(
                            markers: _drivers
                                .where((d) =>
                                    d['current_lat'] != null &&
                                    d['current_lng'] != null)
                                .map((d) {
                              final lat =
                                  (d['current_lat'] as num).toDouble();
                              final lng =
                                  (d['current_lng'] as num).toDouble();
                              final name = _driverName(d);
                              final available = _isAvailable(d);
                              return Marker(
                                point: LatLng(lat, lng),
                                width: 56,
                                height: 56,
                                child: GestureDetector(
                                  onTap: () => _showDriverInfo(context, d),
                                  child: _DriverPin(
                                    name: name,
                                    available: available,
                                  ),
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
                                if (hasLoc) {
                                  _mapController.move(
                                    LatLng(
                                      (d['current_lat'] as num).toDouble(),
                                      (d['current_lng'] as num).toDouble(),
                                    ),
                                    16,
                                  );
                                }
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
                                      hasLoc ? 'Location known' : 'No GPS data',
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

class _DriverPin extends StatelessWidget {
  final String name;
  final bool available;
  const _DriverPin({required this.name, required this.available});

  @override
  Widget build(BuildContext context) {
    final color = available ? AppColors.primary : AppColors.textSecondary;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                  color: color.withValues(alpha: 0.4),
                  blurRadius: 6,
                  spreadRadius: 1),
            ],
          ),
          child: const Icon(Icons.directions_car, color: Colors.white, size: 20),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            name.split(' ').first,
            style: const TextStyle(
                color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
          ),
        ),
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
