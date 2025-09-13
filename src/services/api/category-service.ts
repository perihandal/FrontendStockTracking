import apiClient from './api-client';

// Types
export interface CreateCategoryRequest {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
  userId: number;
}

export interface UpdateCategoryRequest {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
}

export interface CategoryDto {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  userId: number;
  userName: string;
  createDate: string;
}

export interface CreateMainGroupRequest {
  code: string;
  name: string;
  userId: number;
}

export interface UpdateMainGroupRequest {
  code: string;
  name: string;
}

export interface MainGroupDto {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  userId: number;
  userName: string;
}

export interface CreateSubGroupRequest {
  code: string;
  name: string;
  mainGroupId: number;
  userId: number;
}

export interface UpdateSubGroupRequest {
  code: string;
  name: string;
  mainGroupId: number;
}

export interface SubGroupDto {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  mainGroupId: number;
  mainGroupName: string;
  userId: number;
  userName: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Category Service
export class CategoryService {
  // Categories
  static async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    const response = await apiClient.get('/api/Category');
    return response.data;
  }

  static async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/Category', data);
    return response.data;
  }

  static async updateCategory(id: number, data: UpdateCategoryRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/Category/${id}`, data);
    return response.data;
  }

  // Main Groups
  static async getMainGroups(): Promise<ApiResponse<MainGroupDto[]>> {
    const response = await apiClient.get('/api/MainGroup');
    return response.data;
  }

  static async getMainGroupById(id: number): Promise<ApiResponse<MainGroupDto>> {
    const response = await apiClient.get(`/api/MainGroup/${id}`);
    return response.data;
  }

  static async createMainGroup(data: CreateMainGroupRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/MainGroup', data);
    return response.data;
  }

  static async updateMainGroup(id: number, data: UpdateMainGroupRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/MainGroup/${id}`, data);
    return response.data;
  }

  static async deleteMainGroup(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.delete(`/api/MainGroup/${id}`);
    return response.data;
  }

  // Sub Groups
  static async getSubGroups(): Promise<ApiResponse<SubGroupDto[]>> {
    const response = await apiClient.get('/api/SubGroup');
    return response.data;
  }

  static async getSubGroupById(id: number): Promise<ApiResponse<SubGroupDto>> {
    const response = await apiClient.get(`/api/SubGroup/${id}`);
    return response.data;
  }

  static async createSubGroup(data: CreateSubGroupRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/SubGroup', data);
    return response.data;
  }

  static async updateSubGroup(id: number, data: UpdateSubGroupRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/SubGroup/${id}`, data);
    return response.data;
  }

  static async deleteSubGroup(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.delete(`/api/SubGroup/${id}`);
    return response.data;
  }

  // Helper methods
  static async getSubGroupsByMainGroup(mainGroupId: number): Promise<ApiResponse<SubGroupDto[]>> {
    console.log('🔍 Fetching all sub groups and filtering for main group:', mainGroupId);
    const allSubGroups = await this.getSubGroups();
    console.log('🔍 All sub groups received:', allSubGroups.data?.map(sg => ({ id: sg.id, name: sg.name, mainGroupId: sg.mainGroupId })));
    console.log('🔍 First sub group from backend:', allSubGroups.data?.[0]);
    console.log('🔍 First sub group full object:', JSON.stringify(allSubGroups.data?.[0], null, 2));
    
    if (allSubGroups.data && Array.isArray(allSubGroups.data)) {
      // Geçici çözüm: mainGroupId field'ı yoksa, mainGroupName ile filtrele
      // Önce main group adını bul
      const mainGroups = await this.getMainGroups();
      const selectedMainGroup = mainGroups.data?.find(mg => mg.id === mainGroupId);
      
      if (selectedMainGroup) {
        const filteredSubGroups = allSubGroups.data.filter(subGroup => 
          subGroup.mainGroupId === mainGroupId || subGroup.mainGroupName === selectedMainGroup.name
        );
        console.log('🔍 Filtered sub groups for main group:', filteredSubGroups.map(sg => ({ id: sg.id, name: sg.name, mainGroupId: sg.mainGroupId, mainGroupName: sg.mainGroupName })));
        return {
          ...allSubGroups,
          data: filteredSubGroups
        };
      }
      
      console.log('🔍 Main group not found, returning empty sub groups');
      return {
        ...allSubGroups,
        data: []
      };
    }
    return allSubGroups;
  }
}

export default CategoryService;
