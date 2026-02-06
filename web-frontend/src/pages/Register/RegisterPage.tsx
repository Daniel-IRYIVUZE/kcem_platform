import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  Check,
  X,
  Hotel,
  Recycle,
  Truck,
  Upload,
  Mail,
  Lock,
  Map,
  Phone,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const [step, setStep] = useState(0); // 0 = role selection, 1-4 = form steps
  const [userRole, setUserRole] = useState('');
  const [showTerms, setShowTerms] = useState(true);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    accountType: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessType: '',
    address: '',
    sector: '',
    latitude: '',
    longitude: '',
    documentUrl: '',
    licenseNumber: '',
    wasteTypes: [] as string[],
    dailyCapacity: '',
    vehicleCount: '',
    hotelRooms: '',
    restaurantSeats: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { id: 'hotel', label: 'Hotel', icon: <Hotel size={24} />, description: 'Chain or independent hotel with consistent waste output' },
    { id: 'restaurant', label: 'Restaurant/Café', icon: <User size={24} />, description: 'Food service establishment with recyclable waste' },
    { id: 'recycler', label: 'Recycling Company', icon: <Recycle size={24} />, description: 'Industrial recycler or waste processor' },
    { id: 'logistics', label: 'Logistics Partner', icon: <Truck size={24} />, description: 'Transportation and collection services' },
    { id: 'individual', label: 'Individual Collector', icon: <UserPlus size={24} />, description: 'Small-scale waste collection' }
  ];

  const steps = [
    { id: 1, title: 'Account', icon: <User size={18}/>, description: 'Personal information' },
    { id: 2, title: 'Business', icon: <Building2 size={18}/>, description: 'Business details' },
    { id: 3, title: 'Location', icon: <MapPin size={18}/>, description: 'Service location' },
    { id: 4, title: 'Verify', icon: <ShieldCheck size={18}/>, description: 'Document upload' }
  ];

  const wasteTypes = [
    'Used Cooking Oil',
    'Glass Bottles',
    'Paper & Cardboard',
    'Plastic Containers',
    'Metal Cans',
    'Organic Waste',
    'E-waste'
  ];

  const sectors = [
    'Nyarugenge', 'Gasabo', 'Kicukiro', 'Gikondo', 'Kacyiru',
    'Kimihurura', 'Remera', 'Kinyinya', 'Gisozi', 'Kabeza'
  ];

  useEffect(() => {
    if (termsRef.current) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = termsRef.current!;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setScrolledToBottom(true);
        }
      };

      termsRef.current.addEventListener('scroll', handleScroll);
      return () => termsRef.current?.removeEventListener('scroll', handleScroll);
    }
  }, [showTerms]);

  const handleTermsAccept = () => {
    setShowTerms(false);
  };

  const handleTermsDecline = () => {
    navigate('/');
  };

  const handleRoleSelect = (roleId: string) => {
    setUserRole(roleId);
    setFormData(prev => ({ ...prev, accountType: roleId }));
    setStep(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWasteTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(type)
        ? prev.wasteTypes.filter(t => t !== type)
        : [...prev.wasteTypes, type]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store user data
    localStorage.setItem('registeslateUser', JSON.stringify({
      ...formData,
      role: userRole,
      registeslateAt: new Date().toISOString()
    }));
    
    setLoading(false);
    // slateirect to login with success message
    navigate('/login?registeslate=true');
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Firstname Lastname"
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@business.rw"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+250 78X XXX XXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Must contain at least 8 characters</p>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {userRole === 'hotel' ? 'Hotel Details' : 
               userRole === 'restaurant' ? 'Restaurant Details' :
               userRole === 'recycler' ? 'Recycling Business Details' :
               userRole === 'logistics' ? 'Logistics Company Details' : 'Individual Details'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g., Kigali Grand Hotel"
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                />
              </div>
              
              {userRole === 'hotel' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Rooms</label>
                  <input
                    type="number"
                    name="hotelRooms"
                    value={formData.hotelRooms}
                    onChange={handleInputChange}
                    placeholder="e.g., 150"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  />
                </div>
              )}
              
              {userRole === 'restaurant' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Seating Capacity</label>
                  <input
                    type="number"
                    name="restaurantSeats"
                    value={formData.restaurantSeats}
                    onChange={handleInputChange}
                    placeholder="e.g., 80"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  />
                </div>
              )}
              
              {userRole === 'recycler' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Daily Processing Capacity (tons)</label>
                    <input
                      type="number"
                      name="dailyCapacity"
                      value={formData.dailyCapacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 10"
                      className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Waste Types Processed *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {wasteTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleWasteTypeToggle(type)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                            formData.wasteTypes.includes(type)
                              ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            formData.wasteTypes.includes(type)
                              ? 'bg-cyan-500 border-cyan-500'
                              : 'border-slate-300'
                          }`}>
                            {formData.wasteTypes.includes(type) && <Check size={12} className="text-white" />}
                          </div>
                          <span className="text-sm">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {userRole === 'logistics' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Vehicles</label>
                  <input
                    type="number"
                    name="vehicleCount"
                    value={formData.vehicleCount}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                >
                  <option value="">Select type</option>
                  <option value="private">Private Limited</option>
                  <option value="public">Public Limited</option>
                  <option value="sole">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., RDB/2024/XXXXX"
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Location Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">District *</label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                >
                  <option value="">Select district</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., KN 4 Ave, Kigali"
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Map</label>
                <div className="h-48 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-cyan-300">
                  <Map className="text-cyan-500 mb-3" size={32} />
                  <p className="text-cyan-700 text-sm font-medium text-center px-4">
                    Interactive map integration coming soon
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Geolocation will be auto-detected</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Your location helps optimize waste collection routes and matches you with nearby partners
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Verification & Documents</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Registration Document</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-slate-700 font-medium mb-1">Upload PDF, PNG, or JPG file</p>
                  <p className="text-slate-500 text-sm">Max file size: 10MB</p>
                  <button className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">
                    Choose File
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Documents (Optional)</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Environmental Compliance Certificate</p>
                      <p className="text-xs text-slate-500">REMA approved document</p>
                    </div>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white">
                      Upload
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Tax Clearance Certificate</p>
                      <p className="text-xs text-slate-500">RRA clearance document</p>
                    </div>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white">
                      Upload
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-slate-900 mb-1">Verification Process</p>
                    <p className="text-sm text-slate-600">
                      Your documents will be verified within 2 business days. You'll receive email confirmation once approved.
                      Verification is requislate before you can start trading on the marketplace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 1:
        return formData.fullName && formData.email && formData.password && formData.phone;
      case 2:
        return formData.businessName && formData.businessType;
      case 3:
        return formData.address && formData.sector;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Terms Modal
  if (showTerms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl -2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Terms & Conditions</h2>
                <p className="text-slate-500">Please read carefully before proceeding</p>
              </div>
            </div>
          </div>
          
          {/* Terms Content with Scroll */}
          <div 
            ref={termsRef}
            className="h-[400px] overflow-y-auto p-6 bg-slate-50/50"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h3>
                <p className="text-slate-600">
                  By accessing and using the Kigali Circular Economy Marketplace (KCEM) platform, you agree to be bound by these Terms of Service. These terms govern your use of our services for waste management and recycling transactions.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">2. User Responsibilities</h3>
                <p className="text-slate-600">
                  As a user of KCEM, you are responsible for:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                  <li>Providing accurate waste composition information</li>
                  <li>Maintaining proper waste segregation standards</li>
                  <li>Complying with all Rwandan environmental regulations</li>
                  <li>Ensuring timely collection scheduling</li>
                  <li>Verifying transaction details before confirmation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">3. Data Privacy</h3>
                <p className="text-slate-600">
                  We collect and process your data in accordance with Rwanda's Data Protection Law No. 058/2021. Your business information, transaction data, and location information are used solely for platform operations and optimization.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">4. Platform Fees</h3>
                <p className="text-slate-600">
                  KCEM charges a service fee of 5% on successful transactions. This fee covers platform maintenance, verification services, and customer support. All fees are transparently displayed before transaction confirmation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">5. Dispute Resolution</h3>
                <p className="text-slate-600">
                  Any disputes regarding waste quality, payment, or service delivery should first be resolved between parties. If unresolved, KCEM provides mediation services. Legal disputes fall under Kigali jurisdiction.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">6. Account Termination</h3>
                <p className="text-slate-600">
                  We reserve the right to suspend or terminate accounts that violate terms, engage in fraudulent activities, or repeatedly receive poor ratings from partners.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">7. Contact Information</h3>
                <p className="text-slate-600">
                  For questions about these terms, contact our legal team at legal@kcem.rw or call +250 788 123 456.
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="readTerms"
                  checked={scrolledToBottom}
                  onChange={(e) => setScrolledToBottom(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="readTerms" className="text-sm text-slate-700">
                  I confirm I have read and understood the terms
                </label>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleTermsDecline}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
                Decline & Return Home
              </button>
              
              <button
                onClick={handleTermsAccept}
                disabled={!scrolledToBottom}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-xl font-medium hover:-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role Selection Screen
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Join KCEM Marketplace</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select your role to start transforming waste into revenue
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className="p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-cyan-300 hover:-lg transition-all text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{role.label}</h3>
                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                  </div>
                </div>
                <div className="text-sm text-cyan-600 font-medium">Select Role →</div>
              </motion.button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-cyan-600 font-bold hover:underline">
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl -2xl overflow-hidden border border-slate-200">
        {/* Progress Bar - Top */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                {step === 4 ? <Check size={20} /> : steps[step-1].icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Register as {roles.find(r => r.id === userRole)?.label}
                </h2>
                <p className="text-slate-500 text-sm">Step {step} of {steps.length}</p>
              </div>
            </div>
            
            <button
              onClick={() => step > 1 ? setStep(step - 1) : setStep(0)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between items-center">
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > s.id ? 'bg-cyan-500 text-white' :
                    step === s.id ? 'bg-cyan-100 text-cyan-600 border-2 border-cyan-300' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s.id ? 'bg-cyan-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-700 mt-2">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  step === 1
                    ? 'invisible'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">
                  {step === 4 ? 'Review and submit your application' : `Step ${step} of ${steps.length}`}
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                disabled={!isStepValid() || loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-xl font-medium hover:-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : step === 4 ? (
                  <>
                    Complete Registration
                    <Check size={18} />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Form Progress */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Registration Progress</span>
              <span className="font-medium text-cyan-600">{Math.round((step / steps.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;