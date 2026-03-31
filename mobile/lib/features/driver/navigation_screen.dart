import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../shared/live_tracking_screen.dart';

class NavigationScreen extends ConsumerStatefulWidget {
  const NavigationScreen({super.key});

  @override
  ConsumerState<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends ConsumerState<NavigationScreen> {
  Collection? _selected;

  @override
  Widget build(BuildContext context) {
    final allCollections = ref.watch(driverCollectionsProvider);
    final active = allCollections
        .where((c) =>
            c.status == CollectionStatus.enRoute ||
            c.status == CollectionStatus.scheduled)
        .toList();

    // Auto-navigate to the single active collection immediately
    if (_selected == null && active.length == 1) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _selected = active.first);
      });
    }

    // Full-screen live navigation for selected collection
    if (_selected != null) {
      return Scaffold(
        body: Stack(
          children: [
            LiveTrackingScreen(
              collection: _selected!,
              pushDriverLocation: true,
              allCollections: allCollections,
            ),
            Positioned(
              top: 50,
              left: 16,
              child: SafeArea(
                child: FloatingActionButton.small(
                  heroTag: 'back_nav',
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.textPrimary,
                  onPressed: () => setState(() => _selected = null),
                  child: const Icon(Icons.arrow_back),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // Empty state
    if (active.isEmpty) {
      return Scaffold(
        backgroundColor: context.cBg,
        appBar: AppBar(title: const Text('Navigation')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.navigation_outlined,
                  size: 64, color: context.cTextSec),
              const SizedBox(height: 16),
              Text('No active routes',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: context.cText)),
              const SizedBox(height: 8),
              Text('You have no scheduled or en-route collections.',
                  style: TextStyle(color: context.cTextSec),
                  textAlign: TextAlign.center),
            ],
          ),
        ),
      );
    }

    // Overview: map + cards
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(title: const Text('My Stops')),
      body: Column(
        children: [
          // Map overview showing all active stops
          SizedBox(
            height: 280,
            child: _StopsOverviewMap(
              activeCollections: active,
              onStopTap: (c) => setState(() => _selected = c),
            ),
          ),
          // Section header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                Icon(Icons.list_alt, size: 16, color: context.cTextSec),
                const SizedBox(width: 6),
                Text('${active.length} stop${active.length == 1 ? '' : 's'} to collect',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: context.cTextSec)),
              ],
            ),
          ),
          // Cards list — only active collections
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async =>
                  ref.invalidate(driverCollectionsProvider),
              child: ListView.builder(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                itemCount: active.length,
                itemBuilder: (context, i) {
                  final c = active[i];
                  final isEnRoute =
                      c.status == CollectionStatus.enRoute;
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(
                        color: isEnRoute
                            ? AppColors.primary
                            : context.cBorder,
                        width: isEnRoute ? 2 : 1,
                      ),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isEnRoute
                              ? AppColors.primaryLight
                              : AppColors.success.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          isEnRoute
                              ? Icons.navigation
                              : Icons.recycling,
                          color: isEnRoute
                              ? AppColors.primary
                              : AppColors.success,
                        ),
                      ),
                      title: Text(
                        c.businessName,
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: context.cText),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(c.businessAddress ?? '',
                              style: TextStyle(
                                  color: context.cTextSec,
                                  fontSize: 13)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              _StatusChip(c.status),
                              const SizedBox(width: 8),
                              Icon(Icons.scale_outlined,
                                  size: 12,
                                  color: context.cTextSec),
                              const SizedBox(width: 3),
                              Text(
                                '${c.volume.toStringAsFixed(0)} ${c.wasteType.label == "UCO" ? "L" : "kg"}  •  ${c.wasteType.label}',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: context.cTextSec),
                              ),
                            ],
                          ),
                        ],
                      ),
                      trailing: ElevatedButton.icon(
                        onPressed: () async {
                          if (c.status ==
                              CollectionStatus.scheduled) {
                            final id = int.tryParse(c.id);
                            if (id != null) {
                              try {
                                await ApiService.post(
                                  '/collections/$id/advance',
                                  body: {'status': 'en_route'},
                                );
                                ref.invalidate(
                                    driverCollectionsProvider);
                              } catch (_) {}
                            }
                          }
                          if (mounted) {
                            setState(() => _selected = c);
                          }
                        },
                        icon: const Icon(Icons.navigation, size: 16),
                        label: const Text('Go'),
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(70, 36),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12),
                          textStyle: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Overview Map ──────────────────────────────────────────────────────────────

class _StopsOverviewMap extends StatefulWidget {
  final List<Collection> activeCollections;
  final void Function(Collection) onStopTap;

  const _StopsOverviewMap({
    required this.activeCollections,
    required this.onStopTap,
  });

  @override
  State<_StopsOverviewMap> createState() => _StopsOverviewMapState();
}

class _StopsOverviewMapState extends State<_StopsOverviewMap> {
  final MapController _mapController = MapController();

  LatLng? _driverPos;
  // Map from collection ID → resolved LatLng
  final Map<String, LatLng> _stopLocations = {};
  // Map from collection ID → road polyline points
  final Map<String, List<LatLng>> _routes = {};

  static const LatLng _kigali = LatLng(-1.9441, 30.0619);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(_StopsOverviewMap old) {
    super.didUpdateWidget(old);
    // Re-resolve if the collection list changed (e.g. a stop was completed)
    final oldIds = old.activeCollections.map((c) => c.id).toSet();
    final newIds = widget.activeCollections.map((c) => c.id).toSet();
    if (oldIds != newIds) _load();
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    // 1. Get driver GPS
    try {
      final ok = await Geolocator.isLocationServiceEnabled();
      if (ok) {
        var perm = await Geolocator.checkPermission();
        if (perm == LocationPermission.denied) {
          perm = await Geolocator.requestPermission();
        }
        if (perm != LocationPermission.denied &&
            perm != LocationPermission.deniedForever) {
          final pos = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.high);
          if (mounted) {
            setState(() =>
                _driverPos = LatLng(pos.latitude, pos.longitude));
          }
        }
      }
    } catch (_) {}

    // 2. Resolve lat/lng for each active collection and fetch route
    for (final c in widget.activeCollections) {
      if (!mounted) return;
      final point = await _resolveStopLocation(c);
      if (point == null) continue;
      if (!mounted) return;
      setState(() => _stopLocations[c.id] = point);

      // Fetch road route from driver (or Kigali fallback) to this stop
      final from = _driverPos ?? _kigali;
      final route = await _fetchRoute(from, point);
      if (!mounted) return;
      setState(() => _routes[c.id] = route);
    }

    _fitAll();
  }

  Future<LatLng?> _resolveStopLocation(Collection c) async {
    if (c.destinationLat != null && c.destinationLng != null) {
      return LatLng(c.destinationLat!, c.destinationLng!);
    }
    final id = int.tryParse(c.id);
    if (id == null) return null;
    try {
      final data = await ApiService.getCollectionTracking(id);
      final lat = (data['hotel_lat'] as num?)?.toDouble();
      final lng = (data['hotel_lng'] as num?)?.toDouble();
      if (lat != null && lng != null) return LatLng(lat, lng);
    } catch (_) {}
    return null;
  }

  Future<List<LatLng>> _fetchRoute(LatLng from, LatLng to) async {
    try {
      final routes = await ApiService.getOSRMRoute(
        from.latitude, from.longitude,
        to.latitude, to.longitude,
      );
      if (routes.isNotEmpty) {
        final r = routes[0] as Map<String, dynamic>;
        final coords =
            (r['geometry']?['coordinates'] as List?) ?? [];
        final pts = coords.map((c) {
          final l = c as List;
          return LatLng(
              (l[1] as num).toDouble(), (l[0] as num).toDouble());
        }).toList();
        if (pts.isNotEmpty) return pts;
      }
    } catch (_) {}
    return [from, to];
  }

  void _fitAll() {
    final all = <LatLng>[
      if (_driverPos != null) _driverPos!,
      ..._stopLocations.values,
    ];
    if (all.length < 2) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final bounds = LatLngBounds.fromPoints(all);
      _mapController.fitCamera(
        CameraFit.bounds(
            bounds: bounds,
            padding: const EdgeInsets.all(40)),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final driver = _driverPos;
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: driver ?? _kigali,
        initialZoom: 13,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.ecotrade.app',
        ),
        // Road polylines — one per active stop (only active, never completed)
        PolylineLayer(
          polylines: widget.activeCollections
              .where((c) => _routes.containsKey(c.id))
              .map((c) => Polyline(
                    points: _routes[c.id]!,
                    color: AppColors.primary,
                    strokeWidth: 4,
                  ))
              .toList(),
        ),
        // Stop markers — only active collection locations
        MarkerLayer(
          markers: [
            for (final c in widget.activeCollections)
              if (_stopLocations.containsKey(c.id))
                Marker(
                  point: _stopLocations[c.id]!,
                  width: 44,
                  height: 50,
                  child: GestureDetector(
                    onTap: () => widget.onStopTap(c),
                    child: _StopPin(
                        label: c.businessName
                            .split(' ')
                            .take(2)
                            .join(' ')),
                  ),
                ),
            // Driver position
            if (driver != null)
              Marker(
                point: driver,
                width: 52,
                height: 52,
                child: _DriverPin(),
              ),
          ],
        ),
        const RichAttributionWidget(
          attributions: [
            TextSourceAttribution('OpenStreetMap contributors'),
          ],
        ),
      ],
    );
  }
}

// ── Small map pin widgets ─────────────────────────────────────────────────────

class _StopPin extends StatelessWidget {
  final String label;
  const _StopPin({required this.label});

  @override
  Widget build(BuildContext context) {
    return OverflowBox(
      maxHeight: double.infinity,
      alignment: Alignment.topCenter,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.success,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                    color: AppColors.success.withValues(alpha: 0.4),
                    blurRadius: 6)
              ],
            ),
            child: const Icon(Icons.recycling,
                color: Colors.white, size: 16),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              label,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 8,
                  fontWeight: FontWeight.w700),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _DriverPin extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return OverflowBox(
      maxHeight: double.infinity,
      alignment: Alignment.topCenter,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2.5),
              boxShadow: [
                BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.4),
                    blurRadius: 8)
              ],
            ),
            child: const Icon(Icons.directions_car,
                color: Colors.white, size: 18),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text('You',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

// ── Status chip ────────────────────────────────────────────────────────────────

class _StatusChip extends StatelessWidget {
  final CollectionStatus status;
  const _StatusChip(this.status);

  @override
  Widget build(BuildContext context) {
    final isActive = status == CollectionStatus.enRoute;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primaryLight : AppColors.success.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        isActive ? 'En Route' : 'Scheduled',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: isActive ? AppColors.primary : AppColors.success,
        ),
      ),
    );
  }
}
