import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/router/app_router.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/widgets/offline_banner.dart';
import '../shared/terms_privacy_screen.dart';
import 'marketplace_screen.dart';
import 'my_bids_screen.dart';
import 'fleet_screen.dart';
import 'recycler_collections_screen.dart';
import '../../core/utils/image_url.dart';

class RecyclerMainScreen extends ConsumerStatefulWidget {
  final Widget child;
  const RecyclerMainScreen({super.key, required this.child});

  @override
  ConsumerState<RecyclerMainScreen> createState() => _RecyclerMainScreenState();
}

class _RecyclerMainScreenState extends ConsumerState<RecyclerMainScreen> {
  int _selectedIndex = 0;

  void _goToMarket() => setState(() => _selectedIndex = 1);
  void _goToProfile() => setState(() => _selectedIndex = 5);

  @override
  Widget build(BuildContext context) {
    final screens = [
      _RecyclerHomeTab(onBrowseMarket: _goToMarket, onGoToProfile: _goToProfile),
      const MarketplaceScreen(),
      const MyBidsScreen(),
      const FleetScreen(),
      const RecyclerCollectionsScreen(),
      const _RecyclerProfileTab(),
    ];

    return Scaffold(
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
            NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
            NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Market'),
            NavigationDestination(icon: Icon(Icons.gavel_outlined), selectedIcon: Icon(Icons.gavel), label: 'My Bids'),
            NavigationDestination(icon: Icon(Icons.directions_car_outlined), selectedIcon: Icon(Icons.directions_car), label: 'Fleet'),
            NavigationDestination(icon: Icon(Icons.assignment_outlined), selectedIcon: Icon(Icons.assignment), label: 'Jobs'),
            NavigationDestination(icon: Icon(Icons.person_outlined), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      )),
    );
  }
}

// ─── Recycler Home Tab ────────────────────────────────────────────────────────
class _RecyclerHomeTab extends ConsumerStatefulWidget {
  final VoidCallback? onBrowseMarket;
  final VoidCallback? onGoToProfile;
  const _RecyclerHomeTab({this.onBrowseMarket, this.onGoToProfile});

  @override
  ConsumerState<_RecyclerHomeTab> createState() => _RecyclerHomeTabState();
}

class _RecyclerHomeTabState extends ConsumerState<_RecyclerHomeTab> {
  VoidCallback? get onBrowseMarket => widget.onBrowseMarket;
  VoidCallback? get onGoToProfile => widget.onGoToProfile;

  Future<void> _refresh() async {
    // Refresh all dashboard data via the notifiers (they invalidate the private FutureProviders)
    ref.read(listingsNotifierProvider.notifier).refresh();
    await ref.read(collectionsNotifierProvider.notifier).refresh();
    await Future<void>.delayed(const Duration(milliseconds: 400));
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final listings = ref.watch(openListingsProvider);
    final stats = ref.watch(recyclerStatsProvider);
    final dn = user?.displayName ?? 'GR';
    final initials = (dn.length >= 2 ? dn.substring(0, 2) : dn).toUpperCase();
    final greeting = _greeting();
    return Scaffold(
      backgroundColor: context.cBg,
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: CustomScrollView(
        slivers: [
          // ── Gradient header ───────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1A237E), Color(0xFF283593), Color(0xFF3949AB)],
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
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(greeting, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13)),
                                const SizedBox(height: 2),
                                Text(
                                  user?.displayName ?? 'GreenRecycle Ltd',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                                  maxLines: 1, overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: const Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.circle, color: Color(0xFF69F0AE), size: 8),
                              SizedBox(width: 5),
                              Text('Active', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                            ]),
                          ),
                          const SizedBox(width: 8),
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
                          const SizedBox(width: 8),
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
                      // Stats strip inside header
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _RecyclerHeaderStat(
                              label: 'Listings',
                              value: '${listings.length}',
                              icon: Icons.inventory_rounded,
                            ),
                            _RecyclerStatDivider(),
                            _RecyclerHeaderStat(
                              label: 'Active Bids',
                              value: '${stats['activeBids'] ?? 0}',
                              icon: Icons.gavel_outlined,
                            ),
                            _RecyclerStatDivider(),
                            _RecyclerHeaderStat(
                              label: 'Revenue',
                              value: 'RWF ${_fmtK(stats['totalEarnings'] ?? 0)}',
                              icon: Icons.trending_up,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 350.ms),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const OfflineBanner(),
                const SizedBox(height: 12),

                // Stats grid
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.35,
                  children: [
                    StatCard(
                      title: 'Open Listings',
                      value: '${listings.length}',
                      subtitle: 'in marketplace',
                      icon: Icons.inventory_rounded,
                      iconColor: AppColors.primary,
                    ),
                    StatCard(
                      title: 'Active Bids',
                      value: '${stats['activeBids'] ?? 0}',
                      subtitle: 'awaiting response',
                      icon: Icons.gavel_outlined,
                      iconColor: AppColors.accent,
                      iconBg: AppColors.accentLight,
                    ),
                    StatCard(
                      title: 'Won Bids',
                      value: '${stats['wonBids'] ?? 0}',
                      subtitle: 'collections',
                      icon: Icons.check_circle_outline,
                      iconColor: AppColors.info,
                      iconBg: const Color(0xFFDBEAFE),
                    ),
                    StatCard(
                      title: 'Revenue',
                      value: 'RWF ${_fmtK(stats['totalEarnings'] ?? 0)}',
                      subtitle: 'total earnings',
                      icon: Icons.trending_up,
                      iconColor: AppColors.primaryDark,
                    ),
                  ],
                ).animate().slideY(begin: 0.2, duration: 400.ms).fadeIn(),

                const SizedBox(height: 24),

                // Quick Bid
                _QuickBidCard(onBrowse: onBrowseMarket).animate().slideY(begin: 0.2, duration: 400.ms, delay: 100.ms).fadeIn(),

                const SizedBox(height: 24),

                // Nearby Listings — top 3 from marketplace
                SectionHeader(title: 'Nearby Listings', actionLabel: 'View All', onAction: onBrowseMarket),
                const SizedBox(height: 12),

                if (listings.isEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    alignment: Alignment.center,
                    child: const Text('No listings available yet',
                        style: TextStyle(color: AppColors.textSecondary)),
                  )
                else
                  ...listings.take(3).map((listing) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: context.cSurf,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: context.cBorder),
                    ),
                    child: InkWell(
                      onTap: onBrowseMarket,
                      borderRadius: BorderRadius.circular(14),
                      child: Row(
                        children: [
                          Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.inventory_2_outlined, color: AppColors.primary, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(listing.businessName,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                                    maxLines: 1, overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 2),
                                Text(
                                  '${listing.wasteType.label} • ${listing.volume.toStringAsFixed(0)} ${listing.unit}',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('RWF ${listing.minBid.toStringAsFixed(0)}/${listing.unit}',
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.primary)),
                              Text('${listing.activeBidCount} bid${listing.activeBidCount == 1 ? '' : 's'}',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textTertiary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )).toList(),

                const SizedBox(height: 24),

                // Recent activity — latest open listings
                const SectionHeader(title: 'Recent Activity'),
                const SizedBox(height: 12),

                ...listings.take(3).map((listing) => _ActivityCard(
                  icon: Icons.business_outlined,
                  title: 'New listing from ${listing.businessName}',
                  subtitle: '${listing.wasteType.label} ${listing.volume.toStringAsFixed(0)}${listing.unit} \u2022 ${listing.activeBidCount} bids',
                  color: AppColors.primary,
                  onTap: onBrowseMarket,
                  photos: listing.photos,
                )),

                const SizedBox(height: 20),

                // CTA: Browse marketplace
                ElevatedButton.icon(
                  onPressed: onBrowseMarket,
                  icon: const Icon(Icons.map_outlined, size: 20),
                  label: const Text('Browse Marketplace'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    backgroundColor: const Color(0xFF3949AB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    elevation: 2,
                  ),
                ).animate().slideY(begin: 0.2, duration: 350.ms, delay: 300.ms).fadeIn(),
              ]),
            ),
          ),
        ],
      ),
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String _fmtK(dynamic val) {
    final n = (val ?? 0).toDouble();
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toStringAsFixed(0);
  }
}

// ─── Recycler header stat widget ──────────────────────────────────────────────
class _RecyclerHeaderStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _RecyclerHeaderStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 18),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11)),
      ],
    );
  }
}

class _RecyclerStatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(height: 36, width: 1, color: Colors.white.withValues(alpha: 0.25));
  }
}

class _QuickBidCard extends StatelessWidget {
  final VoidCallback? onBrowse;
  const _QuickBidCard({this.onBrowse});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.bolt_rounded, color: Colors.white70, size: 16),
                    SizedBox(width: 4),
                    Text('Quick Bid', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'New listings available\nin your area',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: onBrowse,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF7C3AED),
                    minimumSize: const Size(120, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                  ),
                  child: const Text('Browse Now', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
          const Icon(Icons.factory_rounded, size: 56, color: Colors.white24),
        ],
      ),
    );
  }
}


class _ActivityCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback? onTap;
  final List<String>? photos;
  const _ActivityCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    this.onTap,
    this.photos,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: context.cBorder),
        ),
        child: Row(
          children: [
            // Image thumbnail
            if (photos != null && photos!.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  getFirstImageUrl(photos),
                  width: 40,
                  height: 40,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    color: color.withValues(alpha: 0.1),
                    width: 40,
                    height: 40,
                    child: Icon(icon, color: color, size: 20),
                  ),
                ),
              )
            else
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: context.cText)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(fontSize: 12, color: context.cTextSec)),
                ],
              ),
            ),
            if (onTap != null)
              Icon(Icons.chevron_right, color: context.cTextSec, size: 18),
          ],
        ),
      ),
    );
  }
}

// ─── Recycler Profile Tab ─────────────────────────────────────────────────────
class _RecyclerProfileTab extends ConsumerStatefulWidget {
  const _RecyclerProfileTab();

  @override
  ConsumerState<_RecyclerProfileTab> createState() => _RecyclerProfileTabState();
}

class _RecyclerProfileTabState extends ConsumerState<_RecyclerProfileTab> {
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final recyclerAsync = ref.watch(recyclerProfileProvider);
    final recyclerData = recyclerAsync.valueOrNull ?? {};
    final tin = recyclerData['tin'] as String? ?? recyclerData['tin_number'] as String? ?? '—';
    final location = recyclerData['location'] as String? ?? recyclerData['address'] as String? ?? '—';
    final companyName = recyclerData['company_name'] as String? ?? user?.displayName ?? 'GreenRecycle Ltd';

    final initials = companyName.trim().split(' ').take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '').join();

    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          // ── Full-bleed indigo gradient header ─────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1A237E), Color(0xFF283593), Color(0xFF3949AB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
                  child: Column(
                    children: [
                      // Avatar
                      Container(
                        width: 88, height: 88,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 2.5),
                        ),
                        child: Center(
                          child: Text(
                            initials.isNotEmpty ? initials : '♻️',
                            style: const TextStyle(
                              color: Colors.white, fontWeight: FontWeight.w800, fontSize: 28),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(companyName,
                          style: const TextStyle(
                              color: Colors.white, fontWeight: FontWeight.w800, fontSize: 22),
                          textAlign: TextAlign.center),
                      const SizedBox(height: 4),
                      Text(
                        location == '—' ? 'Recycler · Rwanda' : location,
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      // Edit button
                      OutlinedButton.icon(
                        onPressed: () => _showEditProfileSheet(context,
                            name: companyName,
                            phone: user?.phone ?? '',
                            location: location == '—' ? '' : location,
                            tin: tin == '—' ? '' : tin),
                        icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 16),
                        label: const Text('Edit Profile',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 350.ms),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Company Details
                _RecyclerProfileSection(
                  title: 'Company Details',
                  children: [
                    _RecyclerProfileRow(icon: Icons.business_outlined, label: 'Company Name', value: companyName),
                    _RecyclerProfileRow(icon: Icons.numbers_outlined, label: 'TIN Number', value: tin),
                    _RecyclerProfileRow(icon: Icons.location_on_outlined, label: 'Location', value: location),
                    _RecyclerProfileRow(icon: Icons.phone_outlined, label: 'Phone', value: user?.phone ?? 'N/A'),
                    _RecyclerProfileRow(icon: Icons.email_outlined, label: 'Email', value: user?.email ?? 'N/A'),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),

                const SizedBox(height: 16),

                // RDB Certificate
                _RecyclerRdbSection(
                  onUpload: () => _showRdbCertSheet(context),
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 60.ms).fadeIn(),

                const SizedBox(height: 16),

                // Settings
                _RecyclerProfileSection(
                  title: 'Settings',
                  children: [
                    _RecyclerSettingRow(
                      icon: Icons.notifications_outlined,
                      label: 'Notifications',
                      onTap: () => context.push(AppRoutes.notifications),
                    ),
                    _RecyclerSettingRow(
                      icon: Icons.language_outlined,
                      label: 'Language',
                      onTap: () => _showLanguageSheet(context),
                    ),
                    _RecyclerSettingRow(
                      icon: Icons.lock_outline,
                      label: 'Change Password',
                      onTap: () => _showChangePasswordSheet(context),
                    ),
                    Consumer(
                      builder: (context, ref, _) {
                        final isDark = ref.watch(themeProvider) == ThemeMode.dark;
                        return SwitchListTile(
                          secondary: Icon(
                            isDark ? Icons.dark_mode : Icons.light_mode,
                            color: AppColors.textSecondary,
                            size: 20,
                          ),
                          title: const Text('Dark Mode',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          value: isDark,
                          onChanged: (_) => ref.read(themeProvider.notifier).toggle(),
                          activeThumbColor: AppColors.primary,
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                        );
                      },
                    ),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 80.ms).fadeIn(),

                const SizedBox(height: 16),

                // Support
                _RecyclerProfileSection(
                  title: 'Support',
                  children: [
                    _RecyclerSettingRow(
                      icon: Icons.help_outline,
                      label: 'Help & FAQ',
                      onTap: () => context.push(AppRoutes.support),
                    ),
                    _RecyclerSettingRow(
                      icon: Icons.support_agent_outlined,
                      label: 'Contact Support',
                      onTap: () => context.push(AppRoutes.support),
                    ),
                    _RecyclerSettingRow(
                      icon: Icons.privacy_tip_outlined,
                      label: 'Privacy Policy',
                      onTap: () => _showLegalModal(context, TermsTab.privacy),
                    ),
                    _RecyclerSettingRow(
                      icon: Icons.description_outlined,
                      label: 'Terms of Service',
                      onTap: () => _showLegalModal(context, TermsTab.terms),
                    ),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 160.ms).fadeIn(),

                const SizedBox(height: 20),

                // Sign out
                OutlinedButton.icon(
                  onPressed: () => _confirmSignOut(context, ref),
                  icon: const Icon(Icons.logout, color: AppColors.error),
                  label: const Text('Sign Out',
                      style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    minimumSize: const Size(double.infinity, 52),
                  ),
                ).animate().fadeIn(delay: 200.ms),

                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  void _showRdbCertSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _RecyclerRdbUploadSheet(
        onUploaded: () {
          if (ctx.mounted) Navigator.pop(ctx);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Row(children: [
                Icon(Icons.check_circle, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text('Certificate uploaded. Pending admin review.'),
              ]),
              backgroundColor: AppColors.primary,
              behavior: SnackBarBehavior.floating,
            ));
          }
        },
      ),
    );
  }

  void _showChangePasswordSheet(BuildContext context) {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();
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
                Text('Change Password',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
                const SizedBox(height: 20),
                TextField(
                  controller: currentCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Current Password',
                    prefixIcon: Icon(Icons.lock_outline),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                    prefixIcon: Icon(Icons.lock_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirm New Password',
                    prefixIcon: Icon(Icons.lock_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: loading
                        ? null
                        : () async {
                            if (newCtrl.text != confirmCtrl.text) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Passwords do not match'), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
                              );
                              return;
                            }
                            setSheet(() => loading = true);
                            try {
                              await ApiService.changePassword(
                                currentPassword: currentCtrl.text,
                                newPassword: newCtrl.text,
                              );
                              if (ctx.mounted) Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Row(children: [
                                      Icon(Icons.check_circle, color: Colors.white, size: 18),
                                      SizedBox(width: 8),
                                      Text('Password changed successfully'),
                                    ]),
                                    backgroundColor: AppColors.primary,
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              }
                            } catch (e) {
                              setSheet(() => loading = false);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                    child: loading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Update Password', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _confirmSignOut(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Are you sure you want to sign out of Ecotrade?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showEditProfileSheet(BuildContext context,
      {String name = '', String phone = '', String location = '', String tin = ''}) {
    final nameCtrl = TextEditingController(text: name);
    final phoneCtrl = TextEditingController(text: phone);
    final locationCtrl = TextEditingController(text: location);
    final tinCtrl = TextEditingController(text: tin);
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
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Text('Edit Profile',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const Spacer(),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                  ]),
                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Company Name',
                      prefixIcon: Icon(Icons.recycling_outlined),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Phone Number',
                      prefixIcon: Icon(Icons.phone_outlined),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: locationCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Location / Address',
                      prefixIcon: Icon(Icons.location_on_outlined),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: tinCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'TIN Number',
                      hintText: 'e.g. 123456789',
                      prefixIcon: Icon(Icons.numbers_outlined),
                      border: OutlineInputBorder(),
                      helperText: 'Rwanda Revenue Authority Tax ID',
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: loading
                          ? null
                          : () async {
                              setSheet(() => loading = true);
                              try {
                                final profileData = <String, dynamic>{};
                                if (nameCtrl.text.trim().isNotEmpty) profileData['full_name'] = nameCtrl.text.trim();
                                if (phoneCtrl.text.trim().isNotEmpty) profileData['phone'] = phoneCtrl.text.trim();

                                final recyclerData = <String, dynamic>{};
                                if (nameCtrl.text.trim().isNotEmpty) recyclerData['company_name'] = nameCtrl.text.trim();
                                if (locationCtrl.text.trim().isNotEmpty) recyclerData['address'] = locationCtrl.text.trim();
                                if (tinCtrl.text.trim().isNotEmpty) recyclerData['tin_number'] = tinCtrl.text.trim();

                                final futures = <Future>[];
                                if (profileData.isNotEmpty) futures.add(ApiService.updateProfile(profileData));
                                if (recyclerData.isNotEmpty) futures.add(ApiService.updateMyRecycler(recyclerData));

                                await Future.wait(futures);
                                ref.invalidate(recyclerProfileProvider);
                                if (ctx.mounted) Navigator.pop(ctx);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                    content: Row(children: [
                                      Icon(Icons.check_circle, color: Colors.white, size: 18),
                                      SizedBox(width: 8),
                                      Text('Profile updated successfully'),
                                    ]),
                                    backgroundColor: AppColors.primary,
                                    behavior: SnackBarBehavior.floating,
                                  ));
                                }
                              } catch (e) {
                                setSheet(() => loading = false);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text('Failed to update: $e'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                  ));
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                      child: loading
                          ? const SizedBox(height: 20, width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Save Changes',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showLanguageSheet(BuildContext context) {
    final languages = [
      {'code': 'en', 'label': 'English',     'native': 'English'},
      {'code': 'rw', 'label': 'Kinyarwanda', 'native': 'Ikinyarwanda'},
      {'code': 'fr', 'label': 'French',      'native': 'Français'},
    ];
    String selected = 'en';
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select Language', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('Choose your preferred app language', style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 20),
              for (final lang in languages)
                GestureDetector(
                  onTap: () => setModalState(() => selected = lang['code']!),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: selected == lang['code'] ? AppColors.primary : Colors.grey.shade300,
                        width: selected == lang['code'] ? 2 : 1,
                      ),
                      color: selected == lang['code'] ? AppColors.primaryLight : null,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.language_rounded, color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(lang['label']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              Text(lang['native']!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        ),
                        if (selected == lang['code'])
                          const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    final sel = languages.firstWhere((l) => l['code'] == selected);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Language set to ${sel['label'] ?? ''}'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                  child: const Text('Apply', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static void _showLegalModal(BuildContext context, TermsTab tab) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.92,
          child: TermsPrivacyScreen(initialTab: tab),
        ),
      ),
    );
  }
}

// ─── RDB Certificate Section ──────────────────────────────────────────────────
class _RecyclerRdbSection extends StatefulWidget {
  final VoidCallback? onUpload;
  const _RecyclerRdbSection({this.onUpload});

  @override
  State<_RecyclerRdbSection> createState() => _RecyclerRdbSectionState();
}

class _RecyclerRdbSectionState extends State<_RecyclerRdbSection> {
  List<dynamic> _docs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final docs = await ApiService.getMyDocuments();
      if (mounted) {
        setState(() {
          _docs = docs.where((d) => d['doc_type'] == 'rdb_certificate').toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _statusColor(String status) {
    if (status == 'approved') return const Color(0xFF10B981);
    if (status == 'rejected') return const Color(0xFFEF4444);
    return const Color(0xFFF59E0B);
  }

  IconData _statusIcon(String status) {
    if (status == 'approved') return Icons.check_circle_outline;
    if (status == 'rejected') return Icons.cancel_outlined;
    return Icons.hourglass_empty_outlined;
  }

  String _statusLabel(String status) {
    if (status == 'approved') return 'Approved';
    if (status == 'rejected') return 'Rejected';
    return 'Pending Review';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Text('RDB Certificate',
                    style: TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 15, color: context.cText)),
                const Spacer(),
                TextButton.icon(
                  onPressed: () async {
                    widget.onUpload?.call();
                    await Future.delayed(const Duration(milliseconds: 800));
                    _load();
                  },
                  icon: const Icon(Icons.upload_outlined, size: 16),
                  label: const Text('Upload'),
                  style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: context.cBorder),
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: SizedBox(width: 20, height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2))),
            )
          else if (_docs.isEmpty)
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(Icons.upload_file_outlined, size: 36, color: context.cTextSec),
                  const SizedBox(height: 8),
                  Text('No certificate uploaded yet.',
                      style: TextStyle(color: context.cTextSec, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text('Upload your RDB registration certificate for verification.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: context.cTextSec, fontSize: 11)),
                ],
              ),
            )
          else
            for (final doc in _docs) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.insert_drive_file_outlined,
                          color: AppColors.primary, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(doc['file_name'] as String? ?? 'RDB Certificate',
                              style: TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.w600, color: context.cText),
                              maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 2),
                          Row(children: [
                            Icon(_statusIcon(doc['status'] as String? ?? 'pending'),
                                size: 12, color: _statusColor(doc['status'] as String? ?? 'pending')),
                            const SizedBox(width: 4),
                            Text(_statusLabel(doc['status'] as String? ?? 'pending'),
                                style: TextStyle(
                                    fontSize: 11,
                                    color: _statusColor(doc['status'] as String? ?? 'pending'),
                                    fontWeight: FontWeight.w600)),
                          ]),
                        ],
                      ),
                    ),
                    if ((doc['file_url'] as String?) != null)
                      IconButton(
                        icon: const Icon(Icons.open_in_new_outlined, size: 18),
                        color: AppColors.primary,
                        tooltip: 'View',
                        onPressed: () async {
                          final url = doc['file_url'] as String;
                          final fullUrl = url.startsWith('http')
                              ? url
                              : '${ApiService.baseUrl.replaceAll('/api', '')}$url';
                          final uri = Uri.tryParse(fullUrl);
                          if (uri != null) await launchUrl(uri, mode: LaunchMode.externalApplication);
                        },
                      ),
                  ],
                ),
              ),
              if (doc != _docs.last) Divider(height: 1, indent: 64, color: context.cBorder),
            ],
          if (_docs.any((d) => d['status'] == 'rejected'))
            Container(
              margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(8)),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 14, color: Color(0xFFDC2626)),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Certificate rejected. Please upload a new valid document.',
                      style: TextStyle(fontSize: 11, color: Color(0xFFDC2626)),
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

class _RecyclerRdbUploadSheet extends StatefulWidget {
  final VoidCallback? onUploaded;
  const _RecyclerRdbUploadSheet({this.onUploaded});

  @override
  State<_RecyclerRdbUploadSheet> createState() => _RecyclerRdbUploadSheetState();
}

class _RecyclerRdbUploadSheetState extends State<_RecyclerRdbUploadSheet> {
  bool _uploading = false;
  String? _error;

  Future<void> _pickAndUpload() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.bytes == null) return;

    setState(() { _uploading = true; _error = null; });
    try {
      await ApiService.uploadDocumentFile(
        bytes: file.bytes!,
        filename: file.name,
        docType: 'rdb_certificate',
      );
      widget.onUploaded?.call();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Text('Upload RDB Certificate',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const Spacer(),
            IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
          ]),
          const SizedBox(height: 8),
          const Text(
            'Upload your Rwanda Development Board business registration certificate. Accepted: PDF, JPEG, PNG (max 10 MB). An admin will review and approve it.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 24),
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(8)),
              child: Row(children: [
                const Icon(Icons.error_outline, size: 14, color: Color(0xFFDC2626)),
                const SizedBox(width: 6),
                Expanded(child: Text(_error!,
                    style: const TextStyle(fontSize: 12, color: Color(0xFFDC2626)))),
              ]),
            ),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _uploading ? null : _pickAndUpload,
              icon: _uploading
                  ? const SizedBox(width: 18, height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.upload_outlined),
              label: Text(_uploading ? 'Uploading…' : 'Choose File & Upload'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
                textStyle: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RecyclerProfileSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _RecyclerProfileSection({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(title,
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: context.cText)),
            ),
          ),
          Divider(height: 1, color: context.cBorder),
          ...children,
        ],
      ),
    );
  }
}

class _RecyclerProfileRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _RecyclerProfileRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: context.cTextSec, size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 11, color: context.cTextTer)),
                const SizedBox(height: 2),
                Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: context.cText)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RecyclerSettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  const _RecyclerSettingRow({required this.icon, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, color: context.cTextSec, size: 20),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: context.cText)),
            ),
            Icon(Icons.chevron_right, color: context.cTextTer),
          ],
        ),
      ),
    );
  }
}
