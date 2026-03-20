import { useState, useEffect } from 'react';
import { usersAPI, recyclersAPI } from '../../../services/api';
import type { RecyclerProfile } from '../../../services/api';
import { CheckCircle, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const WASTE_TYPES = [
  { key: 'UCO', label: 'UCO (Used Cooking Oil)' },
  { key: 'Glass', label: 'Glass' },
  { key: 'Paper/Cardboard', label: 'Paper / Cardboard' },
  { key: 'Organic', label: 'Organic Waste' },
  { key: 'Plastic', label: 'Plastic' },
  { key: 'Metal', label: 'Metal' },
  { key: 'Electronic', label: 'Electronic / E-Waste' },
  { key: 'Textile', label: 'Textile' },
  { key: 'Mixed', label: 'Mixed Waste' },
];

export default function RecyclerSettings() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<RecyclerProfile | null>(null);
  const [hasRecyclerProfile, setHasRecyclerProfile] = useState(false);

  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [userPhone, setUserPhone]   = useState('');

  const [companyName, setCompanyName]         = useState('');
  const [address, setAddress]                 = useState('');
  const [city, setCity]                       = useState('Kigali');
  const [phone, setPhone]                     = useState('');
  const [website, setWebsite]                 = useState('');
  const [description, setDescription]         = useState('');
  const [storageCapacity, setStorageCapacity] = useState('');
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    Promise.all([
      usersAPI.me().catch(() => null),
      recyclersAPI.me().catch(() => null),
    ]).then(([u, r]) => {
      if (!u) return;

      setFullName(u.full_name || '');
      setEmail(u.email || '');
      setUserPhone(u.phone || '');
      updateUser({ name: u.full_name || '' });

      if (!r) return;

      setHasRecyclerProfile(true);
      setProfile(r);
      setCompanyName(r.company_name || '');
      setAddress(r.address || '');
      setCity(r.city || 'Kigali');
      setPhone(r.phone || '');
      setWebsite(r.website || '');
      setDescription(r.description || '');
      setStorageCapacity(String(r.storage_capacity || ''));
      if (r.waste_types_handled) {
        try {
          const parsed = typeof r.waste_types_handled === 'string'
            ? JSON.parse(r.waste_types_handled)
            : r.waste_types_handled;
          setSelectedWasteTypes(Array.isArray(parsed) ? parsed : []);
        } catch {
          setSelectedWasteTypes(
            typeof r.waste_types_handled === 'string'
              ? r.waste_types_handled.split(',').map(s => s.trim()).filter(Boolean)
              : []
          );
        }
      }
    }).catch(() => {});
  }, [updateUser]);

  const toggleWasteType = (key: string) =>
    setSelectedWasteTypes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const name = fullName.trim();
      const company = companyName.trim();
      const companyAddress = address.trim();

      if (!name) throw new Error('Full name is required.');
      if (!company) throw new Error('Company name is required.');
      if (!companyAddress) throw new Error('Address is required.');

      await usersAPI.updateMe({
        full_name: name,
        phone: userPhone.trim() || undefined,
        email: email.trim() || undefined,
      });

      const recyclerPayload = {
        company_name: company,
        address: companyAddress,
        city: city.trim() || 'Kigali',
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
        waste_types_handled: selectedWasteTypes,
        storage_capacity: storageCapacity ? Number(storageCapacity) : undefined,
      };

      if (hasRecyclerProfile) {
        await recyclersAPI.update(recyclerPayload);
      } else {
        await recyclersAPI.create(recyclerPayload);
        setHasRecyclerProfile(true);
      }

      updateUser({ name, companyName: company, phone: userPhone.trim() || undefined, email });
      setStatus('success');
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Save failed. Please try again.');
      setStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  const field = (label: string, value: string, onChange: (v: string) => void, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Settings</h1>
        {status === 'success' && (
          <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
            <CheckCircle size={16} /> Changes saved successfully
          </span>
        )}
        {status === 'error' && (
          <span className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
            <AlertCircle size={16} /> {errMsg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-base font-semibold border-b border-gray-100 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">
            Account Details
          </h2>
          {field('Full Name', fullName, setFullName)}
          {field('Email', email, setEmail, 'email')}
          {field('Account Phone', userPhone, setUserPhone)}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-base font-semibold border-b border-gray-100 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">
            Company Profile {profile?.is_verified && <span className="ml-2 text-xs text-green-600 inline-flex items-center gap-0.5"><Check size={11}/> Verified</span>}
          </h2>
          {field('Company Name', companyName, setCompanyName)}
          {field('Address', address, setAddress)}
          {field('City', city, setCity)}
          {field('Company Phone', phone, setPhone)}
          {field('Website', website, setWebsite)}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>
          {field('Storage Capacity (kg)', storageCapacity, setStorageCapacity, 'number')}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold border-b border-gray-100 dark:border-gray-700 pb-2 mb-4 text-gray-900 dark:text-white">
          Waste Types Handled
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WASTE_TYPES.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 p-3 rounded-xl text-sm cursor-pointer border-2 transition-all ${
                selectedWasteTypes.includes(key)
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 dark:border-cyan-600 text-cyan-700 dark:text-cyan-300'
                  : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedWasteTypes.includes(key)}
                onChange={() => toggleWasteType(key)}
                className="rounded text-cyan-600 accent-cyan-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
