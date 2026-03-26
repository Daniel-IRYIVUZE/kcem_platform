import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/router/app_router.dart';
import '../../core/services/api_service.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/terms_privacy_screen.dart';

class HotelProfileScreen extends ConsumerStatefulWidget {
  const HotelProfileScreen({super.key});

  @override
  ConsumerState<HotelProfileScreen> createState() => _HotelProfileScreenState();
}

class _HotelProfileScreenState extends ConsumerState<HotelProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final hotelProfile = ref.watch(hotelProfileProvider).whenOrNull(data: (d) => d) ?? {};
    final stats = ref.watch(businessStatsProvider);

    final businessName = hotelProfile['hotel_name'] as String?
        ?? hotelProfile['business_name'] as String?
        ?? user?.displayName
        ?? 'Hotel';
    final tin = hotelProfile['tin_number'] as String?
        ?? hotelProfile['tax_id'] as String?
        ?? '—';
    final address = hotelProfile['address'] as String?
        ?? hotelProfile['location'] as String?
        ?? hotelProfile['city'] as String?
        ?? '—';
    final phone = hotelProfile['phone'] as String?
        ?? user?.phone
        ?? '—';
    final email = hotelProfile['email'] as String?
        ?? user?.email
        ?? '—';

    final initials = businessName.trim().split(' ').take(2)
        .map((w) => w.isNotEmpty ? w[0].toUpperCase() : '').join();

    return Scaffold(
      backgroundColor: context.cBg,
      body: CustomScrollView(
        slivers: [
          // ── Full-bleed cyan gradient header ──────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0E7490), Color(0xFF0891B2), Color(0xFF06B6D4)],
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
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 2.5),
                        ),
                        child: Center(
                          child: Text(
                            initials.isNotEmpty ? initials : '🏨',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 28,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        businessName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 22,
                        ),
                        textAlign: TextAlign.center,
                      ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),
                      const SizedBox(height: 4),
                      Text(
                        address == '—' ? 'HORECA Business · Rwanda' : address,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.75),
                          fontSize: 13,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      // Edit button
                      OutlinedButton.icon(
                        onPressed: () => _showEditProfileSheet(
                          context,
                          name: businessName,
                          phone: phone == '—' ? '' : phone,
                          location: address == '—' ? '' : address,
                          tin: tin == '—' ? '' : tin,
                        ),
                        icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 16),
                        label: const Text(
                          'Edit Profile',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Stats strip
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
                            _HeaderStat(
                              label: 'Green Score',
                              value: '${user?.greenScore ?? 0}',
                              icon: Icons.eco_outlined,
                            ),
                            _StatDivider(),
                            _HeaderStat(
                              label: 'Listings',
                              value: '${stats['activeListings'] ?? 0}',
                              icon: Icons.inventory_2_outlined,
                            ),
                            _StatDivider(),
                            _HeaderStat(
                              label: 'Collections',
                              value: '${stats['completedCollections'] ?? 0}',
                              icon: Icons.local_shipping_outlined,
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

          // ── Content ───────────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Business Details
                _ProfileSection(
                  title: 'Business Details',
                  children: [
                    _ProfileRow(icon: Icons.business_outlined, label: 'Business Name', value: businessName),
                    _ProfileRow(icon: Icons.numbers_outlined, label: 'TIN Number', value: tin),
                    _ProfileRow(icon: Icons.location_on_outlined, label: 'Address', value: address),
                    _ProfileRow(icon: Icons.phone_outlined, label: 'Phone', value: phone),
                    _ProfileRow(icon: Icons.email_outlined, label: 'Email', value: email),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),

                const SizedBox(height: 16),

                // Green Score Card
                GreenScoreCard(
                  score: (user?.greenScore ?? 0).toDouble(),
                  level: _scoreLevel(user?.greenScore ?? 0),
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 60.ms).fadeIn(),

                const SizedBox(height: 16),

                // RDB Certificate
                _RdbCertificateSection(
                  onUpload: () => _showRdbCertSheet(context),
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 120.ms).fadeIn(),

                const SizedBox(height: 16),

                // Settings
                _ProfileSection(
                  title: 'Settings',
                  children: [
                    _SettingRow(
                      icon: Icons.notifications_outlined,
                      label: 'Notifications',
                      onTap: () => context.push(AppRoutes.notifications),
                    ),
                    _SettingRow(
                      icon: Icons.language_outlined,
                      label: 'Language',
                      trailing: const Text('English',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      onTap: () => _showLanguageSheet(context),
                    ),
                    Consumer(
                      builder: (context, ref, _) {
                        final isDark = ref.watch(themeProvider) == ThemeMode.dark;
                        return SwitchListTile(
                          secondary: Icon(
                            isDark ? Icons.dark_mode : Icons.light_mode,
                            color: AppColors.textSecondary, size: 20,
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
                    _SettingRow(
                      icon: Icons.lock_outline,
                      label: 'Change Password',
                      onTap: () => _showChangePasswordSheet(context),
                    ),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 140.ms).fadeIn(),

                const SizedBox(height: 16),

                // Support
                _ProfileSection(
                  title: 'Support',
                  children: [
                    _SettingRow(
                      icon: Icons.help_outline,
                      label: 'Help & FAQ',
                      onTap: () => context.push(AppRoutes.support),
                    ),
                    _SettingRow(
                      icon: Icons.support_agent_outlined,
                      label: 'Contact Support',
                      onTap: () => context.push(AppRoutes.support),
                    ),
                    _SettingRow(
                      icon: Icons.privacy_tip_outlined,
                      label: 'Privacy Policy',
                      onTap: () => _showLegalModal(context, TermsTab.privacy),
                    ),
                    _SettingRow(
                      icon: Icons.description_outlined,
                      label: 'Terms of Service',
                      onTap: () => _showLegalModal(context, TermsTab.terms),
                    ),
                  ],
                ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 180.ms).fadeIn(),

                const SizedBox(height: 20),

                // Sign out
                OutlinedButton.icon(
                  onPressed: () => _confirmSignOut(context),
                  icon: const Icon(Icons.logout, color: AppColors.error),
                  label: const Text('Sign Out',
                      style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    minimumSize: const Size(double.infinity, 52),
                  ),
                ).animate().fadeIn(duration: 400.ms, delay: 220.ms),

                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  String _scoreLevel(int score) {
    if (score >= 90) return 'Eco Master';
    if (score >= 75) return 'Eco Champion';
    if (score >= 55) return 'Eco Starter';
    return 'Eco Beginner';
  }

  void _confirmSignOut(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Are you sure you want to sign out of EcoTrade?'),
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
                Row(children: [
                  const Text('Change Password',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const Spacer(),
                  IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx)),
                ]),
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
                  child: StatefulBuilder(
                    builder: (_, setBtn) => ElevatedButton(
                      onPressed: loading
                          ? null
                          : () async {
                              if (newCtrl.text != confirmCtrl.text) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                  content: Text('Passwords do not match'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                ));
                                return;
                              }
                              if (newCtrl.text.length < 6) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                  content: Text('Password must be at least 6 characters'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                ));
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
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                    content: Row(children: [
                                      Icon(Icons.check_circle, color: Colors.white, size: 18),
                                      SizedBox(width: 8),
                                      Text('Password changed successfully'),
                                    ]),
                                    backgroundColor: AppColors.primary,
                                    behavior: SnackBarBehavior.floating,
                                  ));
                                }
                              } catch (e) {
                                setSheet(() => loading = false);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text('Failed: $e'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                  ));
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                      child: loading
                          ? const SizedBox(
                              height: 20, width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Update Password',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
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
                  Row(
                    children: [
                      const Text('Edit Profile',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                      const Spacer(),
                      IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Business Name',
                      prefixIcon: Icon(Icons.business_outlined),
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
                  StatefulBuilder(
                    builder: (_, setBtn) => SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: loading
                            ? null
                            : () async {
                                final newName = nameCtrl.text.trim();
                                if (newName.isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                    content: Text('Business name cannot be empty'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                  ));
                                  return;
                                }
                                setSheet(() => loading = true);
                                try {
                                  await Future.wait([
                                    ApiService.updateMyHotel({
                                      'hotel_name': newName,
                                      if (phoneCtrl.text.trim().isNotEmpty)
                                        'phone': phoneCtrl.text.trim(),
                                      if (locationCtrl.text.trim().isNotEmpty)
                                        'address': locationCtrl.text.trim(),
                                      if (tinCtrl.text.trim().isNotEmpty)
                                        'tin_number': tinCtrl.text.trim(),
                                    }),
                                    ApiService.updateProfile({
                                      'full_name': newName,
                                      if (phoneCtrl.text.trim().isNotEmpty)
                                        'phone': phoneCtrl.text.trim(),
                                    }),
                                  ]);
                                  ref.invalidate(hotelProfileProvider);
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
                        style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 52)),
                        child: loading
                            ? const SizedBox(
                                height: 20, width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Save Changes',
                                style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
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

  void _showRdbCertSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _RdbUploadSheet(
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

  void _showLanguageSheet(BuildContext context) {
    const languages = [
      {'code': 'en', 'label': 'English', 'native': 'English'},
      {'code': 'rw', 'label': 'Kinyarwanda', 'native': 'Ikinyarwanda'},
      {'code': 'fr', 'label': 'French', 'native': 'Français'},
    ];
    String selected = 'en';
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select Language',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('Choose your preferred app language',
                  style: TextStyle(color: AppColors.textSecondary)),
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
                        color: selected == lang['code']
                            ? AppColors.primary
                            : Colors.grey.shade300,
                        width: selected == lang['code'] ? 2 : 1,
                      ),
                      color: selected == lang['code']
                          ? AppColors.primaryLight
                          : null,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.language_rounded,
                              color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(lang['label']!,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600, fontSize: 14)),
                              Text(lang['native']!,
                                  style: const TextStyle(
                                      color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        ),
                        if (selected == lang['code'])
                          const Icon(Icons.check_circle,
                              color: AppColors.primary, size: 20),
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
                    final sel =
                        languages.firstWhere((l) => l['code'] == selected);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Language set to ${sel['label'] ?? ''}'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52)),
                  child: const Text('Apply',
                      style: TextStyle(fontWeight: FontWeight.w700)),
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
class _RdbCertificateSection extends StatefulWidget {
  final VoidCallback? onUpload;
  const _RdbCertificateSection({this.onUpload});

  @override
  State<_RdbCertificateSection> createState() => _RdbCertificateSectionState();
}

class _RdbCertificateSectionState extends State<_RdbCertificateSection> {
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
              child: Center(child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))),
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
                  Text('Upload your RDB business registration certificate for verification.',
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
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
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
                          Row(
                            children: [
                              Icon(_statusIcon(doc['status'] as String? ?? 'pending'),
                                  size: 12,
                                  color: _statusColor(doc['status'] as String? ?? 'pending')),
                              const SizedBox(width: 4),
                              Text(_statusLabel(doc['status'] as String? ?? 'pending'),
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: _statusColor(doc['status'] as String? ?? 'pending'),
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
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
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, size: 14, color: Color(0xFFDC2626)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Certificate rejected. Please upload a new valid document.${_docs.firstWhere((d) => d['status'] == 'rejected', orElse: () => {})['notes'] != null ? '\nReason: ${_docs.firstWhere((d) => d['status'] == 'rejected')['notes']}' : ''}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFFDC2626)),
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

class _RdbUploadSheet extends StatefulWidget {
  final VoidCallback? onUploaded;
  const _RdbUploadSheet({this.onUploaded});

  @override
  State<_RdbUploadSheet> createState() => _RdbUploadSheetState();
}

class _RdbUploadSheetState extends State<_RdbUploadSheet> {
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
            'Upload your Rwanda Development Board business registration certificate. Accepted formats: PDF, JPEG, PNG (max 10 MB). An admin will review and approve it.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 24),
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(children: [
                const Icon(Icons.error_outline, size: 14, color: Color(0xFFDC2626)),
                const SizedBox(width: 6),
                Expanded(child: Text(_error!, style: const TextStyle(fontSize: 12, color: Color(0xFFDC2626)))),
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

// ─── Header stat widget ────────────────────────────────────────────────────────
class _HeaderStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _HeaderStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 18),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.w800, fontSize: 20)),
        const SizedBox(height: 2),
        Text(label,
            style: TextStyle(
                color: Colors.white.withValues(alpha: 0.7), fontSize: 11)),
      ],
    );
  }
}

class _StatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(height: 36, width: 1, color: Colors.white.withValues(alpha: 0.25));
}



// ─── Shared profile section ────────────────────────────────────────────────────
class _ProfileSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final Widget? trailing;
  const _ProfileSection(
      {required this.title, required this.children, this.trailing});

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
                Text(title,
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: context.cText)),
                const Spacer(),
                if (trailing != null) trailing!,
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
  const _ProfileRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: AppColors.primaryDark, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.textSecondary)),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: context.cText)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Widget? trailing;
  const _SettingRow(
      {required this.icon, required this.label, this.onTap, this.trailing});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, color: AppColors.textSecondary, size: 20),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label,
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w500)),
            ),
            if (trailing != null) trailing!,
            if (trailing == null)
              Icon(Icons.chevron_right, color: context.cTextSec, size: 18),
          ],
        ),
      ),
    );
  }
}
