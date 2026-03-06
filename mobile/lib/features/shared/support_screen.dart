import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import 'widgets/eco_dialogs.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

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
        title: Text('Help & Support',
            style: TextStyle(
                color: context.cText,
                fontWeight: FontWeight.w700,
                fontSize: 18)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Hero banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, Color(0xFF059669)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('How can we help?',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 18)),
                      const SizedBox(height: 6),
                      Text('Our team is available\nMon–Fri, 8am–6pm EAT',
                          style: TextStyle(
                              color: Colors.white.withOpacity(0.85),
                              fontSize: 13,
                              height: 1.5)),
                    ],
                  ),
                ),
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.support_agent,
                      color: Colors.white, size: 28),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 300.ms),

          const SizedBox(height: 24),

          // Contact channels
          _SectionHeader(label: 'Contact Us'),
          const SizedBox(height: 10),
          _ContactTile(
            icon: Icons.chat_bubble_outline,
            color: AppColors.primary,
            title: 'Live Chat',
            subtitle: 'Chat with a support agent now',
            badge: 'Online',
            onTap: () => _showLiveChatDialog(context),
          ).animate(delay: 50.ms).fadeIn().slideY(begin: 0.1),
          _ContactTile(
            icon: Icons.phone_outlined,
            color: AppColors.success,
            title: 'Call Support',
            subtitle: '+250 780 162 164',
            onTap: () => _launch(context, 'tel:+250780162164'),
          ).animate(delay: 100.ms).fadeIn().slideY(begin: 0.1),
          _ContactTile(
            icon: Icons.email_outlined,
            color: AppColors.info,
            title: 'Email Us',
            subtitle: 'danieliryivuze4@gmail.com',
            onTap: () => _launch(context, 'mailto:danieliryivuze4@gmail.com'),
          ).animate(delay: 150.ms).fadeIn().slideY(begin: 0.1),
          _ContactTile(
            icon: Icons.message_outlined,
            color: const Color(0xFF25D366),
            title: 'WhatsApp',
            subtitle: 'Message us on WhatsApp',
            onTap: () =>
                _launch(context, 'https://wa.me/250780162164'),
          ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.1),

          const SizedBox(height: 24),

          // Quick actions
          _SectionHeader(label: 'Quick Actions'),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.bug_report_outlined,
                  label: 'Report a Bug',
                  color: AppColors.error,
                  onTap: () => _showReportBugDialog(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.lightbulb_outline,
                  label: 'Suggest Feature',
                  color: AppColors.accent,
                  onTap: () => _showFeatureRequestDialog(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.star_outline,
                  label: 'Rate App',
                  color: const Color(0xFFF59E0B),
                  onTap: () => _showRatingDialog(context),
                ),
              ),
            ],
          ).animate(delay: 250.ms).fadeIn(),

          const SizedBox(height: 24),

          // FAQ
          _SectionHeader(label: 'Frequently Asked Questions'),
          const SizedBox(height: 10),
          ..._faqs.asMap().entries.map((e) => _FaqTile(
                question: e.value['q']!,
                answer: e.value['a']!,
                delay: 300 + e.key * 50,
              )),

          const SizedBox(height: 24),

          // Resources
          _SectionHeader(label: 'Resources'),
          const SizedBox(height: 10),
          _ResourceTile(
            icon: Icons.menu_book_outlined,
            title: 'User Guide',
            subtitle: 'Complete platform documentation',
            onTap: () =>
                _launch(context, 'https://docs.ecotrade.rw'),
          ).animate(delay: 550.ms).fadeIn(),
          _ResourceTile(
            icon: Icons.play_circle_outline,
            title: 'Video Tutorials',
            subtitle: 'Step-by-step how-to videos',
            onTap: () =>
                _launch(context, 'https://youtube.com/@ecotrade'),
          ).animate(delay: 600.ms).fadeIn(),
          _ResourceTile(
            icon: Icons.announcement_outlined,
            title: 'System Status',
            subtitle: 'Check platform uptime & incidents',
            trailing: _StatusBadge(status: 'Operational'),
            onTap: () =>
                _launch(context, 'https://status.ecotrade.rw'),
          ).animate(delay: 650.ms).fadeIn(),

          const SizedBox(height: 24),

          // App info
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: context.cSurf,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: context.cBorder),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('App Version',
                        style: TextStyle(
                            fontSize: 13, color: context.cTextSec)),
                    Text('1.0.0 (Build 42)',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: context.cText)),
                  ],
                ),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Device ID',
                        style: TextStyle(
                            fontSize: 13, color: context.cTextSec)),
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(
                            const ClipboardData(text: 'ECO-DEVICE-001'));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Device ID copied'),
                              duration: Duration(seconds: 2)),
                        );
                      },
                      child: Row(
                        children: [
                          Text('ECO-DEVICE-001',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: context.cText)),
                          const SizedBox(width: 6),
                          Icon(Icons.copy_outlined,
                              size: 14, color: context.cTextTer),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ).animate(delay: 700.ms).fadeIn(),

          const SizedBox(height: 30),
        ],
      ),
    );
  }

  // ── Dialogs ───────────────────────────────────────────────────────────────

  void _showLiveChatDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _LiveChatSheet(),
    );
  }

  void _showReportBugDialog(BuildContext context) {
    final ctrl = TextEditingController();
    EcoDialogs.showInputDialog(
      context: context,
      title: 'Report a Bug',
      icon: Icons.bug_report_outlined,
      iconColor: AppColors.error,
      hint: 'Describe the issue you encountered...',
      controller: ctrl,
      confirmLabel: 'Submit Report',
      onConfirm: () {
        EcoDialogs.showSuccessSnack(context, 'Bug report submitted. Thank you!');
      },
    );
  }

  void _showFeatureRequestDialog(BuildContext context) {
    final ctrl = TextEditingController();
    EcoDialogs.showInputDialog(
      context: context,
      title: 'Suggest a Feature',
      icon: Icons.lightbulb_outline,
      iconColor: AppColors.accent,
      hint: 'Describe the feature you\'d like to see...',
      controller: ctrl,
      confirmLabel: 'Submit Suggestion',
      onConfirm: () {
        EcoDialogs.showSuccessSnack(context, 'Feature suggestion received!');
      },
    );
  }

  void _showRatingDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => const _RatingDialog(),
    );
  }

  Future<void> _launch(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (context.mounted) {
        EcoDialogs.showErrorSnack(context, 'Could not open link');
      }
    }
  }

  // ── Static data ───────────────────────────────────────────────────────────

  static const _faqs = [
    {
      'q': 'How do I list waste for collection?',
      'a':
          'Go to the "List Waste" tab, select the waste type, enter volume, take photos, and submit. Active bids will appear within hours.'
    },
    {
      'q': 'How are bids calculated?',
      'a':
          'Recyclers place competitive bids based on waste type, quality grade, and volume. Your Green Score may attract better bids.'
    },
    {
      'q': 'When do I receive payment?',
      'a':
          'Payment is processed within 48 hours after the driver marks the collection as complete. Funds arrive via Mobile Money.'
    },
    {
      'q': 'What is the Green Score?',
      'a':
          'Your Green Score reflects your environmental impact and reliability. A higher score improves bid visibility and unlocks premium features.'
    },
    {
      'q': 'Can I use the app offline?',
      'a':
          'Yes! The app caches your route, listings, and collection data. Actions taken offline sync automatically when you reconnect.'
    },
    {
      'q': 'How do I track my driver?',
      'a':
          'Once a collection is confirmed, the live tracking map appears in the Collections screen, showing the driver\'s real-time position.'
    },
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-widgets
// ────────────────────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  const _SectionHeader({required this.label});
  @override
  Widget build(BuildContext context) => Text(label,
      style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: context.cTextTer,
          letterSpacing: 1.1));
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String? badge;
  final VoidCallback onTap;
  const _ContactTile(
      {required this.icon,
      required this.color,
      required this.title,
      required this.subtitle,
      this.badge,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: context.cBorder),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(title,
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: context.cText)),
                      if (badge != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                              color: AppColors.success.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8)),
                          child: Text(badge!,
                              style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.success,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ]
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style:
                          TextStyle(fontSize: 12, color: context.cTextSec)),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: context.cTextTer, size: 20),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickActionCard(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: context.cBorder),
        ),
        child: Column(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                  color: color.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(label,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: context.cText)),
          ],
        ),
      ),
    );
  }
}

class _FaqTile extends StatefulWidget {
  final String question;
  final String answer;
  final int delay;
  const _FaqTile(
      {required this.question,
      required this.answer,
      required this.delay});
  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: _expanded
                ? AppColors.primary.withOpacity(0.3)
                : context.cBorder),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: Text(widget.question,
                        style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            color: _expanded
                                ? AppColors.primary
                                : context.cText)),
                  ),
                  AnimatedRotation(
                    turns: _expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(Icons.expand_more,
                        color: context.cTextSec, size: 20),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox(height: 0),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Text(widget.answer,
                  style: TextStyle(
                      fontSize: 13,
                      color: context.cTextSec,
                      height: 1.6)),
            ),
            crossFadeState: _expanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
        ],
      ),
    )
        .animate(delay: Duration(milliseconds: widget.delay))
        .fadeIn(duration: 250.ms)
        .slideY(begin: 0.08, duration: 250.ms);
  }
}

class _ResourceTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback onTap;
  const _ResourceTile(
      {required this.icon,
      required this.title,
      required this.subtitle,
      this.trailing,
      required this.onTap});

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
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: context.cText)),
                  Text(subtitle,
                      style: TextStyle(
                          fontSize: 12, color: context.cTextSec)),
                ],
              ),
            ),
            trailing ??
                Icon(Icons.open_in_new_outlined,
                    size: 16, color: context.cTextTer),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
          color: AppColors.success.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                  color: AppColors.success, shape: BoxShape.circle)),
          const SizedBox(width: 4),
          Text(status,
              style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.success,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Live chat bottom sheet
// ────────────────────────────────────────────────────────────────────────────
class _LiveChatSheet extends StatefulWidget {
  const _LiveChatSheet();
  @override
  State<_LiveChatSheet> createState() => _LiveChatSheetState();
}

class _LiveChatSheetState extends State<_LiveChatSheet> {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<_ChatMsg> _messages = [
    _ChatMsg(
        text: 'Hi there! 👋 Welcome to Ecotrade Support. How can I help you today?',
        isAgent: true,
        time: DateTime.now().subtract(const Duration(seconds: 5))),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_ChatMsg(text: text, isAgent: false, time: DateTime.now()));
      _ctrl.clear();
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMsg(
            text: 'Thanks for your message! A support agent will respond shortly. '
                'Average response time is under 5 minutes.',
            isAgent: true,
            time: DateTime.now()));
      });
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollCtrl) => Container(
        decoration: BoxDecoration(
          color: context.cBg,
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 8),
            Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: context.cBorder,
                    borderRadius: BorderRadius.circular(2))),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                        gradient: const LinearGradient(
                            colors: [AppColors.primary, Color(0xFF059669)]),
                        shape: BoxShape.circle),
                    child: const Icon(Icons.support_agent,
                        color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Ecotrade Support',
                          style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: context.cText,
                              fontSize: 15)),
                      Row(children: [
                        Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                                color: AppColors.success,
                                shape: BoxShape.circle)),
                        const SizedBox(width: 4),
                        const Text('Online',
                            style: TextStyle(
                                color: AppColors.success, fontSize: 12)),
                      ]),
                    ],
                  ),
                  const Spacer(),
                  IconButton(
                    icon: Icon(Icons.close, color: context.cTextSec),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                controller: _scrollCtrl,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (_, i) =>
                    _ChatBubble(msg: _messages[i]),
              ),
            ),
            SafeArea(
              child: Container(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                decoration: BoxDecoration(
                  color: context.cSurf,
                  border: Border(top: BorderSide(color: context.cBorder)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _ctrl,
                        style: TextStyle(color: context.cText),
                        decoration: InputDecoration(
                          hintText: 'Type your message...',
                          hintStyle: TextStyle(color: context.cTextTer),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: context.cBg,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                        ),
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _send,
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle),
                        child: const Icon(Icons.send_rounded,
                            color: Colors.white, size: 20),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatMsg {
  final String text;
  final bool isAgent;
  final DateTime time;
  _ChatMsg({required this.text, required this.isAgent, required this.time});
}

class _ChatBubble extends StatelessWidget {
  final _ChatMsg msg;
  const _ChatBubble({required this.msg});
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment:
          msg.isAgent ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: msg.isAgent
              ? context.cSurf
              : AppColors.primary,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: msg.isAgent
                ? Radius.zero
                : const Radius.circular(16),
            bottomRight: msg.isAgent
                ? const Radius.circular(16)
                : Radius.zero,
          ),
          border: msg.isAgent
              ? Border.all(color: context.cBorder)
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(msg.text,
                style: TextStyle(
                    color: msg.isAgent ? context.cText : Colors.white,
                    fontSize: 13,
                    height: 1.5)),
            const SizedBox(height: 4),
            Text(
              '${msg.time.hour.toString().padLeft(2, '0')}:${msg.time.minute.toString().padLeft(2, '0')}',
              style: TextStyle(
                  fontSize: 10,
                  color: msg.isAgent
                      ? context.cTextTer
                      : Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Rating dialog
// ────────────────────────────────────────────────────────────────────────────
class _RatingDialog extends StatefulWidget {
  const _RatingDialog();
  @override
  State<_RatingDialog> createState() => _RatingDialogState();
}

class _RatingDialogState extends State<_RatingDialog> {
  int _stars = 0;
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: context.cSurf,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.star_rate_outlined,
                color: Color(0xFFF59E0B), size: 40),
            const SizedBox(height: 12),
            Text('Rate Ecotrade',
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                    color: context.cText)),
            const SizedBox(height: 6),
            Text('Your feedback helps us improve',
                style: TextStyle(
                    fontSize: 13, color: context.cTextSec)),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                5,
                (i) => GestureDetector(
                  onTap: () => setState(() => _stars = i + 1),
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(
                      i < _stars ? Icons.star : Icons.star_outline,
                      color: const Color(0xFFF59E0B),
                      size: 36,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _ctrl,
              maxLines: 3,
              style: TextStyle(color: context.cText),
              decoration: InputDecoration(
                hintText: 'Any comments? (optional)',
                hintStyle:
                    TextStyle(color: context.cTextTer, fontSize: 13),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: context.cBorder)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: context.cBorder)),
                filled: true,
                fillColor: context.cBg,
              ),
            ),
            const SizedBox(height: 20),
            Row(children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _stars == 0
                      ? null
                      : () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'Thanks for your rating! ⭐'),
                                duration: Duration(seconds: 3)),
                          );
                        },
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white),
                  child: const Text('Submit'),
                ),
              ),
            ]),
          ],
        ),
      ),
    );
  }
}
