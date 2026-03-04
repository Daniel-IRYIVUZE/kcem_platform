// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'business' | 'recycler' | 'driver' | 'individual';
  avatar?: string;
  verified: boolean;
  twoFactorEnabled?: boolean;
  permissions?: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (code: string) => Promise<boolean>;
  updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@ecotrade.rw',
    password: 'admin123',
    role: 'admin' as const,
    avatar: '/images/default-avatar.svg',
    verified: true,
    twoFactorEnabled: false
  },
  {
    id: '2',
    name: 'Mille Collines Hotel',
    email: 'hotel@millecollines.rw',
    password: 'hotel123',
    role: 'business' as const,
    avatar: '/images/default-avatar.svg',
    verified: true,
    twoFactorEnabled: false
  },
  {
    id: '3',
    name: 'GreenEnergy Recyclers',
    email: 'recycler@greenenergy.rw',
    password: 'recycler123',
    role: 'recycler' as const,
    avatar: '/images/default-avatar.svg',
    verified: true,
    twoFactorEnabled: false
  },
  {
    id: '4',
    name: 'Jean Pierre',
    email: 'driver@ecotrade.rw',
    password: 'driver123',
    role: 'driver' as const,
    avatar: '/images/default-avatar.svg',
    verified: true,
    twoFactorEnabled: false
  },
  {
    id: '5',
    name: 'Marie Claire',
    email: 'individual@ecotrade.rw',
    password: 'user123',
    role: 'individual' as const,
    avatar: '/images/default-avatar.svg',
    verified: true,
    twoFactorEnabled: false
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('ecotrade_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ecotrade_user', JSON.stringify(userWithoutPassword));
      // Sync with Navbar auth keys
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userWithoutPassword.role);
      localStorage.setItem('userName', userWithoutPassword.name);
      localStorage.setItem('userEmail', userWithoutPassword.email);
      window.dispatchEvent(new Event('authChange'));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecotrade_user');
    // Sync with Navbar auth keys
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('authChange'));
  };

  const verify2FA = async (code: string) => {
    // Simulate 2FA verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    return code === '123456'; // Demo: any 6-digit code works
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('ecotrade_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verify2FA, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};