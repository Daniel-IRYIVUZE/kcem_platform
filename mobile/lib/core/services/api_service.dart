// lib/core/services/api_service.dart
// Comprehensive API service for EcoTrade Rwanda backend
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException(this.message, {this.statusCode});
  
  @override
  String toString() => message;
}

class ApiService {
  static String get baseUrl {
    const envBase = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (envBase.isNotEmpty) return envBase;

    // Always use local backend for all platforms during development
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000/api';
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return 'http://localhost:8000/api';
    }
    return 'http://127.0.0.1:8000/api';
  }
  
  static String? _accessToken;
  static String? _refreshToken;
  
  // ── Token Management ────────────────────────────────────────────────────────
  
  static Future<void> loadTokens() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('access_token');
    _refreshToken = prefs.getString('refresh_token');
  }
  
  static Future<void> saveTokens(String accessToken, String refreshToken) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', accessToken);
    await prefs.setString('refresh_token', refreshToken);
  }
  
  static Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
  }
  
  // ── HTTP Helpers ────────────────────────────────────────────────────────────
  
  static Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
    bool requiresAuth = true,
  }) async {
    if (requiresAuth && _accessToken == null) {
      await loadTokens();
    }
    
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: queryParams);
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    
    if (requiresAuth && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    
    late http.Response response;
    
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: headers).timeout(const Duration(seconds: 20));
          break;
        case 'POST':
          response = await http.post(uri, headers: headers, body: body != null ? jsonEncode(body) : null).timeout(const Duration(seconds: 20));
          break;
        case 'PUT':
          response = await http.put(uri, headers: headers, body: body != null ? jsonEncode(body) : null).timeout(const Duration(seconds: 20));
          break;
        case 'PATCH':
          response = await http.patch(uri, headers: headers, body: body != null ? jsonEncode(body) : null).timeout(const Duration(seconds: 20));
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: headers).timeout(const Duration(seconds: 20));
          break;
        default:
          throw ApiException('Unsupported HTTP method: $method');
      }
    } on TimeoutException {
      throw ApiException('Request timed out. Please try again.');
    } on http.ClientException {
      throw ApiException('Unable to connect to server. Check API URL and connection.');
    } catch (e) {
      throw ApiException('Network error: Please check your internet connection.');
    }
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    }
    
    // Handle errors
    String errorMessage = 'Request failed';
    try {
      final errorBody = jsonDecode(response.body);
      final detail = errorBody['detail'];
      if (detail is String) {
        errorMessage = detail;
      } else if (detail is List) {
        final first = detail.isNotEmpty ? detail.first : null;
        if (first is Map && first['msg'] is String) {
          errorMessage = first['msg'] as String;
        }
      }
    } catch (_) {
      errorMessage = response.body.isNotEmpty ? response.body : 'HTTP ${response.statusCode}';
    }

    if (response.statusCode == 401 && errorMessage == 'Request failed') {
      errorMessage = 'Invalid email or password.';
    } else if (response.statusCode == 403 && errorMessage == 'Request failed') {
      errorMessage = 'Your account does not have permission to continue.';
    } else if (response.statusCode >= 500 && errorMessage == 'Request failed') {
      errorMessage = 'Server error. Please try again later.';
    }
    
    throw ApiException(errorMessage, statusCode: response.statusCode);
  }
  
  // ── Auth Endpoints ──────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    return await _request('POST', '/auth/register', body: userData, requiresAuth: false);
  }
  
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _request(
      'POST',
      '/auth/login',
      body: {'email': email, 'password': password},
      requiresAuth: false,
    );
    
    // Save tokens
    await saveTokens(response['access_token'], response['refresh_token']);
    
    return response;
  }
  
  static Future<void> logout() async {
    try {
      await _request('POST', '/auth/logout');
    } finally {
      await clearTokens();
    }
  }
  
  static Future<Map<String, dynamic>> getCurrentUser() async {
    return await _request('GET', '/auth/me');
  }
  
  static Future<Map<String, dynamic>> refreshAccessToken() async {
    if (_refreshToken == null) {
      throw ApiException('No refresh token available');
    }
    
    final response = await _request(
      'POST',
      '/auth/refresh',
      body: {'refresh_token': _refreshToken},
      requiresAuth: false,
    );
    
    await saveTokens(response['access_token'], _refreshToken!);
    return response;
  }
  
  // ── User Profile ────────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    return await _request('PATCH', '/users/me', body: data);
  }
  
  static Future<Map<String, dynamic>> uploadAvatar(List<int> bytes, String filename) async {
    final uri = Uri.parse('$baseUrl/users/me/avatar');
    final request = http.MultipartRequest('POST', uri);
    
    if (_accessToken != null) {
      request.headers['Authorization'] = 'Bearer $_accessToken';
    }
    
    request.files.add(http.MultipartFile.fromBytes('file', bytes, filename: filename));
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    
    throw ApiException('Failed to upload avatar', statusCode: response.statusCode);
  }
  
  // ── Listings ────────────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> getListings({
    String? wasteType,
    String? search,
    double? minVolume,
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    final queryParams = <String, String>{
      'skip': ((page - 1) * limit).toString(),
      'limit': limit.toString(),
    };
    if (wasteType != null) queryParams['waste_type'] = wasteType;
    if (search != null) queryParams['search'] = search;
    if (minVolume != null) queryParams['min_volume'] = minVolume.toString();
    if (status != null) queryParams['status'] = status;
    
    final res = await _request('GET', '/listings', queryParams: queryParams, requiresAuth: false);
    if (res is List) return {'items': res};
    if (res is Map<String, dynamic>) return res;
    return {'items': <dynamic>[]};
  }
  
  static Future<List<dynamic>> getMyListings() async {
    final response = await _request('GET', '/listings/mine');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      return (response['items'] as List<dynamic>?) ?? <dynamic>[];
    }
    return <dynamic>[];
  }
  
  static Future<Map<String, dynamic>> getListing(int id) async {
    return await _request('GET', '/listings/$id', requiresAuth: false);
  }
  
  static Future<Map<String, dynamic>> createListing(Map<String, dynamic> data) async {
    return await _request('POST', '/listings/', body: data);
  }
  
  static Future<Map<String, dynamic>> updateListing(int id, Map<String, dynamic> data) async {
    return await _request('PATCH', '/listings/$id', body: data);
  }
  
  static Future<void> deleteListing(int id) async {
    await _request('DELETE', '/listings/$id');
  }
  
  // ── Bids ────────────────────────────────────────────────────────────────────
  
  static Future<List<dynamic>> getMyBids() async {
    final response = await _request('GET', '/bids/mine');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      return (response['items'] as List<dynamic>?) ?? <dynamic>[];
    }
    return <dynamic>[];
  }
  
  static Future<List<dynamic>> getListingBids(int listingId) async {
    final response = await _request('GET', '/bids/listing/$listingId');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      return (response['items'] as List<dynamic>?) ?? <dynamic>[];
    }
    return <dynamic>[];
  }
  
  static Future<Map<String, dynamic>> placeBid({
    required int listingId,
    required double amount,
    String? notes,
  }) async {
    return await _request('POST', '/bids/', body: {
      'listing_id': listingId,
      'amount': amount,
      if (notes != null) 'notes': notes,
    });
  }
  
  static Future<Map<String, dynamic>> acceptBid(int bidId) async {
    return await _request('POST', '/bids/$bidId/accept');
  }
  
  static Future<void> withdrawBid(int bidId) async {
    await _request('POST', '/bids/$bidId/withdraw');
  }
  
  static Future<Map<String, dynamic>> increaseBid(int bidId, double newAmount) async {
    return await _request('PATCH', '/bids/$bidId/increase', body: {'new_amount': newAmount});
  }
  
  // ── Collections ─────────────────────────────────────────────────────────────
  
  static Future<List<dynamic>> getMyCollections() async {
    final response = await _request('GET', '/collections/mine');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      return (response['items'] as List<dynamic>?) ?? <dynamic>[];
    }
    return <dynamic>[];
  }
  
  static Future<Map<String, dynamic>> getCollection(int id) async {
    return await _request('GET', '/collections/$id');
  }
  
  static Future<Map<String, dynamic>> advanceCollectionStatus(
    int id, {
    String? notes,
    double? actualWeight,
  }) async {
    return await _request('POST', '/collections/$id/advance', body: {
      if (notes != null) 'notes': notes,
      if (actualWeight != null) 'actual_weight': actualWeight,
    });
  }

  static Future<Map<String, dynamic>> getCollectionTracking(int id) async {
    return await _request('GET', '/collections/$id/tracking');
  }

  static Future<Map<String, dynamic>> updateDriverLocation(double lat, double lng) async {
    return await _request('PATCH', '/drivers/me/location', body: {
      'lat': lat,
      'lng': lng,
    });
  }
  
  static Future<Map<String, dynamic>> uploadCollectionProof(int id, List<int> bytes, String filename) async {
    final uri = Uri.parse('$baseUrl/collections/$id/proofs');
    final request = http.MultipartRequest('POST', uri);
    
    if (_accessToken != null) {
      request.headers['Authorization'] = 'Bearer $_accessToken';
    }
    
    request.files.add(http.MultipartFile.fromBytes('file', bytes, filename: filename));
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    
    throw ApiException('Failed to upload proof', statusCode: response.statusCode);
  }
  
  // ── Transactions ────────────────────────────────────────────────────────────
  
  static Future<List<dynamic>> getMyTransactions() async {
    final response = await _request('GET', '/transactions/mine');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      return (response['items'] as List<dynamic>?) ?? <dynamic>[];
    }
    return <dynamic>[];
  }
  
  static Future<Map<String, dynamic>> getTransaction(int id) async {
    return await _request('GET', '/transactions/$id');
  }
  
  static Future<Map<String, dynamic>> addPayment(
    int transactionId, {
    required String method,
    required double amount,
    required String reference,
  }) async {
    return await _request('POST', '/transactions/$transactionId/pay', body: {
      'method': method,
      'amount': amount,
      'reference': reference,
    });
  }
  
  // ── Notifications ───────────────────────────────────────────────────────────
  
  static Future<List<dynamic>> getNotifications() async {
    final response = await _request('GET', '/notifications');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      return (response['items'] as List<dynamic>?) ?? <dynamic>[];
    }
    return <dynamic>[];
  }
  
  static Future<Map<String, dynamic>> getUnreadNotificationCount() async {
    return await _request('GET', '/notifications/unread-count');
  }
  
  static Future<void> markNotificationAsRead(int id) async {
    await _request('POST', '/notifications/$id/read');
  }
  
  static Future<void> markAllNotificationsAsRead() async {
    await _request('POST', '/notifications/read-all');
  }
  
  // ── Messages ────────────────────────────────────────────────────────────────
  
  static Future<List<dynamic>> getConversations() async {
    return await _request('GET', '/messages/conversations') as List<dynamic>;
  }
  
  static Future<List<dynamic>> getMessages(int conversationId) async {
    return await _request('GET', '/messages/$conversationId') as List<dynamic>;
  }
  
  static Future<Map<String, dynamic>> sendMessage({
    required int recipientId,
    required String content,
  }) async {
    return await _request('POST', '/messages/', body: {
      'recipient_id': recipientId,
      'content': content,
    });
  }
  
  static Future<void> markConversationRead(int conversationId) async {
    await _request('POST', '/messages/$conversationId/read');
  }
  
  // ── Hotels ──────────────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> getMyHotel() async {
    return await _request('GET', '/hotels/me');
  }
  
  static Future<Map<String, dynamic>> getHotelProfile(int userId) async {
    return await _request('GET', '/hotels/$userId');
  }
  
  static Future<Map<String, dynamic>> updateHotelProfile(int userId, Map<String, dynamic> data) async {
    return await _request('PATCH', '/hotels/$userId', body: data);
  }
  
  static Future<Map<String, dynamic>> updateMyHotel(Map<String, dynamic> data) async {
    return await _request('PATCH', '/hotels/me', body: data);
  }
  
  // ── Recyclers ───────────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> getMyRecycler() async {
    return await _request('GET', '/recyclers/me');
  }
  
  static Future<Map<String, dynamic>> getRecyclerProfile(int userId) async {
    return await _request('GET', '/recyclers/$userId');
  }
  
  static Future<Map<String, dynamic>> updateRecyclerProfile(int userId, Map<String, dynamic> data) async {
    return await _request('PATCH', '/recyclers/$userId', body: data);
  }
  
  static Future<Map<String, dynamic>> updateMyRecycler(Map<String, dynamic> data) async {
    return await _request('PATCH', '/recyclers/me', body: data);
  }
  
  // ── Drivers ─────────────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> getDriverProfile(int userId) async {
    return await _request('GET', '/drivers/$userId');
  }
  
  static Future<Map<String, dynamic>> updateDriverProfile(int userId, Map<String, dynamic> data) async {
    return await _request('PATCH', '/drivers/$userId', body: data);
  }
  
  // ── Inventory ───────────────────────────────────────────────────────────────
  
  static Future<List<dynamic>> getMyInventory() async {
    return await _request('GET', '/inventory/mine') as List<dynamic>;
  }
  
  static Future<Map<String, dynamic>> updateInventoryQuantity(int itemId, double quantity) async {
    return await _request('POST', '/inventory/$itemId/adjust', body: {'quantity': quantity});
  }
  
  // ── Reviews ─────────────────────────────────────────────────────────────────
  
  static Future<Map<String, dynamic>> createReview({
    required int revieweeId,
    required int rating,
    String? comment,
  }) async {
    return await _request('POST', '/reviews/', body: {
      'reviewee_id': revieweeId,
      'rating': rating,
      if (comment != null) 'comment': comment,
    });
  }
  
  static Future<List<dynamic>> getReviewsForUser(int userId) async {
    return await _request('GET', '/reviews/user/$userId', requiresAuth: false) as List<dynamic>;
  }
  
  // ── Blog Posts ──────────────────────────────────────────────────────────────
  
  /// Get published blog posts (public)
  static Future<List<dynamic>> getBlogPosts({
    int? skip,
    int? limit,
    String? category,
    String? search,
    bool? featuredOnly,
  }) async {
    final queryParams = <String, String>{};
    if (skip != null) queryParams['skip'] = skip.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    if (category != null && category.isNotEmpty) queryParams['category'] = category;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (featuredOnly != null) queryParams['featured_only'] = featuredOnly.toString();
    
    return await _request('GET', '/blog', queryParams: queryParams, requiresAuth: false) as List<dynamic>;
  }
  
  /// Get blog post by slug (public, increments view count)
  static Future<Map<String, dynamic>> getBlogPostBySlug(String slug) async {
    return await _request('GET', '/blog/slug/$slug', requiresAuth: false);
  }
  
  /// Get blog post by ID (public)
  static Future<Map<String, dynamic>> getBlogPostById(int id) async {
    return await _request('GET', '/blog/$id', requiresAuth: false);
  }
  
  /// Get all blog categories (public)
  static Future<List<dynamic>> getBlogCategories() async {
    return await _request('GET', '/blog/categories', requiresAuth: false) as List<dynamic>;
  }
  
  // ── Admin Blog Management ───────────────────────────────────────────────────
  
  /// Get all blog posts including unpublished (admin only)
  static Future<List<dynamic>> getAllBlogPosts({int? skip, int? limit}) async {
    final queryParams = <String, String>{};
    if (skip != null) queryParams['skip'] = skip.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    
    return await _request('GET', '/blog/admin/all', queryParams: queryParams) as List<dynamic>;
  }
  
  /// Create new blog post (admin only)
  static Future<Map<String, dynamic>> createBlogPost({
    required String title,
    String? slug,
    required String excerpt,
    required String content,
    String? featuredImage,
    required String category,
    String? tags,
    bool? isPublished,
    bool? isFeatured,
  }) async {
    return await _request('POST', '/blog', body: {
      'title': title,
      if (slug != null) 'slug': slug,
      'excerpt': excerpt,
      'content': content,
      if (featuredImage != null) 'featured_image': featuredImage,
      'category': category,
      if (tags != null) 'tags': tags,
      if (isPublished != null) 'is_published': isPublished,
      if (isFeatured != null) 'is_featured': isFeatured,
    });
  }
  
  /// Update blog post (admin only)
  static Future<Map<String, dynamic>> updateBlogPost({
    required int id,
    String? title,
    String? slug,
    String? excerpt,
    String? content,
    String? featuredImage,
    String? category,
    String? tags,
    bool? isPublished,
    bool? isFeatured,
  }) async {
    final body = <String, dynamic>{};
    if (title != null) body['title'] = title;
    if (slug != null) body['slug'] = slug;
    if (excerpt != null) body['excerpt'] = excerpt;
    if (content != null) body['content'] = content;
    if (featuredImage != null) body['featured_image'] = featuredImage;
    if (category != null) body['category'] = category;
    if (tags != null) body['tags'] = tags;
    if (isPublished != null) body['is_published'] = isPublished;
    if (isFeatured != null) body['is_featured'] = isFeatured;
    
    return await _request('PATCH', '/blog/$id', body: body);
  }
  
  /// Delete blog post (admin only)
  static Future<void> deleteBlogPost(int id) async {
    await _request('DELETE', '/blog/$id');
  }
  
  /// Publish blog post (admin only)
  static Future<Map<String, dynamic>> publishBlogPost(int id) async {
    return await _request('POST', '/blog/$id/publish');
  }
  
  /// Unpublish blog post (admin only)
  static Future<Map<String, dynamic>> unpublishBlogPost(int id) async {
    return await _request('POST', '/blog/$id/unpublish');
  }
  
  /// Toggle featured status (admin only)
  static Future<Map<String, dynamic>> toggleBlogFeatured(int id) async {
    return await _request('POST', '/blog/$id/toggle-featured');
  }
}

