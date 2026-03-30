import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/offline_banner.dart';
import '../../core/utils/cat_date_utils.dart';
import '../shared/live_tracking_screen.dart';
import 'collection_screen.dart';
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
      _DriverHomeTab(
        onGoToProfile: () => setState(() => _selectedIndex = 3),
        onGoToNavigate: () => setState(() => _selectedIndex = 1),
      ),
      mapTarget == null
          ? const Scaffold(
              body: Center(child: Text('No collections available for tracking.')),
            )
          : LiveTrackingScreen(collection: mapTarget, pushDriverLocation: true),
      const CollectionScreen(),
      const DriverProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: context.cBg,
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
  final VoidCallback? onGoToNavigate;
  const _DriverHomeTab({this.onGoToProfile, this.onGoToNavigate});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final stats = ref.watch(driverStatsProvider);
    final route = ref.watch(driverRouteProvider);
    final driverProfile = ref.watch(driverProfileProvider).valueOrNull ?? {};
    final isAvailable = driverProfile['is_available'] as bool? ?? true;
    final greeting = CatDateUtils.greeting();
    final doneCount = route.stops.where((s) => s.status == RouteStopStatus.completed).length;
    final totalCount = route.stops.length;
    final nextStop = route.stops
        .where((s) =>
            s.status == RouteStopStatus.pending ||
            s.status == RouteStopStatus.arrived ||
            s.status == RouteStopStatus.collecting)
        .firstOrNull;
    final initials = (user?.displayName ?? 'D').trim().split(' ').take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '').join();
    final totalVolume = (stats["totalVolume"] as double?) ?? 0.0;
    final totalEarnings = (stats["totalEarnings"] as double?) ?? 0.0;
    final unread = ref.watch(unreadCountProvider);

    return Scaffold(
      backgroundColor: context.cBg,
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(collectionsNotifierProvider.notifier).refresh();
          ref.invalidate(driverProfileProvider);
          ref.invalidate(notificationsProvider);
          await Future.delayed(const Duration(milliseconds: 600));
        },
        child: CustomScrollView(
        slivers: [
          // ── Gradient header ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D47A1), Color(0xFF1565C0), Color(0xFF1E88E5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(greeting, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13)),
                                const SizedBox(height: 2),
                                Text(
                                  user?.displayName ?? 'Driver',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                                  maxLines: 1, overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          // Availability pill — tappable to toggle
                          GestureDetector(
                            onTap: () async {
                              try {
                                await ApiService.setDriverAvailability(!isAvailable);
                                ref.invalidate(driverProfileProvider);
                              } catch (_) {}
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                Icon(Icons.circle, color: isAvailable ? const Color(0xFF69F0AE) : Colors.white54, size: 8),
                                const SizedBox(width: 5),
                                Text(
                                  isAvailable ? 'Online' : 'Offline',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                                ),
                              ]),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Notifications bell with unread badge
                          Stack(
                            children: [
                              GestureDetector(
                                onTap: () => context.push(AppRoutes.notifications),
                                child: Container(
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                                ),
                              ),
                              if (unread > 0)
                                Positioned(
                                  right: 4, top: 4,
                                  child: Container(
                                    width: 8, height: 8,
                                    decoration: const BoxDecoration(color: Color(0xFFFF5252), shape: BoxShape.circle),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(width: 8),
                          // Avatar with popup
                          PopupMenuButton<String>(
                            onSelected: (val) {
                              if (val == 'profile') onGoToProfile?.call();
                              if (val == 'logout') ref.read(authProvider.notifier).logout();
                            },
                            offset: const Offset(0, 48),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            tooltip: 'Account',
                            itemBuilder: (_) => [
                              const PopupMenuItem(value: 'profile', child: Row(children: [
                                Icon(Icons.settings_outlined, size: 18),
                                SizedBox(width: 10), Text('Settings & Profile'),
                              ])),
                              const PopupMenuDivider(),
                              const PopupMenuItem(value: 'logout', child: Row(children: [
                                Icon(Icons.logout, color: Colors.red, size: 18),
                                SizedBox(width: 10), Text('Sign Out', style: TextStyle(color: Colors.red)),
                              ])),
                            ],
                            child: CircleAvatar(
                              radius: 22,
                              backgroundColor: Colors.white.withValues(alpha: 0.2),
                              child: Text(initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Route progress card inside header
                      _RouteSummaryCard(route: route, doneCount: doneCount, totalCount: totalCount),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 350.ms),
          ),

          // ── Body content ─────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
            sliver: SliverList(delegate: SliverChildListDelegate([
              const OfflineBanner(),

              // Stat cards row
              Row(
                children: [
                  _StatMiniCard(
                    label: 'Stops Done',
                    value: '$doneCount / $totalCount',
                    icon: Icons.check_circle_outline,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 10),
                  _StatMiniCard(
                    label: 'Kg Collected',
                    value: '${totalVolume.toStringAsFixed(1)} kg',
                    icon: Icons.scale_outlined,
                    color: const Color(0xFF00ACC1),
                  ),
                  const SizedBox(width: 10),
                  _StatMiniCard(
                    label: 'Earnings',
                    value: 'RWF ${totalEarnings.toStringAsFixed(0)}',
                    icon: Icons.payments_outlined,
                    color: const Color(0xFF43A047),
                  ),
                ],
              ).animate().slideY(begin: 0.2, duration: 350.ms, delay: 80.ms).fadeIn(),

              const SizedBox(height: 20),

              // Next stop
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Next Stop', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: context.cText)),
                  if (totalCount > 0)
                    Text('$totalCount stop${totalCount != 1 ? "s" : ""} today',
                        style: TextStyle(fontSize: 12, color: context.cTextSec)),
                ],
              ),
              const SizedBox(height: 10),

              if (nextStop != null)
                _NextStopCard(stop: nextStop, onNavigate: onGoToNavigate).animate().slideY(begin: 0.2, duration: 350.ms, delay: 160.ms).fadeIn()
              else
                _EmptyStopsCard(allDone: totalCount > 0 && doneCount == totalCount)
                    .animate().fadeIn(duration: 300.ms, delay: 160.ms),

              const SizedBox(height: 20),

              // Today's route list
              if (route.stops.isNotEmpty) ...[
                Text("Today's Route", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: context.cText)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: context.cSurf,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: context.cBorder),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)],
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
                ).animate().slideY(begin: 0.2, duration: 350.ms, delay: 240.ms).fadeIn(),
                const SizedBox(height: 20),
              ],

              // Start navigation button
              ElevatedButton.icon(
                onPressed: () async {
                  // Mark the first scheduled collection as en_route
                  final collections = ref.read(driverCollectionsProvider);
                  final firstScheduled = collections
                      .where((c) => c.status == CollectionStatus.scheduled)
                      .firstOrNull;
                  if (firstScheduled != null) {
                    final id = int.tryParse(firstScheduled.id);
                    if (id != null) {
                      try {
                        await ApiService.post(
                          '/collections/$id/advance',
                          body: {'status': 'en_route'},
                        );
                        ref.invalidate(driverCollectionsProvider);
                      } catch (_) {}
                    }
                  }
                  onGoToNavigate?.call();
                },
                icon: const Icon(Icons.navigation_rounded, size: 20),
                label: const Text('Start Navigation'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  elevation: 2,
                ),
              ).animate().slideY(begin: 0.2, duration: 350.ms, delay: 300.ms).fadeIn(),
            ])),
          ),
        ],
      ),
      ),
    );
  }

}

// ─── Route Summary (embedded inside header gradient) ────────────────────────
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
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(children: [
                const Icon(Icons.route_outlined, color: Colors.white70, size: 15),
                const SizedBox(width: 6),
                Text("Today's Route", style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13)),
              ]),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  stops > 0 ? '$doneCount/$stops done' : 'No stops',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            stops > 0 ? '$stops Stop${stops != 1 ? "s" : ""} Assigned' : 'No stops assigned today',
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
              minHeight: 7,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '$doneCount of $stops completed',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 11),
          ),
        ],
      ),
    );
  }
}

// ─── Compact stat mini-card ──────────────────────────────────────────────────
class _StatMiniCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _StatMiniCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: context.cBorder),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6)],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 34, height: 34,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: Icon(icon, size: 17, color: color),
            ),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: context.cText), maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(fontSize: 10, color: context.cTextSec), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

// ─── Empty stops state ───────────────────────────────────────────────────────
class _EmptyStopsCard extends StatelessWidget {
  final bool allDone;
  const _EmptyStopsCard({this.allDone = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        children: [
          Icon(
            allDone ? Icons.task_alt : Icons.inbox_outlined,
            size: 40,
            color: allDone ? AppColors.primary : AppColors.textTertiary,
          ),
          const SizedBox(height: 10),
          Text(
            allDone ? 'All stops completed!' : 'No stops assigned today',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: allDone ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            allDone ? 'Great work! Check back tomorrow.' : 'Your recycler will assign stops here.',
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _NextStopCard extends StatelessWidget {
  final RouteStop stop;
  final VoidCallback? onNavigate;
  const _NextStopCard({required this.stop, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(5),
                ),
                child: const Text(
                  'NEXT STOP',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.location_on, color: AppColors.primary, size: 14),
                  const SizedBox(width: 3),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 130),
                    child: Text(
                      stop.location,
                      style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            stop.businessName,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
          ),
          const SizedBox(height: 2),
          Text(
            stop.location,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Row(children: [
            _StopDetail(icon: Icons.recycling, label: stop.wasteType.label),
            const SizedBox(width: 12),
            _StopDetail(icon: Icons.scale_outlined, label: '${stop.volume.toStringAsFixed(0)} ${stop.wasteType == WasteType.uco ? "L" : "kg"}'),
          ]),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onNavigate,
                  icon: const Icon(Icons.navigation, size: 15),
                  label: const Text('Navigate'),
                  style: ElevatedButton.styleFrom(minimumSize: const Size(0, 38)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: stop.contactPhone.isNotEmpty
                    ? () async {
                        final uri = Uri(scheme: 'tel', path: stop.contactPhone);
                        if (await canLaunchUrl(uri)) await launchUrl(uri);
                      }
                    : null,
                icon: const Icon(Icons.call, size: 15),
                label: const Text('Call'),
                style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
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
