import { useState, useEffect } from 'react';
import { getAll, update as dsUpdate } from '../../../utils/dataStore';
import type { PlatformUser } from '../../../utils/dataStore';
import { CheckCircle } from 'lucide-react';
import { companyProfile } from './_shared';

export default function RecyclerSettings() {
  const getUser = () => getAll<PlatformUser>('users').find(u => u.role === 'recycler') || getAll<PlatformUser>('users').find(u => u.name === companyProfile.name);
  const [user, setUser] = useState<PlatformUser | undefined>(getUser);
  const [companyName, setCompanyName] = useState(user?.name || 'Green Energy Ltd');
  const [email, setEmail] = useState(user?.email || 'recycler@greenenergy.rw');
  const [phone, setPhone] = useState(user?.phone || '+250 780 162 164');
  const [address, setAddress] = useState(user?.location || 'Kicukiro Industrial Zone, Kigali');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) { setUser(u); setCompanyName(u.name); setEmail(u.email); setPhone(u.phone); setAddress(u.location); }
  }, []);

  const handleSave = () => {
    if (user) dsUpdate<PlatformUser>('users', user.id, { name: companyName, email, phone, location: address });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Settings</h1>
        {saved && <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16} /> Saved</span>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Company Profile</h2>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Waste Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select the waste types your company handles</p>
          <div className="space-y-2">
            {['UCO (Used Cooking Oil)', 'Glass', 'Paper/Cardboard', 'Organic Waste', 'Plastic', 'Metal'].map(type => (
              <label key={type} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm cursor-pointer hover:bg-gray-100 dark:bg-gray-700">
                <input type="checkbox" defaultChecked={!type.includes('Metal')} className="rounded text-cyan-600" />{type}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Save Settings</button>
      </div>
    </div>
  );
}
