import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest, ChangePasswordRequest } from 'src/services/api';

import React, { useState, useEffect, useContext, createContext } from 'react';

import { AuthService } from 'src/services/api';
import { UserService } from 'src/services/api';

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
        
        console.log('🔐 Auth check - token exists:', !!token);
        console.log('🔐 Auth check - user exists:', !!userStr);
        
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('🔐 Auth check - user set:', userData);
        } else {
          console.log('🔐 Auth check - no valid auth data found');
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
      console.log('🔐 Login attempt with credentials:', credentials);
      const response = await AuthService.login(credentials);
      
      console.log('🔐 Login response:', response);
      console.log('🔐 Login response keys:', Object.keys(response));
      
      if (response.accessToken) {
        console.log('🔐 Login successful, storing tokens');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Decode JWT token to get user info (basic implementation)
        const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]));
        
        console.log('🔐 JWT Token payload:', tokenPayload);
        console.log('🔐 JWT Token payload keys:', Object.keys(tokenPayload));

        // JWT token'dan user ID'yi al
        const userId = parseInt(tokenPayload.sub);
        console.log('🔐 User ID from token:', userId);

        // /users endpoint'inden kullanıcı bilgilerini çek
        console.log('🔐 Fetching user details from /users endpoint...');
        const users = await UserService.getUsers();
        console.log('🔐 All users from API:', users);
        
        const currentUser = users.find(u => u.id === userId);
        console.log('🔐 Current user found:', currentUser);

        if (!currentUser) {
          console.error('🔐 User not found in /users endpoint');
          return false;
        }

        // Role bilgisini farklı formatlarda ara
        let userRoles: string[] = [];
        if (tokenPayload.role) {
          userRoles = Array.isArray(tokenPayload.role) ? tokenPayload.role : [tokenPayload.role];
        } else if (tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
          const roleClaim = tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          userRoles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        }

        const userData: User = {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          email: currentUser.email,
          isActive: currentUser.isActive,
          createdDate: new Date().toISOString(),
          roles: userRoles
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('🔐 Login completed, user set:', userData);
        return true;
      }
      console.log('🔐 Login failed - no access token');
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
