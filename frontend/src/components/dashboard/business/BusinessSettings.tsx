// components/dashboard/business/BusinessSettings.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { usersAPI, hotelsAPI, authAPI } from '../../../services/api';
import type { UserDocument } from '../../../services/api';
import { CheckCircle, Upload, FileText, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { resolveMediaUrl } from '../../../services/api';

function DocStatusBadge() {
  // Always show 'Confirmed' for RDB docs
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      <CheckCircle size={11} /> Confirmed
    </span>
  );
}

export default function BusinessSettings() {
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hotelName, setHotelName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [hasHotelProfile, setHasHotelProfile] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [pwdNew, setPwdNew]         = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdMsg, setPwdMsg]         = useState<{ text: string; ok: boolean } | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await usersAPI.getMyDocuments();
      setDocuments(docs.filter(d => d.doc_type === 'rdb_certificate'));
    } catch {
      // silent
    }
  }, []);

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
          setTinNumber(h.tin_number || '');
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
    loadDocuments();
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contact = contactPerson.trim();
      const hotel = hotelName.trim();
      const hotelAddress = address.trim();
      const phoneValue = phone.trim();

      if (!contact) throw new Error('Contact person is required.');
      if (!hotel) throw new Error('Hotel name is required.');
      if (!hotelAddress) throw new Error('Address is required.');

      await usersAPI.updateMe({
        full_name: contact,
        phone: phoneValue || undefined,
        email: email.trim() || undefined,
      });

      const hotelPayload = {
        hotel_name: hotel,
        address: hotelAddress,
        phone: phoneValue || undefined,
        tin_number: tinNumber.trim() || undefined,
      };

      if (hasHotelProfile) {
        await hotelsAPI.update(hotelPayload);
      } else {
        await hotelsAPI.create(hotelPayload);
        setHasHotelProfile(true);
      }

      updateUser({ businessName: hotel, name: contact, phone: phoneValue, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }, [contactPerson, phone, hotelName, address, email, tinNumber, hasHotelProfile, updateUser]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed for RDB Certificate.');
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotel Settings</h1>
        {saved && (
          <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
            <CheckCircle size={16} /> Saved successfully
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotel Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Hotel Profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hotel Name</label>
            <input value={hotelName} onChange={e => setHotelName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TIN Number</label>
            <input
              value={tinNumber}
              onChange={e => setTinNumber(e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <span className="mt-1 text-xs text-green-600 dark:text-green-400 font-semibold">Confirmed</span>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Rwanda Revenue Authority Tax Identification Number</p>
          </div>
        </div>

        {/* RDB Certificate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">RDB Certificate</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload your Rwanda Development Board business registration certificate (PDF or image). An admin will review and approve it.
          </p>

          {/* Existing documents */}
          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-cyan-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {doc.file_name || 'RDB Certificate'}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <DocStatusBadge />
                    {doc.file_url && (
                      <a
                        href={resolveMediaUrl(doc.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        if (documents.length === 1) {
                          setUploadError('RDB Certificate is required. Please upload a new PDF before removing.');
                          return;
                        }
                        try {
                          await usersAPI.deleteDocument(doc.id);
                          await loadDocuments();
                        } catch (err) {
                          setUploadError('Failed to delete document.');
                        }
                      }}
                      className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
                    >
                      Remove
                    </button>
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
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">RDB Certificate is required. Please upload a PDF document.</p>
          )}

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
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
            <p className="mt-1 text-xs text-gray-400">Accepted: PDF only (max 10 MB)</p>
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
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition ${loading ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
