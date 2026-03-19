// context/AuthContext.tsx — EcoTrade Rwanda
// Backend-only authentication (no fallback users)

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, usersAPI, hotelsAPI, recyclersAPI, driversAPI } from '../services/api';
import { syncFromAPI } from '../utils/apiSync';

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

      // Verify token is still valid by calling /me endpoint
      try {
        const apiUser = await usersAPI.me();
        const freshUser = await enrichUserWithRoleProfile(apiUserToUser(apiUser));
        setUser(freshUser);
        // Update cache with fresh data
        localStorage.setItem('ecotrade_user', JSON.stringify(freshUser));
        
        // Sync data from backend when restoring session
        await syncFromAPI(freshUser.role);
      } catch (error) {
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

  // Auto-refresh token before expiration (optional but recommended)
  useEffect(() => {
    if (!user) return;

    // Refresh token every 50 minutes (tokens expire in 60 minutes)
    const refreshInterval = setInterval(() => {
      usersAPI.me()
        .then(async (apiUser) => {
          const freshUser = await enrichUserWithRoleProfile(apiUserToUser(apiUser));
          setUser(freshUser);
          localStorage.setItem('ecotrade_user', JSON.stringify(freshUser));
        })
        .catch((error) => {
          console.error('Token refresh failed:', error);
          // If refresh fails, log out
          logout();
        });
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
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
      
      // Sync all backend data to localStorage dataStore
      // This ensures dashboards have real data from backend
      await syncFromAPI(mappedUser.role);
      
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      const msg = (error as Error).message;
      console.error('Login error:', error);
      showToast(
        msg.includes('Incorrect') || msg.includes('401') || msg.includes('suspended')
          ? msg
          : 'Login failed. Please check your credentials.',
        'error'
      );
      setLoading(false);
      throw new Error(msg);
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
    <AuthContext.Provider value={{ user, loading, mustChangePassword, login, logout, verify2FA, updateUser, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
