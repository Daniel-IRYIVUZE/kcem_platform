import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../shared/live_tracking_screen.dart';
import '../shared/widgets/offline_banner.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/services/api_service.dart';

class CollectionScreen extends ConsumerStatefulWidget {
  const CollectionScreen({super.key});

  @override
  ConsumerState<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends ConsumerState<CollectionScreen> {
  bool _isLoading = false;

  @override
  void dispose() {
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

    // Support JSON-encoded QR (new rich format: {"t":"<token>", ...})
    String extractedToken = token;
    try {
      final qrData = jsonDecode(token) as Map<String, dynamic>;
      extractedToken = (qrData['t'] ?? qrData['token'] ?? token).toString();
    } catch (_) {
      // Not JSON — use raw token string (legacy format)
    }

    setState(() => _isLoading = true);
    try {
      final result = await ApiService.scanQrToken(extractedToken);
      final returnedCollectionId = result['collection_id'] as int?;

      if (returnedCollectionId == collectionId) {
        // Refresh collection list — moves item from active to collected
        await ref.read(collectionsNotifierProvider.notifier).refresh();
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Row(children: [
                Icon(Icons.check_circle, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text('Collected! Proceeding to next stop…'),
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
        final err = e.toString();
        final String msg;
        if (err.contains('not assigned') || err.contains('not authorised') || err.contains('403')) {
          msg = 'This QR code belongs to a different driver\'s collection. You are not authorised to scan it.';
        } else if (err.contains('Invalid QR') || err.contains('404')) {
          msg = 'Invalid QR code. Please make sure you are scanning the correct listing code.';
        } else if (err.contains('No collection')) {
          msg = 'No collection has been assigned for this listing yet.';
        } else {
          msg = 'QR scan failed. Please try again.';
        }
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
    final active = collections.where((c) =>
        c.status == CollectionStatus.enRoute ||
        c.status == CollectionStatus.scheduled).toList();
    final collectedItems = collections.where((c) =>
        c.status == CollectionStatus.collected ||
        c.status == CollectionStatus.completed ||
        c.status == CollectionStatus.verified).toList();
    final currentCollection = active.isNotEmpty ? active.first : null;

    final upcomingCollections =
        active.length > 1 ? active.sublist(1) : <Collection>[];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Collection'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Chip(
              label: Text(
                '${collectedItems.length} Collected',
                style: const TextStyle(fontSize: 11, color: AppColors.primary),
              ),
              backgroundColor: AppColors.primaryLight,
              padding: EdgeInsets.zero,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(collectionsNotifierProvider.notifier).refresh(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Active collection QR scan card ──────────────────
                    if (currentCollection != null) ...[
                      _QrScanCard(
                        collection: currentCollection,
                        isLoading: _isLoading,
                        onScan: () => _scanQrCode(currentCollection),
                      ),
                    ] else ...[
                      _Card(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 10),
                            Icon(Icons.check_circle_outline, size: 48, color: AppColors.primary),
                            const SizedBox(height: 10),
                            const Text(
                              'No active collections',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'All assigned stops have been collected.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                            ),
                            const SizedBox(height: 10),
                          ],
                        ),
                      ),
                    ],

                    // ── Up Next queue ───────────────────────────────────
                    if (upcomingCollections.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.queue, color: AppColors.primary, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            'Up Next (${upcomingCollections.length})',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...upcomingCollections.map((c) => _UpcomingCard(collection: c)),
                    ],

                    const SizedBox(height: 20),

                    // ── Collected items list ────────────────────────────
                    Row(
                      children: [
                        const Icon(Icons.inventory_2_outlined, color: AppColors.primary, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'Completed Today (${collectedItems.length})',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    if (collectedItems.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.hourglass_empty, color: AppColors.textSecondary, size: 18),
                            SizedBox(width: 8),
                            Text('No collections completed yet today.',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                          ],
                        ),
                      )
                    else
                      ...collectedItems.map((c) => _CollectedItemCard(collection: c)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── QR Scan Card — active collection scan prompt ─────────────────────────────

class _QrScanCard extends StatelessWidget {
  final Collection collection;
  final bool isLoading;
  final VoidCallback onScan;

  const _QrScanCard({
    required this.collection,
    required this.isLoading,
    required this.onScan,
  });

  @override
  Widget build(BuildContext context) {
    final unit = collection.wasteType == WasteType.uco ? 'L' : 'kg';
    final volume = collection.volume.toStringAsFixed(0);
    final notes = collection.notes;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Collection info card
        _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Navigate button
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => LiveTrackingScreen(
                        collection: collection,
                        pushDriverLocation: true,
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.navigation, size: 15),
                label: const Text('Navigate to Location'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 36),
                  textStyle: const TextStyle(fontSize: 13),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.business, color: AppColors.primary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          collection.businessName,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          collection.businessAddress ?? collection.location,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final phone = collection.contactPhone ?? '';
                      if (phone.isNotEmpty) {
                        final uri = Uri(scheme: 'tel', path: phone);
                        if (await canLaunchUrl(uri)) await launchUrl(uri);
                      }
                    },
                    icon: const Icon(Icons.call, size: 13),
                    label: const Text('Call'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 30),
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      textStyle: const TextStyle(fontSize: 11),
                    ),
                  ),
                ],
              ),
              const Divider(height: 18),
              _DetailRow(icon: Icons.recycling, label: 'Waste Type', value: collection.wasteType.label, small: true),
              const SizedBox(height: 6),
              _DetailRow(icon: Icons.inventory_2, label: 'Est. Volume', value: '$volume $unit', small: true),
              if (collection.scheduledTime.isNotEmpty) ...[
                const SizedBox(height: 6),
                _DetailRow(icon: Icons.access_time, label: 'Scheduled', value: collection.scheduledTime, small: true),
              ],
            ],
          ),
        ),

        if (notes != null && notes.isNotEmpty) ...[
          const SizedBox(height: 12),
          _Card(
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

        const SizedBox(height: 24),

        // QR scan button
        ElevatedButton.icon(
          onPressed: isLoading ? null : onScan,
          icon: isLoading
              ? const SizedBox(
                  width: 18, height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.qr_code_scanner, size: 20),
          label: Text(
            isLoading ? 'Verifying...' : 'Scan QR Code to Collect',
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
          ),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 50),
            backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
        const SizedBox(height: 6),
        const Center(
          child: Text(
            'Scan the QR code to mark this collection as complete',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }
}

// ─── Upcoming Collection Card (queue item) ────────────────────────────────────

class _UpcomingCard extends StatelessWidget {
  final Collection collection;
  const _UpcomingCard({required this.collection});

  @override
  Widget build(BuildContext context) {
    final unit = collection.wasteType == WasteType.uco ? 'L' : 'kg';
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: context.cBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: AppColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.schedule, color: AppColors.primary, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(collection.businessName,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                Text(
                  '${collection.wasteType.label} · ${collection.volume.toStringAsFixed(0)} $unit',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text('UP NEXT',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  letterSpacing: 0.5,
                )),
          ),
        ],
      ),
    );
  }
}

// ─── Collected Item Card ───────────────────────────────────────────────────────

class _CollectedItemCard extends StatelessWidget {
  final Collection collection;
  const _CollectedItemCard({required this.collection});

  @override
  Widget build(BuildContext context) {
    final unit = collection.wasteType == WasteType.uco ? 'L' : 'kg';
    final weight = collection.actualWeight != null
        ? '${collection.actualWeight!.toStringAsFixed(1)} $unit'
        : '${collection.volume.toStringAsFixed(0)} $unit (est.)';
    final isVerified = collection.status == CollectionStatus.verified;
    final isCompleted = collection.status == CollectionStatus.completed;

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isVerified ? Icons.verified : Icons.check_circle,
              color: Colors.white,
              size: 17,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  collection.businessName,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${collection.wasteType.label} · $weight',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              isVerified ? 'Verified' : isCompleted ? 'Completed' : 'Collected',
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Shared Widgets ───────────────────────────────────────────────────────────

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
