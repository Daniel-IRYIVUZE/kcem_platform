import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/models/models.dart';
import '../shared/widgets/eco_button.dart';

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen> {
  bool _isMapView = false;
  WasteType? _selectedType;
  double _maxDistance = 50; // km — default show all

  /// Deterministic pseudo-distance based on listing id hash (1–50 km)
  double _simDistance(WasteListing l) =>
      (l.id.hashCode.abs() % 50 + 1).toDouble();

  List<WasteListing> _filtered(List<WasteListing> listings) {
    return listings.where((l) {
      final typeOk = _selectedType == null || l.wasteType == _selectedType;
      final distOk = _simDistance(l) <= _maxDistance;
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
                color: context.cSurfAlt,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(
                    'Min bid: RWF ${listing.minBid.toStringAsFixed(0)}',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
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
      appBar: AppBar(
        title: const Text('Marketplace'),
        actions: [
          IconButton(
            onPressed: () => setState(() => _isMapView = !_isMapView),
            icon: Icon(_isMapView ? Icons.list : Icons.map_outlined),
          ),
          IconButton(
            onPressed: () => _showFilters(context),
            icon: const Icon(Icons.tune),
          ),
        ],
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
                          distanceKm: _simDistance(filtered[index]).toInt(),
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
  final int distanceKm;

  const _ListingCard({required this.listing, required this.onBid, required this.distanceKm});

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
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  listing.wasteType == WasteType.uco
                      ? Icons.water_drop_outlined
                      : listing.wasteType == WasteType.glass
                          ? Icons.wine_bar_outlined
                          : listing.wasteType == WasteType.paperCardboard
                              ? Icons.article_outlined
                              : Icons.delete_outline,
                  color: AppColors.primary,
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          listing.wasteType.label,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                        ),

                      ],
                    ),
                    Text(
                      listing.businessName,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Text(
                'RWF ${listing.minBid.toStringAsFixed(0)}+',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              _Tag(icon: Icons.scale_outlined, label: '${listing.volume.toStringAsFixed(0)} ${listing.unit}'),
              const SizedBox(width: 8),
              _Tag(icon: Icons.stars_outlined, label: listing.quality.label),
              const SizedBox(width: 8),
              _Tag(icon: Icons.near_me_outlined, label: '$distanceKm km'),
              const Spacer(),
              _Tag(icon: Icons.gavel_outlined, label: '${listing.activeBidCount} bids'),
            ],
          ),

          const SizedBox(height: 12),

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

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
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

class _MapView extends StatelessWidget {
  final List<WasteListing> listings;
  final Function(WasteListing) onBid;

  const _MapView({required this.listings, required this.onBid});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          color: const Color(0xFFD4EDDA),
          child: Stack(
            children: [
              ...List.generate(6, (i) => Positioned(
                left: i * 60.0, top: 0, bottom: 0,
                child: Container(width: 1, color: Colors.white.withOpacity(0.5)),
              )),
              ...List.generate(8, (i) => Positioned(
                top: i * 55.0, left: 0, right: 0,
                child: Container(height: 1, color: Colors.white.withOpacity(0.5)),
              )),
              ...listings.asMap().entries.map((e) {
                final positions = [
                  [0.2, 0.3], [0.5, 0.45], [0.75, 0.25], [0.35, 0.65], [0.62, 0.7],
                ];
                final pos = positions[e.key % positions.length];
                return Positioned(
                  left: (MediaQuery.of(context).size.width - 40) * pos[0],
                  top: (MediaQuery.of(context).size.height * 0.55) * pos[1],
                  child: GestureDetector(
                    onTap: () => onBid(e.value),
                    child: _MapClusterMarker(
                      wasteType: e.value.wasteType,
                      count: e.value.activeBidCount,
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: SizedBox(
            height: 160,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              itemCount: listings.length,
              itemBuilder: (context, index) {
                final l = listings[index];
                return GestureDetector(
                  onTap: () => onBid(l),
                  child: Container(
                    width: 200,
                    margin: const EdgeInsets.only(right: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 3))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.recycling, color: AppColors.primary, size: 20),
                            const SizedBox(width: 8),
                            Expanded(child: Text(l.wasteType.label,
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(l.businessName,
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        const Spacer(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('${l.volume.toStringAsFixed(0)} ${l.unit}',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            Text('RWF ${l.minBid.toStringAsFixed(0)}',
                                style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _MapClusterMarker extends StatelessWidget {
  final WasteType wasteType;
  final int count;
  const _MapClusterMarker({required this.wasteType, required this.count});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 8, spreadRadius: 2)],
          ),
          child: Icon(
            wasteType == WasteType.uco
                ? Icons.water_drop_outlined
                : wasteType == WasteType.glass
                    ? Icons.wine_bar_outlined
                    : wasteType == WasteType.paperCardboard
                        ? Icons.article_outlined
                        : Icons.delete_outline,
            color: Colors.white,
            size: 22,
          ),
        ),
        Positioned(
          top: -2,
          right: -2,
          child: Container(
            padding: const EdgeInsets.all(3),
            decoration: const BoxDecoration(
              color: AppColors.error,
              shape: BoxShape.circle,
            ),
            child: Text(
              '$count',
              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }
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
