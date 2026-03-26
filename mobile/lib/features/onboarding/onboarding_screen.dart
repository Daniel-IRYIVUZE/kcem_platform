import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../core/services/local_storage_service.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    const OnboardingData(
      icon: Icons.eco_rounded,
      bgColor: Color(0xFFECFDF5),
      accentColor: AppColors.primary,
      headline: 'Turn Waste\ninto Value',
      subheadline: "Join Kigali's circular economy\nand make a real impact",
      isHero: true,
    ),
    const OnboardingData(
      icon: Icons.business_outlined,
      bgColor: Color(0xFFF5F3FF),
      accentColor: AppColors.hotelColor,
      headline: 'For Hotels\n& Businesses',
      subheadline: 'List your waste and earn revenue\ndirectly from certified recyclers',
      isHero: false,
      features: ['Earn from waste', 'Easy pickup scheduling', 'Track revenue'],
    ),
    const OnboardingData(
      icon: Icons.recycling_rounded,
      bgColor: Color(0xFFECFDF5),
      accentColor: AppColors.recyclerColor,
      headline: 'For Recyclers\n& Processors',
      subheadline: 'Source quality recyclable materials\ndirectly from verified businesses',
      isHero: false,
      features: ['Direct sourcing', 'Quality assured', 'Bulk deals'],
    ),
    const OnboardingData(
      icon: Icons.local_shipping_rounded,
      bgColor: Color(0xFFEFF6FF),
      accentColor: AppColors.driverColor,
      headline: 'For Drivers\n& Collectors',
      subheadline: 'Earn money by collecting\nrecyclable waste on your schedule',
      isHero: false,
      features: ['Flexible hours', 'Route optimization', 'Instant pay'],
    ),
    const OnboardingData(
      icon: Icons.rocket_launch_rounded,
      bgColor: Color(0xFFFFFBEB),
      accentColor: AppColors.accent,
      headline: 'Everything\nYou Need',
      subheadline: 'Powerful features built for\nreal-world logistics',
      isHero: false,
      isFeatureGrid: true,
    ),
  ];

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _currentPage == _pages.length - 1;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentPage > 0)
                    TextButton(
                      onPressed: () {
                        _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      child: const Text('Back'),
                    )
                  else
                    const SizedBox(width: 60),
                  TextButton(
                    onPressed: () {
                      LocalStorageService.instance.markOnboardingSeen();
                      context.go(AppRoutes.login);
                    },
                    child: const Text(
                      'Skip',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),

            // Pages
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                },
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _OnboardingPage(data: _pages[index]);
                },
              ),
            ),

            // Bottom section
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Column(
                children: [
                  // Page indicator
                  SmoothPageIndicator(
                    controller: _pageController,
                    count: _pages.length,
                    effect: const ExpandingDotsEffect(
                      activeDotColor: AppColors.primary,
                      dotColor: AppColors.border,
                      dotHeight: 8,
                      dotWidth: 8,
                      expansionFactor: 3,
                    ),
                  ),
                  const SizedBox(height: 32),

                  if (isLast) ...[
                    ElevatedButton(
                      onPressed: () {
                        LocalStorageService.instance.markOnboardingSeen();
                        context.go(AppRoutes.login);
                      },
                      child: const Text('Go to Login'),
                    ),
                  ] else
                    ElevatedButton(
                      onPressed: _nextPage,
                      child: const Text('Continue'),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OnboardingData {
  final IconData icon;
  final Color bgColor;
  final Color accentColor;
  final String headline;
  final String subheadline;
  final bool isHero;
  final bool isFeatureGrid;
  final List<String> features;

  const OnboardingData({
    required this.icon,
    required this.bgColor,
    required this.accentColor,
    required this.headline,
    required this.subheadline,
    this.isHero = false,
    this.isFeatureGrid = false,
    this.features = const [],
  });
}

class _OnboardingPage extends StatelessWidget {
  final OnboardingData data;
  const _OnboardingPage({required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 16),

          // Illustration area
          Expanded(
            flex: 5,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: data.bgColor,
                borderRadius: BorderRadius.circular(24),
              ),
              child: data.isFeatureGrid
                  ? _FeatureGrid(accentColor: data.accentColor)
                  : data.isHero
                      ? _HeroIllustration(data: data)
                      : _RoleIllustration(data: data),
            ),
          ).animate().scale(
                begin: const Offset(0.92, 0.92),
                duration: 400.ms,
                curve: Curves.easeOut,
              ),

          const SizedBox(height: 16),

          // Text content
          Expanded(
            flex: 3,
            child: SingleChildScrollView(
              physics: const NeverScrollableScrollPhysics(),
              child: Column(
                children: [
                  Text(
                    data.headline,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      height: 1.15,
                      letterSpacing: -0.5,
                    ),
                  ).animate().slideY(begin: 0.3, duration: 400.ms, delay: 100.ms).fadeIn(),

                  const SizedBox(height: 8),

                  Text(
                    data.subheadline,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ).animate().slideY(begin: 0.3, duration: 400.ms, delay: 200.ms).fadeIn(),

                  if (data.features.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      alignment: WrapAlignment.center,
                      children: data.features.map((f) => _FeatureChip(label: f, color: data.accentColor)).toList(),
                    ).animate().fadeIn(duration: 400.ms, delay: 300.ms),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroIllustration extends StatelessWidget {
  final OnboardingData data;
  const _HeroIllustration({required this.data});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        for (int i = 0; i < 3; i++)
          Container(
            width: 80.0 + (i * 70),
            height: 80.0 + (i * 70),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: data.accentColor.withValues(alpha: 0.08 - (i * 0.02)),
            ),
          ),
        Icon(data.icon, size: 80, color: data.accentColor),
      ],
    );
  }
}

class _RoleIllustration extends StatelessWidget {
  final OnboardingData data;
  const _RoleIllustration({required this.data});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: data.accentColor.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Icon(data.icon, size: 58, color: data.accentColor),
          ),
        ),
      ],
    );
  }
}

class _FeatureGrid extends StatelessWidget {
  final Color accentColor;
  const _FeatureGrid({required this.accentColor});

  static const List<Map<String, dynamic>> features = [
    {'icon': Icons.phone_android_rounded,    'label': 'Offline Mode',      'color': Color(0xFF0891B2)},
    {'icon': Icons.location_on_rounded,      'label': 'Live Tracking',     'color': Color(0xFFDC2626)},
    {'icon': Icons.payment_rounded,          'label': 'Instant Payments',  'color': Color(0xFF059669)},
    {'icon': Icons.eco_rounded,              'label': 'Green Score',       'color': Color(0xFF16A34A)},
    {'icon': Icons.shield_rounded,           'label': 'Secure & Safe',     'color': Color(0xFF7C3AED)},
    {'icon': Icons.bar_chart_rounded,        'label': 'Analytics',         'color': Color(0xFFF59E0B)},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: features.length,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  features[index]['icon'] as IconData,
                  size: 28,
                  color: features[index]['color'] as Color,
                ),
                const SizedBox(height: 6),
                Text(
                  features[index]['label'] as String,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final String label;
  final Color color;
  const _FeatureChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
