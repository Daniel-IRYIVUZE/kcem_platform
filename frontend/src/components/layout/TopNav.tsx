// components/layout/TopNav.tsx — EcoTrade Rwanda
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Check, Trash2, X, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { getDashboardDisplayName } from '../../utils/userDisplayName';

interface TopNavProps { user: User; }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeColors: Record<string, string> = {
  bid: 'bg-cyan-500', collection: 'bg-blue-500', payment: 'bg-green-500',
  system: 'bg-purple-500', message: 'bg-indigo-500', alert: 'bg-red-500',
};

const TopNav = ({ user }: TopNavProps) => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (id: string, link?: string) => {
    markRead(id);
    if (link) { setShowNotif(false); navigate(link); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleDashPath: Record<string, string> = {
    admin: '/dashboard/admin', business: '/dashboard/business',
    recycler: '/dashboard/recycler', driver: '/dashboard/driver', individual: '/dashboard/individual',
  };
  const displayName = getDashboardDisplayName(user);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-3 sm:py-4 transition-colors duration-300 relative z-30">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 md:hidden shrink-0">
        </div>
        <div className="flex-1 max-w-2xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="search" placeholder="Search listings, users, routes..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 text-gray-600 dark:text-yellow-400 transition-all">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <div ref={notifRef} className="relative">
            <button onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[480px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    Notifications
                    {unreadCount > 0 && <span className="ml-1 text-xs font-normal text-cyan-600"> ({unreadCount} new)</span>}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-cyan-600 hover:underline flex items-center gap-1">
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <X size={15} />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-sm">No notifications yet</div>
                  ) : notifications.slice(0, 20).map(n => (
                    <div key={String(n.id)} onClick={() => handleNotifClick(String(n.id), n.link || '')}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${!(n.read || n.is_read) ? 'bg-cyan-50/60 dark:bg-cyan-900/10 hover:bg-cyan-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${typeColors[String(n.type || '')] || 'bg-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body || n.message || ''}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(String(n.created_at || n.time || new Date()))}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); remove(String(n.id)); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div ref={profileRef} className="relative">
            <button onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{displayName}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-cyan-600 overflow-hidden ring-2 ring-cyan-200 dark:ring-cyan-800 shrink-0 flex items-center justify-center">
                <img src={user.avatar || '/images/default-avatar.svg'} alt={displayName} className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg'; }} />
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowProfile(false); navigate(roleDashPath[user.role] || '/dashboard'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Settings size={15} /> Dashboard Settings
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
