import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, Home, Eye, EyeOff, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const demoCredentials = [
    { role: 'business', email: 'business@demo.com', password: 'demo123', name: 'Hotel Manager' },
    { role: 'recycler', email: 'recycler@demo.com', password: 'recycle123', name: 'Recycling Company' },
    { role: 'driver', email: 'driver@demo.com', password: 'drive123', name: 'Logistics Driver' },
    { role: 'admin', email: 'admin@demo.com', password: 'admin123', name: 'Platform Admin' },
    { role: 'individual', email: 'user@demo.com', password: 'user123', name: 'Individual User' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const matchedUser = demoCredentials.find(
      cred =>
        cred.email === formData.email.trim() &&
        cred.password === formData.password
    );

    if (!matchedUser) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    // Store user data in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', matchedUser.email);
    localStorage.setItem('userRole', matchedUser.role);
    localStorage.setItem('userName', matchedUser.name);
    localStorage.setItem('rememberMe', rememberMe.toString());

    // Dispatch event for Navbar to listen to
    window.dispatchEvent(new Event('authChange'));

    // Navigate to home page (Navbar will show dashboard links)
    navigate('/');
    setLoading(false);
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleDemoFill = (credential: typeof demoCredentials[0]) => {
    setFormData({
      email: credential.email,
      password: credential.password
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 sm:p-4 lg:p-6">
      {/* Navigation Buttons */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl text-slate-700 font-medium hover:bg-white hover:shadow-md transition-all border border-gray-200 text-sm sm:text-base"
        >
          <Home size={16} /> 
          <span className="hidden sm:inline">Return Home</span>
          <span className="sm:hidden">Home</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mt-15 w-full bg-white rounded-xl sm:rounded-[1.5rem] shadow-lg overflow-hidden flex flex-col lg:flex-row border border-gray-200 mx-4"
      >
        {/* Left Branding with Background Image */}
        <div className="lg:w-1/2 relative min-h-[300px] sm:min-h-[400px] lg:min-h-auto">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.85), rgba(6, 95, 70, 0.9)), url('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1470')`
            }}
          />
          
          <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 text-white">
            {/* Top Content */}
            <div>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="bg-cyan-600 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} className="sm:size-[28px]" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">KCEM</h2>
                  <p className="text-cyan-300/80 text-xs font-medium uppercase tracking-widest">Secure Portal</p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-tight">
                Welcome to Your
                <br />
                <span className="text-cyan-300">Circular Economy</span>
              </h2>

              <p className="text-cyan-100/80 text-sm leading-relaxed hidden sm:block">
                Sign in to manage waste listings, track sustainability metrics, and transform waste into revenue.
              </p>
              <p className="text-cyan-100/80 text-xs leading-relaxed sm:hidden">
                Manage waste listings, track metrics, transform waste into revenue.
              </p>
            </div>

            {/* Bottom Content */}
            <div className="mt-6 sm:mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-cyan-900 bg-cyan-600 flex items-center justify-center text-xs font-bold">
                      U{i}
                    </div>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-cyan-900 bg-cyan-500 flex items-center justify-center text-xs font-bold">
                  +85
                </div>
              </div>
              <p className="text-xs font-medium text-cyan-300 uppercase tracking-widest">
                85+ Businesses Transforming Waste
              </p>
            </div>

            {/* Decorative Elements */}
            <Leaf className="absolute -bottom-8 -left-8 text-cyan-800/20 size-32 sm:size-48 lg:size-64" />
            <Leaf className="absolute top-8 -right-8 text-cyan-800/20 size-24 sm:size-32 lg:size-40 rotate-90" />
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 xl:p-12">
          <div className="mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Sign In</h3>
            <p className="text-slate-500 text-sm sm:text-base">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors size-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm sm:text-base"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors size-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm sm:text-base"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 text-slate-700 cursor-pointer text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  disabled={loading}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-cyan-600 hover:text-cyan-700 hover:underline text-xs sm:text-sm font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  Sign In <LogIn size={18} className="sm:size-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Access */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl border border-slate-200">
            <p className="text-sm sm:text-base text-slate-600 text-center mb-3 font-medium">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {demoCredentials.map((credential, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleDemoFill(credential)}
                  disabled={loading}
                  className="bg-white p-2 sm:p-3 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all text-left border border-slate-100 disabled:opacity-50"
                >
                  <div className="font-medium text-slate-700 text-xs sm:text-sm mb-1 truncate">
                    {credential.name}
                  </div>
                  <div className="text-slate-500 text-xs truncate" title={credential.email}>
                    {credential.email}
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-2 sm:mt-3">
              Click any account to auto-fill credentials
            </p>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
            <p className="text-center text-xs sm:text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400 mt-2">
              By signing in, you agree to our{' '}
              <Link to="/terms-privacy" className="text-slate-500 hover:text-slate-600 underline">Terms</Link>{' '}
              and{' '}
              <Link to="/terms-privacy" className="text-slate-500 hover:text-slate-600 underline">Privacy</Link>
            </p>
          </div>

          {/* Mobile-only tip */}
          <div className="mt-6 p-3 bg-gray-50/50 rounded-xl lg:hidden">
            <p className="text-xs text-slate-500 text-center">
              <span className="font-medium">Tip:</span> Landscape mode recommended for tablets
            </p>
          </div>
        </div>
      </motion.div>

      {/* Landscape Mode Tip for Tablets */}
      <div className="hidden sm:block lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg max-w-sm">
        <p className="text-xs text-slate-600 text-center">
          <span className="font-medium">Better Experience:</span> Rotate to landscape mode
        </p>
      </div>
    </div>
  );
};

export default LoginPage;