// components/auth/LoginForm.tsx
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight} from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
  onLogin: (email: string, password: string) => void;
  demoCredentials: Array<{ role: string; email: string; password: string }>;
}

const LoginForm = ({ onToggleMode, onForgotPassword, onLogin }: LoginFormProps) => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [rememberMe, setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');

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