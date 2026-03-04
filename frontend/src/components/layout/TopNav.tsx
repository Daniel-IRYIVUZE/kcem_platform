// components/layout/TopNav.tsx
import { useState } from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import type { User } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopNavProps {
  user: User;
}

const TopNav = ({ user }: TopNavProps) => {
  const { isDark, toggleTheme } = useTheme();
  const [notifications] = useState([
    { id: 1, message: 'New offer received for your UCO listing', time: '2 min ago', read: false },
    { id: 2, message: 'Pickup scheduled for tomorrow', time: '1 hour ago', read: false },
    { id: 3, message: 'Payment confirmed - RWF 25,000', time: '3 hours ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-3 sm:py-4 transition-colors duration-300">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo - visible on mobile when sidebar is collapsed */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/images/EcoTrade.png" alt="EcoTrade Rwanda" className="h-10" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">EcoTrade Rwanda</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400" size={18} />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 text-gray-600 dark:text-yellow-700 hover:text-amber-500 transition-all duration-300 flex-shrink-0"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 cursor-pointer transition-colors ${!notif.read ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{notif.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => setShowNotifications(false)} className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden lg:block">
              <p className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 overflow-hidden ring-2 ring-cyan-100 dark:ring-cyan-900/50 flex items-center justify-center">
              <img 
                src={user.avatar || '/images/default-avatar.svg'} 
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg'; }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;