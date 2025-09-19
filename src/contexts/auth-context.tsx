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
  // Helper functions
  isAdminUser: boolean;
  isEditorUser: boolean;
  isRegularUser: boolean;
  getCompanyId: () => number | null;
  getBranchId: () => number | null;
  canCreate: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canViewAll: () => boolean;
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

        // Login response'ından user bilgisini al (users endpoint'ine gitmeye gerek yok)
        console.log('🔐 Using user data from login response...');
        const currentUser = response.user;
        console.log('🔐 Current user from response:', currentUser);

        if (!currentUser) {
          console.error('🔐 User not found in login response');
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

  // Helper properties and functions
  const isAdminUser = hasRole('Admin');
  const isEditorUser = hasRole('Editor');
  const isRegularUser = hasRole('User');

  const getCompanyId = (): number | null => {
    if (!user) return null;
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.companyId ? parseInt(payload.companyId) : null;
    } catch {
      return null;
    }
  };

  const getBranchId = (): number | null => {
    if (!user) return null;
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.branchId ? parseInt(payload.branchId) : null;
    } catch {
      return null;
    }
  };

  // Permission functions based on API authorization table
  const canCreate = (): boolean => hasRole('Admin') || hasRole('Editor'); // User cannot create anything
  const canEdit = (): boolean => hasRole('Admin') || hasRole('Editor'); // User cannot edit anything  
  const canDelete = (): boolean => hasRole('Admin') || hasRole('Editor'); // User cannot delete anything (Admin can delete all, Editor can delete own company/branch items)
  const canViewAll = (): boolean => hasRole('Admin'); // Only Admin can view all data across all companies

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
    // Helper properties and functions
    isAdminUser,
    isEditorUser,
    isRegularUser,
    getCompanyId,
    getBranchId,
    canCreate,
    canEdit,
    canDelete,
    canViewAll,
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

// Alias for convenience
export const useAuthContext = useAuth;

export default AuthProvider;
