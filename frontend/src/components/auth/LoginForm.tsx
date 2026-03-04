// components/auth/LoginForm.tsx
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight} from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
  onLogin: (email: string, password: string) => void;
  demoCredentials: Array<{ role: string; email: string; password: string }>;
}

// Role colour map for the demo quick-pick cards
const roleColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Admin:      { bg: 'bg-purple-50 dark:bg-purple-900/20',  text: 'text-purple-700 dark:text-purple-300',  border: 'border-purple-200 dark:border-purple-700', dot: 'bg-purple-500' },
  Hotel:      { bg: 'bg-amber-50  dark:bg-amber-900/20',   text: 'text-amber-700  dark:text-amber-300',   border: 'border-amber-200  dark:border-amber-700',  dot: 'bg-amber-500'  },
  Recycler:   { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-700', dot: 'bg-cyan-500' },
  Driver:     { bg: 'bg-blue-50   dark:bg-blue-900/20',    text: 'text-blue-700   dark:text-blue-300',    border: 'border-blue-200   dark:border-blue-700',   dot: 'bg-blue-500'   },
  Individual: { bg: 'bg-cyan-50   dark:bg-cyan-900/20',    text: 'text-cyan-700   dark:text-cyan-300',    border: 'border-cyan-200   dark:border-cyan-700',   dot: 'bg-cyan-500'   },
};

const LoginForm = ({ onToggleMode, onForgotPassword, onLogin, demoCredentials }: LoginFormProps) => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [rememberMe, setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [activeRole, setActiveRole]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError('Invalid email or password. Please try again or use a demo account below.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (cred: { role: string; email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setActiveRole(cred.role);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">

      {/* ── Header ── */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
          Welcome back
        </h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Sign in to continue to your EcoTrade dashboard
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-3 flex items-start gap-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">!</span>
          </span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              placeholder="you@ecotrade.rw"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-11 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword
                ? <EyeOff className="w-4.5 h-4.5" />
                : <Eye     className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
              rememberMe
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            {rememberMe && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Remember me for 30 days</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-3">
        <hr className="flex-1 border-gray-200 dark:border-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">or continue with</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-700" />
      </div>

      {/* ── Google ── */}
      <button className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M23.745 12.27c0-.79-.078-1.54-.228-2.26H12v4.26h6.47c-.29 1.48-1.14 2.84-2.42 3.74v3h3.92c2.3-2.1 3.63-5.2 3.63-8.74z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.92-3c-1.08.72-2.46 1.13-4.01 1.13-3.02 0-5.57-2.03-6.48-4.78H2.18v3.09C3.99 21.1 7.7 24 12 24z"/>
          <path fill="#4285F4" d="M5.52 15.44c-.25-.72-.38-1.49-.38-2.44s.13-1.72.35-2.44V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.49-.27z"/>
          <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.92 2.3 15.25 1 12 1 7.7 1 3.99 3.9 2.18 7.93l3.34 2.6c.91-2.75 3.46-4.78 6.48-4.78z"/>
        </svg>
        Continue with Google
      </button>

      {/* ── Demo quick-fill role cards ── */}
      <div className="mt-3">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Try a demo account
        </p>
        {/* 5 equal columns; shrinks gracefully on narrow phones */}
        <div className="grid grid-cols-5 gap-1">
          {demoCredentials.map((cred) => {
            const c = roleColors[cred.role] ?? roleColors['Individual'];
            const isActive = activeRole === cred.role;
            return (
              <button
                key={cred.role}
                type="button"
                onClick={() => fillDemo(cred)}
                title={`${cred.email} / ${cred.password}`}
                className={`flex flex-col items-center gap-0.5 py-2 px-0.5 rounded-xl border text-center transition-all ${c.bg} ${c.border} ${c.text}
                  ${isActive ? 'ring-2 ring-offset-1 ring-cyan-400 scale-105' : 'hover:scale-105 hover:shadow-sm'}`}
              >
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${c.dot}`} />
                <span className="text-[9px] sm:text-[10px] font-semibold leading-tight truncate w-full text-center">{cred.role}</span>
              </button>
            );
          })}
        </div>
        {activeRole && (
          <p className="mt-2 text-xs text-center text-gray-400 dark:text-gray-500">
            Credentials filled — click <strong>Sign In</strong> to continue
          </p>
        )}
      </div>

      {/* ── Sign-up link ── */}
      <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onToggleMode}
          className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-semibold hover:underline"
        >
          Create one free
        </button>
      </p>
    </div>
  );
};

export default LoginForm;