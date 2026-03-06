import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/app_text_field.dart';
import '../shared/widgets/eco_button.dart';

class ListWasteScreen extends ConsumerStatefulWidget {
  const ListWasteScreen({super.key});

  @override
  ConsumerState<ListWasteScreen> createState() => _ListWasteScreenState();
}

class _ListWasteScreenState extends ConsumerState<ListWasteScreen> {
  String _selectedWasteType = 'Cardboard';
  double _qualityScore = 3;
  bool _isSubmitting = false;
  final _volumeController = TextEditingController();
  final _notesController = TextEditingController();
  final _minBidController = TextEditingController();
  final _addressController = TextEditingController();
  bool _useCurrentLocation = true;
  int _uploadedPhotos = 0;
  String _unit = 'kg';

  final List<String> _wasteTypes = [
    'Cardboard', 'Plastic PET', 'Plastic HDPE', 'Glass',
    'Metal/Aluminum', 'Paper', 'Food Waste', 'E-Waste', 'Textiles',
  ];

  @override
  void dispose() {
    _volumeController.dispose();
    _notesController.dispose();
    _minBidController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  WasteType get _mappedWasteType {
    switch (_selectedWasteType) {
      case 'Glass': return WasteType.glass;
      case 'Cardboard':
      case 'Paper': return WasteType.paperCardboard;
      default: return WasteType.mixed;
    }
  }

  WasteQuality get _mappedQuality {
    if (_qualityScore >= 5) return WasteQuality.a;
    if (_qualityScore >= 3) return WasteQuality.b;
    return WasteQuality.c;
  }

  Future<void> _submitListing() async {
    final auth = ref.read(authProvider);
    if (auth.user == null) return;

    final volume = double.tryParse(_volumeController.text) ?? 50;
    final minBid = double.tryParse(_minBidController.text) ?? 10000;
    final location = _useCurrentLocation
        ? 'Kigali, Rwanda'
        : (_addressController.text.trim().isNotEmpty
            ? _addressController.text.trim()
            : 'Kigali, Rwanda');

    setState(() => _isSubmitting = true);

    try {
      await ref.read(listingsNotifierProvider.notifier).create(
        businessId: auth.user!.id,
        businessName: auth.user!.displayName,
        wasteType: _mappedWasteType,
        volume: volume,
        unit: _unit,
        quality: _mappedQuality,
        minBid: minBid,
        location: location,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 18),
                SizedBox(width: 10),
                Text('Listing created successfully!'),
              ],
            ),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
          ),
        );
        // Clear fields
        _volumeController.clear();
        _minBidController.clear();
        _notesController.clear();
        setState(() {
          _selectedWasteType = 'Cardboard';
          _qualityScore = 3;
          _uploadedPhotos = 0;
          _isSubmitting = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create listing: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('List Waste'),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Draft saved'), behavior: SnackBarBehavior.floating),
            ),
            child: const Text('Save Draft'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Waste type
            _SectionCard(
              title: 'Waste Type',
              icon: '♻️',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _wasteTypes.map((type) {
                  final isSelected = _selectedWasteType == type;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedWasteType = type),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                        ),
                      ),
                      child: Text(
                        type,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),

            const SizedBox(height: 16),

            // Volume
            _SectionCard(
              title: 'Volume / Quantity',
              icon: '⚖️',
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: AppTextField(
                      controller: _volumeController,
                      label: 'Amount',
                      hint: '0',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Unit',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: DropdownButton<String>(
                          value: _unit,
                          underline: const SizedBox(),
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          items: ['kg', 'ton', 'bags', 'units'].map((u) {
                            return DropdownMenuItem(value: u, child: Text(u));
                          }).toList(),
                          onChanged: (v) => setState(() => _unit = v!),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 80.ms).fadeIn(),

            const SizedBox(height: 16),

            // Min Bid Price
            _SectionCard(
              title: 'Minimum Bid Price (RWF)',
              icon: '💰',
              child: AppTextField(
                controller: _minBidController,
                label: 'Minimum bid (RWF)',
                hint: '10000',
                keyboardType: TextInputType.number,
                prefixIcon: Icons.payments_outlined,
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 120.ms).fadeIn(),

            const SizedBox(height: 16),

            // Quality
            _SectionCard(
              title: 'Quality Rating',
              icon: '⭐',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Poor', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _qualityLabel(_qualityScore),
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      const Text('Excellent', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.primary,
                      thumbColor: AppColors.primary,
                      inactiveTrackColor: AppColors.border,
                    ),
                    child: Slider(
                      value: _qualityScore,
                      min: 1,
                      max: 5,
                      divisions: 4,
                      onChanged: (v) => setState(() => _qualityScore = v),
                    ),
                  ),
                ],
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 160.ms).fadeIn(),

            const SizedBox(height: 16),

            // Photos
            _SectionCard(
              title: 'Photos',
              icon: '📷',
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _uploadedPhotos = (_uploadedPhotos + 1).clamp(0, 5)),
                    child: Container(
                      height: 100,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.4),
                          style: BorderStyle.solid,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.add_a_photo_outlined, color: AppColors.primary, size: 32),
                          const SizedBox(height: 8),
                          Text(
                            _uploadedPhotos > 0
                                ? '$_uploadedPhotos photo(s) added. Tap to add more'
                                : 'Tap to capture or upload photos',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_uploadedPhotos > 0) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 70,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _uploadedPhotos,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          return Container(
                            width: 70,
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Stack(
                              children: [
                                const Center(
                                  child: Text('📦', style: TextStyle(fontSize: 28)),
                                ),
                                Positioned(
                                  top: 4,
                                  right: 4,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _uploadedPhotos--),
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: AppColors.error,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.close, size: 12, color: Colors.white),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 240.ms).fadeIn(),

            const SizedBox(height: 16),

            // Pickup time
            _SectionCard(
              title: 'Preferred Pickup Time',
              icon: '🕐',
              child: Row(
                children: ['ASAP', 'Today PM', 'Tomorrow', 'This Week']
                    .map((t) => GestureDetector(
                          onTap: () {},
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                            decoration: BoxDecoration(
                              color: t == 'ASAP' ? AppColors.primary : AppColors.surface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: t == 'ASAP' ? AppColors.primary : AppColors.border,
                              ),
                            ),
                            child: Text(
                              t,
                              style: TextStyle(
                                color: t == 'ASAP' ? Colors.white : AppColors.textPrimary,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 320.ms).fadeIn(),

            const SizedBox(height: 16),

            // Location
            _SectionCard(
              title: 'Pickup Location',
              icon: '📍',
              child: Column(
                children: [
                  SwitchListTile(
                    value: _useCurrentLocation,
                    onChanged: (v) => setState(() => _useCurrentLocation = v),
                    title: const Text('Use current location', style: TextStyle(fontSize: 14)),
                    activeColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                  ),
                  if (!_useCurrentLocation)
                    AppTextField(
                      controller: _addressController,
                      label: 'Address',
                      hint: 'Enter pickup address',
                      prefixIcon: Icons.location_on_outlined,
                    ),
                  const SizedBox(height: 8),
                  Container(
                    height: 140,
                    decoration: BoxDecoration(
                      color: const Color(0xFFD4EDDA),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.location_on, color: AppColors.primary, size: 36),
                          SizedBox(height: 6),
                          Text(
                            'Kigali, Rwanda',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 400.ms).fadeIn(),

            const SizedBox(height: 16),

            AppTextField(
              controller: _notesController,
              label: 'Additional Notes (optional)',
              hint: 'Describe condition, access instructions, etc.',
              maxLines: 3,
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 480.ms).fadeIn(),

            const SizedBox(height: 28),

            EcoButton(
              label: 'Submit Listing',
              icon: Icons.check_circle_outline,
              isLoading: _isSubmitting,
              onPressed: _submitListing,
            ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 560.ms).fadeIn(),
          ],
        ),
      ),
    );
  }

  String _qualityLabel(double score) {
    switch (score.round()) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Good';
    }
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final String icon;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
