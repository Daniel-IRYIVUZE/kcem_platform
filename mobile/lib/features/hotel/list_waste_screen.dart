import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/services/api_service.dart';

// ─── Constants ──────────────────────────────────────────────────────────────
const _maxImages = 5;

// Waste types that match the backend exactly (all 10 supported types)
const _wasteTypeOptions = <WasteType>[
  WasteType.uco,
  WasteType.glass,
  WasteType.paperCardboard,
  WasteType.plastic,
  WasteType.metal,
  WasteType.organic,
  WasteType.electronic,
  WasteType.textile,
  WasteType.mixed,
  WasteType.other,
];

// ─── Screen ─────────────────────────────────────────────────────────────────
class ListWasteScreen extends ConsumerStatefulWidget {
  final WasteListing? existingListing;
  final VoidCallback? onDone;
  const ListWasteScreen({super.key, this.existingListing, this.onDone});

  @override
  ConsumerState<ListWasteScreen> createState() => _ListWasteScreenState();
}

class _ListWasteScreenState extends ConsumerState<ListWasteScreen> {
  int _step = 1; // 1 = Waste Details, 2 = Pickup & Pricing, 3 = Review

  // ── Step 1 fields ──────────────────────────────────────────────────────────
  WasteType? _wasteType;
  final _quantityCtrl = TextEditingController();
  String _unit = 'kg';
  final _descriptionCtrl = TextEditingController();
  final List<XFile> _images = [];

  // ── Step 2 fields ──────────────────────────────────────────────────────────
  final _unitPriceCtrl = TextEditingController();
  DateTime? _pickupDate;
  TimeOfDay? _pickupTime;
  final _instructionsCtrl = TextEditingController();

  // ── Misc ───────────────────────────────────────────────────────────────────
  bool _isLoading = false;
  String? _error;
  final _imagePicker = ImagePicker();

  // ── Computed ───────────────────────────────────────────────────────────────
  double get _qty => double.tryParse(_quantityCtrl.text) ?? 0;
  double get _unitPrice => double.tryParse(_unitPriceCtrl.text) ?? 0;
  double get _totalMinPrice => _qty * _unitPrice;

  bool get _canStep2 => _wasteType != null && _qty > 0 && _images.isNotEmpty;
  bool get _canStep3 => _unitPrice > 0 && _pickupDate != null;

  // ── Init ───────────────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    final e = widget.existingListing;
    if (e != null) {
      _wasteType = e.wasteType;
      _quantityCtrl.text = e.volume.toStringAsFixed(0);
      _unit = e.unit;
      _unitPriceCtrl.text = e.minBid > 0 && e.volume > 0
          ? (e.minBid / e.volume).toStringAsFixed(0)
          : e.minBid.toStringAsFixed(0);
      if (e.description != null) _descriptionCtrl.text = e.description!;
      if (e.notes != null) _instructionsCtrl.text = e.notes!;
      if (e.collectionDate != null) {
        _pickupDate = e.collectionDate;
        _pickupTime = TimeOfDay.fromDateTime(e.collectionDate!);
      }
    }
  }

  @override
  void dispose() {
    _quantityCtrl.dispose();
    _descriptionCtrl.dispose();
    _unitPriceCtrl.dispose();
    _instructionsCtrl.dispose();
    super.dispose();
  }

  // ── Image helpers ──────────────────────────────────────────────────────────
  Future<void> _pickFromGallery() async {
    final remaining = _maxImages - _images.length;
    if (remaining <= 0) return;
    try {
      final picked = await _imagePicker.pickMultiImage(limit: remaining);
      if (picked.isNotEmpty) setState(() => _images.addAll(picked));
    } catch (_) {}
  }

  Future<void> _pickFromCamera() async {
    if (_images.length >= _maxImages) return;
    try {
      final picked = await _imagePicker.pickImage(source: ImageSource.camera);
      if (picked != null) setState(() => _images.add(picked));
    } catch (_) {}
  }

  void _removeImage(int index) => setState(() => _images.removeAt(index));

  // ── Date / time pickers ───────────────────────────────────────────────────
  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _pickupDate ?? now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _pickupDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _pickupTime ?? const TimeOfDay(hour: 9, minute: 0),
    );
    if (picked != null) setState(() => _pickupTime = picked);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  Future<void> _submit() async {
    final auth = ref.read(authProvider);
    if (auth.user == null) return;

    setState(() { _isLoading = true; _error = null; });

    try {
      final collectionDateStr = _pickupDate != null
          ? DateFormat('yyyy-MM-dd').format(_pickupDate!)
          : null;
      final collectionTimeStr = _pickupTime != null
          ? '${_pickupTime!.hour.toString().padLeft(2, '0')}:${_pickupTime!.minute.toString().padLeft(2, '0')}'
          : null;

      if (widget.existingListing != null) {
        // ── Update existing listing ──────────────────────────────────────────
        final e = widget.existingListing!;
        // Build collectionDate combining picked date + time
        DateTime? collectionDateTime;
        if (_pickupDate != null) {
          final t = _pickupTime ?? const TimeOfDay(hour: 9, minute: 0);
          collectionDateTime = DateTime(
            _pickupDate!.year, _pickupDate!.month, _pickupDate!.day,
            t.hour, t.minute,
          );
        }
        final updated = WasteListing(
          id: e.id,
          businessId: e.businessId,
          businessName: e.businessName,
          wasteType: _wasteType ?? e.wasteType,
          volume: _qty,
          unit: _unit,
          quality: WasteQuality.b,
          photos: e.photos,
          minBid: _totalMinPrice,
          reservePrice: e.reservePrice,
          auctionDuration: e.auctionDuration,
          autoAcceptAbove: e.autoAcceptAbove,
          status: e.status,
          bids: e.bids,
          assignedRecycler: e.assignedRecycler,
          assignedDriver: e.assignedDriver,
          collectionDate: collectionDateTime,
          location: e.location,
          createdAt: e.createdAt,
          description: _descriptionCtrl.text.trim().isNotEmpty
              ? _descriptionCtrl.text.trim()
              : e.description,
          notes: _instructionsCtrl.text.trim().isNotEmpty
              ? _instructionsCtrl.text.trim()
              : e.notes,
        );
        await ref.read(listingsNotifierProvider.notifier).update(updated);

        // Upload new images if any
        final listingId = int.tryParse(e.id);
        if (listingId != null && _images.isNotEmpty) {
          await _uploadImages(listingId);
        }
      } else {
        // ── Create new listing ───────────────────────────────────────────────
        final listing = await ref.read(listingsNotifierProvider.notifier).create(
          businessId: auth.user!.id,
          businessName: auth.user!.displayName,
          wasteType: _wasteType!,
          volume: _qty,
          unit: _unit,
          quality: WasteQuality.b,
          minBid: _totalMinPrice,
          location: 'Kigali, Rwanda',
          description: _descriptionCtrl.text.trim().isNotEmpty
              ? _descriptionCtrl.text.trim()
              : null,
          collectionDate: collectionDateStr,
          collectionTime: collectionTimeStr,
          specialInstructions: _instructionsCtrl.text.trim().isNotEmpty
              ? _instructionsCtrl.text.trim()
              : null,
        );

        // Upload images
        final listingId = int.tryParse(listing.id);
        if (listingId != null && _images.isNotEmpty) {
          await _uploadImages(listingId);
        }
      }

      if (mounted) {
        _showSnack(
          widget.existingListing != null
              ? 'Listing updated successfully!'
              : 'Listing published! Recyclers can now bid.',
          isError: false,
        );
        widget.onDone?.call();
      }
    } catch (e) {
      if (mounted) setState(() => _error = 'Failed: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _uploadImages(int listingId) async {
    for (final img in _images) {
      try {
        final bytes = await img.readAsBytes();
        await ApiService.uploadListingImage(
          listingId,
          bytes,
          img.name,
          mimeType: img.mimeType, // let XFile supply the MIME; falls back to extension
        );
      } catch (e) {
        // Log but continue — listing exists even if one image fails
        debugPrint('[uploadImages] failed for ${img.name}: $e');
      }
    }
    // Refresh listing providers so newly uploaded photos appear immediately
    ref.read(listingsNotifierProvider.notifier).refresh();
  }

  void _showSnack(String msg, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [
        Icon(
          isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
          color: Colors.white, size: 18,
        ),
        const SizedBox(width: 8),
        Expanded(child: Text(msg, style: const TextStyle(color: Colors.white))),
      ]),
      backgroundColor: isError ? AppColors.error : AppColors.success,
      behavior: SnackBarBehavior.floating,
    ));
  }

  // ── Build ──────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existingListing != null;

    final screenWidth = MediaQuery.of(context).size.width;
    return SizedBox(
      width: screenWidth,
      child: ColoredBox(
        color: context.cBg,
        child: Column(
        children: [
          // ── Sticky header ────────────────────────────────────────────────
          _Header(
            step: _step,
            isEdit: isEdit,
            onClose: widget.onDone ?? () => Navigator.of(context).maybePop(),
          ),

          // ── Scrollable content ───────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Error banner
                  if (_error != null) ...[
                    _ErrorBanner(message: _error!),
                    const SizedBox(height: 16),
                  ],

                  // Step indicator dots
                  _StepIndicator(current: _step),
                  const SizedBox(height: 24),

                  // Step content
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 220),
                    transitionBuilder: (child, anim) =>
                        FadeTransition(opacity: anim, child: child),
                    child: KeyedSubtree(
                      key: ValueKey(_step),
                      child: _step == 1
                          ? _Step1(
                              wasteType: _wasteType,
                              onWasteType: (t) => setState(() => _wasteType = t),
                              quantityCtrl: _quantityCtrl,
                              unit: _unit,
                              onUnit: (u) => setState(() => _unit = u),
                              descriptionCtrl: _descriptionCtrl,
                              images: _images,
                              onPickGallery: _pickFromGallery,
                              onPickCamera: _pickFromCamera,
                              onRemoveImage: _removeImage,
                            )
                          : _step == 2
                              ? _Step2(
                                  unit: _unit,
                                  unitPriceCtrl: _unitPriceCtrl,
                                  totalMinPrice: _totalMinPrice,
                                  pickupDate: _pickupDate,
                                  pickupTime: _pickupTime,
                                  onPickDate: _pickDate,
                                  onPickTime: _pickTime,
                                  instructionsCtrl: _instructionsCtrl,
                                )
                              : _Step3(
                                  wasteType: _wasteType,
                                  quantity: _qty,
                                  unit: _unit,
                                  unitPrice: _unitPrice,
                                  totalMinPrice: _totalMinPrice,
                                  pickupDate: _pickupDate,
                                  pickupTime: _pickupTime,
                                  imageCount: _images.length,
                                  description: _descriptionCtrl.text.trim(),
                                ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Sticky footer ────────────────────────────────────────────────
          _Footer(
            step: _step,
            isLoading: _isLoading,
            canNext: _step == 1 ? _canStep2 : _canStep3,
            onBack: _step > 1 ? () => setState(() { _step--; _error = null; }) : null,
            onNext: _step < 3
                ? () {
                    if (_step == 1 && !_canStep2) return;
                    if (_step == 2 && !_canStep3) return;
                    setState(() { _step++; _error = null; });
                  }
                : null,
            onSubmit: _step == 3 ? _submit : null,
          ),
        ],
        ),
      ),
    );
  }
}

// ─── Header ──────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final int step;
  final bool isEdit;
  final VoidCallback onClose;
  const _Header({required this.step, required this.isEdit, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final w = (constraints.maxWidth.isFinite && constraints.maxWidth > 0)
            ? constraints.maxWidth
            : (mq.size.width.isFinite && mq.size.width > 0)
                ? mq.size.width
                : 400.0;
        return Container(
          width: w,
          decoration: BoxDecoration(
            color: context.cSurf,
            border: Border(bottom: BorderSide(color: context.cBorder)),
          ),
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isEdit ? 'Edit Listing' : 'Create New Listing',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: context.cText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Step $step of 3',
                          style: TextStyle(fontSize: 13, color: context.cTextSec),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: onClose,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: context.cSurfAlt,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.close, size: 18, color: context.cText),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────
class _StepIndicator extends StatelessWidget {
  final int current;
  const _StepIndicator({required this.current});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (int step = 1; step <= 3; step++) ...[
          _buildCircle(context, step),
          if (step < 3)
            Expanded(
              child: Container(
                height: 3,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: current > step ? AppColors.primary : context.cSurfAlt,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
        ],
      ],
    );
  }

  Widget _buildCircle(BuildContext context, int step) {
    final done = current > step;
    final active = current == step;
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: (active || done) ? AppColors.primary : context.cSurfAlt,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: done
            ? const Icon(Icons.check, size: 16, color: Colors.white)
            : Text(
                '$step',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: active ? Colors.white : context.cTextSec,
                ),
              ),
      ),
    );
  }
}

// ─── Footer ───────────────────────────────────────────────────────────────────
class _Footer extends StatelessWidget {
  final int step;
  final bool isLoading;
  final bool canNext;
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final VoidCallback? onSubmit;
  const _Footer({
    required this.step,
    required this.isLoading,
    required this.canNext,
    this.onBack,
    this.onNext,
    this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        // Triple-fallback to guarantee a finite, positive width at all times.
        // Flutter Web Scaffold body can give unconstrained (∞) constraints.
        final w = (constraints.maxWidth.isFinite && constraints.maxWidth > 0)
            ? constraints.maxWidth
            : (mq.size.width.isFinite && mq.size.width > 0)
                ? mq.size.width
                : 400.0;
        // Row always gives non-flex children unconstrained horizontal constraints.
        // ElevatedButton's _InputPadding then forces BoxConstraints(w=∞) → crash.
        // Fix: wrap every button in SizedBox with an explicit width so the button
        // always receives tight, finite constraints from SizedBox — not from Row.
        return Container(
          width: w,
          decoration: BoxDecoration(
            color: context.cSurf,
            border: Border(top: BorderSide(color: context.cBorder)),
          ),
          padding: EdgeInsets.fromLTRB(20, 14, 20, 14 + mq.padding.bottom),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Back button — SizedBox gives button tight 90px constraint
              SizedBox(
                width: 90,
                child: onBack != null
                    ? OutlinedButton(
                        onPressed: isLoading ? null : onBack,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: context.cBorder),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text('Back', style: TextStyle(color: context.cText)),
                      )
                    : null,
              ),
              // Next / Submit button — SizedBox gives button tight bounded constraint
              if (step < 3)
                SizedBox(
                  width: 110,
                  child: ElevatedButton(
                    onPressed: (isLoading || !canNext) ? null : onNext,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Next', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                )
              else
                SizedBox(
                  width: 170,
                  child: ElevatedButton.icon(
                    onPressed: isLoading ? null : onSubmit,
                    icon: isLoading
                        ? const SizedBox(
                            width: 16, height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.check_circle_outline, size: 18),
                    label: Text(isLoading ? 'Publishing…' : 'Publish Listing',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF16A34A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

// ─── Error banner ─────────────────────────────────────────────────────────────
class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Text(message,
          style: const TextStyle(fontSize: 13, color: Color(0xFFB91C1C))),
    );
  }
}

// ─── Step 1: Waste Details ────────────────────────────────────────────────────
class _Step1 extends StatelessWidget {
  final WasteType? wasteType;
  final ValueChanged<WasteType> onWasteType;
  final TextEditingController quantityCtrl;
  final String unit;
  final ValueChanged<String> onUnit;
  final TextEditingController descriptionCtrl;
  final List<XFile> images;
  final VoidCallback onPickGallery;
  final VoidCallback onPickCamera;
  final ValueChanged<int> onRemoveImage;

  const _Step1({
    required this.wasteType,
    required this.onWasteType,
    required this.quantityCtrl,
    required this.unit,
    required this.onUnit,
    required this.descriptionCtrl,
    required this.images,
    required this.onPickGallery,
    required this.onPickCamera,
    required this.onRemoveImage,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepTitle(context, 'Waste Details'),
        const SizedBox(height: 16),

        // Waste type
        _Label('Waste Type *'),
        const SizedBox(height: 6),
        _DropdownField<WasteType>(
          value: wasteType,
          hint: 'Select waste type…',
          items: _wasteTypeOptions,
          itemLabel: (t) => t.label,
          onChanged: onWasteType,
        ),
        const SizedBox(height: 16),

        // Quantity + unit
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Label('Quantity *'),
                  const SizedBox(height: 6),
                  _InputField(
                    controller: quantityCtrl,
                    hint: 'e.g. 500',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 96,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Label('Unit'),
                  const SizedBox(height: 6),
                  _DropdownField<String>(
                    value: unit,
                    items: const ['kg', 'liters'],
                    itemLabel: (u) => u,
                    onChanged: onUnit,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Description
        _Label('Description'),
        const SizedBox(height: 6),
        _InputField(
          controller: descriptionCtrl,
          hint: 'Describe quality and source…',
          maxLines: 3,
        ),
        const SizedBox(height: 16),

        // Images
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _Label('Images * (max $_maxImages)'),
            Text(
              '${images.length}/$_maxImages',
              style: const TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Pick buttons
        Row(
          children: [
            Expanded(
              child: _ImagePickBtn(
                icon: Icons.photo_library_outlined,
                label: 'Gallery',
                onTap: images.length < _maxImages ? onPickGallery : null,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ImagePickBtn(
                icon: Icons.camera_alt_outlined,
                label: 'Camera',
                onTap: images.length < _maxImages ? onPickCamera : null,
              ),
            ),
          ],
        ),

        // Image previews
        if (images.isNotEmpty) ...[
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: images.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemBuilder: (ctx, idx) => _ImagePreviewTile(
              file: images[idx],
              isPrimary: idx == 0,
              onRemove: () => onRemoveImage(idx),
            ),
          ),
        ] else ...[
          const SizedBox(height: 8),
          Text(
            'Add at least 1 photo of the waste',
            style: TextStyle(fontSize: 12, color: context.cTextSec),
          ),
        ],
      ],
    ).animate().fadeIn(duration: 220.ms);
  }
}

// ─── Step 2: Pickup & Pricing ─────────────────────────────────────────────────
class _Step2 extends StatelessWidget {
  final String unit;
  final TextEditingController unitPriceCtrl;
  final double totalMinPrice;
  final DateTime? pickupDate;
  final TimeOfDay? pickupTime;
  final VoidCallback onPickDate;
  final VoidCallback onPickTime;
  final TextEditingController instructionsCtrl;

  const _Step2({
    required this.unit,
    required this.unitPriceCtrl,
    required this.totalMinPrice,
    required this.pickupDate,
    required this.pickupTime,
    required this.onPickDate,
    required this.onPickTime,
    required this.instructionsCtrl,
  });

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat('#,###', 'en_US');
    final dateFmt = DateFormat('dd MMM yyyy');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepTitle(context, 'Pickup & Pricing'),
        const SizedBox(height: 16),

        // Unit price
        _Label('Price per $unit (RWF) *'),
        const SizedBox(height: 6),
        _InputField(
          controller: unitPriceCtrl,
          hint: 'e.g. 500',
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))],
        ),
        const SizedBox(height: 4),
        Text(
          'Minimum bid = Quantity × Price per $unit',
          style: TextStyle(fontSize: 11, color: context.cTextSec),
        ),
        const SizedBox(height: 12),

        // Total min price preview
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Minimum Bid',
                  style: TextStyle(fontSize: 13, color: context.cTextSec)),
              Text(
                'RWF ${fmt.format(totalMinPrice)}',
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Pickup date + time side by side
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Label('Pickup Date *'),
                  const SizedBox(height: 6),
                  _TapField(
                    text: pickupDate != null ? dateFmt.format(pickupDate!) : null,
                    hint: 'Select date',
                    icon: Icons.calendar_today_outlined,
                    onTap: onPickDate,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Label('Pickup Time'),
                  const SizedBox(height: 6),
                  _TapField(
                    text: pickupTime != null
                        ? pickupTime!.format(context)
                        : null,
                    hint: 'Select time',
                    icon: Icons.access_time_rounded,
                    onTap: onPickTime,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Special instructions
        _Label('Special Instructions'),
        const SizedBox(height: 6),
        _InputField(
          controller: instructionsCtrl,
          hint: 'Loading dock access, contact person, etc.',
          maxLines: 3,
        ),
      ],
    ).animate().fadeIn(duration: 220.ms);
  }
}

// ─── Step 3: Review & Submit ──────────────────────────────────────────────────
class _Step3 extends StatelessWidget {
  final WasteType? wasteType;
  final double quantity;
  final String unit;
  final double unitPrice;
  final double totalMinPrice;
  final DateTime? pickupDate;
  final TimeOfDay? pickupTime;
  final int imageCount;
  final String description;

  const _Step3({
    required this.wasteType,
    required this.quantity,
    required this.unit,
    required this.unitPrice,
    required this.totalMinPrice,
    required this.pickupDate,
    required this.pickupTime,
    required this.imageCount,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final numFmt = NumberFormat('#,###', 'en_US');
    final dateFmt = DateFormat('dd MMM yyyy');
    final pickupStr = [
      pickupDate != null ? dateFmt.format(pickupDate!) : '—',
      if (pickupTime != null) pickupTime!.format(context),
    ].join(' ');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepTitle(context, 'Review & Submit'),
        const SizedBox(height: 16),

        // Summary card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: context.cSurf,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: context.cBorder),
          ),
          child: Column(
            children: [
              _ReviewRow('Waste Type', wasteType?.label ?? '—'),
              _ReviewRow('Quantity', '$quantity $unit'),
              _ReviewRow('Price per $unit', 'RWF ${numFmt.format(unitPrice)}'),
              _ReviewRow(
                'Minimum Bid (Qty × Price)',
                'RWF ${numFmt.format(totalMinPrice)}',
                highlight: true,
              ),
              _ReviewRow('Pickup', pickupStr),
              _ReviewRow('Images', '$imageCount/$_maxImages selected'),
              if (description.isNotEmpty)
                _ReviewRow('Description', description, multiLine: true),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Warning
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.warning_amber_rounded,
                  size: 18, color: Color(0xFFB45309)),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'After publishing, this listing becomes visible to recyclers '
                  'and bidding can start immediately.',
                  style: TextStyle(fontSize: 13, color: Color(0xFFB45309)),
                ),
              ),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 220.ms);
  }
}

// ─── Small shared widgets ─────────────────────────────────────────────────────

Widget _stepTitle(BuildContext context, String title) => Text(
      title,
      style: TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.w800,
        color: context.cText,
      ),
    );

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: context.cText,
        ),
      );
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final int maxLines;

  const _InputField({
    required this.controller,
    required this.hint,
    this.keyboardType,
    this.inputFormatters,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      maxLines: maxLines,
      style: TextStyle(fontSize: 14, color: context.cText),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: context.cTextSec, fontSize: 14),
        filled: true,
        fillColor: context.cSurf,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: context.cBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: context.cBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  final T? value;
  final String? hint;
  final List<T> items;
  final String Function(T) itemLabel;
  final ValueChanged<T> onChanged;

  const _DropdownField({
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
    this.hint,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: context.cBorder),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: DropdownButton<T>(
        value: value,
        hint: hint != null
            ? Text(hint!, style: TextStyle(fontSize: 14, color: context.cTextSec))
            : null,
        isExpanded: true,
        underline: const SizedBox(),
        dropdownColor: context.cSurf,
        items: items.map((item) => DropdownMenuItem<T>(
          value: item,
          child: Text(itemLabel(item),
              style: TextStyle(fontSize: 14, color: context.cText)),
        )).toList(),
        onChanged: (v) { if (v != null) onChanged(v); },
      ),
    );
  }
}

class _TapField extends StatelessWidget {
  final String? text;
  final String hint;
  final IconData icon;
  final VoidCallback onTap;

  const _TapField({
    required this.text,
    required this.hint,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final hasValue = text != null && text!.isNotEmpty;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: hasValue ? AppColors.primary : context.cBorder,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                size: 16,
                color: hasValue ? AppColors.primary : context.cTextSec),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                hasValue ? text! : hint,
                style: TextStyle(
                  fontSize: 13,
                  color: hasValue ? context.cText : context.cTextSec,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImagePickBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _ImagePickBtn({required this.icon, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    final disabled = onTap == null;
    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: disabled ? 0.4 : 1.0,
        child: Container(
          height: 72,
          decoration: BoxDecoration(
            color: context.cSurfAlt,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.primary.withValues(alpha: 0.35),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: AppColors.primary, size: 24),
              const SizedBox(height: 4),
              Text(label,
                  style: TextStyle(fontSize: 12, color: context.cTextSec)),
            ],
          ),
        ),
      ),
    );
  }
}


class _ImagePreviewTile extends StatelessWidget {
  final XFile file;
  final bool isPrimary;
  final VoidCallback onRemove;

  const _ImagePreviewTile({
    required this.file,
    required this.isPrimary,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    Widget imageWidget;
    if (kIsWeb) {
      imageWidget = FutureBuilder<Uint8List>(
        future: file.readAsBytes(),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return Image.memory(snapshot.data!, fit: BoxFit.cover);
          }
          return const Center(child: CircularProgressIndicator());
        },
      );
    } else {
      imageWidget = Image.file(
        File(file.path),
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          color: AppColors.primaryLight,
          child: const Icon(Icons.image_not_supported_outlined, color: AppColors.primary),
        ),
      );
    }
    return Stack(
      fit: StackFit.expand,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: imageWidget,
        ),
        // Filename overlay
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: ClipRRect(
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(10)),
            child: Container(
              color: Colors.black54,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
              child: Text(
                file.name,
                style: const TextStyle(color: Colors.white, fontSize: 9),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ),
        // Primary badge
        if (isPrimary)
          Positioned(
            top: 4, left: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text('Primary',
                  style: TextStyle(color: Colors.white, fontSize: 9)),
            ),
          ),
        // Remove button
        Positioned(
          top: 4, right: 4,
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              width: 20, height: 20,
              decoration: const BoxDecoration(
                color: Colors.black54,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close, color: Colors.white, size: 12),
            ),
          ),
        ),
      ],
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;
  final bool multiLine;

  const _ReviewRow(this.label, this.value,
      {this.highlight = false, this.multiLine = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: multiLine
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(fontSize: 12, color: context.cTextSec)),
                const SizedBox(height: 3),
                Text(value,
                    style: TextStyle(fontSize: 13, color: context.cText)),
              ],
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label,
                    style: TextStyle(fontSize: 13, color: context.cTextSec)),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: highlight ? AppColors.primary : context.cText,
                  ),
                ),
              ],
            ),
    );
  }
}
