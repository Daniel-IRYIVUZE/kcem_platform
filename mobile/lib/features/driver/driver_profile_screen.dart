import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/app_providers.dart';

class DriverProfileScreen extends ConsumerWidget {
  const DriverProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final stats = ref.watch(driverStatsProvider);
    final name = user?.name ?? 'Driver';
    final rating = user?.rating ?? 4.9;
    final phone = user?.phone ?? '+250 788 000 000';
    final email = user?.email ?? '';
    final vehicle = user?.vehicleType ?? 'Truck';
    final plate = user?.vehiclePlate ?? 'N/A';
    final totalJobs = stats['totalCollections'] ?? 0;
    final earnings = stats['totalEarnings'] ?? 0;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Expanded header
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 24),
                      Stack(
                        children: [
                          Container(
                            width: 88,
                            height: 88,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                            ),
                            child: const Icon(Icons.person, color: Colors.white, size: 46),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 26,
                              height: 26,
                              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                              child: const Icon(Icons.camera_alt, color: AppColors.primary, size: 14),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 12),
                      Text(name, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
                      SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white24,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.star, color: Colors.amber, size: 14),
                                SizedBox(width: 4),
                                Text(rating.toStringAsFixed(1), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                                Text('  ·  Driver', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              title: const Text('My Profile', style: TextStyle(color: Colors.white)),
              titlePadding: const EdgeInsets.only(left: 72, bottom: 16),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Stats
                  Row(
                    children: [
                      Expanded(child: _StatCard(value: '$totalJobs', label: 'Total Jobs')),
                      const SizedBox(width: 10),
                      Expanded(child: _StatCard(value: 'RWF ${_fmtK(earnings)}', label: 'Lifetime Earn')),
                    ],
                  ).animate().fadeIn(delay: 100.ms),

                  const SizedBox(height: 20),

                  // Driver QR Identity Card
                  _DriverQrSection(
                    userId: user?.id ?? 'driver-001',
                    displayName: name,
                  ).animate().fadeIn(delay: 130.ms),

                  const SizedBox(height: 20),

                  // Personal Info
                  _Section(
                    title: 'Personal Information',
                    children: [
                      _InfoRow(label: 'Full Name', value: name, icon: Icons.person_outline),
                      _InfoRow(label: 'Phone', value: phone, icon: Icons.phone_outlined),
                      _InfoRow(label: 'Email', value: email, icon: Icons.email_outlined),
                      _InfoRow(label: 'National ID', value: '119900012345678 ****', icon: Icons.credit_card_outlined),
                    ],
                  ).animate().fadeIn(delay: 150.ms),

                  const SizedBox(height: 14),

                  // Vehicle
                  _Section(
                    title: 'Vehicle Details',
                    children: [
                      _InfoRow(label: 'Type', value: vehicle, icon: Icons.local_shipping_outlined),
                      _InfoRow(label: 'Plate Number', value: plate, icon: Icons.pin),
                      _InfoRow(label: 'Make & Model', value: '$vehicle 2020', icon: Icons.directions_car_outlined),
                      _InfoRow(label: 'Capacity', value: '1.5 tonnes', icon: Icons.inventory_2_outlined),
                    ],
                  ).animate().fadeIn(delay: 200.ms),

                  const SizedBox(height: 14),

                  // Documents
                  _Section(
                    title: 'Documents',
                    children: [
                      _DocumentRow(label: "Driver's License", status: 'verified', expiry: 'Expires: Feb 2027'),
                      _DocumentRow(label: 'National ID', status: 'verified', expiry: 'No expiry'),
                      _DocumentRow(label: 'Vehicle License', status: 'verified', expiry: 'Expires: Oct 2025'),
                      _DocumentRow(label: 'Vehicle Insurance', status: 'expiring', expiry: 'Expires: Aug 2025'),
                    ],
                  ).animate().fadeIn(delay: 250.ms),

                  const SizedBox(height: 14),

                  // Settings
                  _Section(
                    title: 'Settings',
                    children: [
                      _SettingsToggle(label: 'Push Notifications', icon: Icons.notifications_outlined, enabled: true),
                      _SettingsToggle(label: 'Job Nearby Alerts', icon: Icons.pin_drop_outlined, enabled: true),
                      _SettingsToggle(label: 'Earnings Updates', icon: Icons.payments_outlined, enabled: false),
                      Consumer(
                        builder: (context, ref, _) {
                          final isDark = ref.watch(themeProvider) == ThemeMode.dark;
                          return SwitchListTile(
                            secondary: Icon(
                              isDark ? Icons.dark_mode : Icons.light_mode,
                              color: AppColors.primary,
                              size: 20,
                            ),
                            title: const Text('Dark Mode',
                                style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                            value: isDark,
                            onChanged: (v) => ref.read(themeProvider.notifier).setDark(v),
                            activeColor: AppColors.primary,
                            dense: true,
                          );
                        },
                      ),
                      _SettingsItem(label: 'Language', value: 'English', icon: Icons.language),
                      _SettingsItem(label: 'App Version', value: '1.0.0', icon: Icons.info_outline),
                    ],
                  ).animate().fadeIn(delay: 300.ms),

                  const SizedBox(height: 14),

                  // Support
                  _Section(
                    title: 'Support',
                    children: [
                      _SettingsItem(label: 'Help Center',     value: '', icon: Icons.help_outline,         onTap: () => context.push(AppRoutes.support)),
                      _SettingsItem(label: 'Contact Support', value: '', icon: Icons.headset_mic_outlined,  onTap: () => context.push(AppRoutes.support)),
                      _SettingsItem(label: 'Privacy Policy',  value: '', icon: Icons.privacy_tip_outlined,  onTap: () => context.push(AppRoutes.privacy)),
                      _SettingsItem(label: 'Terms of Service',value: '', icon: Icons.description_outlined,  onTap: () => context.push(AppRoutes.terms)),
                    ],
                  ).animate().fadeIn(delay: 350.ms),

                  const SizedBox(height: 20),

                  // Sign out
                  OutlinedButton.icon(
                    onPressed: () => _showSignOut(context, ref),
                    icon: const Icon(Icons.logout, size: 18),
                    label: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                    ),
                  ).animate().fadeIn(delay: 400.ms),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _fmtK(dynamic val) {
    final n = (val ?? 0) is num ? (val as num).toDouble() : 0.0;
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toStringAsFixed(0);
  }

  void _showSignOut(BuildContext context, WidgetRef ref) {
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
}

// ─────────────────────────────────────────────
// Driver QR Section
// ─────────────────────────────────────────────
class _DriverQrSection extends StatelessWidget {
  final String userId;
  final String displayName;
  const _DriverQrSection({required this.userId, required this.displayName});

  void _showQrDialog(BuildContext context) {
    final qrData = 'https://ecotrade.rw/driver/$userId';
    showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Driver QR Code',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(displayName, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
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
    final qrData = 'https://ecotrade.rw/driver/$userId';
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
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.qr_code_2, size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Text('Driver QR Code',
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
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Driver',
                          style: TextStyle(
                              fontSize: 11,
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 8),
                    Text('Scan to verify driver identity',
                        style: TextStyle(fontSize: 12, color: context.cTextSec)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _DrvQrButton(
                          icon: Icons.share_outlined,
                          label: 'Share',
                          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('QR code shared!'), behavior: SnackBarBehavior.floating),
                          ),
                        ),
                        const SizedBox(width: 8),
                        _DrvQrButton(
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

class _DrvQrButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _DrvQrButton({required this.icon, required this.label, required this.onTap});

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
class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _Section({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 2),
            child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textSecondary)),
          ),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _InfoRow({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary, size: 20),
      title: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
      subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.textPrimary)),
      dense: true,
      trailing: IconButton(
        icon: const Icon(Icons.edit, size: 16, color: AppColors.textSecondary),
        onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Edit profile coming soon'), behavior: SnackBarBehavior.floating),
        ),
      ),
    );
  }
}

class _DocumentRow extends StatelessWidget {
  final String label;
  final String status;
  final String expiry;
  const _DocumentRow({required this.label, required this.status, required this.expiry});

  @override
  Widget build(BuildContext context) {
    final isVerified = status == 'verified';
    final isExpiring = status == 'expiring';

    Color statusColor = isVerified ? AppColors.primary : isExpiring ? AppColors.warning : AppColors.error;
    Color bgColor = isVerified ? AppColors.primaryLight : isExpiring ? AppColors.warning.withOpacity(0.1) : AppColors.error.withOpacity(0.1);
    String statusText = isVerified ? 'Verified' : isExpiring ? 'Expiring Soon' : 'Expired';

    return ListTile(
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
        child: Icon(Icons.description, color: statusColor, size: 20),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
      subtitle: Text(expiry, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      dense: true,
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
        child: Text(statusText, style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 10)),
      ),
    );
  }
}

class _SettingsToggle extends StatefulWidget {
  final String label;
  final IconData icon;
  final bool enabled;
  const _SettingsToggle({required this.label, required this.icon, required this.enabled});

  @override
  State<_SettingsToggle> createState() => _SettingsToggleState();
}

class _SettingsToggleState extends State<_SettingsToggle> {
  late bool _enabled;

  @override
  void initState() {
    super.initState();
    _enabled = widget.enabled;
  }

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      secondary: Icon(widget.icon, color: AppColors.primary, size: 20),
      title: Text(widget.label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
      value: _enabled,
      onChanged: (v) => setState(() => _enabled = v),
      activeColor: AppColors.primary,
      dense: true,
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final VoidCallback? onTap;
  const _SettingsItem({required this.label, required this.value, required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary, size: 20),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (value.isNotEmpty)
            Text(value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 18, color: AppColors.textSecondary),
        ],
      ),
      onTap: onTap,
      dense: true,
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  const _StatCard({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 12)],
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary, fontSize: 15)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
        ],
      ),
    );
  }
}
