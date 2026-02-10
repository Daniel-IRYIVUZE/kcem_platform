import { useState, useRef, useEffect } from 'react';
import { Mail, ShieldCheck, Lock, ArrowRight, RefreshCw, Check, Eye, EyeOff, Key, Timer, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(digit => digit !== '') && index === 5) {
      setTimeout(() => handleVerifyOtp(), 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

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
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLoading(false);
    setStage('otp');
    setCountdown(300); // 5 minutes in seconds
    setSuccess(`Verification code sent to ${email}`);
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleVerifyOtp = async () => {
    if (otp.some(digit => !digit)) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLoading(false);
    setStage('reset');
    setError('');
    setSuccess('OTP verified successfully!');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResendCode = () => {
    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before requesting a new code`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      setLoading(false);
      setCountdown(300);
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSuccess('Password reset successfully! Redirecting to login...');
    
    setTimeout(() => {
      navigate('/login?reset=success');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={handleBackToHome}
          className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors border border-gray-200 text-sm"
        >
          <Home size={16} />
          Home
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      >
        <div className="p-4 sm:p-6">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-6">
            {['email', 'otp', 'reset'].map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  stage === step ? 'bg-cyan-600 text-white' :
                  ['email', 'otp', 'reset'].indexOf(stage) > index ? 'bg-cyan-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {['email', 'otp', 'reset'].indexOf(stage) > index ? <Check size={12} /> : index + 1}
                </div>
                <span className="text-xs font-medium text-gray-700 mt-1 capitalize">{step}</span>
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
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg mb-3">
                    <Mail size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Reset Your Password</h2>
                  <p className="text-gray-600 text-sm">
                    Enter the email associated with your KCEM account to receive a verification code.
                  </p>
                </div>

                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-600 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="name@business.rw"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                      disabled={loading}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    You'll receive a 6-digit code valid for 5 minutes
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
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg mb-3">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Your Email</h2>
                  <p className="text-gray-600 text-sm mb-1">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="font-medium text-cyan-600 break-all text-sm">{email}</p>
                </div>

                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-600 text-sm">
                    {success}
                  </div>
                )}

                {/* OTP Inputs */}
                <div className="flex justify-between gap-1 mb-4">
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
                      className="w-10 h-12 text-center text-xl font-bold rounded-lg border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Timer Display */}
                {countdown > 0 && (
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                    <Timer size={14} />
                    <span>Code expires in: <span className="font-medium text-cyan-600">{formatTime(countdown)}</span></span>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some(digit => !digit)}
                  className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </motion.button>

                <button
                  onClick={handleResendCode}
                  disabled={loading || countdown > 0}
                  className="w-full flex items-center justify-center gap-1 text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend Code'}
                </button>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setStage('email');
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg mb-3">
                    <Key size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Create New Password</h2>
                  <p className="text-gray-600 text-sm">
                    Your new password must be at least 8 characters long for security.
                  </p>
                </div>

                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-600 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="New password (min. 8 characters)"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
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
                    className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </motion.button>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    After resetting, you'll be redirected to login with your new password
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
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