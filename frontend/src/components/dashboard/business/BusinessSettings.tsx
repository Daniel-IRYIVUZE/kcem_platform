// components/dashboard/business/BusinessSettings.tsx
import { useState, useEffect, useCallback } from 'react';
import { usersAPI, hotelsAPI } from '../../../services/api';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function BusinessSettings() {
  const { updateUser } = useAuth();
  const [hotelName, setHotelName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hasHotelProfile, setHasHotelProfile] = useState(false);
  const [autoAcceptBids, setAutoAcceptBids] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [u, h] = await Promise.all([
          usersAPI.me().catch(() => null),
          hotelsAPI.me().catch(() => null),
        ]);
        
        if (u) {
          setContactPerson(u.full_name || '');
          setEmail(u.email || '');
          setPhone(u.phone || '');
        }
        if (h) {
          setHasHotelProfile(true);
          setHotelName(h.hotel_name || '');
          setAddress(h.address || '');
          setPhone(h.phone || (u?.phone || ''));
          updateUser({ businessName: h.hotel_name });
        }
        if (u?.full_name) {
          updateUser({ name: u.full_name });
        }
      } catch (err) {
        console.error('Error loading hotel settings:', err);
      }
    };
    
    loadData();
  }, [updateUser]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contact = contactPerson.trim();
      const hotel = hotelName.trim();
      const hotelAddress = address.trim();
      const phoneValue = phone.trim();

      if (!contact) {
        throw new Error('Contact person is required.');
      }
      if (!hotel) {
        throw new Error('Hotel name is required.');
      }
      if (!hotelAddress) {
        throw new Error('Address is required.');
      }
      
      // Save contact person and phone to user profile
      await usersAPI.updateMe({ full_name: contact, phone: phoneValue || undefined });
      
      const hotelPayload = { hotel_name: hotel, address: hotelAddress, phone: phoneValue || undefined };

      if (hasHotelProfile) {
        await hotelsAPI.update(hotelPayload);
      } else {
        await hotelsAPI.create(hotelPayload);
        setHasHotelProfile(true);
      }
      
      // Update auth context cache
      updateUser({ businessName: hotel, name: contact, phone: phoneValue, email });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [contactPerson, phone, hotelName, address, email, hasHotelProfile, updateUser]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotel Settings</h1>{saved && <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16} /> Saved successfully</span>}</div>
      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><p className="text-sm text-red-700 dark:text-red-300">{error}</p></div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Hotel Profile</h2>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hotel Name</label><input value={hotelName} onChange={e => setHotelName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label><input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
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
      <div className="flex justify-end"><button onClick={handleSave} disabled={loading} className={`px-6 py-2 rounded-lg text-sm font-medium transition ${loading ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}>{loading ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}
