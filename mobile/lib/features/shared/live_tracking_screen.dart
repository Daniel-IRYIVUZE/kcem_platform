import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../core/models/models.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';

class LiveTrackingScreen extends StatefulWidget {
  final Collection collection;
  /// When true, the driver's GPS position is pushed to backend on each update.
  final bool pushDriverLocation;

  const LiveTrackingScreen({
    super.key,
    required this.collection,
    this.pushDriverLocation = false,
  });

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _positionSub;

  LatLng? _current;
  LatLng? _destination;
  List<LatLng> _routePoints = [];
  double? _roadDistanceMeters;
  double? _durationSeconds;
  bool _loading = true;
  String? _error;

  static const LatLng _kigaliFallback = LatLng(-1.9441, 30.0619);

  @override
  void initState() {
    super.initState();
    _initTracking();
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _initTracking() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() { _error = 'Location service is disabled'; _loading = false; });
        return;
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() { _error = 'Location permission denied'; _loading = false; });
        return;
      }

      final initialPos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      final destination = await _resolveDestination();
      final current = LatLng(initialPos.latitude, initialPos.longitude);

      // Fetch road-following route from OSRM
      final route = await _fetchRoute(current, destination);

      setState(() {
        _current = current;
        _destination = destination;
        _routePoints = route.points;
        _roadDistanceMeters = route.distanceMeters;
        _durationSeconds = route.durationSeconds;
        _loading = false;
      });

      _fitBounds();
      if (widget.pushDriverLocation) await _safePushLocation(current);

      _positionSub = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((pos) async {
        final next = LatLng(pos.latitude, pos.longitude);
        if (!mounted) return;
        setState(() { _current = next; });
        if (widget.pushDriverLocation) await _safePushLocation(next);

        // Recompute road distance to destination from new position
        final dest = _destination;
        if (dest != null) {
          final updated = await _fetchRoute(next, dest);
          if (mounted) {
            setState(() {
              _routePoints = updated.points;
              _roadDistanceMeters = updated.distanceMeters;
              _durationSeconds = updated.durationSeconds;
            });
          }
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = 'Failed to start live tracking.'; _loading = false; });
    }
  }

  Future<_RouteResult> _fetchRoute(LatLng from, LatLng to) async {
    try {
      final routes = await ApiService.getOSRMRoute(
        from.latitude, from.longitude,
        to.latitude, to.longitude,
      );
      if (routes.isNotEmpty) {
        final r = routes[0] as Map<String, dynamic>;
        final geometry = r['geometry'] as Map<String, dynamic>?;
        final coords = geometry?['coordinates'] as List? ?? [];
        final points = coords.map((c) {
          final list = c as List;
          return LatLng((list[1] as num).toDouble(), (list[0] as num).toDouble());
        }).toList();
        return _RouteResult(
          points: points.isNotEmpty ? points : [from, to],
          distanceMeters: (r['distance'] as num?)?.toDouble(),
          durationSeconds: (r['duration'] as num?)?.toDouble(),
        );
      }
    } catch (_) {}
    // Straight-line fallback
    final meters = Geolocator.distanceBetween(
      from.latitude, from.longitude, to.latitude, to.longitude,
    );
    return _RouteResult(points: [from, to], distanceMeters: meters);
  }

  Future<void> _safePushLocation(LatLng point) async {
    try {
      await ApiService.updateDriverLocation(point.latitude, point.longitude);
    } catch (_) {}
  }

  Future<LatLng> _resolveDestination() async {
    if (widget.collection.destinationLat != null &&
        widget.collection.destinationLng != null) {
      return LatLng(
        widget.collection.destinationLat!,
        widget.collection.destinationLng!,
      );
    }
    final id = int.tryParse(widget.collection.id);
    if (id != null) {
      try {
        final tracking = await ApiService.getCollectionTracking(id);
        final lat = (tracking['hotel_lat'] as num?)?.toDouble();
        final lng = (tracking['hotel_lng'] as num?)?.toDouble();
        if (lat != null && lng != null) return LatLng(lat, lng);
      } catch (_) {}
    }
    return _kigaliFallback;
  }

  void _fitBounds() {
    if (_current == null || _destination == null) return;
    final allPoints = [_current!, _destination!, ..._routePoints];
    final bounds = LatLngBounds.fromPoints(allPoints);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _mapController.fitCamera(
          CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(48)),
        );
      }
    });
  }

  String _distanceLabel() {
    final m = _roadDistanceMeters;
    if (m == null) return '—';
    if (m < 1000) return '${m.toStringAsFixed(0)} m';
    return '${(m / 1000).toStringAsFixed(1)} km';
  }

  String _etaLabel() {
    final s = _durationSeconds;
    if (s == null) return '—';
    final minutes = (s / 60).ceil();
    if (minutes < 60) return '~$minutes min';
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return '~${h}h ${m}min';
  }

  @override
  Widget build(BuildContext context) {
    final current = _current;
    final destination = _destination;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.collection.businessName.isNotEmpty
            ? widget.collection.businessName
            : 'Live Navigation'),
        actions: [
          IconButton(
            onPressed: _fitBounds,
            icon: const Icon(Icons.fit_screen),
            tooltip: 'Fit route',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_off_outlined,
                            size: 56, color: AppColors.textTertiary),
                        const SizedBox(height: 12),
                        Text(_error!,
                            style: const TextStyle(color: AppColors.error),
                            textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    // Info banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      color: AppColors.primaryLight,
                      child: Row(
                        children: [
                          const Icon(Icons.navigation,
                              color: AppColors.primary, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.collection.businessName.isNotEmpty
                                      ? widget.collection.businessName
                                      : 'Collection point',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14),
                                ),
                                Text(
                                  widget.collection.location.isNotEmpty
                                      ? widget.collection.location
                                      : 'Kigali, Rwanda',
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.route,
                                      color: AppColors.primary, size: 14),
                                  const SizedBox(width: 4),
                                  Text(
                                    _distanceLabel(),
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.primary,
                                        fontSize: 14),
                                  ),
                                ],
                              ),
                              Text(
                                _etaLabel(),
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(
                          initialCenter: current ?? _kigaliFallback,
                          initialZoom: 14,
                        ),
                        children: [
                          TileLayer(
                            urlTemplate:
                                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.ecotrade.app',
                          ),
                          // Road-following route polyline
                          if (_routePoints.length >= 2)
                            PolylineLayer(
                              polylines: [
                                Polyline(
                                  points: _routePoints,
                                  color: AppColors.primary,
                                  strokeWidth: 5,
                                ),
                              ],
                            ),
                          // Markers
                          MarkerLayer(
                            markers: [
                              if (current != null)
                                Marker(
                                  point: current,
                                  width: 56,
                                  height: 56,
                                  child: _MapPin(
                                    icon: Icons.directions_car,
                                    color: AppColors.primary,
                                    label: 'You',
                                  ),
                                ),
                              if (destination != null)
                                Marker(
                                  point: destination,
                                  width: 52,
                                  height: 52,
                                  child: _MapPin(
                                    icon: Icons.location_on,
                                    color: AppColors.error,
                                    label: 'Drop',
                                  ),
                                ),
                            ],
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
                    // Bottom action bar
                    Container(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
                      color: context.cSurf,
                      child: Row(
                        children: [
                          Expanded(
                            child: _InfoTile(
                              icon: Icons.recycling,
                              label: 'Waste',
                              value: widget.collection.wasteType.label,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _InfoTile(
                              icon: Icons.scale_outlined,
                              label: 'Volume',
                              value:
                                  '${widget.collection.volume.toStringAsFixed(0)} kg',
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _InfoTile(
                              icon: Icons.access_time,
                              label: 'ETA',
                              value: _etaLabel(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}

class _RouteResult {
  final List<LatLng> points;
  final double? distanceMeters;
  final double? durationSeconds;
  const _RouteResult({
    required this.points,
    this.distanceMeters,
    this.durationSeconds,
  });
}

class _MapPin extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  const _MapPin({required this.icon, required this.color, required this.label});

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
              color: color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.4),
                  blurRadius: 6,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 18),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              label,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
      decoration: BoxDecoration(
        color: context.cSurfAlt,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(height: 3),
          Text(value,
              style: const TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 12),
              overflow: TextOverflow.ellipsis),
          Text(label,
              style: const TextStyle(
                  fontSize: 10, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
