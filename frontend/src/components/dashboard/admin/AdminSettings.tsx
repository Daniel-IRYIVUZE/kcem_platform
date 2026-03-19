// pages/dashboard/admin/Settings.tsx
import { useEffect, useState } from 'react';
import { Save, Settings, Bell, Shield, CreditCard, Globe, Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import { adminAPI, type AdminPlatformSettings } from '../../../services/api';

interface SmtpStatus {
  configured: boolean;
  smtp_host: string | null;
  smtp_user: string | null;
  email_from: string | null;
  admin_email: string | null;
}

const defaults: AdminPlatformSettings = {
  platformName: 'EcoTrade Rwanda',
  platformFeePercent: 10,
  minBidAmount: 5000,
  listingExpiryDays: 30,
  maintenanceMode: false,
  emailNotifications: true,
  smsNotifications: true,
  autoApproveListings: false,
  requireIDVerification: true,
  currency: 'RWF',
  country: 'Rwanda',
  supportEmail: 'support@ecotrade.rw',
  supportPhone: '+250 780 162 164',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminPlatformSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [smtp, setSmtp] = useState<SmtpStatus | null>(null);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      adminAPI.getSettings(),
      adminAPI.getSmtpStatus(),
    ]).then(([data, smtpData]) => {
      if (!mounted) return;
      setSettings({ ...defaults, ...data });
      setSmtp(smtpData);
      setError(null);
    }).catch((err: Error) => {
      if (!mounted) return;
      setError(err.message || 'Failed to load settings.');
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const testSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const res = await adminAPI.testSmtp();
      setSmtpTestResult({ ok: true, msg: res.message });
    } catch (e) {
      setSmtpTestResult({ ok: false, msg: e instanceof Error ? e.message : 'SMTP test failed.' });
    } finally {
      setSmtpTesting(false);
    }
  };

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const persisted = await adminAPI.saveSettings(settings);
      setSettings({ ...defaults, ...persisted });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const Field = ({ label, id, type = 'text', value, onChange }: { 
    label: string; 
    id: string; 
    type?: string; 
    value: any; 
    onChange: (v: any) => void 
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input 
        id={id} 
        type={type} 
        value={value} 
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} 
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }: { 
    label: string; 
    desc: string; 
    checked: boolean; 
    onChange: (v: boolean) => void 
  }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)} 
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
          checked ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading settings...</div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Settings size={20} className="text-cyan-600" />
          Platform Settings
        </h2>
        {saved && (
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
            ✓ Settings saved!
          </span>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Globe size={16} />
          General
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field 
            label="Platform Name" 
            id="name" 
            value={settings.platformName} 
            onChange={v => setSettings({...settings, platformName: v})}
          />
          <Field 
            label="Country" 
            id="country" 
            value={settings.country} 
            onChange={v => setSettings({...settings, country: v})}
          />
          <Field 
            label="Support Email" 
            id="email" 
            value={settings.supportEmail} 
            onChange={v => setSettings({...settings, supportEmail: v})}
          />
          <Field 
            label="Support Phone" 
            id="phone" 
            value={settings.supportPhone} 
            onChange={v => setSettings({...settings, supportPhone: v})}
          />
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <CreditCard size={16} />
          Financial
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field 
            label="Platform Fee (%)" 
            id="fee" 
            type="number" 
            value={settings.platformFeePercent} 
            onChange={v => setSettings({...settings, platformFeePercent: v})}
          />
          <Field 
            label="Minimum Bid (RWF)" 
            id="minbid" 
            type="number" 
            value={settings.minBidAmount} 
            onChange={v => setSettings({...settings, minBidAmount: v})}
          />
          <Field 
            label="Listing Expiry (days)" 
            id="expiry" 
            type="number" 
            value={settings.listingExpiryDays} 
            onChange={v => setSettings({...settings, listingExpiryDays: v})}
          />
          <Field 
            label="Currency" 
            id="currency" 
            value={settings.currency} 
            onChange={v => setSettings({...settings, currency: v})}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
          <Bell size={16} />
          Notifications & Features
        </h3>
        <div>
          <Toggle 
            label="Email Notifications" 
            desc="Send email alerts to users" 
            checked={settings.emailNotifications} 
            onChange={v => setSettings({...settings, emailNotifications: v})}
          />
          <Toggle 
            label="SMS Notifications" 
            desc="Send SMS alerts for bids and collections" 
            checked={settings.smsNotifications} 
            onChange={v => setSettings({...settings, smsNotifications: v})}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
          <Shield size={16} />
          Security & Compliance
        </h3>
        <div>
          <Toggle 
            label="Require ID Verification" 
            desc="Require identity docs before account activation" 
            checked={settings.requireIDVerification} 
            onChange={v => setSettings({...settings, requireIDVerification: v})}
          />
          <Toggle 
            label="Auto-Approve Listings" 
            desc="Automatically approve new waste listings" 
            checked={settings.autoApproveListings} 
            onChange={v => setSettings({...settings, autoApproveListings: v})}
          />
          <Toggle 
            label="Maintenance Mode" 
            desc="Take the platform offline for maintenance" 
            checked={settings.maintenanceMode} 
            onChange={v => setSettings({...settings, maintenanceMode: v})}
          />
        </div>
      </div>

      {/* SMTP Status Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Mail size={16} />
          Email (SMTP) Configuration
        </h3>
        {smtp ? (
          <>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
              smtp.configured
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              {smtp.configured
                ? <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                : <XCircle size={18} className="text-red-500 flex-shrink-0" />}
              <div>
                <p className={`text-sm font-medium ${smtp.configured ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-400'}`}>
                  {smtp.configured ? 'SMTP is configured and ready' : 'SMTP is not configured — emails will not be delivered'}
                </p>
                {!smtp.configured && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                    Set SMTP_USER, SMTP_PASSWORD and EMAIL_FROM in <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">backend/.env</code> then restart the server.
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['SMTP Host', smtp.smtp_host],
                ['SMTP User', smtp.smtp_user],
                ['From Address', smtp.email_from],
                ['Admin Email', smtp.admin_email],
              ].map(([label, val]) => (
                <div key={label as string} className="bg-gray-50 dark:bg-gray-900/40 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className={`font-medium text-xs truncate ${val ? 'text-gray-800 dark:text-white' : 'text-gray-400 italic'}`}>
                    {val ?? 'not set'}
                  </p>
                </div>
              ))}
            </div>
            {smtp.configured && (
              <div className="flex items-center gap-3">
                <button
                  onClick={testSmtp}
                  disabled={smtpTesting}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {smtpTesting ? <Loader size={14} className="animate-spin" /> : <Mail size={14} />}
                  {smtpTesting ? 'Sending test email…' : 'Send Test Email'}
                </button>
                {smtpTestResult && (
                  <span className={`text-sm flex items-center gap-1.5 ${smtpTestResult.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {smtpTestResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {smtpTestResult.msg}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">Loading SMTP status…</p>
        )}
      </div>

      {/* Maintenance Warning */}
      {settings.maintenanceMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg p-4 text-sm">
          ⚠️ <strong>Warning:</strong> Maintenance mode is enabled. Users will see a maintenance page when visiting the platform.
        </div>
      )}

      {/* Save Button */}
      <button 
        onClick={save} 
        disabled={loading || isSaving}
        className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl hover:bg-cyan-700 font-medium transition-colors disabled:opacity-50"
      >
        <Save size={16} /> {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}