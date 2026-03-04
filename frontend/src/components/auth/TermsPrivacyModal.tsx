import { useState } from 'react';
import { Shield, FileText, Lock, Check, X, Database, Eye, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsPrivacyModal = ({ isOpen, onAccept, onDecline }: TermsPrivacyModalProps) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'data'>('terms');

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      setAccepted(true);
      setLoading(false);
      onAccept();
    }, 800);
  };

  const sections = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: <FileText className="text-cyan-600" size={24} />,
      lastUpdated: 'January 20, 2026'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Lock className="text-cyan-600" size={24} />,
      lastUpdated: 'January 20, 2026'
    },
    {
      id: 'data',
      title: 'Data Protection',
      icon: <Database className="text-cyan-600" size={24} />,
      lastUpdated: 'January 20, 2026'
    }
  ];

  const termsContent = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using the EcoTrade Rwanda (EcoTrade) platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.'
    },
    {
      title: '2. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.'
    },
    {
      title: '3. Service Description',
      content: 'EcoTrade provides a digital B2B marketplace connecting HORECA businesses with recyclers for reverse logistics operations. We reserve the right to modify or discontinue the service at any time.'
    },
    {
      title: '4. User Responsibilities',
      content: 'Users must provide accurate waste listings, maintain proper waste segregation, and comply with all applicable Rwandan environmental regulations.'
    }
  ];

  const privacyContent = [
    {
      title: 'Data Collection',
      content: 'We collect information you provide directly, including business details, contact information, waste transaction data, and location information for route optimization.',
      icon: <Mail className="text-slate-400 dark:text-slate-500" size={18} />
    },
    {
      title: 'Data Usage',
      content: 'Your data is used to facilitate waste transactions, optimize logistics, generate sustainability reports, and improve our services.',
      icon: <Eye className="text-slate-400 dark:text-slate-500" size={18} />
    },
    {
      title: 'Data Sharing',
      content: 'We share necessary transaction details between buyers and sellers. We do not sell your personal data to third parties.',
      icon: <Users className="text-slate-400 dark:text-slate-500" size={18} />
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data.',
      icon: <Shield className="text-slate-400 dark:text-slate-500" size={18} />
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms & Privacy Policy</h2>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-slate-100 dark:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Please review our terms before joining EcoTrade</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-6 border-b border-slate-200 dark:border-gray-700">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id as 'terms' | 'privacy' | 'data')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === section.id
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-b-2 border-cyan-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-gray-800'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'terms' && (
            <div className="space-y-6">
              {termsContent.map((term, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="pb-6 border-b border-slate-100 dark:border-gray-700 last:border-b-0 last:pb-0"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{term.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{term.content}</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="grid md:grid-cols-2 gap-4">
              {privacyContent.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{item.content}</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Compliance</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">EcoTrade complies with Rwanda's Data Protection Law No. 058/2021 and implements appropriate technical and organizational measures.</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Geospatial Data</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Location data is collected only for route optimization and is anonymized for analytics purposes.</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Data Breach Protocol</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">In the event of a data breach, we will notify affected users and relevant authorities within 72 hours as required by law.</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Contact DPO</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">For data protection inquiries, contact our Data Protection Officer at dpo@EcoTrade.rw</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
          <div className="space-y-4">
            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">I have read and agree to the Terms of Service</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">I understand and agree to the Privacy Policy</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">I acknowledge the data protection measures</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDecline}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-100 dark:bg-gray-700 transition-colors"
              >
                Decline
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAccept}
                disabled={loading || accepted}
                className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : accepted ? (
                  <>
                    <Check size={18} />
                    Accepted ✓
                  </>
                ) : (
                  'Accept & Continue'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPrivacyModal;
