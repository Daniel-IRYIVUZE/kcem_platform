import { motion } from 'framer-motion';
import {
  Mail,
  CheckCircle,
  Navigation,
  ShoppingBag,
  Recycle,
  Truck,
  User,
  Shield,
  ArrowRight,
  TrendingUp,
  Smartphone,
  WifiOff,
  QrCode,
  Camera
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: any;
  count: number;
}

interface UpdatesSubscriptionSectionProps {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  subscriptionPreferences: {
    platformUpdates: boolean;
    industryNews: boolean;
    priceAlerts: boolean;
    eventInvites: boolean;
    roleUpdates: boolean;
    mobileUpdates: boolean;
  };
  tabs: Tab[];
  onEmailChange: (email: string) => void;
  onPreferenceChange: (key: keyof UpdatesSubscriptionSectionProps['subscriptionPreferences']) => void;
  onSubscribe: () => void;
}

const UpdatesSubscriptionSection = ({
  email,
  status,
  subscriptionPreferences,
  tabs,
  onEmailChange,
  onPreferenceChange,
  onSubscribe
}: UpdatesSubscriptionSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Subscribe Widget */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Mail size={24} className="text-cyan-300" />
          <h3 className="text-xl font-bold">Role-Specific Updates</h3>
        </div>

        <p className="text-cyan-100/80 text-sm mb-6">
          Get updates tailored to your role. Select which notifications you want to receive.
        </p>

        {status === 'success' ? (
          <div className="p-4 bg-cyan-500/20 border border-cyan-500/30 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-cyan-300" />
              <div>
                <p className="font-medium text-cyan-100">Subscribed successfully!</p>
                <p className="text-sm text-cyan-200/80">Check your email for confirmation.</p>
              </div>
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl mb-4">
            <p className="text-rose-100 text-sm">Please enter a valid email address</p>
          </div>
        ) : null}

        <div className="space-y-4 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl bg-cyan-800/50 border border-cyan-700 text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={status === 'loading'}
          />

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionPreferences.platformUpdates}
                onChange={() => onPreferenceChange('platformUpdates')}
                className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
              />
              Platform Updates
            </label>
            <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionPreferences.industryNews}
                onChange={() => onPreferenceChange('industryNews')}
                className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
              />
              Industry News
            </label>
            <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionPreferences.roleUpdates}
                onChange={() => onPreferenceChange('roleUpdates')}
                className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
              />
              Role-Specific Updates
            </label>
            <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionPreferences.mobileUpdates}
                onChange={() => onPreferenceChange('mobileUpdates')}
                className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
              />
              Mobile App Updates
            </label>
          </div>
        </div>

        <button
          onClick={onSubscribe}
          disabled={status === 'loading'}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Subscribing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>

        <p className="text-xs text-cyan-300/60 text-center mt-4">
          Receive updates specific to your dashboard role
        </p>
      </motion.div>

      {/* Role Dashboard Links */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Navigation size={18} />
          Quick Dashboard Access
        </h4>
        <div className="space-y-3">
          {[
            { role: 'horeca', label: 'HORECA Dashboard', path: '/dashboard/hotel', icon: <ShoppingBag size={16} /> },
            { role: 'recycler', label: 'Recycler Dashboard', path: '/dashboard/recycler', icon: <Recycle size={16} /> },
            { role: 'driver', label: 'Driver Dashboard', path: '/dashboard/driver', icon: <Truck size={16} /> },
            { role: 'individual', label: 'Individual Dashboard', path: '/dashboard/individual', icon: <User size={16} /> },
            { role: 'admin', label: 'Admin Dashboard', path: '/admin', icon: <Shield size={16} /> }
          ].map((dashboard) => (
            <a
              key={dashboard.role}
              href={dashboard.path}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 hover:text-cyan-600 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:border-cyan-300 group-hover:text-cyan-600">
                {dashboard.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 group-hover:text-cyan-700">{dashboard.label}</div>
                <div className="text-xs text-slate-500 font-mono">{dashboard.path}</div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-cyan-600" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} />
          Platform Statistics
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Updates</span>
            <span className="font-bold text-cyan-600">{tabs.reduce((sum, tab) => sum + tab.count, 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Active Users</span>
            <span className="font-bold text-cyan-600">1.2k</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Role Distribution</span>
            <span className="font-bold text-cyan-600">5 roles</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Mobile App Users</span>
            <span className="font-bold text-amber-600">65%</span>
          </div>
        </div>
      </motion.div>

      {/* Mobile App Banner */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-cyan-900 to-indigo-900 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Smartphone size={24} className="text-cyan-300" />
          <div>
            <h4 className="font-bold text-lg">Mobile App Updates</h4>
            <p className="text-cyan-200/80 text-sm">Role-specific mobile features</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <WifiOff size={14} className="text-cyan-300" />
            <span>Offline mode for drivers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <QrCode size={14} className="text-cyan-300" />
            <span>QR verification for all roles</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Camera size={14} className="text-cyan-300" />
            <span>Photo upload for HORECA</span>
          </div>
        </div>
        <button className="w-full bg-white text-cyan-900 py-2.5 rounded-lg font-bold hover:bg-cyan-50 transition-colors">
          Download App
        </button>
      </motion.div>
    </div>
  );
};

export default UpdatesSubscriptionSection;
