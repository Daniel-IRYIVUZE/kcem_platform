import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../shared/live_tracking_screen.dart';
import '../shared/widgets/offline_banner.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/services/api_service.dart';
import '../../core/services/offline_sync_service.dart';

class CollectionScreen extends ConsumerStatefulWidget {
  const CollectionScreen({super.key});

  @override
  ConsumerState<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends ConsumerState<CollectionScreen> {
  int _step = 0;
  String _filter = 'started';
  bool _isLoading = false;

  // 3 steps: Arrive & Photo → Weigh → Complete (no PIN)
  final List<String> _steps = ['Arrive & Photo', 'Weigh', 'Complete'];

  final TextEditingController _weightCtrl = TextEditingController();
  String _unit = 'kg';
  final List<XFile> _arrivalPhotos = [];
  final List<XFile> _weighPhotos = [];
  final _imagePicker = ImagePicker();

  double? _capturedWeight;
  Map<String, dynamic> _lastAdvanceResult = {};

  @override
  void dispose() {
    _weightCtrl.dispose();
    super.dispose();
  }

  Future<bool> _isOnline() async {
    final result = await Connectivity().checkConnectivity();
    return result != ConnectivityResult.none;
  }

  /// Request camera permission before opening camera or QR scanner.
  /// Returns true if granted, shows a settings prompt if permanently denied.
  Future<bool> _requestCamera() async {
    if (kIsWeb) return true;
    final status = await Permission.camera.request();
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied && mounted) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Camera Permission Required'),
          content: const Text(
            'Camera access is needed to take photos and scan QR codes. '
            'Please enable it in app settings.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                openAppSettings();
              },
              child: const Text('Open Settings'),
            ),
          ],
        ),
      );
    }
    return false;
  }

  /// Advance collection status — queues offline when no connectivity.
  Future<void> _advance(Collection? collection, {double? actualWeight, String? notes}) async {
    final collectionId = int.tryParse(collection?.id ?? '');
    if (collectionId == null) {
      setState(() => _step++);
      return;
    }

    setState(() => _isLoading = true);
    try {
      final online = await _isOnline();
      if (!online) {
        // Queue for later sync
        await OfflineSyncService.queue(
          'POST',
          '/collections/$collectionId/advance',
          {
            if (actualWeight != null) 'actual_weight': actualWeight,
            if (notes != null) 'notes': notes,
          },
        );
        if (mounted) {
          setState(() {
            _lastAdvanceResult = {};
            _step++;
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Row(children: [
                Icon(Icons.cloud_off, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text('Saved offline — will sync when connected'),
              ]),
              backgroundColor: AppColors.warning,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }

      final result = await ref
          .read(collectionsNotifierProvider.notifier)
          .advanceStatus(collectionId, actualWeight: actualWeight, notes: notes);

      if (mounted) {
        setState(() {
          _lastAdvanceResult = result;
          _step++;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  /// Take arrival photo with camera — auto-advances to weigh step when done.
  Future<void> _takeArrivalPhoto(Collection? collection) async {
    if (!await _requestCamera()) return;
    try {
      // On web use gallery (file picker); on mobile always open camera
      final source = kIsWeb ? ImageSource.gallery : ImageSource.camera;
      final image = await _imagePicker.pickImage(
        source: source,
        imageQuality: 75,
        preferredCameraDevice: CameraDevice.rear,
      );
      if (image == null) return;

      setState(() {
        _arrivalPhotos.add(image);
        _isLoading = true;
      });

      // Upload proof photo to backend (only when online)
      final collectionId = int.tryParse(collection?.id ?? '');
      if (collectionId != null) {
        final online = await _isOnline();
        if (online) {
          try {
            final bytes = await image.readAsBytes();
            await ApiService.uploadCollectionProof(collectionId, bytes, image.name);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Row(children: [
                    Icon(Icons.cloud_done, color: Colors.white, size: 16),
                    SizedBox(width: 8),
                    Text('Photo uploaded successfully'),
                  ]),
                  backgroundColor: AppColors.primary,
                  behavior: SnackBarBehavior.floating,
                  duration: Duration(seconds: 2),
                ),
              );
            }
          } catch (_) {
            // Non-fatal — show warning but still advance
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Row(children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.white, size: 16),
                    SizedBox(width: 8),
                    Text('Photo upload failed — re-take when back online'),
                  ]),
                  backgroundColor: AppColors.warning,
                  behavior: SnackBarBehavior.floating,
                  duration: Duration(seconds: 3),
                ),
              );
            }
          }
        } else {
          // Offline — skip upload, arrival advance will be queued instead
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Row(children: [
                  Icon(Icons.cloud_off, color: Colors.white, size: 16),
                  SizedBox(width: 8),
                  Text('Offline — photo skipped, arrival will sync when connected'),
                ]),
                backgroundColor: AppColors.warning,
                behavior: SnackBarBehavior.floating,
                duration: Duration(seconds: 3),
              ),
            );
          }
        }
      }

      // Auto-advance to weigh step — no extra button click needed
      await _advance(collection, notes: 'Driver arrived and confirmed with photo');
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open camera. Please try again.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _addWeighPhoto() async {
    if (!await _requestCamera()) return;
    try {
      final image = await _imagePicker.pickImage(
        source: kIsWeb ? ImageSource.gallery : ImageSource.camera,
        imageQuality: 75,
        preferredCameraDevice: CameraDevice.rear,
      );
      if (image != null) setState(() => _weighPhotos.add(image));
    } catch (_) {}
  }

  /// Open QR scanner — when a valid token is scanned and matches the assigned
  /// collection, the backend marks it as 'collected' and we jump to the
  /// Complete step automatically.
  Future<void> _scanQrCode(Collection? collection) async {
    final collectionId = int.tryParse(collection?.id ?? '');
    if (collectionId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No active collection to verify.'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    // Require internet — QR verification must happen server-side
    final online = await _isOnline();
    if (!online) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(children: [
            Icon(Icons.cloud_off, color: Colors.white, size: 16),
            SizedBox(width: 8),
            Text('No internet — QR scan requires connection'),
          ]),
          backgroundColor: AppColors.warning,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    // Ensure camera permission before opening the scanner
    if (!await _requestCamera()) return;

    // Navigate to QR scanner — returns the scanned token string
    final token = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const _QrScannerPage()),
    );

    if (token == null || !mounted) return;

    setState(() => _isLoading = true);
    try {
      final result = await ApiService.scanQrToken(token);
      final returnedCollectionId = result['collection_id'] as int?;

      if (returnedCollectionId == collectionId) {
        // Refresh collection list via the notifier's public refresh method
        await ref.read(collectionsNotifierProvider.notifier).refresh();
        if (mounted) {
          setState(() {
            _step = 2; // Jump straight to Complete
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Row(children: [
                Icon(Icons.check_circle, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text('QR verified! Collection marked as collected.'),
              ]),
              backgroundColor: AppColors.primary,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } else {
        // Token is valid but doesn't match this collection
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('QR code does not match this collection.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        final msg = e.toString().contains('not assigned')
            ? 'This collection is not assigned to you.'
            : 'QR scan failed. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final collections = ref.watch(driverCollectionsProvider);
    final started = collections.where((c) =>
        c.status == CollectionStatus.enRoute ||
        c.status == CollectionStatus.scheduled ||
        c.status == CollectionStatus.collected).toList();
    final done = collections.where((c) =>
        c.status == CollectionStatus.completed ||
        c.status == CollectionStatus.verified ||
        c.status == CollectionStatus.missed).toList();
    final visible = _filter == 'started' ? started : done;
    final currentCollection = visible.isNotEmpty ? visible.first : null;
    final completedCount = done.length;

    final route = ref.watch(driverRouteProvider);
    final stops = route.stops;
    final stopIdx = stops.indexWhere((s) =>
        s.status == RouteStopStatus.collecting ||
        s.status == RouteStopStatus.arrived ||
        s.status == RouteStopStatus.pending);
    final currentStop = stopIdx >= 0 ? stops[stopIdx] : (stops.isNotEmpty ? stops.first : null);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Collection'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _filter,
                borderRadius: BorderRadius.circular(10),
                items: const [
                  DropdownMenuItem(value: 'started', child: Text('Started')),
                  DropdownMenuItem(value: 'done', child: Text('Done')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => _filter = value);
                },
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Chip(
              label: Text('Stop ${completedCount + 1} of ${stops.length}',
                  style: const TextStyle(fontSize: 12, color: AppColors.primary)),
              backgroundColor: AppColors.primaryLight,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          _StepBar(current: _step, steps: _steps),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 350),
                transitionBuilder: (child, anim) => SlideTransition(
                  position: Tween<Offset>(
                          begin: const Offset(0.3, 0), end: Offset.zero)
                      .animate(anim),
                  child: FadeTransition(opacity: anim, child: child),
                ),
                child: [
                  _ArriveStep(
                    stop: currentStop,
                    currentCollection: currentCollection,
                    isLoading: _isLoading,
                    arrivalPhotos: _arrivalPhotos,
                    onTakePhoto: () => _takeArrivalPhoto(currentCollection),
                    onScanQr: () => _scanQrCode(currentCollection),
                  ),
                  _WeighStep(
                    weightCtrl: _weightCtrl,
                    unit: _unit,
                    photos: _weighPhotos,
                    expectedVolume: currentCollection?.volume,
                    onUnitChange: (u) => setState(() => _unit = u),
                    onAddPhoto: _addWeighPhoto,
                    isLoading: _isLoading,
                    onConfirm: () {
                      _capturedWeight = double.tryParse(_weightCtrl.text);
                      if (_capturedWeight == null || _capturedWeight! <= 0) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Please enter the actual weight collected'),
                            behavior: SnackBarBehavior.floating,
                            backgroundColor: AppColors.warning,
                          ),
                        );
                        return;
                      }
                      _advance(
                        currentCollection,
                        actualWeight: _capturedWeight,
                        notes: 'Weight recorded: $_capturedWeight kg',
                      );
                    },
                  ),
                  _CompleteStep(
                    collection: currentCollection,
                    actualWeight: _capturedWeight,
                    advanceResult: _lastAdvanceResult,
                    arrivalPhotoCount: _arrivalPhotos.length,
                    weighPhotoCount: _weighPhotos.length,
                    onDone: () => setState(() {
                      _step = 0;
                      _weightCtrl.clear();
                      _arrivalPhotos.clear();
                      _weighPhotos.clear();
                      _capturedWeight = null;
                      _lastAdvanceResult = {};
                    }),
                  ),
                ][_step],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Step Bar ─────────────────────────────────────────────────────────────────

class _StepBar extends StatelessWidget {
  final int current;
  final List<String> steps;
  const _StepBar({required this.current, required this.steps});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: context.cSurf,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      child: Row(
        children: List.generate(steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            final idx = i ~/ 2;
            return Expanded(
              child: Container(
                height: 2,
                color: idx < current ? AppColors.primary : context.cBorder,
              ),
            );
          }
          final idx = i ~/ 2;
          final done = idx < current;
          final active = idx == current;
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: done
                      ? AppColors.primary
                      : active
                          ? context.cPrimaryLight
                          : context.cSurf,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: done || active ? AppColors.primary : context.cBorder,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: done
                      ? const Icon(Icons.check, color: Colors.white, size: 14)
                      : Text('${idx + 1}',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: active ? AppColors.primary : context.cTextSec,
                          )),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                steps[idx],
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: active || done ? FontWeight.w600 : FontWeight.w400,
                  color: active || done ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}

// ─── Step 1 — Arrive & Confirm with Photo ─────────────────────────────────────

class _ArriveStep extends StatelessWidget {
  final RouteStop? stop;
  final Collection? currentCollection;
  final bool isLoading;
  final List<XFile> arrivalPhotos;
  final VoidCallback onTakePhoto;
  final VoidCallback onScanQr;

  const _ArriveStep({
    required this.onTakePhoto,
    required this.onScanQr,
    this.stop,
    this.currentCollection,
    this.isLoading = false,
    this.arrivalPhotos = const [],
  });

  @override
  Widget build(BuildContext context) {
    final businessName = currentCollection?.businessName ?? stop?.businessName ?? 'Business';
    final location = currentCollection?.location ?? stop?.location ?? 'Kigali';
    final wasteLabel = currentCollection?.wasteType.label ?? stop?.wasteType.label ?? 'Waste';
    final unit = (currentCollection?.wasteType ?? stop?.wasteType) == WasteType.uco ? 'L' : 'kg';
    final volume = currentCollection?.volume.toStringAsFixed(0) ?? stop?.volume.toStringAsFixed(0) ?? '—';
    final scheduledTime = currentCollection?.scheduledTime ?? stop?.eta ?? '';
    final notes = currentCollection?.notes;
    final hasPhoto = arrivalPhotos.isNotEmpty;

    return Column(
      key: const ValueKey('arrive'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (currentCollection != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => LiveTrackingScreen(
                            collection: currentCollection!,
                            pushDriverLocation: true,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.map, size: 16),
                    label: const Text('Show Map & Navigate'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 42),
                    ),
                  ),
                ),
              Row(
                children: [
                  const Icon(Icons.business, color: AppColors.primary),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(businessName,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 2),
                        Text(location,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final phone = currentCollection?.contactPhone ?? '';
                      if (phone.isNotEmpty) {
                        final uri = Uri(scheme: 'tel', path: phone);
                        if (await canLaunchUrl(uri)) await launchUrl(uri);
                      }
                    },
                    icon: const Icon(Icons.call, size: 14),
                    label: const Text('Call'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 34),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                      textStyle: const TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              _DetailRow(icon: Icons.recycling, label: 'Waste Type', value: wasteLabel),
              const SizedBox(height: 8),
              _DetailRow(icon: Icons.inventory_2, label: 'Est. Volume', value: '$volume $unit'),
              if (scheduledTime.isNotEmpty) ...[
                const SizedBox(height: 8),
                _DetailRow(icon: Icons.access_time, label: 'Scheduled', value: scheduledTime),
              ],
            ],
          ),
        ),

        if (notes != null && notes.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Collection Notes',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppColors.warning, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(notes,
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 20),

        // Arrival photo confirmation section
        _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.camera_alt, color: AppColors.primary, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Confirm Arrival with Photo',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        SizedBox(height: 2),
                        Text(
                          'Take a photo of the waste to auto-confirm your arrival',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (hasPhoto) ...[
                const SizedBox(height: 12),
                SizedBox(
                  height: 80,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: arrivalPhotos.length,
                    itemBuilder: (ctx, i) => Container(
                      width: 80,
                      height: 80,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(9),
                        child: kIsWeb
                            ? FutureBuilder<Uint8List>(
                                future: arrivalPhotos[i].readAsBytes(),
                                builder: (context, snapshot) {
                                  if (snapshot.hasData) {
                                    return Image.memory(snapshot.data!, fit: BoxFit.cover);
                                  }
                                  return const Center(child: CircularProgressIndicator());
                                },
                              )
                            : Image.file(File(arrivalPhotos[i].path), fit: BoxFit.cover),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle, color: AppColors.primary, size: 16),
                      SizedBox(width: 6),
                      Text('Photo captured — advancing to weighing...',
                          style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 24),

        // QR scan button — scans listing QR code and auto-marks as collected
        ElevatedButton.icon(
          onPressed: isLoading ? null : onScanQr,
          icon: isLoading
              ? const SizedBox(
                  width: 18, height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.qr_code_scanner, size: 20),
          label: Text(
            isLoading ? 'Verifying...' : 'Scan QR Code',
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          ),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 56),
            backgroundColor: AppColors.primary,
          ),
        ),
        const SizedBox(height: 10),

        // Divider with "or"
        Row(children: [
          const Expanded(child: Divider()),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text('or', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          ),
          const Expanded(child: Divider()),
        ]),
        const SizedBox(height: 10),

        // Take arrival photo button — auto-advances when photo taken
        OutlinedButton.icon(
          onPressed: isLoading ? null : onTakePhoto,
          icon: const Icon(Icons.camera_alt, size: 20),
          label: const Text(
            'Take Arrival Photo',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
          ),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 52),
          ),
        ),
        const SizedBox(height: 8),
        const Center(
          child: Text(
            'Scan QR to instantly confirm collection, or take a photo to confirm arrival',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }
}

// ─── Step 2 — Weigh & Log ─────────────────────────────────────────────────────

class _WeighStep extends StatelessWidget {
  final TextEditingController weightCtrl;
  final String unit;
  final List<XFile> photos;
  final double? expectedVolume;
  final ValueChanged<String> onUnitChange;
  final VoidCallback onAddPhoto;
  final VoidCallback onConfirm;
  final bool isLoading;

  const _WeighStep({
    required this.weightCtrl,
    required this.unit,
    required this.photos,
    this.expectedVolume,
    required this.onUnitChange,
    required this.onAddPhoto,
    required this.onConfirm,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      key: const ValueKey('weigh'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Info banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.primary, size: 18),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Arrival confirmed! Now record the actual weight collected.',
                  style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Weight entry
        _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Actual Weight Collected',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: weightCtrl,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      autofocus: true,
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                      decoration: InputDecoration(
                        hintText: '0.0',
                        hintStyle: TextStyle(
                            color: AppColors.textSecondary.withValues(alpha: 0.4)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(value: 'kg', label: Text('kg')),
                      ButtonSegment(value: 'tonnes', label: Text('T')),
                    ],
                    selected: {unit},
                    onSelectionChanged: (s) => onUnitChange(s.first),
                    style: SegmentedButton.styleFrom(
                      selectedBackgroundColor: AppColors.primary,
                      selectedForegroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
              if (expectedVolume != null && expectedVolume! > 0) ...[
                const SizedBox(height: 8),
                _DetailRow(
                  icon: Icons.inventory_2,
                  label: 'Expected',
                  value: '${expectedVolume!.toStringAsFixed(0)} kg',
                  small: true,
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Photos of waste collected
        _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Additional Photos (Optional)',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  Text('${photos.length}/5',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 4),
              const Text('Photos of the waste being collected',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              const SizedBox(height: 12),
              SizedBox(
                height: 90,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ...photos.asMap().entries.map((e) => Container(
                          width: 80,
                          height: 80,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(9),
                            child: kIsWeb
                              ? FutureBuilder<Uint8List>(
                                  future: e.value.readAsBytes(),
                                  builder: (context, snapshot) {
                                    if (snapshot.hasData) {
                                      return Image.memory(snapshot.data!, fit: BoxFit.cover);
                                    }
                                    return const Center(child: CircularProgressIndicator());
                                  },
                                )
                              : Image.file(File(e.value.path), fit: BoxFit.cover),
                          ),
                        )),
                    if (photos.length < 5)
                      GestureDetector(
                        onTap: onAddPhoto,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: context.cSurf,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: context.cBorder),
                          ),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.camera_alt, color: AppColors.primary, size: 24),
                              SizedBox(height: 4),
                              Text('Photo',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : onConfirm,
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
          child: isLoading
              ? const SizedBox(
                  height: 20, width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text('Confirm Collection',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }
}

// ─── Step 3 — Complete ────────────────────────────────────────────────────────

class _CompleteStep extends StatelessWidget {
  final Collection? collection;
  final double? actualWeight;
  final Map<String, dynamic> advanceResult;
  final int arrivalPhotoCount;
  final int weighPhotoCount;
  final VoidCallback onDone;

  const _CompleteStep({
    required this.onDone,
    this.collection,
    this.actualWeight,
    this.advanceResult = const {},
    this.arrivalPhotoCount = 0,
    this.weighPhotoCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    final hotelName = collection?.businessName ?? 'Business';
    final wasteLabel = collection?.wasteType.label ?? 'Waste';
    final weight = actualWeight ?? collection?.actualWeight;
    final weightStr = weight != null ? '${weight.toStringAsFixed(1)} kg' : '—';
    final earnings = collection?.earnings ?? 0.0;
    final now = TimeOfDay.now();
    final timeStr = '${now.hourOfPeriod}:${now.minute.toString().padLeft(2, '0')} '
        '${now.period == DayPeriod.am ? 'AM' : 'PM'}';
    final totalPhotos = arrivalPhotoCount + weighPhotoCount;

    return Column(
      key: const ValueKey('complete'),
      children: [
        const SizedBox(height: 24),
        Container(
          width: 100, height: 100,
          decoration: const BoxDecoration(
            gradient: AppColors.primaryGradient,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle_outline, color: Colors.white, size: 56),
        ).animate().scale(delay: 100.ms, duration: 500.ms, curve: Curves.elasticOut),
        const SizedBox(height: 20),
        const Text(
          'Collection Complete!',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 22),
        ),
        const SizedBox(height: 6),
        const Text(
          'Great work! This stop is marked as collected.',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 28),
        _Card(
          child: Column(
            children: [
              _SummaryRow(label: 'Business', value: hotelName),
              _SummaryRow(label: 'Waste Type', value: wasteLabel),
              _SummaryRow(label: 'Actual Weight', value: weightStr),
              _SummaryRow(label: 'Photos Taken', value: '$totalPhotos photo(s)'),
              _SummaryRow(label: 'Collection Time', value: timeStr),
            ],
          ),
        ),
        const SizedBox(height: 20),
        _Card(
          color: AppColors.primaryLight,
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                child: const Icon(Icons.payments, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Earnings for this stop',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  Text(
                    earnings > 0 ? 'RWF ${earnings.toStringAsFixed(0)}' : 'Pending',
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.primary),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: onDone,
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
          child: const Text('Next Stop →', style: TextStyle(fontWeight: FontWeight.w700)),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: onDone,
          child: const Text('Report an Issue'),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }
}

// ─── Shared Widgets ───────────────────────────────────────────────────────────

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  final Color? color;
  const _Card({required this.child, this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color ?? context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: color == null ? Border.all(color: context.cBorder) : null,
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)
        ],
      ),
      child: child,
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool small;
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.small = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: small ? 14 : 16, color: AppColors.primary),
        const SizedBox(width: 8),
        Text('$label: ',
            style: TextStyle(color: AppColors.textSecondary, fontSize: small ? 12 : 13)),
        Expanded(
          child: Text(value,
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: small ? 12 : 13),
              overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }
}

// ─── QR Scanner Page ──────────────────────────────────────────────────────────

class _QrScannerPage extends StatefulWidget {
  const _QrScannerPage();

  @override
  State<_QrScannerPage> createState() => _QrScannerPageState();
}

class _QrScannerPageState extends State<_QrScannerPage> {
  final MobileScannerController _ctrl = MobileScannerController();
  bool _scanned = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text('Scan Collection QR'),
        actions: [
          IconButton(
            onPressed: () => _ctrl.toggleTorch(),
            icon: const Icon(Icons.flashlight_on, color: Colors.white),
            tooltip: 'Toggle torch',
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _ctrl,
            onDetect: (capture) {
              if (_scanned) return;
              for (final barcode in capture.barcodes) {
                final value = barcode.rawValue;
                if (value != null && value.isNotEmpty) {
                  setState(() => _scanned = true);
                  Navigator.of(context).pop(value);
                  return;
                }
              }
            },
          ),
          // Scan frame overlay
          Center(
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 3),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          const Positioned(
            bottom: 48,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'Point camera at the listing QR code',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  shadows: [Shadow(blurRadius: 4, color: Colors.black)],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
