import apiClient from './api-client';

// Types
export interface CreateCompanyRequest {
  name: string;
  code: string;
  taxNumber: string;
  address: string;
  phone: string;
  userId: number;
}

export interface UpdateCompanyRequest {
  name: string;
  code: string;
  taxNumber: string;
  address: string;
  phone: string;
}

export interface CompanyDto {
  id: number;
  name: string;
  code: string;
  taxNumber: string;
  address: string;
  phone: string;
  isActive: boolean;
  userName: string;
  branchNames?: string[];
  warehouseNames?: string[];
}

export interface CreateBranchRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
  userId: number;
}

export interface UpdateBranchRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
}

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

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string[];
  isSuccess?: boolean;
  isFail?: boolean;
  status?: number;
}

export class CompanyService {

  static async getCompanies(): Promise<ApiResponse<CompanyDto[]>> {
    
    try {
      const response = await apiClient.get('/api/Company');
      
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        
        return {
          data: response.data.data,
          isSuccess: !response.data.errorMessage || response.data.errorMessage.length === 0
        };
      } else if (Array.isArray(response.data)) {
        
        return {
          data: response.data,
          isSuccess: true
        };
      } else {
        
        return {
          data: [],
          isSuccess: false
        };
      }
    } catch (error) {
      
      throw error;
    }
  }

  static async createCompany(data: CreateCompanyRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/Company', data);
    return response.data;
  }

  static async updateCompany(id: number, data: UpdateCompanyRequest): Promise<ApiResponse<{ id: number }>> {
    
    try {
      const response = await apiClient.put(`/api/Company?id=${id}`, data);
      
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }

  static async deleteCompany(id: number): Promise<ApiResponse<{ id: number }>> {
    
    try {
      const response = await apiClient.delete(`/api/Company/${id}`);
      
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }

  static async getBranches(): Promise<ApiResponse<BranchDto[]>> {
    
    try {
      const response = await apiClient.get('/api/Branch');
      

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        
        return {
          data: response.data.data,
          isSuccess: !response.data.errorMessage || response.data.errorMessage.length === 0
        };
      } else if (Array.isArray(response.data)) {
        
        return {
          data: response.data,
          isSuccess: true
        };
      } else {
        
        return {
          data: [],
          isSuccess: false
        };
      }
    } catch (error) {
      
      throw error;
    }
  }

  static async getBranchById(id: number): Promise<ApiResponse<BranchDto>> {
    const response = await apiClient.get(`/api/Branch/${id}`);
    return response.data;
  }

  static async createBranch(data: CreateBranchRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/Branch', data);
    return response.data;
  }

  static async updateBranch(id: number, data: UpdateBranchRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/Branch/${id}`, data);
    return response.data;
  }

  static async getBranchesByCompany(companyId: number): Promise<ApiResponse<BranchDto[]>> {
    
    const allBranches = await this.getBranches();
    
    
    if (allBranches.data && Array.isArray(allBranches.data)) {
      const companies = await this.getCompanies();
      const selectedCompany = companies.data?.find(c => c.id === companyId);
      
      if (selectedCompany) {
        const companyBranches = allBranches.data.filter(branch => branch.companyName === selectedCompany.name);
        
        return {
          ...allBranches,
          data: companyBranches
        };
      }
      
      
      return {
        ...allBranches,
        data: []
      };
    }
    return allBranches;
  }

  static async getCompanyById(companyId: number): Promise<CompanyDto | null> {
    const allCompanies = await this.getCompanies();
    if (allCompanies.isSuccess && allCompanies.data) {
      return allCompanies.data.find(company => company.id === companyId) || null;
    }
    return null;
  }
}

export default CompanyService;
