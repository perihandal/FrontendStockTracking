import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest, ChangePasswordRequest } from 'src/services/api';

import React, { useState, useEffect, useContext, createContext } from 'react';

import { AuthService } from 'src/services/api';

// Context Types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Decode JWT token to get user info (basic implementation)
        const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]));

        // Role bilgisini farklı formatlarda ara
        let userRoles: string[] = [];
        if (tokenPayload.role) {
          userRoles = Array.isArray(tokenPayload.role) ? tokenPayload.role : [tokenPayload.role];
        } else if (tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
          const roleClaim = tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          userRoles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        }

        const userData: User = {
          id: tokenPayload.sub,
          username: tokenPayload.username,
          fullName: tokenPayload.fullName,
          email: tokenPayload.email || '',
          isActive: true,
          createdDate: new Date().toISOString(),
          roles: userRoles
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(userData);
      return response.userId > 0;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  // Change password function
  const changePassword = async (passwordData: ChangePasswordRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthService.changePassword(passwordData);
      return response.message === 'Parola güncellendi.';
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Role checking functions
  const hasRole = (role: string): boolean => user?.roles?.includes(role) || false;

  const isAdmin = (): boolean => hasRole('Admin');

  const isEditor = (): boolean => hasRole('Editor') || hasRole('Admin');

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    changePassword,
    hasRole,
    isAdmin,
    isEditor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
