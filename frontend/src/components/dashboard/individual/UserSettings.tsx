import { useState, useEffect } from 'react';
import { usersAPI, type APIUser } from '../../../services/api';
import { CheckCircle } from 'lucide-react';
import { userProfile } from './_shared';

export default function UserSettings() {
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState('+250 780 162 164');
  const [location, setLocation] = useState(userProfile.location);
  const [language, setLanguage] = useState('en');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [newsletter, setNewsletter] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    usersAPI.me().then((u: APIUser) => {
      setUserId(u.id);
      setName(u.full_name || userProfile.name);
      setEmail(u.email || '');
      if (u.phone) setPhone(u.phone);
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    if (userId) usersAPI.update(userId, { full_name: name, email, phone }).catch(() => {});
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        {saved && <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16} /> Saved</span>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Profile</h2>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="en">English</option><option value="rw">Kinyarwanda</option><option value="fr">Français</option></select></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Notifications</h2>
          {[
            { label: 'Email Notifications', desc: 'Receive updates about orders and recycling', value: emailNotifs, setter: setEmailNotifs },
            { label: 'Push Notifications', desc: 'Get alerts on your device', value: pushNotifs, setter: setPushNotifs },
            { label: 'Newsletter', desc: 'Weekly eco-tips and marketplace highlights', value: newsletter, setter: setNewsletter },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p></div>
              <button onClick={() => item.setter(!item.value)} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${item.value ? 'bg-cyan-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-800 shadow mt-0.5 transition ${item.value ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Danger Zone</h3>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 mb-3">Once you delete your account, there is no going back.</p>
            <button className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Account</button>
          </div>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Save Settings</button></div>
    </div>
  );
}
