import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
    
    // Listen for auth changes
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const checkAuth = () => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const name = localStorage.getItem('userName') || '';
    
    setIsAuthenticated(auth);
    setUserRole(role);
    setUserName(name);
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case 'admin': return '/dashboard/admin';
      case 'business': return '/dashboard/business';
      case 'recycler': return '/dashboard/recycler';
      case 'driver': return '/dashboard/driver';
      case 'individual': return '/dashboard/individual';
      default: return '/dashboard';
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Update state
    setIsAuthenticated(false);
    setUserRole('');
    setUserName('');
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('authChange'));
    
    // Close mobile menu if open
    setIsOpen(false);
    
    // Navigate to home
    navigate('/');
  };

  const getRoleName = () => {
    switch (userRole) {
      case 'admin': return 'Admin';
      case 'business': return 'Business';
      case 'recycler': return 'Recycler';
      case 'driver': return 'Driver';
      case 'individual': return 'User';
      default: return 'User';
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-cyan-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">KCEM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-cyan-600 transition-colors">About</Link>
            <Link to="/services" className="hover:text-cyan-600 transition-colors">Services</Link>
            <Link to="/marketplace" className="hover:text-cyan-600 transition-colors">Marketplace</Link>
            {/* <Link to="/updates" className="hover:text-cyan-600 transition-colors">Updates</Link> */}
            <Link to="/blog" className="hover:text-cyan-600 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-cyan-600 transition-colors">Contact</Link>
            
            {/* Conditional Links based on Authentication */}
            {isAuthenticated ? (
              <>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-cyan-600" />
                      </div>
                      <span className="text-sm font-medium">{userName || getRoleName()}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <button
                        onClick={() => navigate(getDashboardPath())}
                        className="w-full text-left px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-50 flex items-center gap-2 transition-colors">
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-gray-200"></div>
                <Link to="/login" className="hover:text-cyan-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-cyan-600 text-white px-6 py-2.5 rounded-full hover:bg-cyan-700 transition-all shadow-sm hover:shadow-md">
                  Join Platform
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">About</Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">Services</Link>
          <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">Marketplace</Link>
          <Link to="/updates" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">Updates</Link>
          <Link to="/blog" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">Blog</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 hover:text-cyan-600">Contact</Link>
          
          {isAuthenticated ? (
            <>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500 capitalize">{getRoleName()}</p>
                  </div>
                </div>
                <Link 
                  to={getDashboardPath()} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 py-3 px-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block py-3 font-medium text-cyan-600"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="block bg-cyan-600 text-white text-center py-3 rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Join Platform
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;