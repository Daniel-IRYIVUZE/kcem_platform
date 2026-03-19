import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Lock, 
  Check, 
  ArrowLeft, 
  Globe, 
  Users, 
  Database, 
  Eye,
  Mail,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const TermsPrivacyPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      setAccepted(true);
      setLoading(false);
      navigate('/login');
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
    },
    {
      title: '5. Transactions & Payments',
      content: 'All waste transactions are binding agreements between buyer and seller. EcoTrade facilitates the transaction but is not responsible for disputes regarding waste quality or payment.'
    },
    {
      title: '6. Intellectual Property',
      content: 'All content on the EcoTrade platform, including trademarks, logos, and software, is the property of EcoTrade and protected by intellectual property laws.'
    },
    {
      title: '7. Limitation of Liability',
      content: 'EcoTrade shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.'
    },
    {
      title: '8. Termination',
      content: 'We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.'
    }
  ];

  const privacyContent = [
    {
      title: 'Data Collection',
      content: 'We collect information you provide directly, including business details, contact information, waste transaction data, and location information for route optimization.',
      icon: <Mail className="text-slate-400" size={18} />
    },
    {
      title: 'Data Usage',
      content: 'Your data is used to facilitate waste transactions, optimize logistics, generate sustainability reports, and improve our services.',
      icon: <Eye className="text-slate-400" size={18} />
    },
    {
      title: 'Data Sharing',
      content: 'We share necessary transaction details between buyers and sellers. We do not sell your personal data to third parties.',
      icon: <Users className="text-slate-400" size={18} />
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data.',
      icon: <Shield className="text-slate-400" size={18} />
    },
    {
      title: 'Data Retention',
      content: 'We retain your data as long as your account is active or as needed to provide services. Transaction records are kept for 7 years as required by law.',
      icon: <Calendar className="text-slate-400" size={18} />
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@EcoTrade.rw to exercise these rights.',
      icon: <AlertTriangle className="text-slate-400" size={18} />
    }
  ];

  const dataProtectionContent = [
    {
      title: 'Compliance',
      content: 'EcoTrade complies with Rwanda\'s Data Protection Law No. 058/2021 and implements appropriate technical and organizational measures.'
    },
    {
      title: 'Geospatial Data',
      content: 'Location data is collected only for route optimization and is anonymized for analytics purposes.'
    },
    {
      title: 'Environmental Data',
      content: 'Waste composition and recycling data is aggregated for sustainability reporting and anonymized for research.'
    },
    {
      title: 'Third-party Processors',
      content: 'We use trusted third-party services for hosting, payment processing, and analytics. All processors comply with data protection standards.'
    },
    {
      title: 'Data Breach Protocol',
      content: 'In the event of a data breach, we will notify affected users and relevant authorities within 72 hours as required by law.'
    },
    {
      title: 'Contact DPO',
      content: 'For data protection inquiries, contact our Data Protection Officer at dpo@EcoTrade.rw'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800/90 dark:bg-gray-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800">
        <div className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/login" className="flex items-center gap-3 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Terms & Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Your trust is important to us. Please review our terms and privacy practices before using the EcoTrade platform.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-slate-200 rounded-xl hover:border-cyan-300 dark:border-cyan-700 hover:shadow-sm transition-all"
            >
              {section.icon}
              <span className="font-medium text-slate-700 dark:text-slate-200">{section.title}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Terms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Terms of Service */}
            <section id="terms" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-cyan-600" size={24} />
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Last updated: {sections[0].lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {termsContent.map((term, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="pb-6 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{term.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{term.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Privacy Policy */}
            <section id="privacy" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="text-cyan-600" size={24} />
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Last updated: {sections[1].lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      This Privacy Policy describes how EcoTrade collects, uses, and shares your personal information when you use our platform.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {privacyContent.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-50/50 p-5 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {item.icon}
                          <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section id="data" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="text-cyan-600" size={24} />
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Protection</h2>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Last updated: {sections[2].lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {dataProtectionContent.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="pb-6 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Accept Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-cyan-200 dark:border-cyan-800 shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-2xl mb-4">
                    <Shield size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Accept Terms</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    By accepting, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>

                {/* Agreement Checkboxes */}
                <div className="space-y-4 mb-6">
                  <label className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white dark:bg-gray-900">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                      defaultChecked
                    />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Terms of Service</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">I have read and agree to the Terms of Service</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white dark:bg-gray-900">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                      defaultChecked
                    />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Privacy Policy</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">I agree to the data collection and usage practices</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white dark:bg-gray-900">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                      defaultChecked
                    />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Data Protection</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">I acknowledge the data protection measures</div>
                    </div>
                  </label>
                </div>

                {/* Accept Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  disabled={loading || accepted}
                  className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : accepted ? (
                    <>
                      <Check size={20} />
                      Accepted
                    </>
                  ) : (
                    <>
                      Accept & Continue
                      <ArrowLeft size={20} className="rotate-180" />
                    </>
                  )}
                </motion.button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Returning to login page after acceptance
                  </p>
                </div>

                {/* Important Notes */}
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-1">Important Notes</h4>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• You must be 18+ or have parental consent</li>
                        <li>• Business accounts require valid registration</li>
                        <li>• Keep your login credentials secure</li>
                        <li>• Contact legal@EcoTrade.rw for questions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div>Email: legal@EcoTrade.rw</div>
                    <div>Phone: +250 780 162 164</div>
                    <div>Address: Kigali Innovation City, Rwanda</div>
                  </div>
                </div>
              </div>

              {/* Scroll to top button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-4 w-full py-3 bg-white dark:bg-gray-900 border border-slate-200 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Questions?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-2xl mx-auto">
              If you have any questions about our terms or privacy practices, please don't hesitate to contact our legal team.
            </p>
            <a
              href="mailto:legal@ecotrade.rw"
              className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-700 transition-all"
            >
              <Mail size={18} />
              Contact Legal Team
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white dark:bg-gray-900">
        <div className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Globe className="text-slate-400" size={20} />
              <span className="text-sm text-slate-600 dark:text-slate-400">© 2026 EcoTrade. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link to="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPrivacyPage;