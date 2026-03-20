import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/api_service.dart';

class AdminSettingsScreen extends ConsumerStatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  ConsumerState<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends ConsumerState<AdminSettingsScreen> {
  Map<String, dynamic> settings = {};
  bool loading = true;
  bool saving = false;
  String? error;
  bool saved = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() { loading = true; error = null; });
    try {
      settings = await ApiService.getPlatformSettings();
    } catch (e) {
      error = e.toString();
    } finally {
      setState(() { loading = false; });
    }
  }

  Future<void> _saveSettings() async {
    setState(() { saving = true; error = null; });
    try {
      final updated = await ApiService.savePlatformSettings(settings);
      settings = updated;
      saved = true;
      Future.delayed(const Duration(seconds: 2), () => setState(() => saved = false));
      // Diagnostic: log success
      debugPrint('Settings saved: $updated');
    } catch (e) {
      error = e.toString();
      // Diagnostic: log error
      debugPrint('Settings save error: $e');
    } finally {
      setState(() { saving = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Settings')),
      body: loading
        ? const Center(child: CircularProgressIndicator())
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                if (error != null)
                  Text(error!, style: const TextStyle(color: Colors.red)),
                if (saved)
                  const Text('Settings saved!', style: TextStyle(color: Colors.green)),
                Expanded(
                  child: ListView(
                    children: [
                      _buildField('Platform Name', 'platformName'),
                      _buildField('Country', 'country'),
                      _buildField('Support Email', 'supportEmail'),
                      _buildField('Support Phone', 'supportPhone'),
                      _buildField('Platform Fee (%)', 'platformFeePercent', isNumber: true),
                      _buildField('Minimum Bid', 'minBidAmount', isNumber: true),
                      _buildField('Listing Expiry Days', 'listingExpiryDays', isNumber: true),
                      _buildToggle('Maintenance Mode', 'maintenanceMode'),
                      _buildToggle('Email Notifications', 'emailNotifications'),
                      _buildToggle('SMS Notifications', 'smsNotifications'),
                      _buildToggle('Auto-Approve Listings', 'autoApproveListings'),
                      _buildToggle('Require ID Verification', 'requireIDVerification'),
                      _buildField('Currency', 'currency'),
                    ],
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: saving ? null : _saveSettings,
                    child: saving ? const CircularProgressIndicator() : const Text('Save Settings'),
                  ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildField(String label, String key, {bool isNumber = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        initialValue: settings[key]?.toString() ?? '',
        decoration: InputDecoration(labelText: label),
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        onChanged: (v) {
          setState(() {
            settings[key] = isNumber ? int.tryParse(v) ?? 0 : v;
          });
        },
      ),
    );
  }

  Widget _buildToggle(String label, String key) {
    return SwitchListTile(
      title: Text(label),
      value: settings[key] == true,
      onChanged: (v) {
        setState(() { settings[key] = v; });
      },
    );
  }
}
