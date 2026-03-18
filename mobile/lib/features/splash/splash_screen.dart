import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../core/services/local_storage_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _navigateAfterDelay();
  }

  void _navigateAfterDelay() async {
    await Future.delayed(const Duration(milliseconds: 3200));
    if (!mounted) return;
    // If the router redirect hasn't already navigated (i.e. user is not logged in),
    // go to onboarding on first launch or login on subsequent launches.
    final hasSeenOnboarding = LocalStorageService.instance.hasSeenOnboarding;
    if (hasSeenOnboarding) {
      context.go(AppRoutes.login);
    } else {
      context.go(AppRoutes.onboarding);
    }
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.splashGradient,
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // Background pattern circles
              Positioned(
                top: -80,
                right: -80,
                child: Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.06),
                  ),
                ),
              ),
              Positioned(
                bottom: 120,
                left: -60,
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.06),
                  ),
                ),
              ),

              // Main content
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(flex: 2),

                    // Logo with multi-stage creative animation
                    Image.asset(
                      'assets/images/EcoTrade Portait.png',
                      width: 200,
                      height: 200,
                      fit: BoxFit.contain,
                    )
                        .animate()
                        .fadeIn(duration: 350.ms)
                        .scale(
                          duration: 750.ms,
                          curve: Curves.elasticOut,
                          begin: const Offset(0.0, 0.0),
                          end: const Offset(1.0, 1.0),
                        )
                        .then(delay: 50.ms)
                        .shimmer(
                          duration: 700.ms,
                          color: Colors.white.withValues(alpha: 0.5),
                          angle: 0.4,
                        )
                        .then(delay: 100.ms)
                        .scaleXY(begin: 1.0, end: 1.06, duration: 300.ms, curve: Curves.easeOut)
                        .then()
                        .scaleXY(begin: 1.06, end: 1.0, duration: 300.ms, curve: Curves.easeIn),

                    const SizedBox(height: 28),

                    // App name
                    const Text(
                      'Ecotrade',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -1,
                      ),
                    )
                        .animate()
                        .slideY(
                          begin: 0.4,
                          duration: 500.ms,
                          delay: 200.ms,
                          curve: Curves.easeOut,
                        )
                        .fadeIn(duration: 400.ms, delay: 200.ms),

                    const SizedBox(height: 10),

                    Text(
                      'Circular Economy Marketplace',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                        color: Colors.white.withValues(alpha: 0.8),
                        letterSpacing: 0.3,
                      ),
                    )
                        .animate()
                        .slideY(
                          begin: 0.4,
                          duration: 500.ms,
                          delay: 350.ms,
                          curve: Curves.easeOut,
                        )
                        .fadeIn(duration: 400.ms, delay: 350.ms),

                    const Spacer(flex: 2),

                    // Loading indicator
                    RotationTransition(
                      turns: _rotationController,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.8),
                            width: 2.5,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(4),
                          child: Container(
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.transparent,
                            ),
                            child: CustomPaint(
                              painter: _ArcPainter(),
                            ),
                          ),
                        ),
                      ),
                    ).animate().fadeIn(duration: 400.ms, delay: 600.ms),

                    const SizedBox(height: 48),

                    // Version text
                    Text(
                      'Version 1.0.0',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                    ).animate().fadeIn(duration: 400.ms, delay: 800.ms),

                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ArcPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromLTWH(0, 0, size.width, size.height),
      -0.5,
      2.5,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
