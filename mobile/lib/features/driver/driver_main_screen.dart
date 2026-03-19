import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/widgets/offline_banner.dart';
import '../shared/live_tracking_screen.dart';
import 'collection_screen.dart';
import 'earnings_screen.dart';
import 'driver_profile_screen.dart';

class DriverMainScreen extends ConsumerStatefulWidget {
  final Widget child;
  const DriverMainScreen({super.key, required this.child});

  @override
  ConsumerState<DriverMainScreen> createState() => _DriverMainScreenState();
}

class _DriverMainScreenState extends ConsumerState<DriverMainScreen> {
  int _selectedIndex = 0;

  Collection? _firstStartedCollection(List<Collection> collections) {
    final started = collections.where((c) =>
        c.status == CollectionStatus.enRoute ||
        c.status == CollectionStatus.scheduled ||
        c.status == CollectionStatus.collected);
    return started.isNotEmpty
        ? started.first
        : (collections.isNotEmpty ? collections.first : null);
  }

  @override
  Widget build(BuildContext context) {
    final driverCollections = ref.watch(driverCollectionsProvider);
    final mapTarget = _firstStartedCollection(driverCollections);
    final screens = [
      _DriverHomeTab(onGoToProfile: () => setState(() => _selectedIndex = 4)),
      mapTarget == null
          ? const Scaffold(
              body: Center(child: Text('No collections available for tracking.')),
            )
          : LiveTrackingScreen(collection: mapTarget, pushDriverLocation: true),
      const CollectionScreen(),
      const EarningsScreen(),
      const DriverProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: context.cBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          title: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Driver Dashboard'),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
      body: screens[_selectedIndex],
      bottomNavigationBar: Builder(builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: ctx.cSurf,
          border: Border(top: BorderSide(color: ctx.cBorder)),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (i) => setState(() => _selectedIndex = i),
          backgroundColor: ctx.cSurf,
          elevation: 0,
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.navigation_outlined), selectedIcon: Icon(Icons.navigation), label: 'Navigate'),
            NavigationDestination(icon: Icon(Icons.inventory_2_outlined), selectedIcon: Icon(Icons.inventory_2), label: 'Collect'),
            NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'Earnings'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      )),
    );
  }
}

// ─── Driver Home Tab ──────────────────────────────────────────────────────────
class _DriverHomeTab extends ConsumerWidget {
  final VoidCallback? onGoToProfile;
  const _DriverHomeTab({this.onGoToProfile});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final stats = ref.watch(driverStatsProvider);
    final route = ref.watch(driverRouteProvider);
    final h = DateTime.now().hour;
    final greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    final doneCount = route.stops.where((s) => s.status == RouteStopStatus.completed).length;
    final totalCount = route.stops.length;
    final nextStop = route.stops.where((s) => s.status == RouteStopStatus.pending || s.status == RouteStopStatus.collecting).firstOrNull;
    return Scaffold(
      backgroundColor: context.cBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Flexible(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          greeting,
                          style: TextStyle(fontSize: 13, color: context.cTextSec),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          user?.displayName ?? 'Driver',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: context.cText),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // Online toggle
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.circle, color: AppColors.primary, size: 10),
                        SizedBox(width: 6),
                        Text(
                          'Online',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Profile avatar popup
                  PopupMenuButton<String>(
                    onSelected: (val) {
                      if (val == 'profile') onGoToProfile?.call();
                      if (val == 'logout') ref.read(authProvider.notifier).logout();
                    },
                    offset: const Offset(0, 44),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    tooltip: 'Account',
                    itemBuilder: (_) => [
                      const PopupMenuItem(
                        value: 'profile',
                        child: Row(children: [
                          Icon(Icons.settings_outlined, size: 18),
                          SizedBox(width: 10),
                          Text('Settings & Profile'),
                        ]),
                      ),
                      const PopupMenuDivider(),
                      const PopupMenuItem(
                        value: 'logout',
                        child: Row(children: [
                          Icon(Icons.logout, color: Colors.red, size: 18),
                          SizedBox(width: 10),
                          Text('Sign Out', style: TextStyle(color: Colors.red)),
                        ]),
                      ),
                    ],
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primaryLight,
                      child: Text(
                        (user?.displayName ?? 'D').substring(0, 1).toUpperCase(),
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 4),
              const OfflineBanner(),
              const SizedBox(height: 20),

              // Route summary card
              _RouteSummaryCard(route: route, doneCount: doneCount, totalCount: totalCount).animate().slideY(begin: 0.2, duration: 400.ms).fadeIn(),

              const SizedBox(height: 20),

              // Today's stats
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      title: "Today's Earnings",
                      value: 'RWF ${_fmtK(stats["todayEarnings"] ?? 0)}',
                      icon: Icons.account_balance_wallet_outlined,
                      iconColor: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      title: 'Stops Done',
                      value: '$doneCount / $totalCount',
                      icon: Icons.check_circle_outline,
                      iconColor: AppColors.accent,
                      iconBg: AppColors.accentLight,
                    ),
                  ),
                ],
              ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 100.ms).fadeIn(),

              const SizedBox(height: 20),

              // Next stop highlighted
              const SectionHeader(title: 'Next Stop'),
              const SizedBox(height: 12),

              if (nextStop != null)
                _NextStopCard(stop: nextStop).animate().slideY(begin: 0.2, duration: 400.ms, delay: 200.ms).fadeIn()
              else
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                  child: const Center(child: Text('All stops completed!', style: TextStyle(color: AppColors.textSecondary))),
                ).animate().fadeIn(),

              const SizedBox(height: 20),

              // Stops progress
              const SectionHeader(title: "Today's Route"),
              const SizedBox(height: 12),

              if (route.stops.isNotEmpty)
                  Container(padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: context.cSurf,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: context.cBorder),
                  ),
                  child: Column(
                    children: route.stops.asMap().entries.map((e) {
                      final stop = e.value;
                      final isLast = e.key == route.stops.length - 1;
                      final statusStr = stop.status == RouteStopStatus.completed
                          ? 'done'
                          : stop.status == RouteStopStatus.collecting
                              ? 'next'
                              : 'pending';
                      return _RouteStop(
                        index: e.key + 1,
                        hotel: stop.businessName,
                        address: stop.location,
                        status: statusStr,
                        isLast: isLast,
                      );
                    }).toList(),
                  ),
                ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 300.ms).fadeIn(),

              const SizedBox(height: 20),

              // Start route button
              ElevatedButton.icon(
                onPressed: () => context.push(AppRoutes.driverNavigation),
                icon: const Icon(Icons.navigation, size: 20),
                label: const Text('Start Navigation'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 58),
                  textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
              ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 400.ms).fadeIn(),
            ],
          ),
        ),
      ),
    );
  }

  String _fmtK(dynamic val) {
    final n = (val ?? 0) is num ? (val as num).toDouble() : 0.0;
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toStringAsFixed(0);
  }
}

class _RouteSummaryCard extends StatelessWidget {
  final DriverRoute? route;
  final int doneCount;
  final int totalCount;
  const _RouteSummaryCard({this.route, required this.doneCount, required this.totalCount});

  @override
  Widget build(BuildContext context) {
    final stops = route?.stops.length ?? 0;
    final progress = stops > 0 ? doneCount / stops : 0.0;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.route, color: Colors.white70, size: 16),
              SizedBox(width: 6),
              Text(
                "Today's Route",
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '$stops Stops',
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            'Est. ${stops * 30}min • RWF ${stops * 3000} potential',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13),
          ),
          const SizedBox(height: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$doneCount of $stops completed',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12),
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progress.toDouble(),
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _NextStopCard extends StatelessWidget {
  final RouteStop stop;
  const _NextStopCard({required this.stop});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'NEXT STOP',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const Spacer(),
              const Icon(Icons.location_on, color: AppColors.primary, size: 16),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  stop.location,
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            stop.businessName,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
          ),
          const SizedBox(height: 4),
          Text(
            stop.location,
            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          Row(children: [_StopDetail(icon: Icons.recycling, label: stop.wasteType.label)]),
          const SizedBox(height: 6),
          Row(children: [_StopDetail(icon: Icons.scale_outlined, label: '${stop.volume.toStringAsFixed(0)} ${stop.wasteType == WasteType.uco ? "L" : "kg"}')]),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.push(AppRoutes.driverNavigation),
                  icon: const Icon(Icons.navigation, size: 16),
                  label: const Text('Navigate'),
                  style: ElevatedButton.styleFrom(minimumSize: const Size(0, 42)),
                ),
              ),
              const SizedBox(width: 10),
              OutlinedButton.icon(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling customer...'), behavior: SnackBarBehavior.floating),
                ),
                icon: const Icon(Icons.call, size: 16),
                label: const Text('Call'),
                style: OutlinedButton.styleFrom(minimumSize: const Size(0, 42)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StopDetail extends StatelessWidget {
  final IconData icon;
  final String label;
  const _StopDetail({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: AppColors.textSecondary),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
      ],
    );
  }
}

class _RouteStop extends StatelessWidget {
  final int index;
  final String hotel;
  final String address;
  final String status; // 'done', 'next', 'pending'
  final bool isLast;

  const _RouteStop({
    required this.index,
    required this.hotel,
    required this.address,
    required this.status,
    this.isLast = false,
  });

  Color get _color {
    switch (status) {
      case 'done': return AppColors.primary;
      case 'next': return AppColors.info;
      default: return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: _color, width: status == 'next' ? 2 : 1),
              ),
              child: Center(
                child: status == 'done'
                    ? Icon(Icons.check, color: _color, size: 16)
                    : Text(
                        '$index',
                        style: TextStyle(
                          color: _color,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 32,
                color: context.cBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hotel,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: status == 'done' ? AppColors.textTertiary : AppColors.textPrimary,
                  ),
                ),
                Text(
                  address,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ),
        if (status == 'next')
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFDBEAFE),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'NEXT',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.info,
              ),
            ),
          ),
      ],
    );
  }
}
