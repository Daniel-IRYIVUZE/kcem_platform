import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const checkAuth = () => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const name = localStorage.getItem('userName') || '';
    setIsAuthenticated(auth);
    setUserRole(role);
    setUserName(name);
  };

  const getDashboardPath = () => {
    const roleMap: Record<string, string> = {
      admin: '/dashboard/admin',
      business: '/dashboard/business',
      recycler: '/dashboard/recycler',
      driver: '/dashboard/driver',
      individual: '/dashboard/individual',
    };
    return roleMap[userRole] || '/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserRole('');
    setUserName('');
    window.dispatchEvent(new Event('authChange'));
    setIsOpen(false);
    navigate('/');
  };

  const getRoleBadgeColor = () => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      business: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
      recycler: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      driver: 'bg-orange-100 text-yellow-700 dark:bg-yellow-700/50 dark:text-yellow-700',
      individual: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    };
    return colors[userRole] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getRoleName = () => {
    const names: Record<string, string> = {
      admin: 'Admin', business: 'Business', recycler: 'Recycler',
      driver: 'Driver', individual: 'User',
    };
    return names[userRole] || 'User';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-800/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-md border-b border-gray-200 dark:border-gray-700/80'
          : 'bg-white dark:bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/images/EcoTrade.png"
              alt="EcoTrade Rwanda"
              className="h-14 group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 font-medium text-gray-600 dark:text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                  isActive(link.path)
                    ? 'text-cyan-600 dark:text-cyan-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-500 after:rounded-full'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 transition-all duration-300 text-gray-600 dark:text-yellow-700 hover:text-amber-500"
            >
              {isDark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* Conditional Auth Links */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <div className="w-9 h-9 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                    <User size={16} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">{userName || getRoleName()}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${getRoleBadgeColor()}`}>
                      {getRoleName()}
                    </span>
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                  <button
                    onClick={() => navigate(getDashboardPath())}
                    className="w-full text-left px-4 py-2.5 text-sm text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md text-sm font-semibold"
                >
                  Join Platform
                </button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-gray-600 dark:text-yellow-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-5 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2.5 px-3 rounded-lg transition-colors font-medium ${
                isActive(link.path)
                  ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-3">
              <div className="flex items-center gap-3 mb-3 px-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                  <User size={20} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getRoleBadgeColor()}`}>
                    {getRoleName()}
                  </span>
                </div>
              </div>
              <Link
                to={getDashboardPath()}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 py-2.5 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2.5 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-3 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block py-2.5 px-3 font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
              >
                Login
              </Link>
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg transition-colors font-semibold"
              >
                Join Platform
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
