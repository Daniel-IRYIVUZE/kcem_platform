import { useState } from 'react';
import { getAll, update as dsUpdate } from '../../../utils/dataStore';
import type { PlatformUser } from '../../../utils/dataStore';
import { CheckCircle } from 'lucide-react';
import { driverProfile } from './_shared';

export default function DriverSettings() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: driverProfile.name, phone: driverProfile.phone, location: 'Kigali, Rwanda', language: 'English' });
  const [toggles, setToggles] = useState({ gps: true, pushNotifs: true, smsAlerts: false });

  const handleSave = () => {
    const users = getAll<PlatformUser>('users');
    const user = users.find(u => u.role === 'driver');
    if (user) {
      dsUpdate<PlatformUser>('users', user.id, { name: form.name, phone: form.phone, location: form.location });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        {saved && <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium"><CheckCircle size={18} /> Saved!</div>}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: 'Full Name', key: 'name' as const, type: 'text' },
            { label: 'Phone Number', key: 'phone' as const, type: 'tel' },
            { label: 'Location', key: 'location' as const, type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
            <select value={form.language} onChange={e => setForm(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none">
              <option>English</option><option>Kinyarwanda</option><option>French</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: 'gps' as const, label: 'Live GPS Tracking', desc: 'Allow the platform to track your location during active routes' },
            { key: 'pushNotifs' as const, label: 'Push Notifications', desc: 'Receive alerts for new assignments and schedule changes' },
            { key: 'smsAlerts' as const, label: 'SMS Alerts', desc: 'Get SMS messages for critical updates (may incur charges)' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p></div>
              <button onClick={() => setToggles(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${toggles[key] ? 'bg-cyan-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 shadow transition-transform ${toggles[key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">Save Changes</button>
      </div>
    </div>
  );
}
