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
  double? _distanceMeters;
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
        setState(() {
          _error = 'Location service is disabled';
          _loading = false;
        });
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        setState(() {
          _error = 'Location permission denied';
          _loading = false;
        });
        return;
      }

      final initialPos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final destination = await _resolveDestination();
      final current = LatLng(initialPos.latitude, initialPos.longitude);
      final firstDistance = Geolocator.distanceBetween(
        current.latitude,
        current.longitude,
        destination.latitude,
        destination.longitude,
      );

      setState(() {
        _current = current;
        _destination = destination;
        _distanceMeters = firstDistance;
        _loading = false;
      });

      _fitBoth();
      if (widget.pushDriverLocation) {
        await _safePushDriverLocation(current);
      }

      _positionSub = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 5,
        ),
      ).listen((pos) async {
        final next = LatLng(pos.latitude, pos.longitude);
        final dest = _destination ?? destination;
        final meters = Geolocator.distanceBetween(
          next.latitude,
          next.longitude,
          dest.latitude,
          dest.longitude,
        );
        if (!mounted) return;
        setState(() {
          _current = next;
          _distanceMeters = meters;
        });
        if (widget.pushDriverLocation) {
          await _safePushDriverLocation(next);
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Failed to start live tracking.';
        _loading = false;
      });
    }
  }

  Future<void> _safePushDriverLocation(LatLng point) async {
    try {
      await ApiService.updateDriverLocation(point.latitude, point.longitude);
    } catch (_) {}
  }

  Future<LatLng> _resolveDestination() async {
    if (widget.collection.destinationLat != null && widget.collection.destinationLng != null) {
      return LatLng(widget.collection.destinationLat!, widget.collection.destinationLng!);
    }

    final id = int.tryParse(widget.collection.id);
    if (id != null) {
      try {
        final tracking = await ApiService.getCollectionTracking(id);
        final lat = (tracking['hotel_lat'] as num?)?.toDouble();
        final lng = (tracking['hotel_lng'] as num?)?.toDouble();
        if (lat != null && lng != null) {
          return LatLng(lat, lng);
        }
      } catch (_) {}
    }

    return _kigaliFallback;
  }

  void _fitBoth() {
    if (_current == null || _destination == null) return;
    final bounds = LatLngBounds.fromPoints([_current!, _destination!]);
    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: bounds,
        padding: const EdgeInsets.all(40),
      ),
    );
  }

  String _distanceLabel() {
    final meters = _distanceMeters;
    if (meters == null) return '—';
    if (meters < 1000) return '${meters.toStringAsFixed(0)} m';
    return '${(meters / 1000).toStringAsFixed(2)} km';
  }

  @override
  Widget build(BuildContext context) {
    final current = _current;
    final destination = _destination;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Distance Tracking'),
        actions: [
          IconButton(
            onPressed: _fitBoth,
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
                    child: Text(_error!, style: const TextStyle(color: AppColors.error)),
                  ),
                )
              : Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      color: AppColors.primaryLight,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.collection.businessName,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Distance remaining: ${_distanceLabel()}',
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
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
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.ecotrade.app',
                          ),
                          if (current != null && destination != null)
                            PolylineLayer(
                              polylines: [
                                Polyline(
                                  points: [current, destination],
                                  color: AppColors.primary,
                                  strokeWidth: 4,
                                ),
                              ],
                            ),
                          MarkerLayer(
                            markers: [
                              if (current != null)
                                Marker(
                                  point: current,
                                  width: 44,
                                  height: 44,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.green,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                    child: const Icon(Icons.my_location, color: Colors.white, size: 20),
                                  ),
                                ),
                              if (destination != null)
                                Marker(
                                  point: destination,
                                  width: 46,
                                  height: 46,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.blue,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                    child: const Icon(Icons.location_on, color: Colors.white, size: 22),
                                  ),
                                ),
                            ],
                          ),
                          const RichAttributionWidget(
                            attributions: [TextSourceAttribution('OpenStreetMap contributors')],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}
