import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
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
class _RecyclerHomeTab extends ConsumerWidget {
  final VoidCallback? onBrowseMarket;
  final VoidCallback? onGoToProfile;
  const _RecyclerHomeTab({this.onBrowseMarket, this.onGoToProfile});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final listings = ref.watch(openListingsProvider);
    final stats = ref.watch(recyclerStatsProvider);
    final dn = user?.displayName ?? 'GR';
    final initials = (dn.length >= 2 ? dn.substring(0, 2) : dn).toUpperCase();
    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: context.cSurf,
            floating: true,
            toolbarHeight: 72,
            automaticallyImplyLeading: false,
            flexibleSpace: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  children: [
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _greeting(),
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            user?.displayName ?? 'GreenRecycle Ltd',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: Icon(Icons.notifications_outlined, color: context.cText),
                      onPressed: () => context.push(AppRoutes.notifications),
                    ),
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
                        radius: 18,
                        backgroundColor: AppColors.primaryLight,
                        child: Text(initials, style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
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

                // Map Preview
                SectionHeader(title: 'Nearby Listings', actionLabel: 'See Map', onAction: onBrowseMarket),
                const SizedBox(height: 12),

                Container(
                  height: 190,
                  decoration: BoxDecoration(
                    color: const Color(0xFFD1FAE5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: const _MapPlaceholder(),
                        ),
                      ),
                      Positioned(
                        bottom: 14,
                        left: 14,
                        right: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))],
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.location_on, color: AppColors.primary, size: 18),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Text(
                                  '12 listings within 5km of Kigali City',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                              ),
                              TextButton(
                                onPressed: onBrowseMarket,
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                ),
                                child: const Text('View All'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 200.ms).fadeIn(),

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
                )),
              ]),
            ),
          ),
        ],
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

class _MapPlaceholder extends StatelessWidget {
  const _MapPlaceholder();

  static const _kigali = LatLng(-1.9441, 30.0619);
  static const _pins = [
    LatLng(-1.9350, 30.0560),
    LatLng(-1.9508, 30.0710),
    LatLng(-1.9620, 30.0520),
  ];

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: const MapOptions(
        initialCenter: _kigali,
        initialZoom: 12.5,
        interactionOptions: InteractionOptions(
          flags: InteractiveFlag.none,
        ),
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.ecotrade.rwanda',
        ),
        MarkerLayer(
          markers: _pins
              .map((pt) => Marker(
                    point: pt,
                    width: 32,
                    height: 32,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.recycling, color: Colors.white, size: 16),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}

class _ActivityCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback? onTap;
  const _ActivityCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    this.onTap,
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
    ).animate().slideY(begin: 0.1, duration: 300.ms).fadeIn();
  }
}

// ─── Recycler Profile Tab ─────────────────────────────────────────────────────
class _RecyclerProfileTab extends ConsumerWidget {
  const _RecyclerProfileTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            automaticallyImplyLeading: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_outlined, color: Colors.white),
                onPressed: () => _showEditProfileSheet(context,
                    name: user?.displayName ?? '',
                    phone: user?.phone ?? '',
                    location: 'Kicukiro, Kigali'),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20),
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 2),
                        ),
                        child: const Center(
                          child: Icon(Icons.recycling, size: 38, color: Colors.white),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        user?.displayName ?? 'GreenRecycle Ltd',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 20,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Recycler • Kigali',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Company Details
                _RecyclerProfileSection(
                  title: 'Company Details',
                  children: [
                    _RecyclerProfileRow(icon: Icons.business_outlined, label: 'Company Name', value: user?.displayName ?? 'N/A'),
                    const _RecyclerProfileRow(icon: Icons.numbers_outlined, label: 'TIN Number', value: '119874300'),
                    const _RecyclerProfileRow(icon: Icons.location_on_outlined, label: 'Location', value: 'Kicukiro, Kigali'),
                    _RecyclerProfileRow(icon: Icons.phone_outlined, label: 'Phone', value: user?.phone ?? 'N/A'),
                    _RecyclerProfileRow(icon: Icons.email_outlined, label: 'Email', value: user?.email ?? 'N/A'),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),

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

                // Logout
                OutlinedButton.icon(
                  onPressed: () => _confirmSignOut(context, ref),
                  icon: const Icon(Icons.logout, color: AppColors.error),
                  label: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
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
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
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
                onPressed: () {
                  if (newCtrl.text != confirmCtrl.text) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Passwords do not match'), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
                    );
                    return;
                  }
                  Navigator.pop(context);
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
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                child: const Text('Update Password', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
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

  void _showEditProfileSheet(BuildContext context, {String name = '', String phone = '', String location = ''}) {
    final nameCtrl = TextEditingController(text: name);
    final phoneCtrl = TextEditingController(text: phone);
    final locationCtrl = TextEditingController(text: location);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Text('Edit Profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
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
                labelText: 'Location',
                prefixIcon: Icon(Icons.location_on_outlined),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Row(children: [
                      Icon(Icons.check_circle, color: Colors.white, size: 18),
                      SizedBox(width: 8),
                      Text('Profile updated successfully'),
                    ]),
                    backgroundColor: AppColors.primary,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
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
