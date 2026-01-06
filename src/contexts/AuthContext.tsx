import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'vendor' | 'client' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: 'vendor' | 'client') => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: Record<string, User & { password: string }> = {
  'admin@marketflow.com': {
    id: '1',
    email: 'admin@marketflow.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123'
  },
  'vendor@example.com': {
    id: '2',
    email: 'vendor@example.com',
    name: 'Digital Agency',
    role: 'vendor',
    password: 'vendor123'
  },
  'client@example.com': {
    id: '3',
    email: 'client@example.com',
    name: 'John Client',
    role: 'client',
    password: 'client123'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('marketflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password && mockUser.role !== 'admin') {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem('marketflow_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: 'Invalid email or password' };
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password && mockUser.role === 'admin') {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem('marketflow_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: 'Invalid admin credentials' };
  };

  const signup = async (email: string, password: string, name: string, role: 'vendor' | 'client'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (mockUsers[email]) {
      setIsLoading(false);
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role
    };
    
    setUser(newUser);
    localStorage.setItem('marketflow_user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marketflow_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      adminLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
