// components/auth/SignupWizard.tsx
import { useState } from 'react';
import { 
  Building2, 
  Factory, 
  Truck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload,
  MapPin,
  Phone,
  Mail,
  Lock
} from 'lucide-react';

interface SignupWizardProps {
  onToggleMode: () => void;
  onComplete: (data: any) => void;
}

const SignupWizard = ({ onToggleMode, onComplete }: SignupWizardProps) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'hotel' | 'recycler' | 'driver' | null>(null);
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Hotel specific
    businessName: '',
    registrationNumber: '',
    taxId: '',
    contactPerson: '',
    position: '',
    
    // Recycler specific
    companyName: '',
    licenseNumber: '',
    wasteTypes: [] as string[],
    facilityAddress: '',
    processingCapacity: '',
    
    // Driver specific
    nationalId: '',
    licenseImage: null as File | null,
    vehicleType: '',
    vehiclePlate: '',
    insuranceImage: null as File | null,
    
    // Location
    latitude: '',
    longitude: '',
    serviceRadius: '',
    operatingHours: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  const handleUserTypeSelect = (type: 'hotel' | 'recycler' | 'driver') => {
    setUserType(type);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      // Calculate password strength
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (value.match(/[a-z]+/)) strength += 25;
      if (value.match(/[A-Z]+/)) strength += 25;
      if (value.match(/[0-9]+/)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleVerificationChange = (index: number, value: string) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Account Type' },
      { number: 2, label: 'Basic Info' },
      { number: 3, label: 'Location' },
      { number: 4, label: 'Verification' },
      { number: 5, label: 'Complete' }
    ];

    return (
      <div className="mb-8 sm:mb-10">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-start flex-1 min-w-0">
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                    s.number < step
                      ? 'bg-cyan-600 text-white'
                      : s.number === step
                      ? 'border-2 border-cyan-600 text-cyan-600'
                      : 'border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {s.number < step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.number}
                </div>
                <p className="hidden sm:block mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
                  {s.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 mt-3 sm:mt-4 ${
                    s.number < step ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center">Choose Account Type</h3>
            <div className="grid gap-3 sm:gap-4">
              <button
                onClick={() => handleUserTypeSelect('hotel')}
                className="p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all group text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 group-hover:text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Hotel / Restaurant</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">List waste and earn revenue</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelect('recycler')}
                className="p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all group text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 group-hover:text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Recycling Company</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">Source materials and grow your business</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelect('driver')}
                className="p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all group text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 group-hover:text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Driver / Collector</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">Earn steady income with flexible hours</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center">
              {userType === 'hotel' && 'Hotel Information'}
              {userType === 'recycler' && 'Company Information'}
              {userType === 'driver' && 'Personal Information'}
            </h3>

            {userType === 'hotel' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Mille Collines Hotel"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="RDB2025001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tax ID (optional)
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="123456789"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="John Karambizi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Operations Manager"
                  />
                </div>
              </div>
            )}

            {userType === 'recycler' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="GreenEnergy Recyclers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Number (REMA)
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="REMA/LIC/2025/001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Waste Types Handled
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {['UCO', 'Glass', 'Paper/Cardboard', 'Plastics', 'E-waste', 'Metals'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          value={type}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...formData.wasteTypes, type]
                              : formData.wasteTypes.filter(t => t !== type);
                            setFormData(prev => ({ ...prev, wasteTypes: newTypes }));
                          }}
                          className="w-4 h-4 text-cyan-600 rounded border-gray-300 dark:border-gray-600 focus:ring-cyan-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Processing Capacity (tons/month)
                  </label>
                  <input
                    type="number"
                    name="processingCapacity"
                    value={formData.processingCapacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            {userType === 'driver' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Jean Pierre"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      National ID
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="1199880012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Driver's License
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'licenseImage')}
                        className="hidden"
                        id="license-upload"
                      />
                      <label
                        htmlFor="license-upload"
                        className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"
                      >
                        <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Upload License</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select type</option>
                      <option value="truck">Truck (3.5 tons)</option>
                      <option value="pickup">Pickup</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="tricycle">Tricycle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Plate
                    </label>
                    <input
                      type="text"
                      name="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="RAC 123 A"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Insurance Certificate
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'insuranceImage')}
                      className="hidden"
                      id="insurance-upload"
                    />
                    <label
                      htmlFor="insurance-upload"
                      className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"
                    >
                      <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Upload Insurance</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Common fields for all types */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="username@ecotrade.rw"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="+250 780 162 164"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 25 ? 'bg-red-500' :
                          passwordStrength <= 50 ? 'bg-yellow-700' :
                          passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Password strength: {
                        passwordStrength <= 25 ? 'Weak' :
                        passwordStrength <= 50 ? 'Fair' :
                        passwordStrength <= 75 ? 'Good' : 'Strong'
                      }
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
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
            
            {/* Map Placeholder */}
            <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}></div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-10 h-10 text-cyan-600 animate-bounce" />
              </div>

              <button className="absolute bottom-4 right-4 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                Set Location
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="-1.9441"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="30.0619"
                />
              </div>
            </div>

            {(userType === 'recycler' || userType === 'driver') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    name="serviceRadius"
                    value={formData.serviceRadius}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operating Hours
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="time"
                      name="operatingHoursStart"
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="time"
                      name="operatingHoursEnd"
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center\">Verify Your Account</h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              We've sent a 6-digit verification code to <strong>{formData.email || 'your email'}</strong>
            </p>

            <div className="flex justify-center space-x-2">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerificationChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Didn't receive the code? <button className="text-cyan-600 font-semibold">Resend</button>
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 sm:space-y-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Registration Complete!</h3>
            
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your account has been created successfully. Please check your email to verify your account.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 text-left">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm sm:text-base">Next Steps:</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Verify your email address
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Complete your profile
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Set up OTP verification
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Start using EcoTrade!
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
      {renderStepIndicator()}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        {step > 1 && step < 5 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        )}
        
        {step < 5 && step > 1 && (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full sm:w-auto sm:ml-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all flex items-center justify-center"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}

        {step === 5 && (
          <button
            onClick={handleSubmit}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all"
          >
            Go to Dashboard
          </button>
        )}
      </div>

      {/* Terms Agreement */}
      {step === 4 && (
        <div className="mt-4 sm:mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 text-cyan-600 rounded border-gray-300 dark:border-gray-600 focus:ring-cyan-500"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <a href="/terms" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-semibold">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-semibold">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>
      )}

      {/* Login Link */}
      {step === 1 && (
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-semibold"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
};

export default SignupWizard;
