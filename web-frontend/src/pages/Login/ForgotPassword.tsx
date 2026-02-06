import { useState, useRef, useEffect } from 'react';
import { Mail, ShieldCheck, Lock, ChevronLeft, ArrowRight, RefreshCw, Check, Eye, EyeOff, Key, Timer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const [stage, setStage] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  // Auto-advance OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      setTimeout(() => handleVerifyOtp(), 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Countdown timer for OTP
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLoading(false);
    setStage('otp');
    setCountdown(600); // 10 minutes in seconds
    setSuccess(`Verification code sent to ${email}`);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleVerifyOtp = async () => {
    if (otp.some(digit => !digit)) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLoading(false);
    setStage('reset');
    setError('');
    setSuccess('OTP verified successfully!');
    
    // Clear success message
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResendCode = () => {
    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before requesting a new code`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulate resend
    setTimeout(() => {
      setLoading(false);
      setCountdown(600);
      setSuccess('New verification code sent!');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      
      setTimeout(() => setSuccess(''), 3000);
    }, 800);
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    // Simulate API reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSuccess('Password reset successfully! Redirecting to login...');
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigate('/login?reset=success');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-white hover:shadow-md transition-all border border-white/20"
        >
          <ChevronLeft size={18} />
          Back to Login
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-8">
            {['email', 'otp', 'reset'].map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage === step ? 'bg-gradient-to-br from-cyan-500 to-cyan-500 text-white' :
                  ['email', 'otp', 'reset'].indexOf(stage) > index ? 'bg-gradient-to-br from-cyan-500 to-cyan-500 text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {['email', 'otp', 'reset'].indexOf(stage) > index ? <Check size={14} /> : index + 1}
                </div>
                <span className="text-xs font-medium text-slate-700 mt-2 capitalize">{step}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STAGE 1: EMAIL INPUT */}
            {stage === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-2xl mb-4">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Reset Your Password</h2>
                  <p className="text-slate-600">
                    Enter the email associated with your KCEM account to receive a verification code.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-600 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="name@business.rw"
                      className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      disabled={loading}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-600 text-white py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 text-center">
                    You'll receive a 6-digit code valid for 10 minutes
                  </p>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: OTP VERIFICATION */}
            {stage === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-2xl mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
                  <p className="text-slate-600 mb-2">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="font-medium text-cyan-600 break-all">{email}</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-600 text-sm">
                    {success}
                  </div>
                )}

                {/* OTP Inputs */}
                <div className="flex justify-between gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-gradient-to-b from-slate-50 to-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Timer Display */}
                {countdown > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-4">
                    <Timer size={16} />
                    <span>Code expires in: <span className="font-bold text-cyan-600">{formatTime(countdown)}</span></span>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some(digit => !digit)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </motion.button>

                <button
                  onClick={handleResendCode}
                  disabled={loading || countdown > 0}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend Code'}
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setStage('email');
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    ← Use a different email address
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: NEW PASSWORD RESET */}
            {stage === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-2xl mb-4">
                    <Key size={32} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Create New Password</h2>
                  <p className="text-slate-600">
                    Your new password must be at least 8 characters long for security.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-600 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="New password (min. 8 characters)"
                      className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Confirm new password"
                      className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            newPassword.length >= 8 ? 'bg-cyan-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(newPassword.length * 12.5, 100)}%` }}
                        />
                      </div>
                      <p className={`text-xs ${
                        newPassword.length >= 8 ? 'text-cyan-600' : 'text-amber-600'
                      }`}>
                        {newPassword.length >= 8 ? 'Strong password ✓' : 'Password must be at least 8 characters'}
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </motion.button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 text-center">
                    After resetting, you'll be redirected to login with your new password
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-cyan-50/30 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center">
            Need help? Contact support at{' '}
            <a href="mailto:support@kcem.rw" className="text-cyan-600 hover:underline">
              support@kcem.rw
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;