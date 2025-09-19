import apiClient from './api-client';

export interface UserDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles?: string[];
  companyId?: number;
  branchId?: number;
  companyName?: string;
  branchName?: string;
}

export interface UserUpdateDto {
  fullName: string;
  email: string;
  isActive: boolean;
  companyId?: number | null;
  branchId?: number | null;
  roles: string[];
}

export interface CompanyAssignDto {
  companyId: number;
  branchId?: number | null;
}

export interface RoleUpdateDto {
  userId: number;
  roleNames: string[];
}

export interface RoleAssignDto {
  userId: number;
  roleName: string;
}

export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string | null;
}

export class UserService {
  // 1. Tüm kullanıcıları getir
  static async getUsers(): Promise<UserDto[]> {
    const response = await apiClient.get('/users');
    return response.data;
  }

  // 2. Belirli bir kullanıcının tüm bilgilerini getir (şirket, branch, roller dahil)
  static async getUserById(id: number): Promise<UserDto> {
    console.log('🔍 UserService.getUserById: Making API call for user:', id);
    const response = await apiClient.get(`/users/${id}`);
    console.log('🔍 UserService.getUserById: Raw response:', response);
    console.log('🔍 UserService.getUserById: Response.data:', response.data);
    console.log('🔍 UserService.getUserById: Response.data type:', typeof response.data);
    
    // Backend response formatını kontrol et
    if (response.data && response.data.data) {
      console.log('🔍 UserService.getUserById: Found data.data format');
      return response.data.data;
    } else {
      console.log('🔍 UserService.getUserById: Using direct response.data format');
      return response.data;
    }
  }

  // 3. Kullanıcının genel bilgilerini güncelle
  static async updateUser(userId: number, userUpdate: UserUpdateDto): Promise<ApiResponse<UserDto>> {
    try {
      const response = await apiClient.put(`/users/${userId}`, userUpdate);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Kullanıcı güncellenirken hata oluştu'
      };
    }
  }

  // 4. Aktif/Pasif durumu değiştir
  static async toggleUserStatus(userId: number): Promise<ApiResponse<UserDto>> {
    try {
      const response = await apiClient.put(`/users/${userId}/toggle-status`);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Kullanıcı durumu güncellenirken hata oluştu'
      };
    }
  }

  // 5. Şirket ve Branch atama/güncelleme
  static async assignCompany(userId: number, companyAssign: CompanyAssignDto): Promise<ApiResponse<UserDto>> {
    try {
      const response = await apiClient.put(`/users/${userId}/assign-company`, companyAssign);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Şirket atama sırasında hata oluştu'
      };
    }
  }

  // 6. Şirketten çıkar
  static async removeCompany(userId: number): Promise<ApiResponse<UserDto>> {
    try {
      const response = await apiClient.put(`/users/${userId}/remove-company`);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Şirket kaldırma sırasında hata oluştu'
      };
    }
  }

  // 7. Rolleri güncelle
  static async updateUserRoles(userId: number, roleNames: string[]): Promise<ApiResponse<UserDto>> {
    try {
      const roleUpdate: RoleUpdateDto = { userId, roleNames };
      const response = await apiClient.put(`/roles/${userId}/roles`, roleUpdate);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Kullanıcı rolleri güncellenirken hata oluştu'
      };
    }
  }

  // 8. Tekil rol atama
  static async assignRole(userId: number, roleName: string): Promise<ApiResponse<UserDto>> {
    try {
      const roleAssign: RoleAssignDto = { userId, roleName };
      const response = await apiClient.post('/roles/assign', roleAssign);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Rol atama sırasında hata oluştu'
      };
    }
  }

  // 9. Rol kaldır
  static async removeRole(userId: number, roleName: string): Promise<ApiResponse<UserDto>> {
    try {
      const response = await apiClient.delete(`/roles/${userId}/roles/${roleName}`);
      return {
        data: response.data,
        errorMessage: null
      };
    } catch (error: any) {
      return {
        data: undefined,
        errorMessage: error.response?.data?.message || 'Rol kaldırma sırasında hata oluştu'
      };
    }
  }

  // 10. Tüm rolleri getir
  static async getAllRoles(): Promise<string[]> {
    try {
      const response = await apiClient.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Roller yüklenirken hata:', error);
      return ['Admin', 'Editor', 'User']; // Fallback
    }
  }
}

export default UserService;
