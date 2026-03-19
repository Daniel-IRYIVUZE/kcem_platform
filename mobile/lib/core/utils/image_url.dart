// Utility to convert relative image paths to absolute URLs for EcoTrade Rwanda
import '../services/api_service.dart';

/// Returns absolute URL for image, given a relative or absolute path.
/// - If null or empty, returns placeholder.
/// - If already absolute, returns as is.
/// - If starts with /uploads/, prepends backend base URL.
/// - Otherwise, returns placeholder.
String getAbsoluteImageUrl(String? imageUrl) {
  if (imageUrl == null || imageUrl.isEmpty) {
    return 'https://eco-trade.rw/images/placeholder-image.svg';
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/uploads/')) {
    return ApiService.baseUrl.replaceAll('/api', '') + imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  return 'https://eco-trade.rw/images/placeholder-image.svg';
}

/// Returns first image from photos array, or placeholder.
String getFirstImageUrl(List<String>? photos) {
  if (photos == null || photos.isEmpty) {
    return 'https://eco-trade.rw/images/placeholder-image.svg';
  }
  return getAbsoluteImageUrl(photos[0]);
}

/// Returns all images as absolute URLs.
List<String> getAbsoluteImageUrls(List<String>? photos) {
  if (photos == null) return [];
  return photos.map(getAbsoluteImageUrl).toList();
}
