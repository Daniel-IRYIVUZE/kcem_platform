import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/app_providers.dart';
import '../shared/terms_privacy_screen.dart';
import '../shared/widgets/shared_cards.dart';

class DriverProfileScreen extends ConsumerStatefulWidget {
  const DriverProfileScreen({super.key});

  @override
  ConsumerState<DriverProfileScreen> createState() => _DriverProfileScreenState();
}

class _DriverProfileScreenState extends ConsumerState<DriverProfileScreen> {
  String? _liveAddress;
  bool _locationLoading = false;
  String? _locationError;

  @override
  void initState() {
    super.initState();
    _fetchLiveLocation();
  }

  Future<void> _fetchLiveLocation() async {
    if (!mounted) return;
    setState(() { _locationLoading = true; _locationError = null; });
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) setState(() { _locationError = 'Location services disabled'; _locationLoading = false; });
        return;
      }
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever || permission == LocationPermission.denied) {
        if (mounted) setState(() { _locationError = 'Location permission denied'; _locationLoading = false; });
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );
      // Push GPS to backend so recycler can track driver
      ApiService.updateDriverLocation(pos.latitude, pos.longitude).catchError((_) => <String, dynamic>{});
      // Reverse geocode via Nominatim (free, no API key)
      final address = await _reverseGeocode(pos.latitude, pos.longitude);
      if (mounted) setState(() { _liveAddress = address; _locationLoading = false; });
    } catch (e) {
      if (mounted) setState(() { _locationError = 'Could not get location'; _locationLoading = false; });
    }
  }

  Future<String> _reverseGeocode(double lat, double lng) async {
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=json',
      );
      final response = await http.get(uri, headers: {'User-Agent': 'EcoTradeRwanda/1.0'})
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final address = data['address'] as Map<String, dynamic>? ?? {};
        final parts = <String>[
          if (address['road'] != null) address['road'] as String,
          if (address['suburb'] != null) address['suburb'] as String,
          if (address['city'] != null) address['city'] as String
          else if (address['town'] != null) address['town'] as String
          else if (address['village'] != null) address['village'] as String,
        ];
        if (parts.isNotEmpty) return parts.join(', ');
        return data['display_name'] as String? ?? '${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}';
      }
    } catch (_) {}
    return '${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}';
  }

  String _scoreLevel(int score) {
    if (score >= 80) return 'Eco Master';
    if (score >= 60) return 'Eco Champion';
    if (score >= 40) return 'Eco Starter';
    return 'Eco Beginner';
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final driverAsync = ref.watch(driverProfileProvider);
    final stats = ref.watch(driverStatsProvider);
    final initials = (user?.displayName ?? 'D')
        .trim()
        .split(' ')
        .take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '')
        .join();

    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          // ── Full-bleed gradient header ──────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D47A1), Color(0xFF1976D2), Color(0xFF26C6DA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                  child: Column(
                    children: [
                      // Top row — edit button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'My Profile',
                            style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
                          ),
                          Material(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () => _showEditProfileSheet(context),
                              child: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                                child: Row(mainAxisSize: MainAxisSize.min, children: [
                                  Icon(Icons.edit_outlined, color: Colors.white, size: 15),
                                  SizedBox(width: 6),
                                  Text('Edit', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                                ]),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Avatar
                      Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF4FC3F7), Color(0xFF0288D1)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 12, offset: const Offset(0, 4))],
                        ),
                        child: Center(
                          child: Text(
                            initials,
                            style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: 1),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Name
                      Text(
                        user?.displayName ?? 'Driver',
                        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                      ).animate().fadeIn(duration: 300.ms),
                      const SizedBox(height: 4),
                      // Role badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.drive_eta, color: Colors.white70, size: 13),
                          SizedBox(width: 5),
                          Text('Driver', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                      const SizedBox(height: 6),
                      // Live location pill
                      if (_locationLoading)
                        Row(mainAxisSize: MainAxisSize.min, children: [
                          const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 1.5, color: Colors.white70)),
                          const SizedBox(width: 6),
                          Text('Getting location...', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                        ])
                      else if (_liveAddress != null)
                        Row(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.location_on, color: Colors.white70, size: 13),
                          const SizedBox(width: 4),
                          Flexible(child: Text(_liveAddress!, style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis)),
                        ])
                      else if (_locationError != null)
                        GestureDetector(
                          onTap: _fetchLiveLocation,
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.location_off, color: Colors.orange, size: 13),
                            const SizedBox(width: 4),
                            Text('Tap to get location', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                          ]),
                        ),
                      const SizedBox(height: 24),
                      // Stats strip
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            _HeaderStat(label: 'Total Trips', value: '${stats["totalCollections"] ?? 0}', icon: Icons.local_shipping_outlined),
                            _StatDivider(),
                            _HeaderStat(label: 'Completed', value: '${stats["completedCollections"] ?? 0}', icon: Icons.check_circle_outline),
                            _StatDivider(),
                            _HeaderStat(
                              label: 'Kg Collected',
                              value: ((stats["totalVolume"] as double?) ?? 0.0).toStringAsFixed(0),
                              icon: Icons.scale_outlined,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 400.ms),
          ),

          // ── Scrollable content ──────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Green Score
                GreenScoreCard(
                  score: (user?.greenScore ?? 0).toDouble(),
                  level: _scoreLevel(user?.greenScore ?? 0),
                ).animate().slideY(begin: 0.15, duration: 300.ms).fadeIn(),
                const SizedBox(height: 16),
                // Driver Details
                driverAsync.when(
                  data: (d) {
                    final plate = d['plate_number'] as String? ?? d['vehicle_plate'] as String? ?? '—';
                    return _ProfileSection(
                      title: 'Driver Details',
                      icon: Icons.badge_outlined,
                      children: [
                        _ProfileRow(icon: Icons.drive_eta, label: 'Driver Name', value: user?.displayName ?? 'N/A'),
                        _ProfileRow(icon: Icons.directions_car_outlined, label: 'Plate Number', value: plate),
                        _LiveLocationRow(
                          address: _liveAddress,
                          isLoading: _locationLoading,
                          error: _locationError,
                          onRefresh: _fetchLiveLocation,
                        ),
                        _ProfileRow(icon: Icons.phone_outlined, label: 'Phone', value: user?.phone ?? 'N/A'),
                        _ProfileRow(icon: Icons.email_outlined, label: 'Email', value: user?.email ?? 'N/A'),
                      ],
                    );
                  },
                  loading: () => const Center(child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(),
                  )),
                  error: (_, __) => _ProfileSection(
                    title: 'Driver Details',
                    icon: Icons.badge_outlined,
                    children: [
                      _ProfileRow(icon: Icons.drive_eta, label: 'Driver Name', value: user?.displayName ?? 'N/A'),
                      _LiveLocationRow(
                        address: _liveAddress,
                        isLoading: _locationLoading,
                        error: _locationError,
                        onRefresh: _fetchLiveLocation,
                      ),
                      _ProfileRow(icon: Icons.phone_outlined, label: 'Phone', value: user?.phone ?? 'N/A'),
                      _ProfileRow(icon: Icons.email_outlined, label: 'Email', value: user?.email ?? 'N/A'),
                    ],
                  ),
                ).animate().slideY(begin: 0.15, duration: 300.ms, delay: 80.ms).fadeIn(),
                const SizedBox(height: 16),
                // Settings
                _ProfileSection(
                  title: 'Settings',
                  icon: Icons.tune_outlined,
                  children: [
                    _SettingRow(icon: Icons.notifications_outlined, label: 'Notifications', onTap: () => context.push(AppRoutes.notifications)),
                    _SettingRow(
                      icon: Icons.language_outlined,
                      label: 'Language',
                      trailing: const Text('English', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      onTap: () => _showLanguageSheet(context),
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
                          title: const Text('Dark Mode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          value: isDark,
                          onChanged: (_) => ref.read(themeProvider.notifier).toggle(),
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                        );
                      },
                    ),
                    _SettingRow(
                      icon: Icons.lock_outline,
                      label: 'Change Password',
                      onTap: () => _showChangePasswordSheet(context),
                    ),
                  ],
                ).animate().slideY(begin: 0.15, duration: 300.ms, delay: 200.ms).fadeIn(),
                const SizedBox(height: 16),
                // Support
                _ProfileSection(
                  title: 'Support',
                  icon: Icons.help_outline,
                  children: [
                    _SettingRow(icon: Icons.help_outline, label: 'Help & FAQ', onTap: () => context.push(AppRoutes.support)),
                    _SettingRow(icon: Icons.support_agent_outlined, label: 'Contact Support', onTap: () => context.push(AppRoutes.support)),
                    _SettingRow(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () => _showLegalModal(context, TermsTab.privacy)),
                    _SettingRow(icon: Icons.description_outlined, label: 'Terms of Service', onTap: () => _showLegalModal(context, TermsTab.terms)),
                  ],
                ).animate().slideY(begin: 0.15, duration: 300.ms, delay: 260.ms).fadeIn(),
                const SizedBox(height: 20),
                // Logout
                OutlinedButton.icon(
                  onPressed: () => ref.read(authProvider.notifier).logout(),
                  icon: const Icon(Icons.logout, color: AppColors.error),
                  label: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    minimumSize: const Size(double.infinity, 52),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ).animate().fadeIn(duration: 400.ms, delay: 320.ms),
                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditProfileSheet(BuildContext context) {
    final user = ref.read(authProvider).user;
    final driverData = ref.read(driverProfileProvider).valueOrNull ?? {};

    final nameCtrl = TextEditingController(text: user?.displayName ?? '');
    final phoneCtrl = TextEditingController(text: user?.phone ?? '');
    final plateCtrl = TextEditingController(
      text: driverData['plate_number'] as String? ?? driverData['vehicle_plate'] as String? ?? '',
    );
    final locationCtrl = TextEditingController(
      text: driverData['location'] as String? ?? driverData['address'] as String? ?? '',
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        bool loading = false;
        return StatefulBuilder(
          builder: (ctx, setSheet) {
          return Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('Edit Profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const Spacer(),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline),
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
                  controller: plateCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Plate Number',
                    prefixIcon: Icon(Icons.directions_car_outlined),
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
                    onPressed: loading
                        ? null
                        : () async {
                            setSheet(() => loading = true);
                            try {
                              final futures = <Future>[];
                              if (nameCtrl.text.trim().isNotEmpty || phoneCtrl.text.trim().isNotEmpty) {
                                futures.add(ApiService.updateProfile({
                                  if (nameCtrl.text.trim().isNotEmpty) 'full_name': nameCtrl.text.trim(),
                                  if (phoneCtrl.text.trim().isNotEmpty) 'phone': phoneCtrl.text.trim(),
                                }));
                              }
                              final driverUpdate = <String, dynamic>{};
                              if (plateCtrl.text.trim().isNotEmpty) driverUpdate['plate_number'] = plateCtrl.text.trim();
                              if (locationCtrl.text.trim().isNotEmpty) driverUpdate['location'] = locationCtrl.text.trim();
                              if (driverUpdate.isNotEmpty) {
                                futures.add(ApiService.updateMyDriver(driverUpdate));
                              }
                              await Future.wait(futures);
                              ref.invalidate(driverProfileProvider);
                              if (ctx.mounted) Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Row(children: [
                                      Icon(Icons.check_circle, color: Colors.white, size: 18),
                                      SizedBox(width: 8),
                                      Text('Profile updated'),
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
                                  SnackBar(
                                    content: Text('Failed to update: $e'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                    child: loading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          );
          },
        );
      },
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
      builder: (ctx) {
        bool loading = false;
        return StatefulBuilder(
          builder: (ctx, setSheet) {
          return Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Change Password', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
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
                                const SnackBar(
                                  content: Text('Passwords do not match'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                ),
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
                                  SnackBar(
                                    content: Text('Failed: $e'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                  ),
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
        );
      },
    );
  }

  void _showLanguageSheet(BuildContext context) {
    final languages = [
      {'code': 'en', 'label': 'English', 'native': 'English'},
      {'code': 'rw', 'label': 'Kinyarwanda', 'native': 'Ikinyarwanda'},
      {'code': 'fr', 'label': 'French', 'native': 'Français'},
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

  void _showLegalModal(BuildContext context, TermsTab tab) {
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

// ─────────────────────────────────────────────
// Header stat widgets
// ─────────────────────────────────────────────
class _HeaderStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _HeaderStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white70, size: 18),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 11)),
        ],
      ),
    );
  }
}

class _StatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(width: 1, height: 36, color: Colors.white.withValues(alpha: 0.2));
}

// ─────────────────────────────────────────────
// Profile Section
// ─────────────────────────────────────────────
class _ProfileSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final IconData? icon;

  const _ProfileSection({
    required this.title,
    required this.children,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            child: Row(
              children: [
                if (icon != null) ...[
                  Container(
                    width: 28, height: 28,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, size: 16, color: AppColors.primary),
                  ),
                  const SizedBox(width: 10),
                ],
                Text(
                  title,
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: context.cText),
                ),
                const Spacer(),
              ],
            ),
          ),
          Divider(height: 1, color: context.cBorder),
          ...children,
        ],
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileRow({
    required this.icon,
    required this.label,
    required this.value,
  });

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

// ─────────────────────────────────────────────
// Live Location Row
// ─────────────────────────────────────────────
class _LiveLocationRow extends StatelessWidget {
  final String? address;
  final bool isLoading;
  final String? error;
  final VoidCallback onRefresh;

  const _LiveLocationRow({
    this.address,
    this.isLoading = false,
    this.error,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(Icons.location_on, color: isLoading ? AppColors.textSecondary : AppColors.primary, size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Live Location', style: TextStyle(fontSize: 11, color: context.cTextTer)),
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('GPS', style: TextStyle(fontSize: 9, color: AppColors.primary, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                if (isLoading)
                  Row(children: [
                    const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 1.5)),
                    const SizedBox(width: 6),
                    Text('Fetching location...', style: TextStyle(fontSize: 13, color: context.cTextSec)),
                  ])
                else if (error != null)
                  Text(error!, style: const TextStyle(fontSize: 13, color: AppColors.error))
                else
                  Text(
                    address ?? '—',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: context.cText),
                  ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 18),
            color: AppColors.primary,
            tooltip: 'Refresh location',
            onPressed: isLoading ? null : onRefresh,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingRow({required this.icon, required this.label, this.trailing, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap ?? () {},
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, color: context.cTextSec, size: 20),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: context.cText)),
            ),
            trailing ?? Icon(Icons.chevron_right, color: context.cTextTer),
          ],
        ),
      ),
    );
  }
}

