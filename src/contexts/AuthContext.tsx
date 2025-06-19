
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/game';
import { authDB } from '../database/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProgress: (progress: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const storedUser = authDB.getUserById(storedUserId);
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const loginUser = await authDB.loginUser(email, password);
      if (loginUser) {
        setUser(loginUser);
        setIsAuthenticated(true);
        localStorage.setItem('userId', loginUser.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const newUser = await authDB.registerUser(email, password);
      if (newUser) {
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('userId', newUser.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
  };

  const updateUserProgress = async (progress: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    const success = await authDB.updateUserProgress(user.id, progress);
    if (success) {
      const updatedUser = authDB.getUserById(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
    return success;
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUserProgress,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
