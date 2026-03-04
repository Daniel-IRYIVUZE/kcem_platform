// pages/Login/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import TermsPrivacyModal from '../../components/auth/TermsPrivacyModal';
import SignupWizard from '../../components/auth/SignupWizard';

const roleToDashboard: Record<string, string> = {
  admin: '/dashboard/admin',
  business: '/dashboard/business',
  recycler: '/dashboard/recycler',
  driver: '/dashboard/driver',
  individual: '/dashboard/individual',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginError, setLoginError] = useState('');

  const demoCredentials = [
    { role: 'Admin',      email: 'admin@ecotrade.rw',       password: 'admin123'    },
    { role: 'Hotel',      email: 'hotel@millecollines.rw',  password: 'hotel123'    },
    { role: 'Recycler',   email: 'recycler@greenenergy.rw', password: 'recycler123' },
    { role: 'Driver',     email: 'driver@ecotrade.rw',      password: 'driver123'   },
    { role: 'Individual', email: 'individual@ecotrade.rw',  password: 'user123'     },
  ];

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    try {
      await login(email, password);
      // After login, user state is updated — read role from context
      // Use a brief timeout so state update propagates
      setTimeout(() => {
        const storedUser = localStorage.getItem('ecotrade_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          navigate(roleToDashboard[u.role] || '/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 50);
    } catch (err) {
      setLoginError((err as Error).message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const ImagePanel = ({ side }: { side: 'left' | 'right' }) => (
    <div className={`hidden lg:flex lg:w-5/12 relative overflow-hidden ${side === 'right' ? 'order-last' : ''}`}>
      <img
        src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&auto=format&fit=crop&q=80"
        alt="Circular economy – clean green city"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex flex-col justify-between h-full w-full p-8 xl:p-10">
        <div className="flex items-center justify-between">
          <img src="/images/EcoTrade.png" alt="EcoTrade Rwanda" className="h-14 object-contain brightness-200" />
          <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm border border-white/25 transition-all">
            <Home size={15} /><span>Home</span>
          </Link>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
            Turn Waste Into <span className="text-cyan-300">Opportunity</span>
          </h1>
          <p className="text-sm xl:text-base text-white/75 leading-relaxed max-w-xs xl:max-w-sm">
            Join Rwanda's premier circular economy marketplace. Connect hotels, recyclers,
            and drivers to transform how Kigali manages resources — sustainably and profitably.
          </p>
          <blockquote className="border-l-4 border-cyan-500 pl-4">
            <p className="text-white/60 italic text-sm leading-relaxed">
              "Every kilogram recycled is a step toward a cleaner Rwanda and a stronger local economy."
            </p>
          </blockquote>
        </div>
        <p className="text-white/35 text-xs">© 2026 EcoTrade Rwanda · Building a circular future</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden lg:flex-row bg-white dark:bg-gray-950 transition-colors duration-300">
      {!showSignup && <ImagePanel side="left" />}
      <div className="flex-1 flex flex-col lg:h-full lg:overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <img src="/images/EcoTrade.png" alt="EcoTrade Rwanda" className="h-11 object-contain" />
          <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
            <Home size={16} /><span>Home</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-6 xl:px-10 py-6 lg:py-4 lg:overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="w-full max-w-md">
            {!showSignup ? (
              <>
                {loginError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                    {loginError}
                  </div>
                )}
                <LoginForm
                  onToggleMode={() => setShowTermsModal(true)}
                  onForgotPassword={() => setShowForgotPassword(true)}
                  onLogin={handleLogin}
                  demoCredentials={demoCredentials}
                />
              </>
            ) : (
              <SignupWizard
                onToggleMode={() => setShowSignup(false)}
                onComplete={() => navigate('/dashboard')}
              />
            )}
          </div>
        </div>
      </div>
      {showSignup && <ImagePanel side="right" />}
      <TermsPrivacyModal
        isOpen={showTermsModal}
        onAccept={() => { setShowTermsModal(false); setShowSignup(true); }}
        onDecline={() => { setShowTermsModal(false); window.location.href = '/'; }}
      />
      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onSubmit={(_email) => { setShowForgotPassword(false); }}
        />
      )}
    </div>
  );
};

export default LoginPage;
