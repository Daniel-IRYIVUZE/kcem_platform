import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/models/models.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);
    final unread = notifications.where((n) => !n.read).length;

    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        backgroundColor: context.cBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.cText, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Notifications',
                style: TextStyle(
                    color: context.cText,
                    fontWeight: FontWeight.w700,
                    fontSize: 18)),
            if (unread > 0)
              Text('$unread unread',
                  style: const TextStyle(
                      color: AppColors.primary, fontSize: 12)),
          ],
        ),
        actions: [
          if (unread > 0)
            TextButton(
              onPressed: () =>
                  ref.read(notificationsProvider.notifier).markAllRead(),
              child: const Text('Mark all read',
                  style: TextStyle(color: AppColors.primary, fontSize: 13)),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? _EmptyNotifications()
          : _NotificationList(notifications: notifications, ref: ref),
    );
  }
}

class _EmptyNotifications extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.notifications_none_outlined,
                size: 40, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text('No notifications yet',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: context.cText)),
          const SizedBox(height: 8),
          Text('You\'ll see bids, collections\nand updates here',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: context.cTextSec)),
        ],
      ).animate().fadeIn(duration: 300.ms),
    );
  }
}

class _NotificationList extends StatelessWidget {
  final List<AppNotification> notifications;
  final WidgetRef ref;
  const _NotificationList(
      {required this.notifications, required this.ref});

  @override
  Widget build(BuildContext context) {
    // Group by date
    final today = DateTime.now();
    final todayNotifs = notifications
        .where((n) => _isSameDay(n.time, today))
        .toList();
    final olderNotifs = notifications
        .where((n) => !_isSameDay(n.time, today))
        .toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        if (todayNotifs.isNotEmpty) ...[
          _SectionLabel(label: 'Today'),
          ...todayNotifs.asMap().entries.map((e) => _NotifTile(
                notification: e.value,
                delay: e.key * 40,
                onTap: () => ref
                    .read(notificationsProvider.notifier)
                    .markRead(e.value.id),
              )),
        ],
        if (olderNotifs.isNotEmpty) ...[
          _SectionLabel(label: 'Earlier'),
          ...olderNotifs.asMap().entries.map((e) => _NotifTile(
                notification: e.value,
                delay: todayNotifs.length * 40 + e.key * 40,
                onTap: () => ref
                    .read(notificationsProvider.notifier)
                    .markRead(e.value.id),
              )),
        ],
      ],
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(label,
          style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: context.cTextTer,
              letterSpacing: 1.2)),
    );
  }
}

class _NotifTile extends StatelessWidget {
  final AppNotification notification;
  final int delay;
  final VoidCallback onTap;
  const _NotifTile(
      {required this.notification, required this.delay, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isUnread = !notification.read;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUnread
              ? AppColors.primary.withOpacity(0.05)
              : context.cSurf,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: isUnread
                  ? AppColors.primary.withOpacity(0.2)
                  : context.cBorder),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _NotifIcon(type: notification.type),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(
                      child: Text(notification.title,
                          style: TextStyle(
                              fontWeight: isUnread
                                  ? FontWeight.w700
                                  : FontWeight.w600,
                              fontSize: 13,
                              color: context.cText)),
                    ),
                    if (isUnread)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle),
                      ),
                  ]),
                  const SizedBox(height: 4),
                  Text(notification.message,
                      style: TextStyle(
                          fontSize: 12,
                          color: context.cTextSec,
                          height: 1.5)),
                  const SizedBox(height: 6),
                  Text(_formatTime(notification.time),
                      style: TextStyle(
                          fontSize: 11, color: context.cTextTer)),
                ],
              ),
            ),
          ],
        ),
      )
          .animate(delay: Duration(milliseconds: delay))
          .fadeIn(duration: 250.ms)
          .slideY(begin: 0.1, duration: 250.ms),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

class _NotifIcon extends StatelessWidget {
  final NotificationType type;
  const _NotifIcon({required this.type});

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _iconColor();
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: color, size: 20),
    );
  }

  (IconData, Color) _iconColor() {
    switch (type) {
      case NotificationType.bid:
        return (Icons.gavel_outlined, AppColors.hotelColor);
      case NotificationType.collection:
        return (Icons.local_shipping_outlined, AppColors.driverColor);
      case NotificationType.payment:
        return (Icons.payments_outlined, AppColors.success);
      case NotificationType.system:
        return (Icons.info_outline, AppColors.primary);
      default:
        return (Icons.notifications_outlined, AppColors.primary);
    }
  }
}
