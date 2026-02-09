// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  businessName: string | null;
  avatar: string;
}

interface AuthContextType {
  logout: () => void;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('kcem_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string, _password: string, role: string): User => {
    // Mock authentication - replace with actual API call
    // password parameter is for future API integration
    const mockUser: User = {
      id: 1,
      email,
      role,
      name: role === 'admin' ? 'System Admin' : 
             role === 'business' ? 'Kigali Hotel' :
             role === 'recycler' ? 'Green Recyclers Ltd' :
             role === 'driver' ? 'John Driver' : 'Jane Doe',
      businessName: role === 'business' ? 'Kigali Hotel' : null,
      avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(
        role === 'admin' ? 'Admin' : 
        role === 'business' ? 'Hotel' :
        role === 'recycler' ? 'Recycler' :
        role === 'driver' ? 'Driver' : 'User'
      ),
    };
    
    setUser(mockUser);
    localStorage.setItem('kcem_user', JSON.stringify(mockUser));
    
    // Also set individual items for navbar compatibility
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', mockUser.name);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('authChange'));
    
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kcem_user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('rememberMe');
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('authChange'));
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};