import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/app_providers.dart';
import '../../core/services/api_service.dart';
import '../../core/services/offline_sync_service.dart';

import '../shared/widgets/app_text_field.dart';
import '../shared/widgets/eco_button.dart';
import '../shared/widgets/offline_banner.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  bool get _isLocalBackend {
    final uri = Uri.tryParse(ApiService.baseUrl);
    final host = uri?.host ?? '';
    return host == '127.0.0.1' || host == 'localhost' || host == '10.0.2.2';
  }

  String get _backendIndicatorText {
    final uri = Uri.tryParse(ApiService.baseUrl);
    final host = uri?.host ?? 'unknown';
    final port = uri?.hasPort == true ? ':${uri!.port}' : '';
    final modeLabel = _isLocalBackend ? 'Connected to local server' : 'Connected to production server';
    return '$modeLabel ($host$port)';
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showMessage(BuildContext ctx, String message, {required bool isError}) {
    final messenger = ScaffoldMessenger.of(ctx);
    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        backgroundColor: isError ? AppColors.error : const Color(0xFF059669),
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    final success = await ref
        .read(authProvider.notifier)
        .login(_emailController.text.trim(), _passwordController.text);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (success) {
      final role = ref.read(authProvider).role!;
      // Check if this was an offline login (cached session restored)
      final pendingCount = OfflineSyncService.pendingCount;
      final msg = pendingCount > 0
          ? 'Welcome back! ($pendingCount action(s) will sync when online)'
          : 'Welcome back!';
      _showMessage(context, msg, isError: false);
      context.go(AppRoutes.homeForRole(role));
    } else {
      final error = ref.read(authProvider).error ?? 'Invalid email or password';
      _showMessage(context, error, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.cBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                // Always show the network badge (online or offline)
                const OfflineBanner(showOnlineState: true),
                const SizedBox(height: 8),
                // Backend server indicator (dev vs production)
                Row(
                  children: [
                    Text(
                      '●',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _isLocalBackend ? AppColors.success : AppColors.warning,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Flexible(
                      child: Text(
                        _backendIndicatorText,
                        style: TextStyle(
                          fontSize: 11,
                          color: _isLocalBackend ? AppColors.success : AppColors.warning,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Header
                Center(
                  child: Column(
                    children: [
                      Image.asset(
                        'assets/images/EcoTrade.png',
                        width: 110,
                        height: 110,
                        fit: BoxFit.contain,
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Welcome back',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Sign in to your Ecotrade account',
                        style: TextStyle(
                          fontSize: 15,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ).animate().slideY(begin: -0.2, duration: 400.ms).fadeIn(),

                const SizedBox(height: 20),

                // // Demo quick-login chips
                // Wrap(
                //   alignment: WrapAlignment.center,
                //   spacing: 8,
                //   runSpacing: 8,
                //   children: [
                //     _DemoChip(
                //       label: 'Hotel Demo',
                //       icon: Icons.business,
                //       color: const Color(0xFF0891B2),
                //       onTap: () => _fillDemoCredentials(
                //           'danieliryivuze4@gmail.com', 'hotel123'),
                //     ),
                //     _DemoChip(
                //       label: 'Recycler Demo',
                //       icon: Icons.recycling,
                //       color: AppColors.primary,
                //       onTap: () => _fillDemoCredentials(
                //           'danieliryivuze4@gmail.com', 'recycler123'),
                //     ),
                //     _DemoChip(
                //       label: 'Driver Demo',
                //       icon: Icons.local_shipping_outlined,
                //       color: const Color(0xFFF59E0B),
                //       onTap: () => _fillDemoCredentials(
                //           'danieliryivuze4@gmail.com', 'driver123'),
                //     ),
                //   ],
                // ).animate().fadeIn(duration: 400.ms, delay: 150.ms),

                const SizedBox(height: 20),

                // Login card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: context.cSurf,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: context.cBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppTextField(
                        controller: _emailController,
                        label: 'Email',
                        hint: 'Enter your email address',
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Email is required';
                          if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(v.trim())) {
                            return 'Enter a valid email address';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      AppTextField(
                        controller: _passwordController,
                        label: 'Password',
                        hint: 'Enter your password',
                        prefixIcon: Icons.lock_outline,
                        obscureText: _obscurePassword,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            color: AppColors.textTertiary,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Password is required';
                          if (v.length < 6) return 'Password must be at least 6 characters';
                          return null;
                        },
                      ),

                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () => context.push(AppRoutes.forgotPassword),
                          child: const Text('Forgot Password?'),
                        ),
                      ),

                      const SizedBox(height: 8),
                      EcoButton(
                        label: 'Sign In',
                        onPressed: _handleLogin,
                        isLoading: _isLoading,
                      ),


                    ],
                  ),
                ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 100.ms).fadeIn(),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
