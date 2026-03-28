import { useState, useEffect, useRef, useCallback } from 'react';
import { usersAPI, recyclersAPI, resolveMediaUrl, authAPI } from '../../../services/api';
import type { RecyclerProfile, UserDocument } from '../../../services/api';
import { CheckCircle, AlertCircle, Loader2, Check, Upload, FileText, Lock } from 'lucide-react';
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

function DocStatusBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      <CheckCircle size={11} /> Confirmed
    </span>
  );
}

export default function RecyclerSettings() {
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [tinNumber, setTinNumber]             = useState('');
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [pwdNew, setPwdNew]       = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg]       = useState<{ text: string; ok: boolean } | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await usersAPI.getMyDocuments();
      setDocuments(docs.filter(d => d.doc_type === 'rdb_certificate'));
    } catch {
      // silent
    }
  }, []);

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
      setTinNumber(r.tin_number || '');
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
    loadDocuments();
  }, [updateUser, loadDocuments]);

  const toggleWasteType = (key: string) =>
    setSelectedWasteTypes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await usersAPI.uploadDocumentFile(file, 'rdb_certificate');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      await loadDocuments();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        tin_number: tinNumber.trim() || undefined,
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TIN Number</label>
            <input
              type="text"
              value={tinNumber}
              onChange={e => setTinNumber(e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <span className="mt-1 text-xs text-green-600 dark:text-green-400 font-semibold">Confirmed</span>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Rwanda Revenue Authority Tax Identification Number</p>
          </div>
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

      {/* RDB Certificate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-base font-semibold border-b border-gray-100 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">
          RDB Certificate
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload your Rwanda Development Board business registration certificate (PDF or image). An admin will review and approve it.
        </p>

        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="text-cyan-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.file_name || 'RDB Certificate'}</p>
                    <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <DocStatusBadge />
                  {doc.file_url && (
                    <a href={resolveMediaUrl(doc.file_url)} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 hover:underline">View</a>
                  )}
                </div>
              </div>
            ))}
            {documents.some(d => d.status === 'rejected') && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300">
                  Your certificate was rejected. Please upload a new valid document.
                  {documents.find(d => d.status === 'rejected')?.notes && (
                    <span className="block mt-1 font-medium">Reason: {documents.find(d => d.status === 'rejected')!.notes}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {documents.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certificate uploaded yet.</p>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleDocumentUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDoc}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-cyan-400 dark:border-cyan-600 rounded-lg text-sm text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition disabled:opacity-50"
          >
            {uploadingDoc ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploadingDoc ? 'Uploading…' : 'Upload Certificate'}
          </button>
          <p className="mt-1 text-xs text-gray-400">Accepted: PDF, JPEG, PNG (max 10 MB)</p>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
            <AlertCircle size={12} /> {uploadError}
          </div>
        )}
        {uploadSuccess && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
            <CheckCircle size={12} /> Certificate uploaded. Pending admin review.
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-base font-semibold border-b border-gray-100 dark:border-gray-700 pb-2 text-gray-900 dark:text-white flex items-center gap-2">
          <Lock size={16} className="text-cyan-600" /> Change Password
        </h2>
        {pwdMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${pwdMsg.ok ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
            {pwdMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {pwdMsg.text}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input type="password" value={pwdNew} onChange={e => setPwdNew(e.target.value)} minLength={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Repeat new password" />
          </div>
        </div>
        <button
          disabled={pwdSaving || !pwdNew || pwdNew.length < 8 || pwdNew !== pwdConfirm}
          onClick={async () => {
            setPwdSaving(true);
            try {
              await authAPI.changePassword(pwdNew);
              setPwdMsg({ text: 'Password changed successfully.', ok: true });
              setPwdNew(''); setPwdConfirm('');
            } catch (e: any) {
              setPwdMsg({ text: e?.message || 'Failed to change password.', ok: false });
            } finally {
              setPwdSaving(false);
              setTimeout(() => setPwdMsg(null), 5000);
            }
          }}
          className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {pwdSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {pwdSaving ? 'Updating…' : 'Update Password'}
        </button>
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
