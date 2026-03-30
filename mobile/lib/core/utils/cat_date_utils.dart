/// Central African Time (CAT) = UTC+2
/// All backend datetimes are stored as UTC. This utility converts them to
/// CAT for display, ensuring all visible dates/times are in the correct
/// timezone for Rwanda / East Africa.
class CatDateUtils {
  static const _catOffset = Duration(hours: 2);

  /// Convert any DateTime to CAT (UTC+2).
  static DateTime toCat(DateTime dt) => dt.toUtc().add(_catOffset);

  /// Current time in CAT.
  static DateTime nowCat() => DateTime.now().toUtc().add(_catOffset);

  /// Hour of day in CAT — use this for greetings.
  static int hourOfDay() => nowCat().hour;

  /// e.g. "31/3/2026"
  static String formatDate(DateTime dt) {
    final c = toCat(dt);
    return '${c.day}/${c.month}/${c.year}';
  }

  /// e.g. "31/3/2026  09:00"
  static String formatDateTime(DateTime dt) {
    final c = toCat(dt);
    final h = c.hour.toString().padLeft(2, '0');
    final m = c.minute.toString().padLeft(2, '0');
    return '${c.day}/${c.month}/${c.year}  $h:$m CAT';
  }

  /// e.g. "09:00 CAT"
  static String formatTime(DateTime dt) {
    final c = toCat(dt);
    final h = c.hour.toString().padLeft(2, '0');
    final m = c.minute.toString().padLeft(2, '0');
    return '$h:$m CAT';
  }

  /// Relative human-friendly label: "5m ago", "3h ago", "2d ago".
  /// Uses UTC-aware diff to avoid local-timezone bugs.
  static String timeAgo(DateTime dt) {
    final diff = DateTime.now().toUtc().difference(dt.toUtc());
    if (diff.isNegative) return 'just now';
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  /// Greeting based on current CAT hour.
  static String greeting() {
    final h = hourOfDay();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
