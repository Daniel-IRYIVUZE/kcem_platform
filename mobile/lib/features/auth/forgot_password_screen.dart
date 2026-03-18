import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../shared/widgets/app_text_field.dart';
import '../shared/widgets/eco_button.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _sent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendReset() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _sent = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        backgroundColor: context.cBg,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.cText),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Reset Password',
          style: TextStyle(
            color: context.cText,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: _sent ? _SuccessView(email: _emailController.text.trim()) : _FormView(
            formKey: _formKey,
            emailController: _emailController,
            isLoading: _isLoading,
            onSend: _sendReset,
          ),
        ),
      ),
    );
  }
}

// ── Form View ─────────────────────────────────────────────────────────────────

class _FormView extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailController;
  final bool isLoading;
  final VoidCallback onSend;

  const _FormView({
    required this.formKey,
    required this.emailController,
    required this.isLoading,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
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
              child: const Icon(Icons.lock_reset, size: 40, color: AppColors.primary),
            ),
          ).animate().scale(duration: 400.ms).fadeIn(),

          const SizedBox(height: 28),

          Text(
            'Forgot your password?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: context.cText,
            ),
          ).animate().slideY(begin: 0.2, duration: 350.ms).fadeIn(),

          const SizedBox(height: 10),

          Text(
            'Enter the email address associated with your account and we\'ll send you a link to reset your password.',
            style: TextStyle(
              fontSize: 14,
              color: context.cTextSec,
              height: 1.6,
            ),
          ).animate().fadeIn(delay: 100.ms),

          const SizedBox(height: 32),

          // Email field
          Container(
            decoration: BoxDecoration(
              color: context.cSurf,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.cBorder),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextField(
                  controller: emailController,
                  label: 'Email Address',
                  hint: 'your@email.com',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Email is required';
                    if (!v.contains('@')) return 'Enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                EcoButton(
                  label: 'Send Reset Link',
                  onPressed: onSend,
                  isLoading: isLoading,
                  icon: Icons.send_outlined,
                ),
              ],
            ),
          ).animate().slideY(begin: 0.2, duration: 400.ms, delay: 150.ms).fadeIn(),

          const SizedBox(height: 24),

          // Back to login
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Remember your password? ',
                style: TextStyle(color: context.cTextSec, fontSize: 14),
              ),
              GestureDetector(
                onTap: () => context.pop(),
                child: const Text(
                  'Sign In',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ).animate().fadeIn(delay: 250.ms),
        ],
      ),
    );
  }
}

// ── Success View ──────────────────────────────────────────────────────────────

class _SuccessView extends StatelessWidget {
  final String email;
  const _SuccessView({required this.email});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 40),

        Container(
          width: 100,
          height: 100,
          decoration: const BoxDecoration(
            color: AppColors.primaryLight,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.mark_email_read_outlined, size: 52, color: AppColors.primary),
        )
            .animate()
            .scale(duration: 500.ms, curve: Curves.elasticOut)
            .fadeIn(),

        const SizedBox(height: 28),

        Text(
          'Check your email!',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: context.cText,
          ),
          textAlign: TextAlign.center,
        ).animate().slideY(begin: 0.2, duration: 350.ms).fadeIn(),

        const SizedBox(height: 12),

        Text(
          'We\'ve sent a password reset link to\n${email.isNotEmpty ? email : "your email address"}',
          style: TextStyle(
            fontSize: 15,
            color: context.cTextSec,
            height: 1.6,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn(delay: 100.ms),

        const SizedBox(height: 12),

        Text(
          'Didn\'t receive the email? Check your spam folder or wait a few minutes.',
          style: TextStyle(
            fontSize: 13,
            color: context.cTextTer,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn(delay: 150.ms),

        const SizedBox(height: 40),

        EcoButton(
          label: 'Back to Sign In',
          onPressed: () => context.pop(),
          icon: Icons.arrow_back_ios_new,
        ).animate().slideY(begin: 0.2, duration: 350.ms, delay: 200.ms).fadeIn(),

        const SizedBox(height: 16),

        TextButton(
          onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Resend email sent!'), behavior: SnackBarBehavior.floating),
          ),
          child: const Text(
            'Resend email',
            style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
          ),
        ).animate().fadeIn(delay: 300.ms),
      ],
    );
  }
}
