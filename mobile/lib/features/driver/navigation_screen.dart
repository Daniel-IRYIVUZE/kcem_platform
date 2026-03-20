import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../core/theme/app_theme.dart';
import '../shared/live_tracking_screen.dart';

class NavigationScreen extends ConsumerStatefulWidget {
  const NavigationScreen({super.key});

  @override
  ConsumerState<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends ConsumerState<NavigationScreen> {
  Collection? _selected;

  @override
  Widget build(BuildContext context) {
    final collections = ref.watch(driverCollectionsProvider)
        .where((c) => [
              CollectionStatus.enRoute,
              CollectionStatus.scheduled,
              CollectionStatus.collected,
            ].contains(c.status))
        .toList();

    // Auto-navigate to the first active collection if only one
    if (_selected == null && collections.length == 1) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _selected = collections.first);
      });
    }

    if (_selected != null) {
      return Scaffold(
        body: Stack(
          children: [
            LiveTrackingScreen(collection: _selected!, pushDriverLocation: true),
            Positioned(
              top: 50,
              left: 16,
              child: SafeArea(
                child: FloatingActionButton.small(
                  heroTag: 'back_nav',
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.textPrimary,
                  onPressed: () => setState(() => _selected = null),
                  child: const Icon(Icons.arrow_back),
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (collections.isEmpty) {
      return Scaffold(
        backgroundColor: context.cBg,
        appBar: AppBar(title: const Text('Navigation')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.navigation_outlined, size: 64, color: context.cTextSec),
              const SizedBox(height: 16),
              Text('No active routes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: context.cText)),
              const SizedBox(height: 8),
              Text('You have no scheduled or en-route collections.',
                  style: TextStyle(color: context.cTextSec), textAlign: TextAlign.center),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        title: const Text('Select Stop to Navigate'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: LinearProgressIndicator(
            value: null,
            backgroundColor: Colors.transparent,
            color: AppColors.primary.withValues(alpha: 0.3),
          ),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: collections.length,
        itemBuilder: (context, i) {
          final c = collections[i];
          final isActive = c.status == CollectionStatus.enRoute;
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: isActive ? AppColors.primary : context.cBorder,
                width: isActive ? 2 : 1,
              ),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primaryLight : context.cSurfAlt,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isActive ? Icons.navigation : Icons.location_on_outlined,
                  color: isActive ? AppColors.primary : context.cTextSec,
                ),
              ),
              title: Text(
                c.businessName,
                style: TextStyle(fontWeight: FontWeight.w700, color: context.cText),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text(c.businessAddress ?? '', style: TextStyle(color: context.cTextSec, fontSize: 13)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      _StatusChip(c.status),
                      const SizedBox(width: 8),
                      Text('${c.volume.toStringAsFixed(0)} ${c.wasteType.label == "UCO" ? "L" : "kg"}',
                          style: TextStyle(fontSize: 12, color: context.cTextSec)),
                    ],
                  ),
                ],
              ),
              trailing: ElevatedButton.icon(
                onPressed: () => setState(() => _selected = c),
                icon: const Icon(Icons.navigation, size: 16),
                label: const Text('Go'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(70, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final CollectionStatus status;
  const _StatusChip(this.status);

  @override
  Widget build(BuildContext context) {
    final isActive = status == CollectionStatus.enRoute;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primaryLight : AppColors.accentLight,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        isActive ? 'En Route' : status.name.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: isActive ? AppColors.primary : AppColors.accent,
        ),
      ),
    );
  }
}
