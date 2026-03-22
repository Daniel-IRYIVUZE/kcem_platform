// context/AuthContext.tsx — EcoTrade Rwanda
// Backend-first auth with offline cache fallback.

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, usersAPI, hotelsAPI, recyclersAPI, driversAPI, API_BASE_URL } from '../services/api';
import { syncFromAPI } from '../utils/apiSync';
import { replayQueue, getQueueCount } from '../utils/offlineQueue';

export type UserRole = 'admin' | 'business' | 'recycler' | 'driver' | 'individual';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  phone?: string;
  twoFactorEnabled?: boolean;
  permissions?: string[];
  // Extra profile fields
  businessName?: string;
  companyName?: string;
  greenScore?: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  mustChangePassword: boolean;
  isOnline: boolean;
  pendingQueueCount: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (code: string) => Promise<boolean>;
  updateUser: (data: Partial<User>) => void;
  clearMustChangePassword: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Role mapping: backend "hotel" → frontend "business" ────────────────────
function mapRole(backendRole: string): UserRole {
  if (backendRole === 'hotel') return 'business';
  return backendRole as UserRole;
}

// ─── Convert API user to our User shape ──────────────────────────────────────
function apiUserToUser(apiUser: {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  is_email_verified?: boolean;
  avatar_url?: string;
  hotel_profile?: { business_name: string };
  recycler_profile?: { company_name: string };
  green_score?: { total_score: number };
}): User {
  return {
    id: String(apiUser.id),
    name: apiUser.full_name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: mapRole(apiUser.role),
    verified: apiUser.is_email_verified ?? apiUser.is_verified,
    avatar: apiUser.avatar_url || '/images/default-avatar.svg',
    twoFactorEnabled: false,
    businessName: apiUser.hotel_profile?.business_name,
    companyName: apiUser.recycler_profile?.company_name,
    greenScore: apiUser.green_score?.total_score,
  };
}

async function enrichUserWithRoleProfile(user: User): Promise<User> {
  // Skip the extra API round-trip when login/me response already embedded profile data
  if (user.role === 'business' && user.businessName) return user;
  if (user.role === 'recycler' && user.companyName) return user;
  if (user.role === 'driver' && user.name) return user;

  try {
    if (user.role === 'business') {
      const hotel = await hotelsAPI.me();
      return { ...user, businessName: hotel.hotel_name || user.businessName };
    }
    if (user.role === 'recycler') {
      const recycler = await recyclersAPI.me();
      return { ...user, companyName: recycler.company_name || user.companyName };
    }
    if (user.role === 'driver') {
      const driver = await driversAPI.me();
      return { ...user, name: driver.name || user.name };
    }
  } catch {
    // Keep base user if profile fetch fails
  }

  return user;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingQueueCount, setPendingQueueCount] = useState(() => getQueueCount());

  // ── Online / offline tracking ───────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Replay any queued offline actions
      const currentUser = localStorage.getItem('ecotrade_user');
      if (currentUser) {
        try {
          const { synced } = await replayQueue(API_BASE_URL);
          if (synced > 0) {
            setPendingQueueCount(getQueueCount());
            // Re-sync fresh data from backend after replaying queue
            const u: User = JSON.parse(currentUser);
            syncFromAPI(u.role).catch(() => {});
          }
        } catch { /* ignore replay errors */ }
      }
      setPendingQueueCount(getQueueCount());
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueChange = () => setPendingQueueCount(getQueueCount());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('ecotrade_queue_change', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('ecotrade_queue_change', handleQueueChange);
    };
  }, []);

  // Restore session on mount from localStorage and verify token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('ecotrade_token');
      const storedUser = localStorage.getItem('ecotrade_user');

      // No token = not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      // Optimistically restore user from cache while verifying token
      if (storedUser) {
        try {
          const cachedUser = JSON.parse(storedUser);
          setUser(cachedUser);
        } catch (_e) {
          console.error('Failed to parse cached user');
        }
      }

      if (!navigator.onLine) {
        // Offline: trust the cached session, skip /me verification
        setLoading(false);
        return;
      }

      // Online: verify token is still valid by calling /me endpoint
      try {
        const apiUser = await usersAPI.me();
        const freshUser = await enrichUserWithRoleProfile(apiUserToUser(apiUser));
        setUser(freshUser);
        // Update cache with fresh data
        localStorage.setItem('ecotrade_user', JSON.stringify(freshUser));
        // Sync data in the background — do NOT await so the dashboard shows immediately
        syncFromAPI(freshUser.role).catch(() => {});
      } catch (error) {
        if (!navigator.onLine) {
          // Network failed because we went offline — keep cached session
          setLoading(false);
          return;
        }
        // Token invalid or expired - clear session
        console.error('Session expired or invalid:', error);
        localStorage.removeItem('ecotrade_token');
        localStorage.removeItem('ecotrade_user');
        localStorage.removeItem('ecotrade_refresh_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for API-level auth expiry so UI logs out immediately.
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem('ecotrade_user');
      localStorage.removeItem('ecotrade_token');
      localStorage.removeItem('ecotrade_refresh_token');
      window.dispatchEvent(new Event('authChange'));
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Auto-refresh token before expiration (online only)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      // Skip silently when offline — cached session stays valid
      if (!navigator.onLine) return;

      usersAPI.me()
        .then(async (apiUser) => {
          const freshUser = await enrichUserWithRoleProfile(apiUserToUser(apiUser));
          setUser(freshUser);
          localStorage.setItem('ecotrade_user', JSON.stringify(freshUser));
        })
        .catch((error) => {
          // Only force logout for auth errors (401/403), not network failures
          const msg = (error as Error).message || '';
          const isAuthError = msg.includes('401') || msg.includes('403') || msg.includes('expired');
          if (isAuthError && navigator.onLine) {
            console.error('Token refresh failed (auth error):', error);
            logout();
          }
        });
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);

    // ── Offline login: restore cached session if email matches ──────────────
    if (!navigator.onLine) {
      const storedRaw = localStorage.getItem('ecotrade_user');
      const token = localStorage.getItem('ecotrade_token');
      if (storedRaw && token) {
        try {
          const cached: User = JSON.parse(storedRaw);
          if (cached.email.toLowerCase() === email.toLowerCase()) {
            setUser(cached);
            setLoading(false);
            window.dispatchEvent(new Event('authChange'));
            return; // success — user is in offline mode
          }
        } catch { /* fall through to error */ }
      }
      setLoading(false);
      throw new Error(
        'You are offline. Please connect to the internet to sign in for the first time, ' +
        'or use the same account that was previously logged in on this device.'
      );
    }

    // ── Online login: authenticate against backend ───────────────────────────
    try {
      const res = await authAPI.login(email, password);

      // Store token
      localStorage.setItem('ecotrade_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('ecotrade_refresh_token', res.refresh_token);
      }

      // Set user state
      const mappedUser = await enrichUserWithRoleProfile(apiUserToUser(res.user));
      setUser(mappedUser);

      // Flag first-login password change requirement
      if (res.must_change_password) {
        setMustChangePassword(true);
      }

      // Persist user data for quick restoration
      localStorage.setItem('ecotrade_user', JSON.stringify(mappedUser));

      // Sync backend data in the background — do NOT await so login is instant
      syncFromAPI(mappedUser.role).catch(() => {});

      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      const msg = (error as Error).message;
      console.error('Login error:', error);
      throw new Error(
        msg.includes('Incorrect') || msg.includes('401') || msg.includes('suspended')
          ? msg
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('ecotrade_user');
    localStorage.removeItem('ecotrade_token');
    localStorage.removeItem('ecotrade_refresh_token');
    window.dispatchEvent(new Event('authChange'));
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    // In production this would call POST /api/auth/verify-2fa
    return code.length === 6 && /^\d{6}$/.test(code);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('ecotrade_user', JSON.stringify(updated));
  };

  const clearMustChangePassword = () => setMustChangePassword(false);

  return (
    <AuthContext.Provider value={{ user, loading, mustChangePassword, isOnline, pendingQueueCount, login, logout, verify2FA, updateUser, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
