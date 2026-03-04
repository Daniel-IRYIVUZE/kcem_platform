// components/auth/TwoFactorModal.tsx
import { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';

interface TwoFactorModalProps {
  email: string;
  onClose: () => void;
  onVerify: (code: string) => void;
}

const TwoFactorModal = ({ email, onClose, onVerify }: TwoFactorModalProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onVerify(fullCode);
    } else {
      setError('Please enter the complete 6-digit OTP');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-cyan-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">OTP Verification</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter the OTP sent to {email.replace(/(.{2}).*(.{2}@)/, '$1***$2')}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center space-x-2 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={handleSubmit}
            className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Verify OTP
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Didn't receive it? <button className="text-cyan-600 font-semibold">Resend OTP</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;