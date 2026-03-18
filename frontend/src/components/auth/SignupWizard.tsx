// components/auth/SignupWizard.tsx
import { useState } from 'react';
import {
  Building2, Factory, Truck, ArrowRight, ArrowLeft, Check, Upload, MapPin, Phone, Mail, Lock, Loader2
} from 'lucide-react';
import { authAPI } from '../../services/api';

interface SignupWizardProps {
  onToggleMode: () => void;
  onComplete: (data: any) => void;
}

const SignupWizard = ({ onToggleMode, onComplete }: SignupWizardProps) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'hotel' | 'recycler' | 'driver' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    businessName: '', registrationNumber: '', taxId: '', contactPerson: '', position: '',
    companyName: '', licenseNumber: '', wasteTypes: [] as string[], facilityAddress: '', processingCapacity: '',
    nationalId: '', licenseImage: null as File | null, vehicleType: '', vehiclePlate: '', insuranceImage: null as File | null,
    latitude: '', longitude: '', serviceRadius: '', operatingHours: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleUserTypeSelect = (type: 'hotel' | 'recycler' | 'driver') => { setUserType(type); setStep(2); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      let s = 0;
      if (value.length >= 8) s += 25;
      if (/[a-z]/.test(value)) s += 25;
      if (/[A-Z]/.test(value)) s += 25;
      if (/[0-9]/.test(value)) s += 25;
      setPasswordStrength(s);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files?.[0]) setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
  };

  const handleRegister = async () => {
    if (!userType) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const role = userType === 'hotel' ? 'business' : userType;
      await authAPI.register({
        email: formData.email,
        full_name: formData.fullName || (userType === 'hotel' ? formData.contactPerson : '') || 'User',
        password: formData.password,
        phone: formData.phone || undefined,
        role,
      });
      setStep(5);
    } catch (err) {
      setSubmitError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep2 = () => {
    if (!formData.email || !formData.password || formData.password !== formData.confirmPassword) return false;
    if (formData.password.length < 6) return false;
    if (userType === 'hotel' && !formData.businessName) return false;
    if (userType === 'recycler' && !formData.companyName) return false;
    return true;
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Account Type' }, { number: 2, label: 'Basic Info' },
      { number: 3, label: 'Location' }, { number: 4, label: 'Review' }, { number: 5, label: 'Complete' }
    ];
    return (
      <div className="mb-8 sm:mb-10">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-start flex-1 min-w-0">
              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                  s.number < step ? 'bg-cyan-600 text-white' : s.number === step ? 'border-2 border-cyan-600 text-cyan-600' : 'border-2 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}>
                  {s.number < step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.number}
                </div>
                <p className="hidden sm:block mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{s.label}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mt-3 sm:mt-4 ${s.number < step ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center">Choose Account Type</h3>
            <div className="grid gap-3 sm:gap-4">
              {[
                { type: 'hotel' as const, Icon: Building2, title: 'Hotel / Restaurant', desc: 'List waste and earn revenue' },
                { type: 'recycler' as const, Icon: Factory, title: 'Recycling Company', desc: 'Source materials and grow your business' },
                { type: 'driver' as const, Icon: Truck, title: 'Driver / Collector', desc: 'Earn steady income with flexible hours' },
              ].map(({ type, Icon, title, desc }) => (
                <button key={type} onClick={() => handleUserTypeSelect(type)}
                  className="p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all group text-left">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 group-hover:text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center">
              {userType === 'hotel' ? 'Hotel Information' : userType === 'recycler' ? 'Company Information' : 'Personal Information'}
            </h3>
            {userType === 'hotel' && (
              <div className="space-y-3 sm:space-y-4">
                <input name="businessName" value={formData.businessName} onChange={handleInputChange}
                  placeholder="Mille Collines Hotel" required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange}
                    placeholder="Registration Number" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  <input name="taxId" value={formData.taxId} onChange={handleInputChange}
                    placeholder="Tax ID (optional)" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange}
                  placeholder="Contact Person Name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <input name="position" value={formData.position} onChange={handleInputChange}
                  placeholder="Position (e.g. Operations Manager)" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
            )}
            {userType === 'recycler' && (
              <div className="space-y-4">
                <input name="companyName" value={formData.companyName} onChange={handleInputChange}
                  placeholder="GreenEnergy Recyclers" required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange}
                  placeholder="REMA License Number" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Waste Types Handled</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['UCO', 'Glass', 'Paper/Cardboard', 'Plastics', 'E-waste', 'Metals'].map(t => (
                      <label key={t} className="flex items-center">
                        <input type="checkbox" value={t}
                          onChange={e => {
                            const types = e.target.checked ? [...formData.wasteTypes, t] : formData.wasteTypes.filter(x => x !== t);
                            setFormData(p => ({ ...p, wasteTypes: types }));
                          }}
                          className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500" />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <input type="number" name="processingCapacity" value={formData.processingCapacity} onChange={handleInputChange}
                  placeholder="Processing Capacity (Kilograms/month)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
            )}
            {userType === 'driver' && (
              <div className="space-y-4">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange}
                  placeholder="Full Name" required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input name="nationalId" value={formData.nationalId} onChange={handleInputChange}
                    placeholder="National ID Number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option value="">Select vehicle type</option>
                    <option value="truck">Truck (3.5 Kilograms)</option>
                    <option value="pickup">Pickup</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="tricycle">Tricycle</option>
                  </select>
                </div>
                <input name="vehiclePlate" value={formData.vehiclePlate} onChange={handleInputChange}
                  placeholder="Vehicle Plate (e.g. RAC 123 A)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ field: 'licenseImage', label: 'Driver License' }, { field: 'insuranceImage', label: 'Insurance Certificate' }].map(({ field, label }) => (
                    <div key={field}>
                      <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, field)} className="hidden" id={`upload-${field}`} />
                      <label htmlFor={`upload-${field}`} className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(formData as any)[field] ? (formData as any)[field].name : `Upload ${label}`}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Common credentials */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Mail className="w-4 h-4 inline mr-1" />Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Phone className="w-4 h-4 inline mr-1" />Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="+250 780 000 000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Lock className="w-4 h-4 inline mr-1" />Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${passwordStrength <= 25 ? 'bg-red-500' : passwordStrength <= 50 ? 'bg-yellow-500' : passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${passwordStrength}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordStrength <= 25 ? 'Weak' : passwordStrength <= 50 ? 'Fair' : passwordStrength <= 75 ? 'Good' : 'Strong'} password
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center">Set Your Location</h3>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-10 h-10 mx-auto mb-2 text-cyan-600" />
                <p className="text-sm">Enter coordinates below</p>
                <p className="text-xs">Kigali center: -1.9441, 30.0619</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange}
                placeholder="Latitude (e.g. -1.9441)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange}
                placeholder="Longitude (e.g. 30.0619)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            {(userType === 'recycler' || userType === 'driver') && (
              <input type="number" name="serviceRadius" value={formData.serviceRadius} onChange={handleInputChange}
                placeholder="Service Radius (km)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center">Review & Submit</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Account Type</span><span className="font-medium capitalize">{userType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{formData.email}</span></div>
              {formData.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{formData.phone}</span></div>}
              {userType === 'hotel' && formData.businessName && <div className="flex justify-between"><span className="text-gray-500">Business</span><span className="font-medium">{formData.businessName}</span></div>}
              {userType === 'recycler' && formData.companyName && <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{formData.companyName}</span></div>}
              {formData.latitude && <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{formData.latitude}, {formData.longitude}</span></div>}
            </div>
            {submitError && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                {submitError}
              </div>
            )}
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 mt-0.5" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the <a href="/terms-privacy" className="text-cyan-600 font-semibold hover:underline">Terms of Service</a> and <a href="/terms-privacy" className="text-cyan-600 font-semibold hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 sm:space-y-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Registration Submitted!</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your account is pending review by our admin team. You will receive an email once approved.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 text-left">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm sm:text-base">Next Steps:</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                {['Check your email for confirmation', 'Wait for admin approval (1-2 business days)', 'Login once approved to access your dashboard', 'Start listing waste and earning revenue!'].map(s => (
                  <li key={s} className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" />{s}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
      {renderStepIndicator()}
      {renderStep()}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        {step > 1 && step < 5 && (
          <button onClick={() => setStep(step - 1)} disabled={submitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors flex items-center justify-center disabled:opacity-50">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        )}
        {step >= 2 && step < 4 && (
          <button onClick={() => setStep(step + 1)} disabled={step === 2 && !canProceedStep2()}
            className="w-full sm:w-auto sm:ml-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-cyan-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
        {step === 4 && (
          <button onClick={handleRegister} disabled={submitting || !agreedToTerms}
            className="w-full sm:w-auto sm:ml-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-cyan-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <>Submit Registration <ArrowRight className="w-4 h-4 ml-2" /></>}
          </button>
        )}
        {step === 5 && (
          <button onClick={() => onComplete(formData)}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-cyan-700 transition-all">
            Go to Login Page
          </button>
        )}
      </div>
      {step === 1 && (
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onToggleMode} className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-semibold">Sign in</button>
        </p>
      )}
    </div>
  );
};

export default SignupWizard;
