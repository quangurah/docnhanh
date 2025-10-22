import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  full_name: string;
  role: 'Admin' | 'Writer' | 'View';
  disabled: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('access_token');
    if (token) {
      // Simulate API call to get user info
      fetchUserInfo(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      // In real implementation, this would call GET /api/v1/users/me
      // For now, we'll simulate with localStorage
      const userData = localStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call to POST /api/v1/auth/token
      // In real implementation, replace with actual API call to https://docnhanh.marketingservice.io:8502/api/v1/auth/token
      if (username && password) {
        // Mock different users for testing
        let mockUser: User;
        if (username === 'admin' || username === 'phantd') {
          mockUser = {
            username: 'phantd',
            full_name: 'Phan Tất Đức',
            role: 'Admin',
            disabled: false
          };
        } else if (username === 'writer' || username === 'lehien') {
          mockUser = {
            username: 'lehien',
            full_name: 'Lê Hiến',
            role: 'Writer',
            disabled: false
          };
        } else {
          mockUser = {
            username: username,
            full_name: 'Người dùng xem',
            role: 'View',
            disabled: false
          };
        }
        
        const mockToken = 'mock_jwt_token_' + Date.now();
        
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};