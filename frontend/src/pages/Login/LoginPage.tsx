// pages/Login/LoginPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Home, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getQueueCount } from '../../utils/offlineQueue';
import LoginForm from '../../components/auth/LoginForm';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import TermsPrivacyModal from '../../components/auth/TermsPrivacyModal';
import SignupWizard from '../../components/auth/SignupWizardSimplified';

const roleToDashboard: Record<string, string> = {
  admin: '/dashboard/admin',
  business: '/dashboard/business',
  recycler: '/dashboard/recycler',
  driver: '/dashboard/driver',
  individual: '/dashboard/individual',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clearMustChangePassword } = useAuth();
  const isOnline = useOnlineStatus();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tokenLoginLoading, setTokenLoginLoading] = useState(false);
  const [tokenLoginError, setTokenLoginError] = useState('');
  const [showPwdReset, setShowPwdReset] = useState(false);
  const [pwdResetRole, setPwdResetRole] = useState('driver');
  const [newPwd, setNewPwd]       = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError]   = useState('');
  const [pendingCount, setPendingCount] = useState(() => getQueueCount());

  // Keep pending count in sync with queue events
  useEffect(() => {
    const handler = () => setPendingCount(getQueueCount());
    window.addEventListener('ecotrade_queue_change', handler);
    return () => window.removeEventListener('ecotrade_queue_change', handler);
  }, []);

  const demoCredentials = [
    { role: 'Admin',      email: 'admin@ecotrade.rw',       password: 'Password123!' },
    { role: 'Business',   email: 'hotel1@ecotrade.rw',      password: 'Password123!' },
    { role: 'Recycler',   email: 'recycler1@ecotrade.rw',   password: 'Password123!' },
    { role: 'Driver',     email: 'driver1@ecotrade.rw',     password: 'Password123!' },
  ];

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    try {
      await login(email, password);
      const from = (location.state as any)?.from || null;
      const storedUser = localStorage.getItem('ecotrade_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (from && from !== '/login' && from !== '/signup') {
          navigate(from, { replace: true });
        } else {
          navigate(roleToDashboard[u.role] || '/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLoginError((err as Error).message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  // Token-based login flow
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setTokenLoginLoading(true);
      authAPI
        .loginWithToken(token)
        .then((res) => {
          // Store tokens
          localStorage.setItem('ecotrade_token', res.access_token);
          if (res.refresh_token) {
            localStorage.setItem('ecotrade_refresh_token', res.refresh_token);
          }
          localStorage.setItem('ecotrade_user', JSON.stringify(res.user));
          // If must_change_password, show set-password form (driver is already authenticated)
          if (res.must_change_password) {
            setPwdResetRole(res.user?.role || 'driver');
            setShowPwdReset(true);
          } else {
            navigate(roleToDashboard[res.user.role] || '/dashboard', { replace: true });
          }
        })
        .catch((err) => {
          setTokenLoginError((err instanceof Error ? err.message : 'Token login failed'));
        })
        .finally(() => setTokenLoginLoading(false));
    }
  }, [location.search, navigate]);

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
            {/* ── Global network status banner ── */}
            {!isOnline && (
              <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                <span className="mt-0.5 shrink-0 text-lg leading-none">📵</span>
                <div>
                  <p className="font-semibold">You are offline</p>
                  <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-400">
                    You can still sign in with your previously used account. Any actions you
                    take will be saved locally and synced automatically when you reconnect.
                  </p>
                </div>
              </div>
            )}
            {isOnline && pendingCount > 0 && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-xl text-sm text-cyan-800 dark:text-cyan-300">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <p>
                  Back online — syncing <strong>{pendingCount}</strong> pending action
                  {pendingCount !== 1 ? 's' : ''} with the server…
                </p>
              </div>
            )}
            {tokenLoginLoading && (
              <div className="mb-4 px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-xl text-sm text-cyan-700">
                Logging in with secure link...
              </div>
            )}
            {tokenLoginError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {tokenLoginError}
              </div>
            )}
            {!showSignup && !tokenLoginLoading && !showPwdReset ? (
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
            ) : showPwdReset ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">Set Your Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                  Your account is ready. Please set a new password to activate it and sign in.
                </p>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPwd.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
                  if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
                  setPwdLoading(true); setPwdError('');
                  try {
                    await authAPI.changePassword(newPwd);
                    clearMustChangePassword();
                    setShowPwdReset(false);
                    navigate(roleToDashboard[pwdResetRole] || '/dashboard', { replace: true });
                  } catch (err) {
                    setPwdError(err instanceof Error ? err.message : 'Failed to set password.');
                  } finally {
                    setPwdLoading(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" required minLength={8} value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(''); }}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                    <input type="password" required value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                  </div>
                  {pwdError && <p className="text-sm text-red-600 dark:text-red-400">{pwdError}</p>}
                  <button type="submit" disabled={pwdLoading}
                    className="w-full py-2.5 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 disabled:opacity-50 transition-colors">
                    {pwdLoading ? 'Saving…' : 'Activate Account & Sign In'}
                  </button>
                </form>
              </div>
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
