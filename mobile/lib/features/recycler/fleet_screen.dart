import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_theme.dart';
import '../shared/widgets/shared_cards.dart';
import '../shared/widgets/eco_button.dart';

class FleetScreen extends StatefulWidget {
  const FleetScreen({super.key});

  @override
  State<FleetScreen> createState() => _FleetScreenState();
}

class _FleetScreenState extends State<FleetScreen> {
  final List<Map<String, dynamic>> _drivers = [
    {
      'name': 'Jean Paul Kagame',
      'phone': '+250 788 123 456',
      'vehicle': 'Toyota Hilux • RRA 456T',
      'status': 'active',
      'location': 'Nyarugenge, Kigali',
      'jobs': '12',
      'rating': '4.8',
      'todayJobs': '2',
    },
    {
      'name': 'Marie Claire Uwera',
      'phone': '+250 788 456 789',
      'vehicle': 'Yamaha FZ • RRA 221K',
      'status': 'active',
      'location': 'Gasabo, Kigali',
      'jobs': '8',
      'rating': '4.5',
      'todayJobs': '1',
    },
    {
      'name': 'Pierre Nkurunziza',
      'phone': '+250 789 012 345',
      'vehicle': 'Toyota Prado • RRA 789M',
      'status': 'idle',
      'location': 'Kicukiro, Kigali',
      'jobs': '20',
      'rating': '4.7',
      'todayJobs': '0',
    },
    {
      'name': 'Eric Mutabazi',
      'phone': '+250 783 567 890',
      'vehicle': 'Pickup Truck • RRA 334N',
      'status': 'offline',
      'location': 'Last seen 2h ago',
      'jobs': '5',
      'rating': '4.2',
      'todayJobs': '0',
    },
  ];

  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _vehicleCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final active = _drivers.where((d) => d['status'] == 'active').length;
    final idle = _drivers.where((d) => d['status'] == 'idle').length;

    return Scaffold(
      backgroundColor: context.cBg,
      appBar: AppBar(
        title: const Text('Driver Fleet'),
        actions: [
          ElevatedButton.icon(
            onPressed: () => _showAddDriverSheet(context),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Add Driver'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(0, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Column(
        children: [
          // Fleet summary
          Container(
            margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                _FleetStat(value: '$active', label: 'Active', color: Colors.white),
                _FleetDivider(),
                _FleetStat(value: '$idle', label: 'Idle', color: Colors.white70),
                _FleetDivider(),
                _FleetStat(value: '${_drivers.length - active - idle}', label: 'Offline', color: Colors.white54),
                _FleetDivider(),
                _FleetStat(value: _drivers.length.toString(), label: 'Total', color: Colors.white),
              ],
            ),
          ).animate().slideY(begin: 0.2, duration: 300.ms).fadeIn(),

          const SizedBox(height: 16),

          // Map overview
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            height: 160,
            decoration: BoxDecoration(
              color: const Color(0xFFD4EDDA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Stack(
              children: [
                // Map background
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      color: const Color(0xFFD4EDDA),
                      child: Stack(
                        children: [
                          ...List.generate(5, (i) => Positioned(
                            left: i * 70.0,
                            top: 0,
                            bottom: 0,
                            child: Container(width: 1, color: Colors.white.withValues(alpha: 0.5)),
                          )),
                          ...List.generate(4, (i) => Positioned(
                            top: i * 40.0,
                            left: 0,
                            right: 0,
                            child: Container(height: 1, color: Colors.white.withValues(alpha: 0.5)),
                          )),
                          // Driver markers
                          ...[
                            {'x': 0.2, 'y': 0.3, 'color': AppColors.primary},
                            {'x': 0.55, 'y': 0.5, 'color': AppColors.primary},
                            {'x': 0.75, 'y': 0.25, 'color': AppColors.accent},
                          ].map((m) => Positioned(
                            left: (MediaQuery.of(context).size.width - 40) * (m['x'] as double),
                            top: 160 * (m['y'] as double),
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: m['color'] as Color,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: const Icon(Icons.person, color: Colors.white, size: 16),
                            ),
                          )),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.my_location, size: 14, color: AppColors.primary),
                        SizedBox(width: 4),
                        Text('Live Fleet Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ).animate().slideY(begin: 0.2, duration: 300.ms, delay: 80.ms).fadeIn(),

          const SizedBox(height: 16),

          // Driver list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              itemCount: _drivers.length,
              itemBuilder: (context, index) {
                return _DriverCard(driver: _drivers[index])
                    .animate()
                    .slideY(begin: 0.15, duration: 300.ms, delay: (index * 60 + 160).ms)
                    .fadeIn();
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showAddDriverSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Add New Driver', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 20),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Driver Full Name',
                prefixIcon: Icon(Icons.person_outline),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneCtrl,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: Icon(Icons.phone_outlined),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _vehicleCtrl,
              decoration: const InputDecoration(
                labelText: 'Vehicle Plate',
                prefixIcon: Icon(Icons.directions_car_outlined),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            EcoButton(
              label: 'Send Invitation',
              onPressed: () {
                final name = _nameCtrl.text.trim();
                final phone = _phoneCtrl.text.trim();
                if (name.isEmpty || phone.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please fill in name and phone'),
                      backgroundColor: AppColors.error,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                  return;
                }
                setState(() {
                  _drivers.add({
                    'name': name,
                    'phone': phone,
                    'vehicle': _vehicleCtrl.text.isNotEmpty ? _vehicleCtrl.text : 'Vehicle TBD',
                    'status': 'idle',
                    'location': 'Kigali',
                    'jobs': '0',
                    'rating': '4.0',
                    'todayJobs': '0',
                  });
                });
                _nameCtrl.clear();
                _phoneCtrl.clear();
                _vehicleCtrl.clear();
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Text('Invitation sent to $name'),
                      ],
                    ),
                    backgroundColor: AppColors.primary,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FleetStat extends StatelessWidget {
  final String value;
  final String label;
  final Color color;
  const _FleetStat({required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800)),
          ),
          Text(label, style: TextStyle(color: color.withValues(alpha: 0.8), fontSize: 12)),
        ],
      ),
    );
  }
}

class _FleetDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.2));
  }
}

class _DriverCard extends StatelessWidget {
  final Map<String, dynamic> driver;
  const _DriverCard({required this.driver});

  Color get _statusColor {
    switch (driver['status']) {
      case 'active': return AppColors.primary;
      case 'idle': return AppColors.accent;
      default: return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cSurf,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cBorder),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Stack(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: _statusColor.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.person, color: _statusColor, size: 28),
                  ),
                  Positioned(
                    bottom: 1,
                    right: 1,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: _statusColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(driver['name']!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    Text(driver['vehicle']!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textTertiary),
                        const SizedBox(width: 3),
                        Text(driver['location']!, style: const TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star, color: AppColors.accent, size: 13),
                      const SizedBox(width: 2),
                      Text(driver['rating']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${driver['todayJobs']} today',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  StatusBadge(
                    label: (driver['status'] as String).toUpperCase(),
                    type: driver['status'] == 'active'
                        ? StatusType.success
                        : driver['status'] == 'idle'
                            ? StatusType.warning
                            : StatusType.neutral,
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Tracking ${driver['name']}...'), behavior: SnackBarBehavior.floating),
                  ),
                  icon: const Icon(Icons.my_location, size: 14),
                  label: const Text('Track'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Assign job to ${driver['name']}'), behavior: SnackBarBehavior.floating),
                  ),
                  icon: const Icon(Icons.assignment_outlined, size: 14),
                  label: const Text('Assign'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Calling ${driver['phone']}...'), behavior: SnackBarBehavior.floating),
                ),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(36, 36),
                  padding: EdgeInsets.zero,
                ),
                child: const Icon(Icons.call, size: 16),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
