import apiClient from './api-client';

// DTOs
export interface BranchDto {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  companyName: string;
  userFullName: string;
  warehouseNames: string[];
  stockCardCodes: string[];
}

// Request DTOs
export interface CreateBranchRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  userId: number;
}

export interface UpdateBranchRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  userId: number;
}

// Response DTOs
export interface CreateBranchResponse {
  id: number;
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string[];
  isSuccess?: boolean;
  isFail?: boolean;
  status?: number;
}

class BranchService {
  // Branches
  static async getBranches(): Promise<ApiResponse<BranchDto[]>> {
    console.log('🔍 BranchService.getBranches: Making API call to /api/Branch');
    try {
      const response = await apiClient.get('/api/Branch');
      console.log('✅ BranchService.getBranches: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BranchService.getBranches: API call failed:', error);
      throw error;
    }
  }

  static async getBranchById(id: number): Promise<ApiResponse<BranchDto>> {
    console.log('🔍 BranchService.getBranchById: Making API call to /api/Branch with id:', id);
    try {
      const response = await apiClient.get(`/api/Branch/${id}`);
      console.log('✅ BranchService.getBranchById: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BranchService.getBranchById: API call failed:', error);
      throw error;
    }
  }

  static async createBranch(data: CreateBranchRequest): Promise<ApiResponse<CreateBranchResponse>> {
    console.log('🔍 BranchService.createBranch: Making API call to /api/Branch with data:', data);
    try {
      const response = await apiClient.post('/api/Branch', data);
      console.log('✅ BranchService.createBranch: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BranchService.createBranch: API call failed:', error);
      throw error;
    }
  }

  static async updateBranch(id: number, data: UpdateBranchRequest): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 BranchService.updateBranch: Making API call to /api/Branch with id:', id);
    try {
      const response = await apiClient.put(`/api/Branch?id=${id}`, data);
      console.log('✅ BranchService.updateBranch: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BranchService.updateBranch: API call failed:', error);
      throw error;
    }
  }

  static async deleteBranch(id: number): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 BranchService.deleteBranch: Making API call to /api/Branch with id:', id);
    try {
      const response = await apiClient.delete(`/api/Branch/${id}`);
      console.log('✅ BranchService.deleteBranch: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BranchService.deleteBranch: API call failed:', error);
      throw error;
    }
  }
}

export default BranchService;
