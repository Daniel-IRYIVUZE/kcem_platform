// components/auth/ForgotPasswordModal.tsx
import { useState, useRef } from 'react';
import { X, Mail, ArrowRight, Lock, Eye, EyeOff, CheckCircle, Sun, Moon, KeyRound, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Email', 'OTP', 'New Password', 'Done'];

const ForgotPasswordModal = ({ onClose, onSubmit }: ForgotPasswordModalProps) => {
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep]               = useState<Step>(1);
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── helpers ── */
  const setErr = (msg: string) => setError(msg);
  const clearErr = () => setError('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErr();
    if (!email || !email.includes('@')) { setErr('Enter a valid email address'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 800); // simulate send
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    clearErr();
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErr();
    const code = otp.join('');
    if (code.length < 6) { setErr('Enter all 6 digits'); return; }
    // Demo: accept any 6-digit OTP
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 600);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErr();
    if (newPassword.length < 6) { setErr('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPass) { setErr('Passwords do not match'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); onSubmit(email); }, 800);
  };

  const inputCls = 'w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm';
  const btnCls   = 'w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      {/* max-h keeps the modal on-screen on short/small viewports; inner scroll handles overflow */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[calc(100svh-24px)] overflow-y-auto">

        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Reset Password</h2>
          </div>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Step indicator ── */}
        {step < 4 && (
          <div className="px-4 sm:px-5 pb-3 sm:pb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                    step > s
                      ? 'bg-cyan-500 text-white'
                      : step === s
                        ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 dark:ring-cyan-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }`}>
                    {step > s ? <Check size={12}/> : s}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block truncate ${
                    step >= s ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                  }`}>{STEP_LABELS[s - 1]}</span>
                  {s < 3 && <div className={`flex-1 h-px mx-1 ${ step > s ? 'bg-cyan-400' : 'bg-gray-200 dark:bg-gray-700' }`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="mx-4 sm:mx-5 mb-2 sm:mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ── Step content ── */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">

          {/* STEP 1 – Email */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your account email and we'll send a 6-digit OTP.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearErr(); }}
                    className={inputCls}
                    placeholder="you@ecotrade.rw"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                  Send OTP <ArrowRight className="w-4 h-4" />
                </>}
              </button>
            </form>
          )}

          {/* STEP 2 – OTP */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the 6-digit code sent to <strong className="text-gray-700 dark:text-gray-200">{email}</strong>.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                {/* Fluid OTP boxes: fill available width on all phone sizes */}
                <div className="flex gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="flex-1 min-w-0 h-10 sm:h-11 text-center text-base sm:text-lg font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                  Verify OTP <ArrowRight className="w-4 h-4" />
                </>}
              </button>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                Didn't receive it?{' '}
                <button type="button" onClick={() => { setOtp(['','','','','','']); clearErr(); setStep(1); }} className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">Resend</button>
              </p>
            </form>
          )}

          {/* STEP 3 – New password */}
          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose a strong new password.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); clearErr(); }}
                    className={`${inputCls} pr-10`}
                    placeholder="Min. 6 characters"
                    autoFocus
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => { setConfirmPass(e.target.value); clearErr(); }}
                    className={`${inputCls} pr-10`}
                    placeholder="Repeat password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Inline match indicator */}
              {confirmPass && (
                <p className={`text-xs ${newPassword === confirmPass ? 'text-cyan-500' : 'text-red-500'}`}>
                  {newPassword === confirmPass ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                  Update Password <ArrowRight className="w-4 h-4" />
                </>}
              </button>
            </form>
          )}

          {/* STEP 4 – Success */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Password Updated!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Your password has been reset successfully. You can now sign in.
              </p>
              <button onClick={onClose} className={btnCls}>Back to Sign In</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;