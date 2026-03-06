import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/models.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;

  Future<void> init() async {
    if (kIsWeb) return; // flutter_local_notifications is not supported on web
    if (_initialized) return;
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _plugin.initialize(settings);
    _initialized = true;
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    NotificationType type = NotificationType.system,
  }) async {
    if (kIsWeb || !_initialized) return;
    final androidDetails = AndroidNotificationDetails(
      _channelId(type),
      _channelName(type),
      channelDescription: _channelDesc(type),
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const iosDetails = DarwinNotificationDetails();
    final details =
        NotificationDetails(android: androidDetails, iOS: iosDetails);
    await _plugin.show(id, title, body, details);
  }

  Future<void> showBidNotification(String recyclerName, double amount) =>
      showNotification(
        id: 1001,
        title: 'New Bid Received',
        body:
            '$recyclerName placed a bid of RWF ${amount.toStringAsFixed(0)} on your listing',
        type: NotificationType.bid,
      );

  Future<void> showCollectionNotification(String businessName, String time) =>
      showNotification(
        id: 1002,
        title: 'Pickup Scheduled',
        body: 'Collection at $businessName confirmed for $time',
        type: NotificationType.collection,
      );

  Future<void> showPaymentNotification(double amount) =>
      showNotification(
        id: 1003,
        title: 'Payment Confirmed',
        body: 'RWF ${amount.toStringAsFixed(0)} has been processed',
        type: NotificationType.payment,
      );

  Future<void> showDriverEnRouteNotification(String driverName) =>
      showNotification(
        id: 1004,
        title: 'Driver En Route',
        body: '$driverName is on the way to collect your waste',
        type: NotificationType.alert,
      );

  String _channelId(NotificationType t) {
    switch (t) {
      case NotificationType.bid:
        return 'ecotrade_bids';
      case NotificationType.collection:
        return 'ecotrade_collections';
      case NotificationType.payment:
        return 'ecotrade_payments';
      default:
        return 'ecotrade_general';
    }
  }

  String _channelName(NotificationType t) {
    switch (t) {
      case NotificationType.bid:
        return 'Bids';
      case NotificationType.collection:
        return 'Collections';
      case NotificationType.payment:
        return 'Payments';
      default:
        return 'General';
    }
  }

  String _channelDesc(NotificationType t) {
    switch (t) {
      case NotificationType.bid:
        return 'Notifications for new bids on your listings';
      case NotificationType.collection:
        return 'Notifications for scheduled collections';
      case NotificationType.payment:
        return 'Notifications for payments';
      default:
        return 'General app notifications';
    }
  }
}
