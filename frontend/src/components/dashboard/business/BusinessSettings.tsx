// components/dashboard/business/BusinessSettings.tsx
import { useState, useEffect } from 'react';
import { usersAPI, type APIUser } from '../../../services/api';
import { CheckCircle } from 'lucide-react';

export default function BusinessSettings() {
  const [userId, setUserId] = useState<number | null>(null);
  const [hotelName, setHotelName] = useState('Hotel Mille Collines');
  const [email, setEmail] = useState('hotel@millecollines.rw');
  const [phone, setPhone] = useState('+250 780 162 164');
  const [address, setAddress] = useState('KG 2 Ave, Kigali');
  const [contactPerson, setContactPerson] = useState('Jean Bosco Kariyo');
  const [autoAcceptBids, setAutoAcceptBids] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    usersAPI.me().then((u: APIUser) => {
      setUserId(u.id);
      setHotelName(u.full_name || 'Hotel Mille Collines');
      setEmail(u.email || '');
      setPhone(u.phone || '');
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    if (userId) usersAPI.update(userId, { full_name: hotelName, email, phone }).catch(() => {});
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotel Settings</h1>{saved && <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16} /> Saved successfully</span>}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Hotel Profile</h2>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hotel Name</label><input value={hotelName} onChange={e => setHotelName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label><input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Preferences</h2>
          {[
            { label: 'Auto-Accept Top Bid', desc: 'Automatically accept the highest bid when listing expires', value: autoAcceptBids, setter: setAutoAcceptBids },
            { label: 'Email Notifications', desc: 'Receive email for new bids and collection updates', value: emailNotifs, setter: setEmailNotifs },
            { label: 'SMS Notifications', desc: 'Receive SMS alerts for important events', value: smsNotifs, setter: setSmsNotifs },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p></div>
              <button onClick={() => item.setter(!item.value)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors ${item.value ? 'bg-cyan-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-800 shadow ring-0 transition mt-0.5 ${item.value ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Waste Collection Preferences</h3>
            <div className="space-y-2">
              {['UCO', 'Glass', 'Paper/Cardboard', 'Organic Waste'].map(type => (
                <label key={type} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="rounded text-cyan-600 focus:ring-cyan-500" />{type}</label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Save Settings</button></div>
    </div>
  );
}
