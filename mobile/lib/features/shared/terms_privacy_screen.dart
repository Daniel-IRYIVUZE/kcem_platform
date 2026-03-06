import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_theme.dart';

enum TermsTab { terms, privacy }

class TermsPrivacyScreen extends StatefulWidget {
  final TermsTab initialTab;
  const TermsPrivacyScreen({super.key, this.initialTab = TermsTab.terms});

  @override
  State<TermsPrivacyScreen> createState() => _TermsPrivacyScreenState();
}

class _TermsPrivacyScreenState extends State<TermsPrivacyScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab.index,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        backgroundColor: context.cBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.cText, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Legal',
          style: TextStyle(
              color: context.cText, fontWeight: FontWeight.w700, fontSize: 18),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: context.cTextSec,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Terms of Service'),
            Tab(text: 'Privacy Policy'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [_TermsContent(), _PrivacyContent()],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Terms of Service content
// ────────────────────────────────────────────────────────────────────────────
class _TermsContent extends StatelessWidget {
  const _TermsContent();
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _LegalSection(
          icon: Icons.verified_outlined,
          title: 'Agreement to Terms',
          body:
              'By accessing and using the Ecotrade platform, you accept and agree to be bound by '
              'these Terms of Service. Ecotrade connects hotels, recyclers, and drivers to '
              'facilitate Rwanda\'s circular economy.\n\nLast updated: March 2026',
        ),
        _LegalSection(
          icon: Icons.people_outline,
          title: 'Eligibility',
          body:
              'You must be at least 18 years old and a registered business entity in Rwanda to '
              'use Ecotrade as a hotel or recycler. Drivers must hold a valid driving license '
              'and vehicle registration documents.',
        ),
        _LegalSection(
          icon: Icons.recycling_outlined,
          title: 'Platform Use',
          body:
              '• Hotels may list verified recyclable waste materials only.\n'
              '• Recyclers must place bids in good faith and fulfil accepted agreements.\n'
              '• Drivers must complete assigned routes and accurately record collections.\n'
              '• All users must maintain accurate profile information.',
        ),
        _LegalSection(
          icon: Icons.payments_outlined,
          title: 'Payments & Fees',
          body:
              'Ecotrade charges a 5% platform fee on completed transactions. Payments are '
              'processed via MTN Mobile Money or Airtel Money. Withdrawal requests are '
              'processed within 2 business days.',
        ),
        _LegalSection(
          icon: Icons.star_outline,
          title: 'Green Score System',
          body:
              'The Green Score is calculated based on verified collections, waste quality, '
              'on-time pickups, and platform engagement. Scores affect visibility and '
              'preferential bid matching. Fraudulent submissions will result in score '
              'penalties and potential account suspension.',
        ),
        _LegalSection(
          icon: Icons.gavel_outlined,
          title: 'Dispute Resolution',
          body:
              'Disputes between parties are handled by the Ecotrade mediation team. Both '
              'parties must submit evidence within 5 business days. Ecotrade\'s decision '
              'is final for platform-related disputes. Legal disputes are governed by '
              'Rwandan law.',
        ),
        _LegalSection(
          icon: Icons.block_outlined,
          title: 'Prohibited Actions',
          body:
              '• Listing hazardous or non-recyclable waste\n'
              '• Creating multiple accounts to manipulate scoring\n'
              '• Bid manipulation or collusion\n'
              '• Sharing login credentials\n'
              '• Using bots or automated tools without written permission',
        ),
        _LegalSection(
          icon: Icons.cancel_outlined,
          title: 'Account Termination',
          body:
              'Ecotrade reserves the right to suspend or terminate accounts that violate '
              'these terms. Users may request account deletion by contacting '
              'danieliryivuze4@gmail.com. Data will be retained for 3 years per regulatory requirements.',
        ),
        const SizedBox(height: 32),
        _ContactBanner(
          text: 'Questions about our Terms?',
          email: 'danieliryivuze4@gmail.com',
        ),
        const SizedBox(height: 20),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Privacy Policy content
// ────────────────────────────────────────────────────────────────────────────
class _PrivacyContent extends StatelessWidget {
  const _PrivacyContent();
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _LegalSection(
          icon: Icons.shield_outlined,
          title: 'Our Commitment',
          body:
              'Ecotrade is committed to protecting your privacy and personal data in '
              'accordance with Rwanda\'s Data Protection Law. This policy explains what '
              'data we collect, how we use it, and your rights.\n\nLast updated: March 2026',
        ),
        _LegalSection(
          icon: Icons.storage_outlined,
          title: 'Data We Collect',
          body:
              '• Identity: Name, email address, phone number, National ID\n'
              '• Business: Company name, TIN, business documents\n'
              '• Location: GPS coordinates during active collection routes\n'
              '• Device: Device ID, OS version, app version\n'
              '• Usage: App activity logs, collection history, bid records',
        ),
        _LegalSection(
          icon: Icons.psychology_outlined,
          title: 'How We Use Your Data',
          body:
              '• Match waste listings with appropriate recyclers\n'
              '• Optimize collection routes using PostGIS algorithms\n'
              '• Calculate Green Scores and platform analytics\n'
              '• Send transaction notifications and alerts\n'
              '• Comply with Rwandan environmental regulations',
        ),
        _LegalSection(
          icon: Icons.share_outlined,
          title: 'Data Sharing',
          body:
              'We share relevant data with transaction counterparties (e.g., hotel name '
              'and location visible to assigned driver). We do not sell your personal '
              'data to third parties. We may share anonymized aggregate data with '
              'Rwanda Environment Management Authority (REMA) for compliance.',
        ),
        _LegalSection(
          icon: Icons.map_outlined,
          title: 'Location Data',
          body:
              'Location data is collected only during active navigation sessions for '
              'drivers. Hotel location is used for route optimization and is shared with '
              'assigned drivers and recyclers only. You can revoke location permissions '
              'in device settings.',
        ),
        _LegalSection(
          icon: Icons.lock_outline,
          title: 'Data Security',
          body:
              'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). '
              'Passwords are hashed with bcrypt. We conduct security audits quarterly. '
              'In case of a data breach, affected users will be notified within 72 hours.',
        ),
        _LegalSection(
          icon: Icons.admin_panel_settings_outlined,
          title: 'Your Rights',
          body:
              '• Access: Request a copy of your data\n'
              '• Correction: Update inaccurate information\n'
              '• Deletion: Request account and data removal\n'
              '• Portability: Export your data in JSON format\n'
              '• Objection: Opt out of marketing communications\n\n'
              'Submit requests to danieliryivuze4@gmail.com',
        ),
        _LegalSection(
          icon: Icons.cookie_outlined,
          title: 'Cookies & Analytics',
          body:
              'The mobile app uses local storage (Hive) for offline caching. We use '
              'anonymized analytics to improve the platform. No third-party advertising '
              'trackers are used.',
        ),
        const SizedBox(height: 32),
        _ContactBanner(
          text: 'Privacy concerns or requests?',
          email: 'danieliryivuze4@gmail.com',
        ),
        const SizedBox(height: 20),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Shared widgets
// ────────────────────────────────────────────────────────────────────────────
class _LegalSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  const _LegalSection(
      {required this.icon, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 18, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(title,
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: context.cText)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(body,
              style: TextStyle(
                  fontSize: 13, color: context.cTextSec, height: 1.65)),
        ],
      ),
    );
  }
}

class _ContactBanner extends StatelessWidget {
  final String text;
  final String email;
  const _ContactBanner({required this.text, required this.email});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.08),
            AppColors.primary.withOpacity(0.04)
          ],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child:
                const Icon(Icons.mail_outline, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(text,
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: context.cText)),
                const SizedBox(height: 2),
                Text(email,
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
