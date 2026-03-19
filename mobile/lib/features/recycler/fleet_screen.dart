import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/widgets/eco_button.dart';
import 'driver_tracking_screen.dart';
import 'recycler_collections_screen.dart';

class FleetScreen extends ConsumerStatefulWidget {
  const FleetScreen({super.key});

  @override
  ConsumerState<FleetScreen> createState() => _FleetScreenState();
}

class _FleetScreenState extends ConsumerState<FleetScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _vehicleCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final driversAsync = ref.watch(driversProvider);

    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        title: const Text('Driver Fleet'),
        actions: [
          ElevatedButton.icon(
            onPressed: () => _showAddDriverSheet(context),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Add Driver'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(0, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
          ),
          const SizedBox(width: 12),
        ],
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
                onPressed: () => ref.invalidate(driversProvider),
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
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () => _showAddDriverSheet(context),
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add Driver'),
                        ),
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
    // Backend may return is_available, status, or last_seen fields
    if (d['is_available'] == true) return 'active';
    if (d['is_available'] == false) return 'offline';
    return d['status'] as String? ?? 'idle';
  }

  void _showAddDriverSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          bool loading = false;
          return Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Add New Driver', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                const SizedBox(height: 20),
                TextField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Driver Full Name',
                    prefixIcon: Icon(Icons.person_outline),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone_outlined),
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _vehicleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Vehicle Plate',
                    prefixIcon: Icon(Icons.directions_car_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),
                EcoButton(
                  label: 'Send Invitation',
                  isLoading: loading,
                  onPressed: loading
                      ? null
                      : () async {
                          final name = _nameCtrl.text.trim();
                          final phone = _phoneCtrl.text.trim();
                          if (name.isEmpty || phone.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Please fill in name and phone'),
                                backgroundColor: AppColors.error,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                            return;
                          }
                          setSheet(() => loading = true);
                          try {
                            await ApiService.inviteDriver(
                              name: name,
                              phone: phone,
                              vehiclePlate: _vehicleCtrl.text.trim(),
                            );
                            ref.invalidate(driversProvider);
                            _nameCtrl.clear();
                            _phoneCtrl.clear();
                            _vehicleCtrl.clear();
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Row(
                                    children: [
                                      const Icon(Icons.check_circle, color: Colors.white, size: 18),
                                      const SizedBox(width: 8),
                                      Text('Invitation sent to $name'),
                                    ],
                                  ),
                                  backgroundColor: AppColors.primary,
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            }
                          } catch (e) {
                            setSheet(() => loading = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Failed to invite driver: $e'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            }
                          }
                        },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ─── Fleet Map Preview ────────────────────────────────────────────────────────

class _FleetMapPreview extends StatelessWidget {
  final List<Map<String, dynamic>> driverData;
  static const _kigali = LatLng(-1.9441, 30.0619);

  const _FleetMapPreview({required this.driverData});

  @override
  Widget build(BuildContext context) {
    final withGps = driverData
        .where((d) => d['current_lat'] != null && d['current_lng'] != null)
        .toList();

    return FlutterMap(
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
        if (withGps.isNotEmpty)
          MarkerLayer(
            markers: withGps.map((d) {
              final lat = (d['current_lat'] as num).toDouble();
              final lng = (d['current_lng'] as num).toDouble();
              final available = d['is_available'] as bool? ?? false;
              return Marker(
                point: LatLng(lat, lng),
                width: 32,
                height: 32,
                child: Container(
                  decoration: BoxDecoration(
                    color: available ? AppColors.primary : AppColors.textSecondary,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(Icons.directions_car, color: Colors.white, size: 14),
                ),
              );
            }).toList(),
          ),
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

  String get _driverStatus {
    if (driver['is_available'] == true) return 'active';
    if (driver['is_available'] == false) return 'offline';
    return driver['status'] as String? ?? 'idle';
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
                    label: _driverStatus.toUpperCase(),
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
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const RecyclerCollectionsScreen()),
                  ),
                  icon: const Icon(Icons.assignment_outlined, size: 14),
                  label: const Text('Assign'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Calling $phone...'), behavior: SnackBarBehavior.floating),
                ),
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
