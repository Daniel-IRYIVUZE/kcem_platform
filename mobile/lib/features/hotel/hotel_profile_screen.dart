import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/router/app_router.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/terms_privacy_screen.dart';

class HotelProfileScreen extends ConsumerWidget {
  const HotelProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    return Scaffold(
      backgroundColor: context.cBg,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile header
            Container(
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
                        color: Colors.white.withAlpha(50),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withAlpha(120), width: 2),
                      ),
                      child: const Center(
                        child: Icon(Icons.business, size: 38, color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      user?.displayName ?? 'Hotel',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                      ),
                    ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Kigali City',
                          style: TextStyle(
                            color: Colors.white.withAlpha(200),
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(width: 4),
                      ],
                    ),
                    const SizedBox(height: 16),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, color: Colors.white),
                      onPressed: () => _showEditProfileSheet(context),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Green Score
            GreenScoreCard(
              score: (user?.greenScore ?? 0).toDouble(),
              level: _scoreLevel(user?.greenScore ?? 0),
            ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),
            const SizedBox(height: 20),
            // Business Details
            _ProfileSection(
              title: 'Business Details',
              children: [
                _ProfileRow(icon: Icons.business_outlined, label: 'Business Name', value: user?.displayName ?? 'N/A'),
                _ProfileRow(icon: Icons.numbers_outlined, label: 'TIN Number', value: '119874652'),
                _ProfileRow(icon: Icons.location_on_outlined, label: 'Location', value: 'KN 5 Rd, Kigali'),
                _ProfileRow(icon: Icons.phone_outlined, label: 'Phone', value: user?.phone ?? 'N/A'),
                _ProfileRow(icon: Icons.email_outlined, label: 'Email', value: user?.email ?? 'N/A'),
              ],
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 80.ms).fadeIn(),
            const SizedBox(height: 16),
            // QR Code Identity Card
            _QrCodeSection(
              userId: user?.id ?? 'user-001',
              displayName: user?.displayName ?? 'Hotel',
              role: 'Business',
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 120.ms).fadeIn(),
            const SizedBox(height: 16),
            // Payment Methods
            _ProfileSection(
              title: 'Payment Methods',
              trailing: TextButton(
                onPressed: () => _showAddPaymentSheet(context),
                child: const Text('Add'),
              ),
              children: const [
                    _PaymentMethodCard(
                      icon: Icons.phone_android_rounded,
                      name: 'MTN Mobile Money',
                      detail: '+250 780 162 164',
                      isDefault: true,
                    ),
                    _PaymentMethodCard(
                      icon: Icons.account_balance_rounded,
                      name: 'Bank of Kigali',
                      detail: '**** **** 8873',
                      isDefault: false,
                    ),
              ],
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 160.ms).fadeIn(),
            const SizedBox(height: 16),
            // Settings
            _ProfileSection(
              title: 'Settings',
              children: [
                _SettingRow(icon: Icons.notifications_outlined, label: 'Notifications', onTap: () => context.push(AppRoutes.notifications)),
                _SettingRow(
                  icon: Icons.language_outlined,
                  label: 'Language',
                  trailing: const Text('English'),
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
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 240.ms).fadeIn(),
            const SizedBox(height: 16),
            // Support
            _ProfileSection(
              title: 'Support',
              children: [
                _SettingRow(icon: Icons.help_outline, label: 'Help & FAQ', onTap: () => context.push(AppRoutes.support)),
                _SettingRow(icon: Icons.support_agent_outlined, label: 'Contact Support', onTap: () => context.push(AppRoutes.support)),
                _SettingRow(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () => _showLegalModal(context, TermsTab.privacy)),
                _SettingRow(icon: Icons.description_outlined, label: 'Terms of Service', onTap: () => _showLegalModal(context, TermsTab.terms)),
              ],
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 320.ms).fadeIn(),
            const SizedBox(height: 16),
            // Logout
            OutlinedButton.icon(
              onPressed: () {
                ref.read(authProvider.notifier).logout();
                // Router redirect handles navigation to /login
              },
              icon: const Icon(Icons.logout, color: AppColors.error),
              label: const Text('Sign Out', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error),
                minimumSize: const Size(double.infinity, 52),
              ),
            ).animate().fadeIn(duration: 400.ms, delay: 400.ms),
            const SizedBox(height: 32),
          ],
        ),
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
                      content: Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.white, size: 18),
                          SizedBox(width: 8),
                          Text('Password changed successfully'),
                        ],
                      ),
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

  void _showAddPaymentSheet(BuildContext context) {
    String selectedType = 'momo';
    final numCtrl = TextEditingController();
    final nameCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('Add Payment Method', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  const Spacer(),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  for (final t in [
                    {'id': 'momo',   'label': 'MTN MoMo'},
                    {'id': 'airtel', 'label': 'Airtel'},
                    {'id': 'bank',   'label': 'Bank'},
                  ])
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setModalState(() => selectedType = t['id']!),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.only(right: 6),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: selectedType == t['id'] ? AppColors.primary : Colors.grey.shade300,
                              width: selectedType == t['id'] ? 2 : 1,
                            ),
                            color: selectedType == t['id'] ? AppColors.primaryLight : null,
                          ),
                          child: Column(
                            children: [
                              Text(t['icon']!, style: const TextStyle(fontSize: 22)),
                              const SizedBox(height: 4),
                              Text(t['label']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11)),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: numCtrl,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: selectedType == 'bank' ? 'Account Number' : 'Phone Number',
                  prefixIcon: Icon(selectedType == 'bank' ? Icons.credit_card_outlined : Icons.phone_outlined),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Account Holder Name',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (numCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text('Please fill in all fields'),
                        backgroundColor: AppColors.error,
                        behavior: SnackBarBehavior.floating,
                      ));
                      return;
                    }
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                      content: Row(children: [
                        Icon(Icons.check_circle, color: Colors.white, size: 18),
                        SizedBox(width: 8),
                        Text('Payment method added'),
                      ]),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                  child: const Text('Add Payment Method', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
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

  String _scoreLevel(int score) {
    if (score >= 90) return 'Eco Master';
    if (score >= 75) return 'Eco Champion';
    if (score >= 55) return 'Eco Starter';
    return 'Eco Beginner';
  }
}

// ─────────────────────────────────────────────
// QR Code Section
// ─────────────────────────────────────────────
class _QrCodeSection extends StatelessWidget {
  final String userId;
  final String displayName;
  final String role;
  const _QrCodeSection({required this.userId, required this.displayName, required this.role});

  void _showQrDialog(BuildContext context) {
    final qrData = 'https://ecotrade.rw/profile/$userId';
    showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('My QR Code',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(displayName,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                ),
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 200,
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Text(qrData, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Close'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('QR code shared!'), behavior: SnackBarBehavior.floating),
                      );
                    },
                    icon: const Icon(Icons.share_outlined, size: 16),
                    label: const Text('Share'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final qrData = 'https://ecotrade.rw/profile/$userId';
    return Container(
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.qr_code_2, size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Text('My QR Code',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: context.cText,
                  )),
              const Spacer(),
              TextButton(
                onPressed: () => _showQrDialog(context),
                child: const Text('Expand'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: context.cBorder),
                ),
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 80,
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(displayName,
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: context.cText,
                          fontSize: 14,
                        )),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(role,
                          style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 8),
                    Text('Scan to view business profile',
                        style: TextStyle(
                            fontSize: 12, color: context.cTextSec)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _QrButton(
                          icon: Icons.share_outlined,
                          label: 'Share',
                          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('QR code shared!'), behavior: SnackBarBehavior.floating),
                          ),
                        ),
                        const SizedBox(width: 8),
                        _QrButton(
                          icon: Icons.download_outlined,
                          label: 'Save',
                          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('QR code saved!'), behavior: SnackBarBehavior.floating),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QrButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QrButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          border: Border.all(color: context.cBorder),
          borderRadius: BorderRadius.circular(8),
          color: context.cSurfAlt,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: context.cTextSec),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 12, color: context.cTextSec)),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Profile Section
// ─────────────────────────────────────────────
class _ProfileSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final Widget? trailing;

  const _ProfileSection({
    required this.title,
    required this.children,
    this.trailing,
  });

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
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: context.cText,
                  ),
                ),
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

class _PaymentMethodCard extends StatelessWidget {
  final IconData icon;
  final String name;
  final String detail;
  final bool isDefault;

  const _PaymentMethodCard({
    required this.icon,
    required this.name,
    required this.detail,
    required this.isDefault,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Icon(icon, color: AppColors.primary, size: 20)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    if (isDefault) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'Default',
                          style: TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(detail, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, size: 18, color: AppColors.textSecondary),
            onPressed: () => showModalBottomSheet(
              context: context,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              builder: (ctx) => SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 8),
                    Container(
                      width: 36, height: 4,
                      decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                    ),
                    const SizedBox(height: 4),
                    if (!isDefault)
                      ListTile(
                        leading: const Icon(Icons.star_outline, color: AppColors.accent),
                        title: const Text('Set as Default'),
                        onTap: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                            content: Text('Default payment method updated'),
                            backgroundColor: AppColors.primary,
                            behavior: SnackBarBehavior.floating,
                          ));
                        },
                      ),
                    ListTile(
                      leading: const Icon(Icons.delete_outline, color: AppColors.error),
                      title: const Text('Remove Payment Method', style: TextStyle(color: AppColors.error)),
                      onTap: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                          content: Text('Payment method removed'),
                          backgroundColor: AppColors.error,
                          behavior: SnackBarBehavior.floating,
                        ));
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
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
