import apiClient from './api-client';

// Types
export interface CreateCategoryRequest {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
  userId: number;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
  userId: number;
  isActive: boolean;
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
  data?: T;
  errorMessage?: string | null;
}

// Category Service
export class CategoryService {
  // Categories
  static async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    try {
      const response = await apiClient.get('/api/Category');
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
        };
      } else if (Array.isArray(response.data)) {
        return {
          data: response.data,
        };
      } else {
        console.warn('⚠️ CategoryService.getCategories: Unexpected response format:', response.data);
        return {
          data: [],
 
        };
      }
    } catch (error) {
      console.error('❌ CategoryService.getCategories: API call failed:', error);
      throw error;
    }
  }

  static async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/Category', data);
    return response.data;
  }

  static async updateCategory(id: number, data: UpdateCategoryRequest): Promise<ApiResponse<{ id: number }>> {
    
    // Query parameter ile endpoint
    const response = await apiClient.put(`/api/Category?id=${id}`, data);
    return response.data;
  }

  static async deleteCategory(id: number): Promise<ApiResponse<{ id: number }>> {
    
    const response = await apiClient.delete(`/api/Category?id=${id}`);
    return response.data;
  }

  // Main Groups
  static async getMainGroups(): Promise<ApiResponse<MainGroupDto[]>> {
    try {
      const response = await apiClient.get('/api/MainGroup');
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data
        };
      } else if (Array.isArray(response.data)) {
        return {
          data: response.data
        };
      } else {
        console.warn('⚠️ CategoryService.getMainGroups: Unexpected response format:', response.data);
        return {
          data: []
        };
      }
    } catch (error) {
      console.error('❌ CategoryService.getMainGroups: API call failed:', error);
      throw error;
    }
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
    try {
      const response = await apiClient.get('/api/SubGroup');
      console.log('🔍 CategoryService.getSubGroups: Response.data keys:', Object.keys(response.data || {}));
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('🔍 CategoryService.getSubGroups: Found data.data format, sub groups count:', response.data.data.length);
        return {
          data: response.data.data
        };
      } else if (Array.isArray(response.data)) {
        console.log('🔍 CategoryService.getSubGroups: Found direct array format, sub groups count:', response.data.length);
        return {
          data: response.data,
        };
      } else {
        console.warn('⚠️ CategoryService.getSubGroups: Unexpected response format:', response.data);
        return {
          data: []
        };
      }
    } catch (error) {
      console.error('❌ CategoryService.getSubGroups: API call failed:', error);
      throw error;
    }
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
