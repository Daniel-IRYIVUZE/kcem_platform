// context/AuthContext.tsx — EcoTrade Rwanda
// Tries the real FastAPI backend first; falls back to demo users if backend is unreachable.

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
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
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (code: string) => Promise<boolean>;
  updateUser: (data: Partial<User>) => void;
  isBackendOnline: boolean;
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
  hotel_profile?: { business_name: string };
  recycler_profile?: { company_name: string };
}): User {
  return {
    id: String(apiUser.id),
    name: apiUser.full_name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: mapRole(apiUser.role),
    verified: apiUser.is_verified,
    avatar: '/images/default-avatar.svg',
    twoFactorEnabled: false,
    businessName: apiUser.hotel_profile?.business_name,
    companyName: apiUser.recycler_profile?.company_name,
  };
}

// ─── Demo users (fallback when backend is offline) ───────────────────────────
const DEMO_USERS = [
  { id: '1', name: 'Admin User',           email: 'admin@ecotrade.rw',       password: 'admin123',    role: 'admin' as UserRole,      verified: true  },
  { id: '2', name: 'Mille Collines Hotel', email: 'hotel@millecollines.rw',  password: 'hotel123',    role: 'business' as UserRole,   verified: true  },
  { id: '3', name: 'GreenEnergy Recyclers',email: 'recycler@greenenergy.rw', password: 'recycler123', role: 'recycler' as UserRole,   verified: true  },
  { id: '4', name: 'Jean Pierre',          email: 'driver@ecotrade.rw',      password: 'driver123',   role: 'driver' as UserRole,     verified: true  },
  { id: '5', name: 'Marie Claire',         email: 'individual@ecotrade.rw',  password: 'user123',     role: 'individual' as UserRole, verified: true  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('ecotrade_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // Persist user helper
  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem('ecotrade_user', JSON.stringify(u));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', u.role);
    localStorage.setItem('userName', u.name);
    localStorage.setItem('userEmail', u.email);
    window.dispatchEvent(new Event('authChange'));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // ── Try real backend first ──────────────────────────────────────────
      const res = await authAPI.login(email, password);
      localStorage.setItem('ecotrade_token', res.access_token);
      setIsBackendOnline(true);
      const mappedRole = mapRole(res.user.role);
      persistUser(apiUserToUser(res.user));
      // Non-blocking: sync real data into localStorage dataStore
      syncFromAPI(mappedRole).catch(() => {});
    } catch (apiErr) {
      // ── Fall back to demo users ─────────────────────────────────────────
      const found = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (!found) {
        setLoading(false);
        // Rethrow original API error if backend responded (wrong credentials)
        // vs network error (use demo fallback message)
        const msg = (apiErr as Error).message;
        if (msg.includes('Incorrect') || msg.includes('401') || msg.includes('suspended')) {
          throw new Error(msg);
        }
        throw new Error('Invalid credentials');
      }
      const { password: _, ...safe } = found;
      setIsBackendOnline(false);
      persistUser({ ...safe, avatar: '/images/default-avatar.svg', twoFactorEnabled: false });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecotrade_user');
    localStorage.removeItem('ecotrade_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
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
    persistUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verify2FA, updateUser, isBackendOnline }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
