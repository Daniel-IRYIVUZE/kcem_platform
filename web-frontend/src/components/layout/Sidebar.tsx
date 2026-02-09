// components/layout/Sidebar.tsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Package, Truck, Settings, 
  BarChart3, DollarSign, Calendar, Map,
  FileText, ShoppingCart, Recycle, Leaf,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  userRole: 'admin' | 'business' | 'recycler' | 'driver' | 'individual';
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const roleConfigs = {
    admin: {
      navItems: [
        { path: '/dashboard/admin/overview', label: 'Platform Overview', icon: <Home size={20} /> },
        { path: '/dashboard/admin/users', label: 'User Management', icon: <Users size={20} /> },
        { path: '/dashboard/admin/listings', label: 'Content Moderation', icon: <Package size={20} /> },
        { path: '/dashboard/admin/financial', label: 'Financial Oversight', icon: <DollarSign size={20} /> },
        { path: '/dashboard/admin/analytics', label: 'Analytics & Reports', icon: <BarChart3 size={20} /> },
        { path: '/dashboard/admin/settings', label: 'System Configuration', icon: <Settings size={20} /> },
      ]
    },
    business: {
      navItems: [
        { path: '/dashboard/business/overview', label: 'Overview', icon: <Home size={20} /> },
        { path: '/dashboard/business/listings', label: 'Waste Listings', icon: <Package size={20} /> },
        { path: '/dashboard/business/marketplace', label: 'Marketplace', icon: <ShoppingCart size={20} /> },
        { path: '/dashboard/business/financial', label: 'Financial', icon: <DollarSign size={20} /> },
        { path: '/dashboard/business/schedule', label: 'Schedule & Pickups', icon: <Calendar size={20} /> },
        { path: '/dashboard/business/greenscore', label: 'Green Score', icon: <BarChart3 size={20} /> },
        { path: '/dashboard/business/reports', label: 'Reports', icon: <FileText size={20} /> },
      ]
    },
    recycler: {
      navItems: [
        { path: '/dashboard/recycler/overview', label: 'Overview', icon: <Home size={20} /> },
        { path: '/dashboard/recycler/marketplace', label: 'Marketplace', icon: <ShoppingCart size={20} /> },
        { path: '/dashboard/recycler/logistics', label: 'Logistics Management', icon: <Truck size={20} /> },
        { path: '/dashboard/recycler/inventory', label: 'Inventory', icon: <Package size={20} /> },
        { path: '/dashboard/recycler/financial', label: 'Financial', icon: <DollarSign size={20} /> },
        { path: '/dashboard/recycler/suppliers', label: 'Supplier Network', icon: <Users size={20} /> },
        { path: '/dashboard/recycler/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
      ]
    },
    driver: {
      navItems: [
        { path: '/dashboard/driver/schedule', label: "Today's Schedule", icon: <Calendar size={20} /> },
        { path: '/dashboard/driver/routes', label: 'Assigned Routes', icon: <Map size={20} /> },
        { path: '/dashboard/driver/collections', label: 'Collections', icon: <Package size={20} /> },
        { path: '/dashboard/driver/earnings', label: 'Earnings', icon: <DollarSign size={20} /> },
        { path: '/dashboard/driver/vehicle', label: 'Vehicle & Equipment', icon: <Truck size={20} /> },
        { path: '/dashboard/driver/offline', label: 'Offline Mode', icon: <Settings size={20} /> },
      ]
    },
    individual: {
      navItems: [
        { path: '/dashboard/individual/overview', label: 'Overview', icon: <Home size={20} /> },
        { path: '/dashboard/individual/marketplace', label: 'Marketplace', icon: <ShoppingCart size={20} /> },
        { path: '/dashboard/individual/impact', label: 'My Impact', icon: <Recycle size={20} /> },
        { path: '/dashboard/individual/orders', label: 'Orders', icon: <Package size={20} /> },
        { path: '/dashboard/individual/financial', label: 'Financial', icon: <DollarSign size={20} /> },
        { path: '/dashboard/individual/settings', label: 'Settings', icon: <Settings size={20} /> },
      ]
    }
  };

  const config = roleConfigs[userRole] || roleConfigs.individual;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-600 p-2 rounded-lg">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold">KCEM</span>
          </div>
        ) : (
          <div className="bg-cyan-600 p-2 rounded-lg mx-auto">
            <Leaf className="text-white" size={24} />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Home Button */}
        <NavLink
          to="/"
          className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-300 border-b border-gray-800 mb-2 pb-3"
        >
          <Home size={20} />
          {!collapsed && <span>Home</span>}
        </NavLink>
        
        {config.navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium capitalize">{userRole}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 w-full"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;