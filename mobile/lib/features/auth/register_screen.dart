import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/app_providers.dart';
import '../shared/widgets/app_text_field.dart';
import '../shared/widgets/eco_button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  int _currentStep = 0;
  static const int _totalSteps = 5;
  String _selectedRole = '';

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPwdController = TextEditingController();

  final _hotelNameController = TextEditingController();
  final _hotelAddrController = TextEditingController();
  final _companyNameController = TextEditingController();
  final _tinController = TextEditingController();
  final _recyclerLicController = TextEditingController();
  final _plateController = TextEditingController();
  final _driverLicController = TextEditingController();

  final _addressController = TextEditingController();
  LatLng _pickedLocation = const LatLng(-1.9441, 30.0619);
  final _mapController = MapController();

  @override
  void dispose() {
    for (final c in [
      _nameController,
      _phoneController,
      _emailController,
      _passwordController,
      _confirmPwdController,
      _hotelNameController,
      _hotelAddrController,
      _companyNameController,
      _tinController,
      _recyclerLicController,
      _plateController,
      _driverLicController,
      _addressController,
    ]) {
      c.dispose();
    }
    _mapController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < _totalSteps - 1) {
      setState(() => _currentStep++);
    } else {
      _submitRegistration();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      context.go(AppRoutes.login);
    }
  }

  Future<void> _submitRegistration() async {
    String businessName;
    switch (_selectedRole) {
      case 'recycler':
        businessName = _companyNameController.text.trim().isNotEmpty
            ? _companyNameController.text.trim()
            : 'Recycling Company';
        break;
      case 'driver':
        businessName = _nameController.text.trim().isNotEmpty
            ? _nameController.text.trim()
            : 'Driver';
        break;
      default:
        businessName = _hotelNameController.text.trim().isNotEmpty
            ? _hotelNameController.text.trim()
            : 'My Business';
    }
    await ref.read(authProvider.notifier).register(
          name: _nameController.text.trim().isNotEmpty
              ? _nameController.text.trim()
              : 'New User',
          email: _emailController.text.trim().isNotEmpty
              ? _emailController.text.trim()
              : 'danieliryivuze4@gmail.com',
          phone: _phoneController.text.trim().isNotEmpty
              ? _phoneController.text.trim()
              : '+250780162164',
          password: _passwordController.text.trim().isNotEmpty
              ? _passwordController.text.trim()
              : 'password123',
          role: (_selectedRole.isNotEmpty ? _selectedRole : 'hotel') == 'hotel'
              ? 'business'
              : _selectedRole,
          businessName: businessName,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        backgroundColor: context.cBg,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: context.cText, size: 18),
          onPressed: _prevStep,
        ),
        title: Text('Create Account',
            style: TextStyle(
                color: context.cText,
                fontWeight: FontWeight.w700,
                fontSize: 18)),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(6),
          child: _StepProgressBar(
              currentStep: _currentStep, totalSteps: _totalSteps),
        ),
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 280),
          transitionBuilder: (child, animation) => SlideTransition(
            position:
                Tween<Offset>(begin: const Offset(0.12, 0), end: Offset.zero)
                    .animate(animation),
            child: FadeTransition(opacity: animation, child: child),
          ),
          child: KeyedSubtree(key: ValueKey(_currentStep), child: _buildStep()),
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_currentStep) {
      case 0:
        return _StepChooseRole(
            selectedRole: _selectedRole,
            onRoleSelected: (r) {
              setState(() => _selectedRole = r);
            },
            onNext: _selectedRole.isNotEmpty ? _nextStep : null);
      case 1:
        return _StepPersonalInfo(
            nameController: _nameController,
            phoneController: _phoneController,
            emailController: _emailController,
            passwordController: _passwordController,
            confirmPwdController: _confirmPwdController,
            onNext: _nextStep);
      case 2:
        return _StepRoleDetails(
            role: _selectedRole,
            hotelNameController: _hotelNameController,
            hotelAddrController: _hotelAddrController,
            companyNameController: _companyNameController,
            tinController: _tinController,
            recyclerLicController: _recyclerLicController,
            plateController: _plateController,
            driverLicController: _driverLicController,
            onNext: _nextStep);
      case 3:
        return _StepLocation(
            addressController: _addressController,
            pickedLocation: _pickedLocation,
            mapController: _mapController,
            onLocationPicked: (ll) => setState(() => _pickedLocation = ll),
            onNext: _nextStep);
      case 4:
        return _StepTerms(onFinish: _nextStep);
      default:
        return const SizedBox();
    }
  }
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
class _StepProgressBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  const _StepProgressBar({required this.currentStep, required this.totalSteps});
  @override
  Widget build(BuildContext context) => LinearProgressIndicator(
        value: (currentStep + 1) / totalSteps,
        backgroundColor: context.cBorder,
        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
        minHeight: 5,
      );
}

// ─── Step Header ──────────────────────────────────────────────────────────────
class _StepHeader extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color? iconColor;
  const _StepHeader(
      {required this.icon,
      required this.title,
      required this.subtitle,
      this.iconColor});
  @override
  Widget build(BuildContext context) {
    final color = iconColor ?? AppColors.primary;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        const SizedBox(height: 12),
        Text(title,
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: context.cText)),
        const SizedBox(height: 6),
        Text(subtitle,
            style:
                TextStyle(fontSize: 14, color: context.cTextSec, height: 1.5)),
      ],
    );
  }
}

// ─── Form card wrapper ─────────────────────────────────────────────────────────
class _FormCard extends StatelessWidget {
  final Widget child;
  const _FormCard({required this.child});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: context.cSurf,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: context.cBorder),
        ),
        child: child,
      );
}

// ─── Step 0: Choose Role ──────────────────────────────────────────────────────
class _StepChooseRole extends StatelessWidget {
  final String selectedRole;
  final void Function(String) onRoleSelected;
  final VoidCallback? onNext;
  const _StepChooseRole(
      {required this.selectedRole,
      required this.onRoleSelected,
      required this.onNext});

  static const _roles = <Map<String, dynamic>>[
    {
      'id': 'hotel',
      'label': 'Hotel / Business',
      'sub': 'List organic waste for recycling',
      'icon': Icons.hotel_outlined,
      'color': AppColors.hotelColor,
      'traits': [
        'Waste listing & tracking',
        'Bid management',
        'Collection scheduling'
      ]
    },
    {
      'id': 'recycler',
      'label': 'Recycling Company',
      'sub': 'Bid on waste and manage fleet',
      'icon': Icons.recycling_outlined,
      'color': AppColors.recyclerColor,
      'traits': [
        'Marketplace access',
        'Fleet management',
        'Analytics dashboard'
      ]
    },
    {
      'id': 'driver',
      'label': 'Driver / Collector',
      'sub': 'Handle pickups and deliveries',
      'icon': Icons.local_shipping_outlined,
      'color': AppColors.driverColor,
      'traits': ['Route navigation', 'Collection tracking', 'Earnings overview']
    },
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _StepHeader(
              icon: Icons.dashboard_customize_outlined,
              title: "What's your role?",
              subtitle:
                  'Choose how you will use Ecotrade. This determines your dashboard.'),
          const SizedBox(height: 24),
          ..._roles.map((role) {
            final isSel = selectedRole == role['id'];
            final color = role['color'] as Color;
            final traits = role['traits'] as List<String>;
            return GestureDetector(
              onTap: () => onRoleSelected(role['id'] as String),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isSel ? color.withOpacity(0.07) : context.cSurf,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: isSel ? color : context.cBorder,
                      width: isSel ? 2 : 1),
                ),
                child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: color.withOpacity(isSel ? 0.15 : 0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(role['icon'] as IconData,
                            color: color, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Row(children: [
                              Expanded(
                                  child: Text(role['label'] as String,
                                      style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color:
                                              isSel ? color : context.cText))),
                              if (isSel)
                                Icon(Icons.check_circle,
                                    color: color, size: 20),
                            ]),
                            const SizedBox(height: 4),
                            Text(role['sub'] as String,
                                style: TextStyle(
                                    fontSize: 12, color: context.cTextSec)),
                            if (isSel) ...[
                              const SizedBox(height: 10),
                              ...traits.map((t) => Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Row(children: [
                                      Icon(Icons.check, size: 14, color: color),
                                      const SizedBox(width: 6),
                                      Text(t,
                                          style: TextStyle(
                                              fontSize: 12,
                                              color: context.cTextSec)),
                                    ]),
                                  )),
                            ],
                          ])),
                    ]),
              ),
            );
          }),
          const SizedBox(height: 8),
          EcoButton(
              label: 'Continue', onPressed: onNext, icon: Icons.arrow_forward),
          const SizedBox(height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text('Already have an account? ',
                style: TextStyle(color: context.cTextSec, fontSize: 14)),
            GestureDetector(
              onTap: () => context.go(AppRoutes.login),
              child: const Text('Sign In',
                  style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 14)),
            ),
          ]),
        ],
      ),
    );
  }
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────
class _StepPersonalInfo extends StatefulWidget {
  final TextEditingController nameController,
      phoneController,
      emailController,
      passwordController,
      confirmPwdController;
  final VoidCallback onNext;
  const _StepPersonalInfo(
      {required this.nameController,
      required this.phoneController,
      required this.emailController,
      required this.passwordController,
      required this.confirmPwdController,
      required this.onNext});
  @override
  State<_StepPersonalInfo> createState() => _StepPersonalInfoState();
}

class _StepPersonalInfoState extends State<_StepPersonalInfo> {
  final _key = GlobalKey<FormState>();
  bool _obscure = true, _obscureC = true;
  @override
  Widget build(BuildContext context) {
    return Form(
      key: _key,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const _StepHeader(
              icon: Icons.person_outline,
              title: 'Personal Information',
              subtitle: 'Your basic account details'),
          const SizedBox(height: 24),
          _FormCard(
              child: Column(children: [
            AppTextField(
                controller: widget.nameController,
                label: 'Full Name',
                hint: 'Enter your full name',
                prefixIcon: Icons.person_outline,
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Name is required'
                    : null),
            const SizedBox(height: 14),
            AppTextField(
                controller: widget.phoneController,
                label: 'Phone Number',
                hint: '+250 7XX XXX XXX',
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Phone is required'
                    : null),
            const SizedBox(height: 14),
            AppTextField(
                controller: widget.emailController,
                label: 'Email Address',
                hint: 'your@email.com',
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Email required';
                  if (!v.contains('@')) return 'Invalid email';
                  return null;
                }),
            const SizedBox(height: 14),
            AppTextField(
                controller: widget.passwordController,
                label: 'Password',
                hint: 'Min 8 characters',
                prefixIcon: Icons.lock_outline,
                obscureText: _obscure,
                validator: (v) =>
                    (v == null || v.length < 8) ? 'Min 8 characters' : null,
                suffixIcon: IconButton(
                    icon: Icon(
                        _obscure
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: context.cTextTer,
                        size: 20),
                    onPressed: () => setState(() => _obscure = !_obscure))),
            const SizedBox(height: 14),
            AppTextField(
                controller: widget.confirmPwdController,
                label: 'Confirm Password',
                hint: 'Re-enter password',
                prefixIcon: Icons.lock_outline,
                obscureText: _obscureC,
                validator: (v) => v != widget.passwordController.text
                    ? 'Passwords do not match'
                    : null,
                suffixIcon: IconButton(
                    icon: Icon(
                        _obscureC
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: context.cTextTer,
                        size: 20),
                    onPressed: () => setState(() => _obscureC = !_obscureC))),
          ])),
          const SizedBox(height: 24),
          EcoButton(
              label: 'Continue',
              onPressed: () {
                if (_key.currentState!.validate()) widget.onNext();
              },
              icon: Icons.arrow_forward),
        ]),
      ),
    );
  }
}

// ─── Step 2: Role-Specific Details ────────────────────────────────────────────
class _StepRoleDetails extends StatelessWidget {
  final String role;
  final TextEditingController hotelNameController,
      hotelAddrController,
      companyNameController,
      tinController,
      recyclerLicController,
      plateController,
      driverLicController;
  final VoidCallback onNext;
  const _StepRoleDetails(
      {required this.role,
      required this.hotelNameController,
      required this.hotelAddrController,
      required this.companyNameController,
      required this.tinController,
      required this.recyclerLicController,
      required this.plateController,
      required this.driverLicController,
      required this.onNext});

  @override
  Widget build(BuildContext context) {
    final data = role == 'recycler'
        ? (
            icon: Icons.recycling_outlined,
            color: AppColors.recyclerColor,
            title: 'Company Details',
            sub: 'About your recycling company'
          )
        : role == 'driver'
            ? (
                icon: Icons.local_shipping_outlined,
                color: AppColors.driverColor,
                title: 'Vehicle & License',
                sub: 'Your vehicle and license info'
              )
            : (
                icon: Icons.hotel_outlined,
                color: AppColors.hotelColor,
                title: 'Business Details',
                sub: 'About your hotel or business'
              );
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _StepHeader(
            icon: data.icon,
            title: data.title,
            subtitle: data.sub,
            iconColor: data.color),
        const SizedBox(height: 24),
        _FormCard(child: _buildFields(context)),
        const SizedBox(height: 24),
        EcoButton(
            label: 'Continue', onPressed: onNext, icon: Icons.arrow_forward),
      ]),
    );
  }

  Widget _buildFields(BuildContext context) {
    if (role == 'recycler') {
      return Column(children: [
        AppTextField(
            controller: companyNameController,
            label: 'Company Name',
            hint: 'e.g. GreenEnergy Recyclers Ltd',
            prefixIcon: Icons.business_outlined),
        const SizedBox(height: 14),
        AppTextField(
            controller: tinController,
            label: 'TIN Number',
            hint: 'Tax Identification Number',
            prefixIcon: Icons.numbers_outlined,
            keyboardType: TextInputType.number),
        const SizedBox(height: 14),
        AppTextField(
            controller: recyclerLicController,
            label: 'Recycling License',
            hint: 'REMA-XXXX-YYYY',
            prefixIcon: Icons.verified_outlined),
        const SizedBox(height: 14),
        _ChipPicker(
            label: 'Waste Types Handled',
            options: const [
              'Organic',
              'Plastic',
              'Metal',
              'Paper',
              'E-Waste',
              'Glass'
            ],
            color: AppColors.recyclerColor),
      ]);
    } else if (role == 'driver') {
      return Column(children: [
        _ChipPicker(
            label: 'Vehicle Type',
            options: const [
              'Pickup Truck',
              'Box Truck',
              'Mini-Truck',
              'Cargo Van'
            ],
            color: AppColors.driverColor,
            singleSelect: true),
        const SizedBox(height: 14),
        AppTextField(
            controller: plateController,
            label: 'Vehicle Plate',
            hint: 'e.g. RAB 123 A',
            prefixIcon: Icons.confirmation_number_outlined),
        const SizedBox(height: 14),
        AppTextField(
            controller: driverLicController,
            label: "Driver's License No.",
            hint: 'Full license number',
            prefixIcon: Icons.credit_card_outlined),
        const SizedBox(height: 14),
        AppTextField(
            label: 'Years of Experience',
            hint: 'e.g. 3',
            prefixIcon: Icons.work_history_outlined,
            keyboardType: TextInputType.number),
      ]);
    } else {
      return Column(children: [
        AppTextField(
            controller: hotelNameController,
            label: 'Business Name',
            hint: 'e.g. Hotel des Mille Collines',
            prefixIcon: Icons.hotel_outlined),
        const SizedBox(height: 14),
        AppTextField(
            controller: hotelAddrController,
            label: 'Business Address',
            hint: 'e.g. KN 5 Rd, Kigali',
            prefixIcon: Icons.location_on_outlined),
        const SizedBox(height: 14),
        AppTextField(
            label: 'Operating Hours',
            hint: 'e.g. Mon-Fri 06:00-22:00',
            prefixIcon: Icons.schedule_outlined),
        const SizedBox(height: 14),
        _ChipPicker(
            label: 'Waste Types Produced',
            options: const [
              'Food Waste',
              'Cardboard',
              'Plastic',
              'Glass',
              'Metal'
            ],
            color: AppColors.hotelColor),
      ]);
    }
  }
}

class _ChipPicker extends StatefulWidget {
  final String label;
  final List<String> options;
  final Color color;
  final bool singleSelect;
  const _ChipPicker(
      {required this.label,
      required this.options,
      required this.color,
      this.singleSelect = false});
  @override
  State<_ChipPicker> createState() => _ChipPickerState();
}

class _ChipPickerState extends State<_ChipPicker> {
  final Set<String> _sel = {};
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(widget.label,
          style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.w600, color: context.cText)),
      const SizedBox(height: 8),
      Wrap(
          spacing: 8,
          runSpacing: 8,
          children: widget.options.map((opt) {
            final s = _sel.contains(opt);
            return GestureDetector(
              onTap: () => setState(() {
                if (widget.singleSelect) {
                  _sel.clear();
                  _sel.add(opt);
                } else {
                  s ? _sel.remove(opt) : _sel.add(opt);
                }
              }),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: s ? widget.color.withOpacity(0.12) : context.cSurfAlt,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: s ? widget.color : context.cBorder,
                      width: s ? 1.5 : 1),
                ),
                child: Text(opt,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: s ? FontWeight.w600 : FontWeight.w400,
                        color: s ? widget.color : context.cTextSec)),
              ),
            );
          }).toList()),
    ]);
  }
}

// ─── Step 3: Location with Real Map ──────────────────────────────────────────
class _StepLocation extends StatefulWidget {
  final TextEditingController addressController;
  final LatLng pickedLocation;
  final MapController mapController;
  final void Function(LatLng) onLocationPicked;
  final VoidCallback onNext;
  const _StepLocation(
      {required this.addressController,
      required this.pickedLocation,
      required this.mapController,
      required this.onLocationPicked,
      required this.onNext});
  @override
  State<_StepLocation> createState() => _StepLocationState();
}

class _StepLocationState extends State<_StepLocation> {
  late LatLng _marker;
  @override
  void initState() {
    super.initState();
    _marker = widget.pickedLocation;
  }

  void _onTap(TapPosition tp, LatLng ll) {
    setState(() => _marker = ll);
    widget.onLocationPicked(ll);
    widget.addressController.text =
        '${ll.latitude.toStringAsFixed(5)}, ${ll.longitude.toStringAsFixed(5)}';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const _StepHeader(
            icon: Icons.location_on_outlined,
            title: 'Your Location',
            subtitle: 'Tap the map to pin your business address'),
        const SizedBox(height: 16),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(children: [
              FlutterMap(
                mapController: widget.mapController,
                options: MapOptions(
                    initialCenter: _marker, initialZoom: 14.0, onTap: _onTap),
                children: [
                  TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.ecotrade.app',
                      maxNativeZoom: 19),
                  MarkerLayer(markers: [
                    Marker(
                        point: _marker,
                        width: 44,
                        height: 44,
                        child:
                            Column(mainAxisSize: MainAxisSize.min, children: [
                          Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                  border:
                                      Border.all(color: Colors.white, width: 2),
                                  boxShadow: const [
                                    BoxShadow(
                                        color: Colors.black26,
                                        blurRadius: 6,
                                        offset: Offset(0, 2))
                                  ]),
                              child: const Icon(Icons.location_on,
                                  color: Colors.white, size: 18)),
                          Container(
                              width: 2, height: 8, color: AppColors.primary),
                        ]))
                  ]),
                ],
              ),
              Positioned(
                  bottom: 4,
                  right: 4,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(4)),
                    child: const Text('© OpenStreetMap contributors',
                        style: TextStyle(fontSize: 9, color: Colors.black54)),
                  )),
            ]),
          ),
        ),
        const SizedBox(height: 14),
        AppTextField(
            controller: widget.addressController,
            label: 'Address',
            hint: 'Tap map or type manually',
            prefixIcon: Icons.location_on_outlined),
        const SizedBox(height: 14),
        EcoButton(
            label: 'Continue',
            onPressed: widget.onNext,
            icon: Icons.arrow_forward),
        const SizedBox(height: 16),
      ]),
    );
  }
}

// ─── Step 4: Terms ─────────────────────────────────────────────────────────────
class _StepTerms extends StatefulWidget {
  final VoidCallback onFinish;
  const _StepTerms({required this.onFinish});
  @override
  State<_StepTerms> createState() => _StepTermsState();
}

class _StepTermsState extends State<_StepTerms> {
  bool _terms = false, _privacy = false;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
      child: Column(children: [
        const _StepHeader(
            icon: Icons.description_outlined,
            title: 'Terms & Conditions',
            subtitle: 'Review and accept to create your account'),
        const SizedBox(height: 16),
        Expanded(
            child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
              color: context.cSurf,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.cBorder)),
          child: SingleChildScrollView(
              child: Text(
            'Welcome to Ecotrade Platform.\n\nBy creating an account, you agree to participate in Kigali\'s circular economy initiative.\n\n1. Service Terms\nYou agree to provide accurate waste listings and engage in fair trade practices.\n\n2. Data Privacy\nYour personal data is encrypted and protected per GDPR standards.\n\n3. Platform Rules\n• No fraudulent listings\n• Timely collection required\n• Transparent pricing expected\n\n4. Payments\nAll transactions processed securely. Disputes resolved within 5 business days.\n\n5. Environmental Commitment\nYou commit to proper waste segregation and sustainable practices.',
            style:
                TextStyle(fontSize: 13, color: context.cTextSec, height: 1.7),
          )),
        )),
        const SizedBox(height: 14),
        Row(children: [
          Checkbox(
              value: _terms,
              onChanged: (v) => setState(() => _terms = v!),
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4))),
          Expanded(
              child: Text('I agree to the Terms and Conditions',
                  style: TextStyle(fontSize: 13, color: context.cText))),
        ]),
        Row(children: [
          Checkbox(
              value: _privacy,
              onChanged: (v) => setState(() => _privacy = v!),
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4))),
          Expanded(
              child: Text('I agree to the Privacy Policy',
                  style: TextStyle(fontSize: 13, color: context.cText))),
        ]),
        const SizedBox(height: 16),
        EcoButton(
            label: 'Create Account',
            onPressed: (_terms && _privacy) ? widget.onFinish : null,
            icon: Icons.check_circle_outline),
      ]),
    );
  }
}
