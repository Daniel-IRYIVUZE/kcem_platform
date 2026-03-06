import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/router/app_router.dart';

class NavigationScreen extends ConsumerStatefulWidget {
  const NavigationScreen({super.key});

  @override
  ConsumerState<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends ConsumerState<NavigationScreen> {
  final _mapController = MapController();

  // Approximate Kigali coords for route stops
  static const _stopCoords = [
    LatLng(-1.9620, 30.0580), // Stop 1
    LatLng(-1.9506, 30.0585), // Stop 2
    LatLng(-1.9440, 30.0670), // Stop 3
    LatLng(-1.9360, 30.0780), // Stop 4
  ];

  // Driver current position (animated midpoint)
  static const _driverPos = LatLng(-1.9490, 30.0620);

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stops = ref.watch(driverRouteProvider).stops;
    final nextIdx = stops.indexWhere(
        (s) => s.status == RouteStopStatus.pending || s.status == RouteStopStatus.arrived || s.status == RouteStopStatus.collecting);
    final nextStop = nextIdx >= 0 ? stops[nextIdx] : (stops.isNotEmpty ? stops.last : null);
    final completedCount = stops.where((s) => s.status == RouteStopStatus.completed).length;
    return Scaffold(
      body: Stack(
        children: [
          // Real FlutterMap with OpenStreetMap tiles
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: const MapOptions(
                initialCenter: _driverPos,
                initialZoom: 14.5,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.ecotrade.app',
                  maxNativeZoom: 19,
                ),
                // Route polyline
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _stopCoords.take(completedCount + 1 > _stopCoords.length ? _stopCoords.length : completedCount + 1).toList(),
                      color: AppColors.primary,
                      strokeWidth: 4,
                    ),
                    if (completedCount < _stopCoords.length - 1)
                      Polyline(
                        points: _stopCoords.sublist(completedCount > 0 ? completedCount : 0),
                        color: AppColors.info,
                        strokeWidth: 4,
                        isDotted: true,
                      ),
                  ],
                ),
                // Driver marker
                MarkerLayer(markers: [
                  Marker(
                    point: _driverPos,
                    width: 60, height: 60,
                    child: _AnimatedDriverMarker(),
                  ),
                  // Stop markers
                  ...List.generate(_stopCoords.length < stops.length ? _stopCoords.length : stops.length, (i) {
                    final isDone = i < completedCount;
                    final isNext = i == completedCount;
                    return Marker(
                      point: _stopCoords[i],
                      width: isNext ? 44 : 36,
                      height: isNext ? 44 : 36,
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDone ? AppColors.primary : isNext ? Colors.white : Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(color: isDone ? AppColors.primary : isNext ? AppColors.primary : AppColors.border, width: isNext ? 2.5 : 1.5),
                          boxShadow: isNext ? [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 12, spreadRadius: 3)] : null,
                        ),
                        child: Center(
                          child: isDone
                              ? const Icon(Icons.check, color: Colors.white, size: 16)
                              : Text('${i + 1}', style: TextStyle(fontWeight: FontWeight.w700, color: isNext ? AppColors.primary : AppColors.textSecondary, fontSize: 13)),
                        ),
                      ),
                    );
                  }),
                ]),
                // OSM attribution
                RichAttributionWidget(
                  attributions: [TextSourceAttribution('OpenStreetMap contributors')],
                ),
              ],
            ),
          ),

          // Top bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                        if (context.canPop()) context.pop();
                      },
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
                        ),
                        child: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 8)],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.navigation, color: AppColors.primary, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Navigating to ${nextStop?.businessName ?? 'Next Stop'}',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Voice indicator
          Positioned(
            top: 100,
            right: 16,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
              ),
              child: const Icon(Icons.volume_up, color: AppColors.primary, size: 22),
            ),
          ),

          // Map controls — wire to MapController
          Positioned(
            top: 160,
            right: 16,
            child: Column(
              children: [
                _MapButton(icon: Icons.add, onTap: () => _mapController.move(_mapController.camera.center, _mapController.camera.zoom + 1)),
                const SizedBox(height: 8),
                _MapButton(icon: Icons.remove, onTap: () => _mapController.move(_mapController.camera.center, _mapController.camera.zoom - 1)),
                const SizedBox(height: 8),
                _MapButton(icon: Icons.my_location, color: AppColors.primary, onTap: () => _mapController.move(_driverPos, 14.5)),
              ],
            ),
          ),

          // Bottom turn-by-turn panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 20, offset: const Offset(0, -4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 8),
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(color: context.cBorder, borderRadius: BorderRadius.circular(2)),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.turn_right, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Turn right onto KN 4 Ave',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'In 300m',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text(
                              '2.3 km',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.primary),
                            ),
                            Text(
                              '8 min',
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                    child: Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => context.push(AppRoutes.driverCollection),
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(0, 52),
                              backgroundColor: AppColors.primary,
                            ),
                            child: const Text('Arrived at Stop', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        OutlinedButton(
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              shape: const RoundedRectangleBorder(
                                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                              ),
                              builder: (_) => SafeArea(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const SizedBox(height: 8),
                                    Container(
                                      width: 36, height: 4,
                                      decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
                                    ),
                                    ListTile(
                                      leading: const Icon(Icons.share_location, color: AppColors.primary),
                                      title: const Text('Share Location'),
                                      onTap: () {
                                        Navigator.pop(context);
                                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                          content: Row(children: [
                                            Icon(Icons.check_circle, color: Colors.white, size: 18),
                                            SizedBox(width: 8),
                                            Text('Location shared with dispatcher'),
                                          ]),
                                          backgroundColor: AppColors.primary,
                                          behavior: SnackBarBehavior.floating,
                                        ));
                                      },
                                    ),
                                    ListTile(
                                      leading: const Icon(Icons.report_problem_outlined, color: AppColors.error),
                                      title: const Text('Report Issue'),
                                      onTap: () {
                                        Navigator.pop(context);
                                        _showReportIssueDialog(context);
                                      },
                                    ),
                                    ListTile(
                                      leading: const Icon(Icons.skip_next, color: AppColors.warning),
                                      title: const Text('Skip Stop'),
                                      onTap: () {
                                        Navigator.pop(context);
                                        _showSkipStopDialog(context);
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(52, 52),
                            padding: EdgeInsets.zero,
                          ),
                          child: const Icon(Icons.more_horiz),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showReportIssueDialog(BuildContext context) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(children: [
          Icon(Icons.report_problem_outlined, color: AppColors.error, size: 22),
          SizedBox(width: 10),
          Text('Report Issue', style: TextStyle(fontWeight: FontWeight.w800)),
        ]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Describe the issue you are experiencing:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'e.g. Road blocked, wrong address, business closed...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Row(children: [
                  Icon(Icons.check_circle, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Issue reported to dispatcher'),
                ]),
                backgroundColor: AppColors.primary,
                behavior: SnackBarBehavior.floating,
              ));
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Submit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _showSkipStopDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Skip This Stop?', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text(
          'Skipping a stop will notify the dispatcher and reschedule this collection. '  
          'Are you sure you want to skip?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Row(children: [
                  Icon(Icons.info_outline, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Stop skipped — dispatcher notified'),
                ]),
                backgroundColor: AppColors.warning,
                behavior: SnackBarBehavior.floating,
              ));
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning),
            child: const Text('Yes, Skip', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _AnimatedDriverMarker extends StatefulWidget {
  @override
  State<_AnimatedDriverMarker> createState() => _AnimatedDriverMarkerState();
}

class _AnimatedDriverMarkerState extends State<_AnimatedDriverMarker>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        AnimatedBuilder(
          animation: _controller,
          builder: (_, __) => Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.info.withOpacity(0.15 * (1 - _controller.value)),
            ),
          ),
        ),
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AppColors.info,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [BoxShadow(color: AppColors.info.withOpacity(0.4), blurRadius: 8)],
          ),
          child: const Icon(Icons.local_shipping, color: Colors.white, size: 20),
        ),
      ],
    );
  }
}

class _MapButton extends StatelessWidget {
  final IconData icon;
  final Color? color;
  final VoidCallback? onTap;
  const _MapButton({required this.icon, this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
        ),
        child: Icon(icon, size: 20, color: color ?? AppColors.textPrimary),
      ),
    );
  }
}
