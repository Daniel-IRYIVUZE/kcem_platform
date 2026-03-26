import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/models/models.dart';
import '../shared/widgets/eco_button.dart';
import '../../core/utils/image_url.dart';

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen> {
  bool _isMapView = false;
  WasteType? _selectedType;
  double _maxDistance = 50; // km — default show all
  Position? _userPosition;

  @override
  void initState() {
    super.initState();
    _loadUserPosition();
  }

  Future<void> _loadUserPosition() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );
      if (mounted) setState(() => _userPosition = pos);
    } catch (_) {}
  }

  double? _realDistance(WasteListing l) {
    if (_userPosition == null || l.latitude == null || l.longitude == null) return null;
    return Geolocator.distanceBetween(
      _userPosition!.latitude, _userPosition!.longitude,
      l.latitude!, l.longitude!,
    ) / 1000; // convert to km
  }

  List<WasteListing> _filtered(List<WasteListing> listings) {
    return listings.where((l) {
      final typeOk = _selectedType == null || l.wasteType == _selectedType;
      final dist = _realDistance(l);
      final distOk = dist == null || dist <= _maxDistance;
      return typeOk && distOk;
    }).toList();
  }

  void _showBidModal(BuildContext context, WasteListing listing) {
    final controller = TextEditingController();
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
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: context.cBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Place Bid on ${listing.wasteType.label}',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            Text(
            '${listing.businessName} • ${listing.volume.toStringAsFixed(0)} ${listing.unit}',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Min Bid', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text(
                        'RWF ${listing.minBid.toStringAsFixed(0)}/${listing.unit}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Total Amount', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text(
                        'RWF ${(listing.volume * listing.minBid).toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('Your Bid Amount (RWF)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              decoration: InputDecoration(
                hintText: '0',
                prefixText: 'RWF ',
                prefixStyle: const TextStyle(
                  fontSize: 18,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: ['12,000', '15,000', '18,000'].map((amount) {
                return GestureDetector(
                  onTap: () => controller.text = amount.replaceAll(',', ''),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.primary),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'RWF $amount',
                      style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            EcoButton(
              label: 'Submit Bid',
              onPressed: () async {
                final amount = double.tryParse(
                        controller.text.replaceAll(',', '')) ??
                    listing.minBid;
                final auth = ref.read(authProvider);
                if (auth.user != null) {
                  await ref.read(bidsNotifierProvider.notifier).placeBid(
                    listingId: listing.id,
                    recyclerId: auth.user!.id,
                    recyclerName: auth.user!.displayName,
                    amount: amount,
                  );
                }
                if (!context.mounted) return;
                Navigator.pop(context);
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Row(
                      children: [
                        Icon(Icons.gavel, color: Colors.white, size: 16),
                        SizedBox(width: 8),
                        Text('Bid submitted successfully!'),
                      ],
                    ),
                    backgroundColor: AppColors.primary,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              icon: Icons.gavel,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final allListings = ref.watch(openListingsProvider);
    final filtered = _filtered(allListings);
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          title: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Marketplace'),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: IconButton(
                onPressed: () => setState(() => _isMapView = !_isMapView),
                icon: Icon(_isMapView ? Icons.list : Icons.map_outlined),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: IconButton(
                onPressed: () => _showFilters(context),
                icon: const Icon(Icons.tune),
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Waste type filters
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              children: [
                _FilterChip(
                  label: 'All',
                  isSelected: _selectedType == null,
                  onTap: () => setState(() => _selectedType = null),
                ),
                ...WasteType.values.map((type) => _FilterChip(
                  label: type.label,
                  isSelected: _selectedType == type,
                  onTap: () => setState(() => _selectedType = type),
                )),
              ],
            ),
          ),

          if (_isMapView)
            Expanded(child: _MapView(listings: filtered, onBid: (l) => _showBidModal(context, l)))
          else
            Expanded(
              child: filtered.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search_off, size: 56, color: AppColors.textTertiary),
                          SizedBox(height: 12),
                          Text('No listings for this filter', style: TextStyle(color: AppColors.textSecondary)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _ListingCard(
                          listing: filtered[index],
                          distanceKm: _realDistance(filtered[index])?.toInt(),
                          onBid: () => _showBidModal(context, filtered[index]),
                        ).animate().slideY(begin: 0.15, duration: 300.ms, delay: (index * 60).ms).fadeIn();
                      },
                    ),
            ),
        ],
      ),
    );
  }

  void _showFilters(BuildContext context) {
    double tempDist = _maxDistance;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Filters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Max Distance', style: TextStyle(fontWeight: FontWeight.w600)),
                  Text('${tempDist.toInt()} km',
                      style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                ],
              ),
              Slider(
                value: tempDist,
                min: 1,
                max: 50,
                divisions: 49,
                activeColor: AppColors.primary,
                onChanged: (v) => setModalState(() => tempDist = v),
              ),
              const SizedBox(height: 12),
              EcoButton(
                label: 'Apply Filters',
                onPressed: () {
                  setState(() => _maxDistance = tempDist);
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  const _FilterChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : context.cSurf,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : context.cBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _ListingCard extends StatelessWidget {
  final WasteListing listing;
  final VoidCallback onBid;
  final int? distanceKm;

  const _ListingCard({required this.listing, required this.onBid, this.distanceKm});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Grid of images
          _WasteImageRow(listing: listing),
          const SizedBox(width: 12),
          // Listing details
          Row(
            children: [
              const Icon(Icons.recycling, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(listing.wasteType.label,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            listing.businessName,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _Tag(icon: Icons.scale_outlined, label: '${listing.volume.toStringAsFixed(0)} ${listing.unit}'),
              const SizedBox(width: 8),
              _Tag(icon: Icons.stars_outlined, label: listing.quality.label),
              const SizedBox(width: 8),
              _Tag(icon: Icons.near_me_outlined, label: distanceKm != null ? '$distanceKm km' : '—'),
              const Spacer(),
              _Tag(icon: Icons.gavel_outlined, label: '${listing.activeBidCount} bids'),
            ],
          ),
          const SizedBox(height: 12),
          // Pricing row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Min Bid', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      'RWF ${_fmt(listing.minBid)}/${listing.unit}',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Total Amount', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      'RWF ${_fmt(listing.volume * listing.minBid)}',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                _timeAgo(listing.createdAt),
                style: const TextStyle(fontSize: 12, color: AppColors.textTertiary),
              ),
              const Spacer(),
              EcoSmallButton(label: 'Place Bid', onPressed: onBid),
            ],
          ),
        ],
      ),
    );
  }

  String _fmt(double v) {
    if (v >= 1000000) return '${(v / 1000000).toStringAsFixed(1)}M';
    if (v >= 1000) return '${(v / 1000).toStringAsFixed(0)}K';
    return v.toStringAsFixed(0);
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

/// Reusable row of photo thumbnails for a WasteListing.
/// Shows up to [maxPhotos] 60×60 thumbnails (horizontal scroll) or a
/// single icon-placeholder when there are no photos.
class _WasteImageRow extends StatelessWidget {
  final WasteListing listing;
  final int maxPhotos;
  const _WasteImageRow({required this.listing, this.maxPhotos = 4});

  IconData get _icon {
    switch (listing.wasteType) {
      case WasteType.uco:           return Icons.water_drop_outlined;
      case WasteType.glass:         return Icons.wine_bar_outlined;
      case WasteType.paperCardboard: return Icons.article_outlined;
      default:                      return Icons.delete_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final urls = getAbsoluteImageUrls(listing.photos)
        .take(maxPhotos)
        .toList();

    if (urls.isEmpty) {
      return Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(_icon, color: AppColors.primary, size: 26),
      );
    }

    return SizedBox(
      height: 60,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        shrinkWrap: true,
        itemCount: urls.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (context, idx) => ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.network(
            urls[idx],
            width: 60,
            height: 60,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: AppColors.primaryLight,
              width: 60,
              height: 60,
              child: Icon(_icon, color: AppColors.primary, size: 26),
            ),
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final IconData icon;
  final String label;
  const _Tag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.textSecondary),
        const SizedBox(width: 3),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }
}

// ─── Waste type → colour mapping ──────────────────────────────────────────────

Color _wasteTypeColor(WasteType t) {
  switch (t) {
    case WasteType.uco:            return const Color(0xFF00897B); // teal
    case WasteType.glass:          return const Color(0xFF1565C0); // dark blue
    case WasteType.paperCardboard: return const Color(0xFF388E3C); // green
    case WasteType.plastic:        return const Color(0xFF1B5E20); // dark green
    case WasteType.metal:          return const Color(0xFFC62828); // red
    case WasteType.organic:        return const Color(0xFF9E9D24); // lime
    case WasteType.mixed:          return const Color(0xFF6A1B9A); // purple
    case WasteType.electronic:     return const Color(0xFF283593); // indigo
    case WasteType.textile:        return const Color(0xFFAD1457); // pink
    case WasteType.other:          return const Color(0xFF616161); // grey
  }
}

// ─── Map view ─────────────────────────────────────────────────────────────────

class _MapView extends StatelessWidget {
  final List<WasteListing> listings;
  final Function(WasteListing) onBid;

  const _MapView({required this.listings, required this.onBid});

  static const _kigali = LatLng(-1.9441, 30.0619);

  static LatLng _point(WasteListing l) {
    if (l.latitude != null && l.longitude != null) {
      return LatLng(l.latitude!, l.longitude!);
    }
    final h = l.id.hashCode;
    return LatLng(
      -1.9441 + (h % 1000 - 500) / 5000.0,
      30.0619 + ((h >> 4) % 1000 - 500) / 5000.0,
    );
  }

  @override
  Widget build(BuildContext context) {
    // Unique hotel positions — one entry per business
    final hotelMap = <String, LatLng>{};
    for (final l in listings) {
      hotelMap.putIfAbsent(l.businessName, () => _point(l));
    }
    final hotelPoints = hotelMap.values.toList();

    // Dashed polylines between distinct hotel locations
    final polylines = <Polyline>[];
    for (int i = 0; i < hotelPoints.length - 1; i++) {
      for (int j = i + 1; j < hotelPoints.length; j++) {
        polylines.add(Polyline(
          points: [hotelPoints[i], hotelPoints[j]],
          color: const Color(0xFF0288D1),
          strokeWidth: 1.5,
          isDotted: true,
        ));
      }
    }

    // Waste types present in the filtered results (for legend)
    final presentTypes = listings.map((l) => l.wasteType).toSet().toList()
      ..sort((a, b) => a.index.compareTo(b.index));

    // Distance strings for each pair of distinct hotels
    final distanceLabels = <String>[];
    final hotelEntries = hotelMap.entries.toList();
    for (int i = 0; i < hotelEntries.length - 1; i++) {
      for (int j = i + 1; j < hotelEntries.length; j++) {
        final a = hotelEntries[i].value;
        final b = hotelEntries[j].value;
        final km = _haversineKm(a, b);
        distanceLabels.add(
          '${hotelEntries[i].key} ↔ ${hotelEntries[j].key}: ${km.toStringAsFixed(1)} km',
        );
      }
    }

    return Stack(
      children: [
        FlutterMap(
          options: const MapOptions(
            initialCenter: _kigali,
            initialZoom: 13.0,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.ecotrade.rwanda',
            ),
            if (polylines.isNotEmpty)
              PolylineLayer(polylines: polylines),
            MarkerLayer(
              markers: listings.map((l) => Marker(
                point: _point(l),
                width: 110,
                height: 64,
                alignment: Alignment.bottomCenter,
                child: GestureDetector(
                  onTap: () => onBid(l),
                  child: _WastePin(
                    label: l.businessName,
                    color: _wasteTypeColor(l.wasteType),
                  ),
                ),
              )).toList(),
            ),
          ],
        ),

        // Legend + stats bar at bottom
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: Container(
            color: Colors.white.withValues(alpha: 0.93),
            padding: const EdgeInsets.fromLTRB(12, 6, 12, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Distances (only when multiple hotels present)
                if (distanceLabels.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Wrap(
                      spacing: 12,
                      children: distanceLabels.map((d) => Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ...List.generate(4, (i) => Container(
                            width: 5, height: 1.5,
                            margin: EdgeInsets.only(right: i < 3 ? 3 : 0),
                            color: const Color(0xFF0288D1),
                          )),
                          const SizedBox(width: 4),
                          Text(d, style: const TextStyle(fontSize: 10, color: Color(0xFF0288D1))),
                        ],
                      )).toList(),
                    ),
                  ),

                // Waste type legend + listing/hotel count
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Wrap(
                        spacing: 10,
                        runSpacing: 3,
                        children: presentTypes.map((t) => Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 10, height: 10,
                              decoration: BoxDecoration(
                                color: _wasteTypeColor(t),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(t.label,
                                style: const TextStyle(fontSize: 11, color: Color(0xFF333333))),
                          ],
                        )).toList(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${listings.length} listing${listings.length == 1 ? '' : 's'} · '
                      '${hotelMap.length} hotel${hotelMap.length == 1 ? '' : 's'}',
                      style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF333333)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Haversine distance in km between two LatLng points.
  static double _haversineKm(LatLng a, LatLng b) {
    const r = 6371.0;
    final dLat = (b.latitude - a.latitude) * math.pi / 180;
    final dLng = (b.longitude - a.longitude) * math.pi / 180;
    final h = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(a.latitude * math.pi / 180) *
            math.cos(b.latitude * math.pi / 180) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);
    return 2 * r * math.asin(math.sqrt(h));
  }
}

// ─── Teardrop location pin ─────────────────────────────────────────────────────

class _WastePin extends StatelessWidget {
  final String label;
  final Color color;
  const _WastePin({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Business name label bubble
        Container(
          constraints: const BoxConstraints(maxWidth: 100),
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: color.withValues(alpha: 0.4), width: 0.8),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 3)],
          ),
          child: Text(
            label,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: 2),
        // Teardrop pin
        CustomPaint(
          size: const Size(24, 32),
          painter: _TearDropPainter(color: color),
        ),
      ],
    );
  }
}

class _TearDropPainter extends CustomPainter {
  final Color color;
  const _TearDropPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final r = size.width / 2;
    final path = ui.Path()
      ..addOval(Rect.fromCircle(center: Offset(r, r), radius: r))
      ..moveTo(size.width * 0.3, r + r * 0.55)
      ..lineTo(r, size.height)
      ..lineTo(size.width * 0.7, r + r * 0.55)
      ..close();

    canvas.drawPath(path, Paint()..color = color..style = PaintingStyle.fill);
    canvas.drawPath(
      path,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8,
    );
    // White inner dot
    canvas.drawCircle(Offset(r, r), r * 0.38,
        Paint()..color = Colors.white..style = PaintingStyle.fill);
  }

  @override
  bool shouldRepaint(_TearDropPainter old) => old.color != color;
}

class EcoSmallButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const EcoSmallButton({super.key, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}
