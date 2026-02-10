// components/layout/TopNav.tsx
import { useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface User {
  name: string;
  role: string;
  avatar: string;
}

interface TopNavProps {
  user: User;
}

const TopNav = ({ user }: TopNavProps) => {
  const [notifications] = useState([
    { id: 1, message: 'New offer received for your UCO listing', time: '2 min ago', read: false },
    { id: 2, message: 'Pickup scheduled for tomorrow', time: '1 hour ago', read: false },
    { id: 3, message: 'Payment confirmed - RWF 25,000', time: '3 hours ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo - visible on mobile when sidebar is collapsed */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/images/EcoTrade.png" alt="EcoTrade Rwanda" className="h-10" />
          <span className="text-lg font-bold text-gray-900">EcoTrade Rwanda</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-600 hover:text-gray-900"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                </div>
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-cyan-50' : ''}`}>
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t">
                  <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden lg:block">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 overflow-hidden ring-2 ring-cyan-100">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;