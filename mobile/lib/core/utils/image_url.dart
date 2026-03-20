/// Utility helpers for resolving photo URLs from the backend.
///
/// Backend may return:
///   - A full URL: "https://..."
///   - A relative path: "/uploads/listings/abc.jpg"
///   - A bare filename: "abc.jpg"
///
/// All are normalised to an absolute URL against the configured API host.

import '../services/api_service.dart';

/// Returns the base host (scheme + host, no path) derived from the API base URL.
String get _apiHost {
  try {
    final uri = Uri.parse(ApiService.baseUrl);
    return '${uri.scheme}://${uri.host}${uri.hasPort ? ":${uri.port}" : ""}';
  } catch (_) {
    return 'http://localhost:8000';
  }
}

/// Converts a single raw photo string to an absolute URL.
String resolveImageUrl(String raw) {
  final trimmed = raw.trim();
  if (trimmed.isEmpty) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // relative path like "/uploads/..."
  if (trimmed.startsWith('/')) {
    return '$_apiHost$trimmed';
  }
  // bare filename
  return '$_apiHost/uploads/$trimmed';
}

/// Returns the first absolute image URL from the photos list.
/// Returns an empty string when no photos are available.
String getFirstImageUrl(List<String>? photos) {
  if (photos == null || photos.isEmpty) return '';
  final raw = photos.first;
  if (raw.isEmpty) return '';
  return resolveImageUrl(raw);
}

/// Returns all photos as absolute URLs, filtering out empty entries.
List<String> getAbsoluteImageUrls(List<String>? photos) {
  if (photos == null || photos.isEmpty) return [];
  return photos
      .where((p) => p.isNotEmpty)
      .map(resolveImageUrl)
      .where((url) => url.isNotEmpty)
      .toList();
}
