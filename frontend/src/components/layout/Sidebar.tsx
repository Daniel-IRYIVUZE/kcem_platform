// components/layout/Sidebar.tsx
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Users, Package, Truck, Settings, BarChart3,
  Calendar, Map, FileText, ShoppingCart, LogOut, ChevronLeft,
  ChevronRight, Menu, X, ClipboardList, Trophy, Star, Eye,
  CheckCircle, Route, Warehouse, DollarSign, Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getDashboardDisplayName } from '../../utils/userDisplayName';

interface SidebarProps {
  userRole: 'admin' | 'business' | 'recycler' | 'driver' | 'individual';
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const roleConfigs: Record<string, {
  label: string;
  accent: string;
  navItems: NavItem[];
}> = {
  admin: {
    label: 'Admin Panel',
    accent: '#00aac4',
    navItems: [
      { path: '/dashboard/admin', label: 'Dashboard Home', icon: <BarChart3 size={20} /> },
      { path: '/dashboard/admin/users', label: 'User Management', icon: <Users size={20} /> },
      { path: '/dashboard/admin/listings', label: 'Waste Listings', icon: <Package size={20} /> },
      { path: '/dashboard/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
      { path: '/dashboard/admin/green-scores', label: 'Green Scores', icon: <Trophy size={20} /> },
      { path: '/dashboard/admin/blog', label: 'Blog Management', icon: <FileText size={20} /> },
      { path: '/dashboard/admin/reports', label: 'Reports', icon: <FileText size={20} /> },
      { path: '/dashboard/admin/settings', label: 'System Settings', icon: <Settings size={20} /> },
    ]
  },
  business: {
    label: 'Hotel Dashboard',
    accent: '#00aac4',
    navItems: [
      { path: '/dashboard/business', label: 'Dashboard', icon: <BarChart3 size={20} /> },
      { path: '/dashboard/business/listings', label: 'My Waste Listings', icon: <Package size={20} /> },
      { path: '/dashboard/business/greenscore', label: 'Green Score', icon: <Trophy size={20} /> },
      { path: '/dashboard/business/schedule', label: 'Collection Schedule', icon: <Calendar size={20} /> },
      { path: '/dashboard/business/settings', label: 'Hotel Settings', icon: <Settings size={20} /> },
      { path: '/dashboard/business/reports', label: 'Reports & Certificates', icon: <Star size={20} /> },
    ]
  },
  recycler: {
    label: 'Recycler Dashboard',
    accent: '#00aac4',
    navItems: [
      { path: '/dashboard/recycler', label: 'Dashboard', icon: <BarChart3 size={20} /> },
      { path: '/dashboard/recycler/fleet', label: 'My Fleet', icon: <Truck size={20} /> },
      { path: '/dashboard/recycler/drivers', label: 'Drivers', icon: <Truck size={20} /> },
      { path: '/dashboard/recycler/marketplace', label: 'Available Waste', icon: <ShoppingCart size={20} /> },
      { path: '/dashboard/recycler/bids', label: 'My Bids', icon: <Eye size={20} /> },
      { path: '/dashboard/recycler/collections', label: 'Active Collections', icon: <Route size={20} /> },
      { path: '/dashboard/recycler/inventory', label: 'Inventory', icon: <Warehouse size={20} /> },
      { path: '/dashboard/recycler/revenue', label: 'Revenue & Payouts', icon: <DollarSign size={20} /> },
      { path: '/dashboard/recycler/impact', label: 'Green Impact', icon: <Trophy size={20} /> },
      { path: '/dashboard/recycler/settings', label: 'Company Settings', icon: <Settings size={20} /> },
      { path: '/dashboard/recycler/reports', label: 'Reports', icon: <FileText size={20} /> },
    ]
  },
  driver: {
    label: 'Driver Dashboard',
    accent: '#00aac4',
    navItems: [
      { path: '/dashboard/driver', label: "Today's Route", icon: <Map size={20} /> },
      { path: '/dashboard/driver/assignments', label: 'My Assignments', icon: <ClipboardList size={20} /> },
      { path: '/dashboard/driver/completed', label: 'Completed Jobs', icon: <CheckCircle size={20} /> },
      { path: '/dashboard/driver/settings', label: 'Settings', icon: <Settings size={20} /> },
    ]
  },
  individual: {
    label: 'My Dashboard',
    accent: '#00aac4',
    navItems: [
      { path: '/dashboard/individual', label: 'Overview', icon: <BarChart3 size={20} /> },
      { path: '/dashboard/individual/marketplace', label: 'Marketplace', icon: <ShoppingCart size={20} /> },
      { path: '/dashboard/individual/impact', label: 'My Impact', icon: <Leaf size={20} /> },
      { path: '/dashboard/individual/orders', label: 'My Orders', icon: <Package size={20} /> },
      { path: '/dashboard/individual/financial', label: 'Financial', icon: <DollarSign size={20} /> },
      { path: '/dashboard/individual/settings', label: 'Settings', icon: <Settings size={20} /> },
    ]
  },
};

const Sidebar = ({ userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      } else if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const config = roleConfigs[userRole] ?? roleConfigs.individual;
  const displayName = getDashboardDisplayName(user, userRole);

  const handleLogout = () => {
    logout();
    ['isAuthenticated', 'userEmail', 'userRole', 'userName'].forEach(k =>
      localStorage.removeItem(k)
    );
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  // Base classes for sidebar
  const sidebarClasses = `
    flex flex-col h-full transition-all duration-300 ease-in-out
    fixed lg:relative inset-y-0 left-0 z-50
    ${collapsed ? 'w-20' : 'w-64'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${isDark 
      ? 'bg-gray-950 border-r border-gray-800' 
      : 'bg-white border-r border-gray-200'
    }
    shadow-xl
  `;

  // Nav item base classes
  const getNavItemClasses = (isActive: boolean) => `
    group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium
    transition-all duration-200 relative
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500
    ${isActive 
      ? 'text-white shadow-md' 
      : isDark
        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }
  `;

  // Icon wrapper classes
  const getIconClasses = (isActive: boolean) => `
    shrink-0 flex items-center justify-center w-9 h-9 rounded-lg
    transition-all duration-200
    ${isActive
      ? 'text-white'
      : isDark
        ? 'text-gray-500 group-hover:text-gray-200'
        : 'text-gray-400 group-hover:text-gray-700'
    }
  `;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className={`
          lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl shadow-lg
          transition-all duration-200 active:scale-95
          ${isDark 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
          }
        `}
      >
        <Menu size={22} />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className={`
          flex items-center justify-between px-4 py-5 min-h-18
          ${isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'}
        `}>
          {/* Logo */}
          <div className="flex items-center justify-center flex-1">
            {collapsed ? (
              <img 
                src="/images/EcoTrade1.png" 
                alt="EcoTrade" 
                className="h-10 w-10 object-contain"
              />
            ) : (
              <img 
                src="/images/EcoTrade.png" 
                alt="EcoTrade Rwanda" 
                className="h-10 object-contain"
              />
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-1">
            {/* Mobile Close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
            
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(c => !c)}
              className={`
                hidden lg:flex p-2 rounded-lg transition-all duration-200
                ${isDark 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }
              `}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className={`
            px-4 py-3
            ${isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'}
          `}>
            <div className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
              ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
            `}>
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: config.accent }}
              />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {config.label}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <div className="space-y-1">
            {/* Home Link */}
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => getNavItemClasses(isActive)}
              style={({ isActive }) => isActive ? { backgroundColor: config.accent } : {}}
              title={collapsed ? 'Home' : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className={getIconClasses(isActive)}>
                    <Home size={collapsed ? 22 : 20} />
                  </span>
                  {!collapsed && <span className="truncate">Home</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      Home
                    </span>
                  )}
                </>
              )}
            </NavLink>

            {/* Divider */}
            {!collapsed && (
              <div className={`
                mx-4 my-2 h-px
                ${isDark ? 'bg-gray-800' : 'bg-gray-200'}
              `} />
            )}

            {/* Role-specific Links */}
            {config.navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/dashboard/${userRole}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => getNavItemClasses(isActive)}
                style={({ isActive }) => isActive ? { backgroundColor: config.accent } : {}}
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span className={getIconClasses(isActive)}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    {collapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.label}
                        {item.badge && ` (${item.badge})`}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className={`
          p-4
          ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}
        `}>
          {/* User Info */}
          {!collapsed && (
            <div className={`
              mb-3 p-3 rounded-xl
              ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'}
            `}>
              <p className={`
                text-[10px] font-medium uppercase tracking-wider
                ${isDark ? 'text-gray-500' : 'text-gray-400'}
              `}>
                Logged in as
              </p>
              <p className={`
                text-sm font-semibold capitalize mt-1 truncate
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                {displayName}
              </p>
              {user?.email && (
                <p className={`
                  text-xs truncate mt-0.5
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  {user.email}
                </p>
              )}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 relative
              ${isDark
                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }
            `}
          >
            <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg">
              <LogOut size={collapsed ? 22 : 20} />
            </span>
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;