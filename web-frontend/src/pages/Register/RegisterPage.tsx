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
  UserPlus,
  Home,
  Coffee,
  AlertCircle,
  Camera
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
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: '',
    address: '',
    district: '',
    sector: '',
    latitude: '',
    longitude: '',
    documentUrl: '',
    licenseNumber: '',
    wasteTypes: [] as string[],
    dailyCapacity: '',
    vehicleCount: '',
    hotelRooms: '',
    restaurantSeats: '',
    storageCapacity: '',
    processingTypes: [] as string[],
    employeeCount: '',
    operationHours: '',
    vehicleTypes: [] as string[],
    serviceRadius: '',
    personalId: '',
    collectorType: '',
    collectionAreas: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { 
      id: 'hotel', 
      label: 'Hotel/Resort', 
      icon: <Hotel size={24} />, 
      description: 'Chain or independent hotel with consistent waste output',
      color: 'from-cyan-500 to-cyan-500',
      loginPath: '/dashboard/hotel',
      features: ['Waste Listing Management', 'Revenue Dashboard', 'Green Score Certification', 'Schedule Management']
    },
    { 
      id: 'restaurant', 
      label: 'Restaurant/Café', 
      icon: <Coffee size={24} />, 
      description: 'Food service establishment with recyclable waste',
      color: 'from-amber-500 to-orange-500',
      loginPath: '/dashboard/hotel',
      features: ['Quick Listing Creation', 'Price Comparison', 'Local Recycler Network', 'Payment Tracking']
    },
    { 
      id: 'recycler', 
      label: 'Recycling Company', 
      icon: <Recycle size={24} />, 
      description: 'Industrial recycler or waste processor',
      color: 'from-green-500 to-cyan-500',
      loginPath: '/dashboard/recycler',
      features: ['Bulk Purchasing', 'Route Optimization', 'Quality Verification', 'Inventory Management']
    },
    { 
      id: 'logistics', 
      label: 'Logistics Partner', 
      icon: <Truck size={24} />, 
      description: 'Transportation and collection services',
      color: 'from-purple-500 to-cyan-500',
      loginPath: '/dashboard/driver',
      features: ['Route Optimization', 'Collection Verification', 'Earnings Tracking', 'Schedule Management']
    },
    { 
      id: 'individual', 
      label: 'Individual Collector', 
      icon: <UserPlus size={24} />, 
      description: 'Small-scale waste collection',
      color: 'from-cyan-500 to-teal-500',
      loginPath: '/dashboard/individual',
      features: ['Marketplace Access', 'Personal Green Score', 'Collection Tracking', 'Earnings Dashboard']
    },
    { 
      id: 'admin', 
      label: 'Platform Admin', 
      icon: <ShieldCheck size={24} />, 
      description: 'Platform management and oversight',
      color: 'from-red-500 to-pink-500',
      loginPath: '/admin',
      features: ['User Management', 'Content Moderation', 'Financial Oversight', 'System Configuration'],
      requiresInvitation: true
    }
  ];

  const steps = [
    { id: 1, title: 'Account', icon: <User size={18}/>, description: 'Personal information' },
    { id: 2, title: 'Business', icon: <Building2 size={18}/>, description: 'Business details' },
    { id: 3, title: 'Location', icon: <MapPin size={18}/>, description: 'Service location' },
    { id: 4, title: 'Verify', icon: <ShieldCheck size={18}/>, description: 'Document upload' }
  ];

  const wasteTypes = [
    'Used Cooking Oil (UCO)',
    'Glass Bottles',
    'Paper & Cardboard',
    'Plastic Containers',
    'Metal Cans',
    'Organic Waste',
    'E-waste',
    'Textile Waste',
    'Construction Waste'
  ];

  const processingTypes = [
    'Mechanical Recycling',
    'Chemical Recycling',
    'Composting',
    'Incineration with Energy Recovery',
    'Landfill',
    'Upcycling',
    'Refurbishment'
  ];

  const vehicleTypes = [
    'Pickup Truck',
    'Box Truck',
    'Dump Truck',
    'Compactor Truck',
    'Flatbed Truck',
    'Van',
    'Motorcycle with Trailer'
  ];

  const districts = [
    'Gasabo',
    'Nyarugenge', 
    'Kicukiro',
    'Rubavu',
    'Musanze',
    'Huye',
    'Nyagatare',
    'Rusizi',
    'Karongi',
    'Kayonza'
  ];

  const sectorsByDistrict: Record<string, string[]> = {
    'Gasabo': ['Kacyiru', 'Kimihurura', 'Remera', 'Gisozi', 'Kinyinya', 'Gikondo', 'Kabeza'],
    'Nyarugenge': ['Nyamirambo', 'Rwezamenyo', 'Muhima', 'Gitega', 'Kimisagara'],
    'Kicukiro': ['Gatenga', 'Niboye', 'Kagarama', 'Gikondo', 'Kanombe']
  };

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
    const selectedRole = roles.find(r => r.id === roleId);
    if (selectedRole?.requiresInvitation) {
      // Redirect to admin invitation page or show message
      navigate('/admin/invitation');
      return;
    }
    setUserRole(roleId);
    setFormData(prev => ({ ...prev, accountType: roleId }));
    setStep(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If district changes, reset sector
    if (name === 'district') {
      setFormData(prev => ({ ...prev, sector: '' }));
    }
  };

  const handleArrayToggle = (arrayName: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[arrayName] as string[];
      return {
        ...prev,
        [arrayName]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const validateStep = (stepNumber: number): boolean => {
    switch(stepNumber) {
      case 1:
        return !!(formData.fullName && formData.email && formData.password && formData.confirmPassword && 
                 formData.phone && formData.password === formData.confirmPassword);
      case 2:
        if (userRole === 'hotel') return !!(formData.businessName && formData.hotelRooms);
        if (userRole === 'restaurant') return !!(formData.businessName && formData.restaurantSeats);
        if (userRole === 'recycler') return !!(formData.businessName && formData.dailyCapacity && formData.processingTypes.length > 0);
        if (userRole === 'logistics') return !!(formData.businessName && formData.vehicleCount && formData.vehicleTypes.length > 0);
        if (userRole === 'individual') return !!(formData.fullName && formData.personalId);
        return !!(formData.businessName);
      case 3:
        return !!(formData.address && formData.district && formData.sector);
      case 4:
        return true; // Documents are optional initially
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    setLoading(true);
    
    // Simulate API call with role-specific endpoint
    try {
      const userData = {
        ...formData,
        role: userRole,
        registrationDate: new Date().toISOString(),
        status: 'pending_verification',
        loginRedirect: roles.find(r => r.id === userRole)?.loginPath
      };
      
      // Store user data in localStorage (simulating backend)
      localStorage.setItem('EcoTrade_user', JSON.stringify(userData));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message and redirect
      setLoading(false);
      navigate(`/login?registered=true&role=${userRole}`);
      
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
    }
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
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roles.find(r => r.id === userRole)?.color} flex items-center justify-center text-white`}>
                {roles.find(r => r.id === userRole)?.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Account Information</h3>
                <p className="text-slate-500 text-sm">Registering as {roles.find(r => r.id === userRole)?.label}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Firstname Lastname"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              {userRole === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">National ID Number *</label>
                  <input
                    type="text"
                    name="personalId"
                    value={formData.personalId}
                    onChange={handleInputChange}
                    placeholder="1XXXXXXXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    required
                  />
                </div>
              )}
            </div>
            
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  Passwords do not match
                </div>
              </div>
            )}
          </motion.div>
        );

      case 2:
        const roleConfig = roles.find(r => r.id === userRole);
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleConfig?.color} flex items-center justify-center text-white`}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{roleConfig?.label} Details</h3>
                <p className="text-slate-500 text-sm">Provide specific information for your role</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {userRole === 'individual' ? 'Display Name' : 'Business Name'} *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder={userRole === 'individual' ? 'Your preferred display name' : 'e.g., Kigali Grand Hotel'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                />
              </div>
              
              {/* Hotel-specific fields */}
              {userRole === 'hotel' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Rooms *</label>
                    <input
                      type="number"
                      name="hotelRooms"
                      value={formData.hotelRooms}
                      onChange={handleInputChange}
                      placeholder="e.g., 150"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Waste Types</label>
                    <select
                      name="wasteTypes"
                      multiple
                      value={formData.wasteTypes}
                      onChange={(e) => handleArrayToggle('wasteTypes', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      size={3}
                    >
                      {wasteTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                </>
              )}
              
              {/* Restaurant-specific fields */}
              {userRole === 'restaurant' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Seating Capacity *</label>
                    <input
                      type="number"
                      name="restaurantSeats"
                      value={formData.restaurantSeats}
                      onChange={handleInputChange}
                      placeholder="e.g., 80"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Daily UCO Production (L)</label>
                    <input
                      type="number"
                      name="dailyCapacity"
                      value={formData.dailyCapacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    />
                  </div>
                </>
              )}
              
              {/* Recycler-specific fields */}
              {userRole === 'recycler' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Daily Processing Capacity (tons) *</label>
                    <input
                      type="number"
                      name="dailyCapacity"
                      value={formData.dailyCapacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 10"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Storage Capacity (m³)</label>
                    <input
                      type="number"
                      name="storageCapacity"
                      value={formData.storageCapacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 500"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Processing Types *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {processingTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleArrayToggle('processingTypes', type)}
                          className={`p-3 rounded-lg border transition-all ${
                            formData.processingTypes.includes(type)
                              ? 'bg-green-50 border-green-300 text-green-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              formData.processingTypes.includes(type)
                                ? 'bg-green-500 border-green-500'
                                : 'border-slate-300'
                            }`}>
                              {formData.processingTypes.includes(type) && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm">{type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Logistics-specific fields */}
              {userRole === 'logistics' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Vehicles *</label>
                    <input
                      type="number"
                      name="vehicleCount"
                      value={formData.vehicleCount}
                      onChange={handleInputChange}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Radius (km)</label>
                    <input
                      type="number"
                      name="serviceRadius"
                      value={formData.serviceRadius}
                      onChange={handleInputChange}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Types *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {vehicleTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleArrayToggle('vehicleTypes', type)}
                          className={`p-3 rounded-lg border transition-all ${
                            formData.vehicleTypes.includes(type)
                              ? 'bg-purple-50 border-purple-300 text-purple-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              formData.vehicleTypes.includes(type)
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-slate-300'
                            }`}>
                              {formData.vehicleTypes.includes(type) && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm">{type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Individual-specific fields */}
              {userRole === 'individual' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Collector Type</label>
                    <select
                      name="collectorType"
                      value={formData.collectorType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    >
                      <option value="">Select type</option>
                      <option value="independent">Independent Collector</option>
                      <option value="cooperative">Cooperative Member</option>
                      <option value="youth">Youth Group</option>
                      <option value="women">Women's Group</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Collection Area</label>
                    <select
                      name="collectionAreas"
                      multiple
                      value={formData.collectionAreas}
                      onChange={(e) => handleArrayToggle('collectionAreas', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      size={3}
                    >
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {/* Common fields */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                >
                  <option value="">Select type</option>
                  <option value="private">Private Limited</option>
                  <option value="public">Public Limited</option>
                  <option value="sole">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="ngo">NGO/Association</option>
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                />
              </div>
              
              {['recycler', 'logistics'].includes(userRole) && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Employees</label>
                  <input
                    type="number"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  />
                </div>
              )}
              
              {userRole === 'recycler' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Operation Hours</label>
                  <input
                    type="text"
                    name="operationHours"
                    value={formData.operationHours}
                    onChange={handleInputChange}
                    placeholder="e.g., 8:00 AM - 6:00 PM"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  />
                </div>
              )}
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Location Details</h3>
                <p className="text-slate-500 text-sm">For route optimization and local matching</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                >
                  <option value="">Select district</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sector *</label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                >
                  <option value="">Select sector</option>
                  {formData.district && sectorsByDistrict[formData.district]?.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., KN 4 Ave, Kigali"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Pin</label>
                <div className="h-64 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-cyan-300 relative">
                  <Map className="text-cyan-500 mb-3" size={32} />
                  <p className="text-cyan-700 text-sm font-medium text-center px-4">
                    Interactive map integration coming soon
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Geolocation will be auto-detected for route optimization</p>
                  
                  <div className="absolute bottom-4 right-4">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2"
                    >
                      <Map size={16} />
                      Detect Location
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Your location helps optimize waste collection routes and matches you with nearby partners
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        const roleColor = roles.find(r => r.id === userRole)?.color;
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white`}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Verification & Documents</h3>
                <p className="text-slate-500 text-sm">Required for account activation</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Registration Document *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                  <div className="relative">
                    <Upload className="mx-auto text-slate-400 mb-3" size={32} />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Camera size={14} className="text-white" />
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium mb-1">Upload PDF, PNG, or JPG file</p>
                  <p className="text-slate-500 text-sm mb-4">Max file size: 10MB</p>
                  <button 
                    type="button"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Choose File
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Documents</label>
                <div className="space-y-3">
                  {userRole === 'individual' ? (
                    <>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">National ID (Front & Back)</p>
                          <p className="text-xs text-slate-500">Required for identity verification</p>
                        </div>
                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition-colors">
                          Upload
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Environmental Compliance Certificate</p>
                          <p className="text-xs text-slate-500">REMA approved document</p>
                        </div>
                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition-colors">
                          Upload
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Tax Clearance Certificate</p>
                          <p className="text-xs text-slate-500">RRA clearance document</p>
                        </div>
                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition-colors">
                          Upload
                        </button>
                      </div>
                    </>
                  )}
                  
                  {userRole === 'logistics' && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <Truck size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Vehicle Registration Documents</p>
                        <p className="text-xs text-slate-500">For all operational vehicles</p>
                      </div>
                      <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition-colors">
                        Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border ${roleColor?.includes('cyan') ? 'bg-cyan-50 border-cyan-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <ShieldCheck className={`flex-shrink-0 mt-0.5 ${roleColor?.includes('cyan') ? 'text-cyan-600' : 'text-amber-600'}`} size={18} />
                  <div>
                    <p className="font-medium text-slate-900 mb-1">Verification Process</p>
                    <p className="text-sm text-slate-600">
                      Your documents will be verified within 2 business days. You'll receive email confirmation once approved.
                      {userRole !== 'individual' ? ' Verification is required before you can start trading on the marketplace.' : ' Verification is required for full platform access.'}
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      <p>• Business registration: Required</p>
                      <p>• Identity verification: Required</p>
                      <p>• Additional documents: Optional for initial registration</p>
                    </div>
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

  // Terms Modal
  if (showTerms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">EcoTrade Terms & Conditions</h2>
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
                  By accessing and using the EcoTrade Rwanda   (EcoTrade) platform, you agree to be bound by these Terms of Service. These terms govern your use of our services for waste management and recycling transactions.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">2. Role-Specific Responsibilities</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <h4 className="font-bold text-cyan-700 mb-1">HORECA Businesses</h4>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li>Accurate waste composition reporting</li>
                      <li>Proper waste segregation standards</li>
                      <li>Timely collection scheduling</li>
                      <li>Quality assurance of listed materials</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-bold text-green-700 mb-1">Recycling Companies</h4>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li>Accurate quality assessments</li>
                      <li>Timely collection and payment</li>
                      <li>Compliance with environmental regulations</li>
                      <li>Transparent processing methods</li>
                    </ul>
                  </div>
                </div>
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
                  EcoTrade charges a service fee of 5% on successful transactions. This fee covers platform maintenance, verification services, and customer support. All fees are transparently displayed before transaction confirmation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">5. Dispute Resolution</h3>
                <p className="text-slate-600">
                  Any disputes regarding waste quality, payment, or service delivery should first be resolved between parties. If unresolved, EcoTrade provides mediation services. Legal disputes fall under Kigali jurisdiction.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">6. Account Termination</h3>
                <p className="text-slate-600">
                  We reserve the right to suspend or terminate accounts that violate terms, engage in fraudulent activities, or repeatedly receive poor ratings from partners.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">7. Role-Based Access</h3>
                <p className="text-slate-600">
                  Each user role has specific dashboard access and functionality. Cross-role access is strictly prohibited without explicit platform authorization.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">8. Contact Information</h3>
                <p className="text-slate-600">
                  For questions about these terms, contact our legal team at legal@EcoTrade.rw or call +250 780 162 164.
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
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Join EcoTrade Marketplace</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select your role to access tailored waste management solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                disabled={role.requiresInvitation}
                className={`p-6 bg-white rounded-2xl border-2 border-slate-200 hover:shadow-xl transition-all text-left ${
                  role.requiresInvitation ? 'opacity-75 cursor-not-allowed' : 'hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.color} text-white`}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">{role.label}</h3>
                      {role.requiresInvitation && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">By Invitation</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {role.features?.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className={`text-sm font-medium ${
                  role.requiresInvitation ? 'text-slate-400' : 'text-cyan-600'
                }`}>
                  {role.requiresInvitation ? 'Contact admin for access →' : 'Select Role →'}
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-cyan-600 font-bold hover:underline">
                Sign in to your dashboard
              </button>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Each role provides unique dashboard features and access levels
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Registration Form
  const currentRole = roles.find(r => r.id === userRole);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Progress Bar - Top */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentRole?.color} text-white`}>
                {step === 4 ? <Check size={20} /> : steps[step-1].icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Register as {currentRole?.label}
                </h2>
                <p className="text-slate-500 text-sm">Step {step} of {steps.length} • Login to: {currentRole?.loginPath}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
                title="Go to Home"
              >
                <Home size={20} />
              </button>
              <button
                onClick={() => step > 1 ? setStep(step - 1) : setStep(0)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back
              </button>
            </div>
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
                {!validateStep(step) && step < 4 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Please complete all required fields
                  </p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: validateStep(step) ? 1.02 : 1 }}
                whileTap={{ scale: validateStep(step) ? 0.98 : 1 }}
                onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                disabled={!validateStep(step) || loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                  validateStep(step) 
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white hover:shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
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

          {/* Role-specific Dashboard Preview */}
          {currentRole && (
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-xl border border-cyan-100">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-6 rounded-lg ${currentRole.color} flex items-center justify-center text-white`}>
                  {currentRole.icon}
                </div>
                <h4 className="font-bold text-slate-900">{currentRole.label} Dashboard Preview</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                After verification, you'll access: <span className="font-medium">{currentRole.loginPath}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {currentRole.features?.map((feature, index) => (
                  <span key={index} className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;