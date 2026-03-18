import { useState, useEffect } from 'react';
import { usersAPI, driversAPI } from '../../../services/api';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DriverSettings() {
  const [userId, setUserId] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    accountPhone: '',
    driverPhone: '',
    licenseNumber: '',
    status: 'available' as 'available' | 'on_route' | 'off_duty',
  });

  useEffect(() => {
    Promise.all([
      usersAPI.me().catch(() => null),
      driversAPI.me().catch(() => null),
    ]).then(([u, d]) => {
      if (u) {
        setUserId(u.id);
        setForm(prev => ({
          ...prev,
          name: u.full_name || '',
          email: u.email || '',
          accountPhone: u.phone || '',
        }));
      }
      if (d) {
        setDriverId(d.id);
        setForm(prev => ({
          ...prev,
          driverPhone: d.phone || '',
          licenseNumber: d.license_number || '',
          status: d.status || 'available',
        }));
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      await usersAPI.updateMe({
        full_name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.accountPhone.trim() || undefined,
      });

      if (driverId) {
        await driversAPI.updateProfile({
          phone: form.driverPhone.trim() || undefined,
          license_number: form.licenseNumber.trim() || undefined,
          status: form.status,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        {saved && <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium"><CheckCircle size={18} /> Saved!</div>}
      </div>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: 'Full Name', key: 'name' as const, type: 'text' },
            { label: 'Email', key: 'email' as const, type: 'email' },
            { label: 'Account Phone', key: 'accountPhone' as const, type: 'tel' },
            { label: 'Driver Phone', key: 'driverPhone' as const, type: 'tel' },
            { label: 'License Number', key: 'licenseNumber' as const, type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Availability Status</label>
            <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as 'available' | 'on_route' | 'off_duty' }))}
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none">
              <option value="available">Available</option>
              <option value="on_route">On Route</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
