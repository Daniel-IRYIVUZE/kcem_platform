// components/auth/SignupWizardSimplified.tsx
import { useState, useCallback } from 'react';
import {
  Building2, Factory, ArrowRight, ArrowLeft, Check,
  MapPin, Eye, EyeOff, Search,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

// Fix default leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface SignupWizardProps {
  onToggleMode: () => void;
  onComplete: () => void;
}

// ─── Chip picker ─────────────────────────────────────────────────────────────
const ChipPicker = ({
  label, options, selected, onToggle, color = '#0891b2', single = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  color?: string;
  single?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const sel = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={sel
              ? { backgroundColor: color + '1a', borderColor: color, color }
              : { backgroundColor: 'transparent', borderColor: '#d1d5db', color: '#6b7280' }}
          >
            {sel && <span className="mr-1">✓</span>}{opt}
          </button>
        );
      })}
    </div>
    {single && selected.length === 0 && (
      <p className="text-xs text-gray-400 mt-1">Select one option</p>
    )}
  </div>
);

// ─── Map click handler ────────────────────────────────────────────────────────
const MapClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// ─── Field component ──────────────────────────────────────────────────────────
const Field = ({
  label, name, value, onChange, type = 'text', placeholder, required, hint,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ─── Wizard ───────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;

const SignupWizard = ({ onToggleMode, onComplete }: SignupWizardProps) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'hotel' | 'recycler' | 'driver' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 2 — personal info
  const [personal, setPersonal] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);

  // Step 3 — role details
  const [roleDetails, setRoleDetails] = useState({
    businessName: '', businessAddress: '', operatingHours: '',
    companyName: '', tinNumber: '', recyclerLicense: '',
    vehicleType: [] as string[], vehiclePlate: '', driverLicense: '', yearsExp: '',
  });
  const [wasteTypes, setWasteTypes] = useState<string[]>([]);

  // Step 4 — location
  const [markerPos, setMarkerPos] = useState<[number, number]>([-1.9441, 30.0619]);
  const [address, setAddress] = useState('');
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ name: string; lat: number; lng: number }>>([]);

  // Step 5 — terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const { login } = useAuth();

  const handlePersonalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonal(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      let s = 0;
      if (value.length >= 8) s += 25;
      if (/[a-z]/.test(value)) s += 25;
      if (/[A-Z]/.test(value)) s += 25;
      if (/[0-9]/.test(value)) s += 25;
      setPwdStrength(s);
    }
  }, []);

  const handleRoleDetailsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleDetails(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleChip = (list: string[], setList: (v: string[]) => void, value: string, single = false) => {
    if (single) { setList([value]); return; }
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleMapPick = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&bounded=1&viewbox=29.5,-2.5,30.5,-1.0`
      );
      const data = await response.json();
      const formatted = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
      setLocationSuggestions(formatted);
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSuggestions([]);
    }
  }, []);

  const handleLocationSearch = (value: string) => {
    setLocationSearchInput(value);
    fetchLocationSuggestions(value);
  };

  const selectLocationSuggestion = (suggestion: typeof locationSuggestions[0]) => {
    setLocationSearchInput(suggestion.name);
    setLocationSuggestions([]);
    setMarkerPos([suggestion.lat, suggestion.lng]);
    setAddress(suggestion.name);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPos([latitude, longitude]);
        setAddress(`Your Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setLocationSearchInput('Your Current Location');
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please enable location services.');
      }
    );
  };

  const canProceedStep2 = () =>
    !!personal.fullName.trim() &&
    !!personal.email.trim() && personal.email.includes('@') &&
    personal.password.length >= 8 &&
    personal.password === personal.confirmPassword;

  const handleRegister = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const backendRole = role === 'hotel' ? 'business' : role;
      await authAPI.register({
        email: personal.email.trim(),
        full_name: personal.fullName.trim(),
        password: personal.password,
        phone: personal.phone.trim() || undefined,
        role: backendRole,
      });
      await login(personal.email.trim(), personal.password);
      setStep(6); // success
    } catch (err) {
      setSubmitError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step indicator ─────────────────────────────────────────────────────────
  const stepLabels = ['Role', 'Personal', 'Details', 'Location', 'Terms'];
  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {stepLabels.map((_label, idx) => {
          const num = idx + 1;
          return (
            <div key={num} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-colors ${
                step > num ? 'bg-cyan-600 text-white' :
                step === num ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 dark:ring-cyan-900/40' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${step > num ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {stepLabels.map((lbl, idx) => (
          <span key={idx} className={`text-center flex-1 text-xs ${step === idx + 1 ? 'text-cyan-600 font-semibold' : 'text-gray-400'}`}>{lbl}</span>
        ))}
      </div>
    </div>
  );

  // ─── Steps ──────────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // STEP 1: Choose role
      case 1: {
        const roles = [
          { id: 'hotel',    label: 'Hotel / Business',    sub: 'List organic waste for recycling',  icon: Building2, color: '#d97706', traits: ['Waste listing & tracking', 'Bid management', 'Collection scheduling'] },
          { id: 'recycler', label: 'Recycling Company',   sub: 'Bid on waste and manage fleet',     icon: Factory,   color: '#0891b2', traits: ['Marketplace access', 'Fleet management', 'Analytics dashboard']      },
          // { id: 'driver',   label: 'Driver / Collector',  sub: 'Handle pickups and deliveries',     icon: Truck,     color: '#2563eb', traits: ['Route navigation', 'Collection tracking', 'Earnings overview']        },
        ] as const;
        return (
          <div className="space-y-3">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">What's your role?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you will use EcoTrade. This determines your dashboard.</p>
            </div>
            {roles.map(({ id, label, sub, icon: Icon, color, traits }) => {
              const sel = role === id;
              return (
                <button
                  key={id}
                  onClick={() => setRole(id)}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all"
                  style={sel
                    ? { borderColor: color, backgroundColor: color + '10' }
                    : { borderColor: '#e5e7eb' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + (sel ? '25' : '15') }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm" style={sel ? { color } : undefined}>{label}</span>
                        {sel && <Check className="w-4 h-4 shrink-0" style={{ color }} />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
                      {sel && (
                        <ul className="mt-2 space-y-1">
                          {traits.map(t => (
                            <li key={t} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Check className="w-3 h-3 shrink-0" style={{ color }} />{t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      // STEP 2: Personal info
      case 2:
        return (
          <div className="space-y-4">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Personal Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your basic account details</p>
            </div>
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                {submitError}
              </div>
            )}
            <Field label="Full Name" name="fullName" value={personal.fullName} onChange={handlePersonalChange} placeholder="Enter your full name" required />
            <Field label="Phone Number" name="phone" value={personal.phone} onChange={handlePersonalChange} placeholder="+250 7XX XXX XXX" type="tel" />
            <Field label="Email Address" name="email" value={personal.email} onChange={handlePersonalChange} placeholder="your@email.com" type="email" required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password" value={personal.password}
                  onChange={handlePersonalChange}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {personal.password && (
                <div className="mt-1.5">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${pwdStrength <= 25 ? 'bg-red-500' : pwdStrength <= 50 ? 'bg-yellow-500' : pwdStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${pwdStrength}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{pwdStrength <= 25 ? 'Weak' : pwdStrength <= 50 ? 'Fair' : pwdStrength <= 75 ? 'Good' : 'Strong'} password</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword" value={personal.confirmPassword}
                  onChange={handlePersonalChange}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {personal.confirmPassword && personal.password !== personal.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        );

      // STEP 3: Role-specific details
      case 3: {
        const hotelWasteOpts = ['Food Waste', 'Cardboard', 'Plastic', 'Glass', 'Metal'];
        const recyclerWasteOpts = ['Organic', 'Plastic', 'Metal', 'Paper', 'E-Waste', 'Glass'];
        const vehicleOpts = ['Pickup Truck', 'Box Truck', 'Mini-Truck', 'Cargo Van'];
        return (
          <div className="space-y-4">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {role === 'recycler' ? 'Company Details' : role === 'driver' ? 'Vehicle & License' : 'Business Details'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {role === 'recycler' ? 'About your recycling company' : role === 'driver' ? 'Your vehicle and license info' : 'About your hotel or business'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
              {role === 'recycler' && (
                <>
                  <Field label="Company Name" name="companyName" value={roleDetails.companyName} onChange={handleRoleDetailsChange} placeholder="e.g. GreenEnergy Recyclers Ltd" />
                  <Field label="TIN Number" name="tinNumber" value={roleDetails.tinNumber} onChange={handleRoleDetailsChange} placeholder="Tax Identification Number" />
                  <Field label="Recycling License" name="recyclerLicense" value={roleDetails.recyclerLicense} onChange={handleRoleDetailsChange} placeholder="REMA-XXXX-YYYY" />
                  <ChipPicker label="Waste Types Handled" options={recyclerWasteOpts} selected={wasteTypes} onToggle={v => toggleChip(wasteTypes, setWasteTypes, v)} color="#0891b2" />
                </>
              )}
              {role === 'driver' && (
                <>
                  <ChipPicker label="Vehicle Type" options={vehicleOpts} selected={roleDetails.vehicleType} onToggle={v => toggleChip(roleDetails.vehicleType, val => setRoleDetails(p => ({ ...p, vehicleType: val })), v, true)} color="#2563eb" single />
                  <Field label="Vehicle Plate" name="vehiclePlate" value={roleDetails.vehiclePlate} onChange={handleRoleDetailsChange} placeholder="e.g. RAB 123 A" />
                  <Field label="Driver's License No." name="driverLicense" value={roleDetails.driverLicense} onChange={handleRoleDetailsChange} placeholder="Full license number" />
                  <Field label="Years of Experience" name="yearsExp" value={roleDetails.yearsExp} onChange={handleRoleDetailsChange} placeholder="e.g. 3" />
                </>
              )}
              {role === 'hotel' && (
                <>
                  <Field label="Business Name" name="businessName" value={roleDetails.businessName} onChange={handleRoleDetailsChange} placeholder="e.g. Hotel des Mille Collines" />
                  <Field label="Business Address" name="businessAddress" value={roleDetails.businessAddress} onChange={handleRoleDetailsChange} placeholder="e.g. KN 5 Rd, Kigali" />
                  <Field label="Operating Hours" name="operatingHours" value={roleDetails.operatingHours} onChange={handleRoleDetailsChange} placeholder="e.g. Mon-Fri 06:00-22:00" />
                  <ChipPicker label="Waste Types Produced" options={hotelWasteOpts} selected={wasteTypes} onToggle={v => toggleChip(wasteTypes, setWasteTypes, v)} color="#d97706" />
                </>
              )}
            </div>
          </div>
        );
      }

      // STEP 4: Location map
      case 4:
        return (
          <div className="space-y-4">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your Location</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pin your business address on the map or search for it</p>
            </div>
            
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Location</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={locationSearchInput}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Search for a location..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />

                {/* Suggestions Dropdown */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {locationSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectLocationSuggestion(suggestion)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm text-gray-900 dark:text-gray-100 transition-colors flex items-start gap-2"
                      >
                        <MapPin className="w-4 h-4 mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{suggestion.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Use Current Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="w-full px-4 py-2.5 border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-xl font-medium text-sm hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Use My Current Location
            </button>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 280 }}>
              <MapContainer center={markerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                <MapClickHandler onPick={handleMapPick} />
                <Marker position={markerPos} />
              </MapContainer>
            </div>

            {/* Address Input */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin className="w-4 h-4 text-cyan-600" /> Address / Coordinates
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Click the map or search above"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          </div>
        );

      // STEP 5: Terms & Conditions
      case 5:
        return (
          <div className="space-y-4">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Terms & Conditions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review and accept to create your account</p>
            </div>
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                {submitError}
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-52 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Welcome to EcoTrade Platform.</p>
              <p className="mb-3">By creating an account, you agree to participate in Kigali's circular economy initiative.</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">1. Service Terms</p>
              <p className="mb-3">You agree to provide accurate waste listings and engage in fair trade practices.</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">2. Data Privacy</p>
              <p className="mb-3">Your personal data is encrypted and protected per GDPR standards.</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">3. Platform Rules</p>
              <ul className="list-disc list-inside mb-3 space-y-1">
                <li>No fraudulent listings</li>
                <li>Timely collection required</li>
                <li>Transparent pricing expected</li>
              </ul>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">4. Payments</p>
              <p className="mb-3">All transactions processed securely. Disputes resolved within 5 business days.</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">5. Environmental Commitment</p>
              <p>You commit to proper waste segregation and sustainable practices.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">I agree to the Terms and Conditions</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">I agree to the Privacy Policy</span>
            </label>
          </div>
        );

      // STEP 6: Success
      case 6:
        return (
          <div className="space-y-4 text-center py-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Account Created!</h3>
            <p className="text-gray-500 dark:text-gray-400">Welcome to EcoTrade! You're now logged in.</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Next Steps:</h4>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                {['Complete your profile in Dashboard Settings', 'Upload required documents for verification', 'Start using the platform once approved!'].map(t => (
                  <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      default: return null;
    }
  };

  const progress = Math.min(step, TOTAL_STEPS);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
      {step <= TOTAL_STEPS && renderStepIndicator()}
      {renderStep()}

      {/* Actions */}
      <div className="mt-7 flex flex-col sm:flex-row justify-between gap-3">
        {step > 1 && step <= TOTAL_STEPS && (
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={submitting}
            className="w-full sm:w-auto px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {/* Step 1 continue */}
        {step === 1 && (
          <button
            onClick={() => { if (role) setStep(2); }}
            disabled={!role}
            className="w-full sm:flex-1 px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Step 2 continue */}
        {step === 2 && (
          <button
            onClick={() => { if (canProceedStep2()) setStep(3); }}
            disabled={!canProceedStep2()}
            className="w-full sm:flex-1 px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Step 3 continue */}
        {step === 3 && (
          <button
            onClick={() => setStep(4)}
            className="w-full sm:flex-1 px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Step 4 continue */}
        {step === 4 && (
          <button
            onClick={() => setStep(5)}
            className="w-full sm:flex-1 px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Step 5 create account */}
        {step === 5 && (
          <button
            onClick={handleRegister}
            disabled={!termsAccepted || !privacyAccepted || submitting}
            className="w-full sm:flex-1 px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Account…' : <><Check className="w-4 h-4" /> Create Account</>}
          </button>
        )}

        {/* Step 6 go to dashboard */}
        {step === 6 && (
          <button
            onClick={onComplete}
            className="w-full px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all"
          >
            Go to Dashboard
          </button>
        )}
      </div>

      {step === 1 && (
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onToggleMode} className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-semibold">
            Sign in
          </button>
        </p>
      )}

      {/* hidden progress tracker for accessibility */}
      <div className="sr-only" aria-live="polite">Step {progress} of {TOTAL_STEPS}</div>
    </div>
  );
};

export default SignupWizard;
