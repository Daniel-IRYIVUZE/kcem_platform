import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_providers.dart';
import '../../core/router/app_router.dart';
import '../shared/widgets/eco_button.dart';

class VerifyOtpScreen extends ConsumerStatefulWidget {
  const VerifyOtpScreen({super.key});

  @override
  ConsumerState<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends ConsumerState<VerifyOtpScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;
  int _resendCooldown = 0;
  Timer? _resendTimer;

  @override
  void dispose() {
    for (var c in _controllers) { c.dispose(); }
    for (var f in _focusNodes) { f.dispose(); }
    _resendTimer?.cancel();
    super.dispose();
  }

  void _onDigitEntered(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    // Auto-verify when all 6 digits are entered
    if (_controllers.every((c) => c.text.isNotEmpty)) {
      _verify();
    }
  }

  void _onKeyDown(int index, KeyEvent event) {
    // Allow backspace to move focus back
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _controllers[index].text.isEmpty &&
        index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  Future<void> _verify() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    setState(() => _isLoading = false);
    final user = ref.read(authProvider).user;
    final role = user?.role;
    final dest = role != null ? AppRoutes.homeForRole(role) : AppRoutes.hotelHome;
    context.go(dest);
  }

  void _resendCode() {
    if (_resendCooldown > 0) return;
    // Start 30s cooldown
    setState(() => _resendCooldown = 30);
    _resendTimer?.cancel();
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendCooldown <= 1) {
        t.cancel();
        if (mounted) setState(() => _resendCooldown = 0);
      } else {
        if (mounted) setState(() => _resendCooldown--);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.send, color: Colors.white, size: 16),
            SizedBox(width: 8),
            Text('Verification code resent!'),
          ],
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        backgroundColor: context.cBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.cText, size: 18),
          onPressed: () => context.pop(),
        ),
        title: Text('Verify Account',
            style: TextStyle(color: context.cText, fontWeight: FontWeight.w700, fontSize: 17)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // Icon
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: context.cPrimaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('✉️', style: TextStyle(fontSize: 36)),
                  ),
                ),
              ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),

              const SizedBox(height: 24),

              Text(
                'Check your inbox',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: context.cText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit verification code to your email and phone number.',
                style: TextStyle(
                  fontSize: 15,
                  color: context.cTextSec,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 36),

              // OTP label
              Text('Enter 6-digit code',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: context.cText)),
              const SizedBox(height: 12),

              // OTP Input
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 48,
                    height: 58,
                    child: KeyboardListener(
                      focusNode: FocusNode(),
                      onKeyEvent: (e) => _onKeyDown(index, e),
                      child: TextField(
                        controller: _controllers[index],
                        focusNode: _focusNodes[index],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 1,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: context.cText,
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          filled: true,
                          fillColor: context.cSurf,
                          contentPadding: EdgeInsets.zero,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(color: context.cBorder),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(color: context.cBorder),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(color: AppColors.primary, width: 2),
                          ),
                        ),
                        onChanged: (value) => _onDigitEntered(index, value),
                      ),
                    ),
                  );
                }),
              ).animate().slideY(begin: 0.3, duration: 400.ms).fadeIn(),

              const SizedBox(height: 32),

              EcoButton(
                label: 'Verify Account',
                onPressed: _verify,
                isLoading: _isLoading,
                icon: Icons.verified_user_outlined,
              ),

              const SizedBox(height: 20),

              // Resend code
              Center(
                child: _resendCooldown > 0
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.timer_outlined, size: 16, color: context.cTextSec),
                          const SizedBox(width: 6),
                          Text(
                            'Resend in ${_resendCooldown}s',
                            style: TextStyle(fontSize: 14, color: context.cTextSec),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Didn't receive it? ",
                            style: TextStyle(fontSize: 14, color: context.cTextSec),
                          ),
                          GestureDetector(
                            onTap: _resendCode,
                            child: const Text(
                              'Resend Code',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
              ).animate().fadeIn(delay: 300.ms),

              const SizedBox(height: 16),

              // Back to login
              Center(
                child: GestureDetector(
                  onTap: () => context.pop(),
                  child: Text(
                    'Back to Sign In',
                    style: TextStyle(
                      fontSize: 14,
                      color: context.cTextSec,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
