import apiClient from './api-client';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  refreshExpiresAtUtc: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    isActive: boolean;
  };
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdDate: string;
  roles: string[];
}

// Authentication Service
export class AuthService {
  // Login
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  // Register
  static async register(userData: RegisterRequest): Promise<{ message: string; userId: number }> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  // Refresh Token
  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // Change Password
  static async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  }

  // Logout
  static logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Sign-in sayfasına yönlendir
    window.location.href = '/sign-in';
  }

  // Get current user from token
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Check if user has specific role
  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  // Check if user is editor
  static isEditor(): boolean {
    return this.hasRole('Editor') || this.hasRole('Admin');
  }
}

export default AuthService;
