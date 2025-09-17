import apiClient from './api-client';

export interface UserDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string | null;
}

export class UserService {
  static async getUsers(): Promise<UserDto[]> {
    const response = await apiClient.get('/users');
    return response.data;
  }

  static async getUserById(id: number): Promise<UserDto> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }
}

export default UserService;
