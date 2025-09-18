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
  companyId: number; // Backend'de CompanyId olarak geliyor ama camelCase'e çevriliyor
  companyName: string;
  userFullName: string; // Backend'de UserFullName olarak geliyor
  warehouseNames: string[]; // Backend'de WarehouseNames olarak geliyor
  stockCardCodes: string[]; // Backend'de StockCardCodes olarak geliyor
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string[];
  isSuccess?: boolean;
  isFail?: boolean;
  status?: number;
}

// Company Service
export class CompanyService {
  // Companies
  static async getCompanies(): Promise<ApiResponse<CompanyDto[]>> {
    console.log('🔍 CompanyService.getCompanies: Making API call to /api/Company');
    try {
      const response = await apiClient.get('/api/Company');
      console.log('✅ CompanyService.getCompanies: API call successful:', response);
      console.log('🔍 CompanyService.getCompanies: Response data:', response.data);
      console.log('🔍 CompanyService.getCompanies: Response status:', response.status);
      console.log('🔍 CompanyService.getCompanies: Response.data type:', typeof response.data);
      console.log('🔍 CompanyService.getCompanies: Response.data keys:', Object.keys(response.data || {}));
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('🔍 CompanyService.getCompanies: Found data.data format, companies count:', response.data.data.length);
        return {
          data: response.data.data,
          isSuccess: !response.data.errorMessage || response.data.errorMessage.length === 0
        };
      } else if (Array.isArray(response.data)) {
        console.log('🔍 CompanyService.getCompanies: Found direct array format, companies count:', response.data.length);
        return {
          data: response.data,
          isSuccess: true
        };
      } else {
        console.warn('⚠️ CompanyService.getCompanies: Unexpected response format:', response.data);
        return {
          data: [],
          isSuccess: false
        };
      }
    } catch (error) {
      console.error('❌ CompanyService.getCompanies: API call failed:', error);
      console.error('❌ CompanyService.getCompanies: Error details:', {
        message: (error as any).message,
        response: (error as any).response,
        request: (error as any).request,
        code: (error as any).code
      });
      throw error;
    }
  }

  static async createCompany(data: CreateCompanyRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/Company', data);
    return response.data;
  }

  static async updateCompany(id: number, data: UpdateCompanyRequest): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 CompanyService.updateCompany: Making API call to /api/Company with id:', id);
    try {
      const response = await apiClient.put(`/api/Company?id=${id}`, data);
      console.log('✅ CompanyService.updateCompany: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ CompanyService.updateCompany: API call failed:', error);
      throw error;
    }
  }

  static async deleteCompany(id: number): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 CompanyService.deleteCompany: Making API call to /api/Company with id:', id);
    try {
      const response = await apiClient.delete(`/api/Company/${id}`);
      console.log('✅ CompanyService.deleteCompany: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ CompanyService.deleteCompany: API call failed:', error);
      throw error;
    }
  }

  // Branches
  static async getBranches(): Promise<ApiResponse<BranchDto[]>> {
    console.log('🔍 CompanyService.getBranches: Making API call to /api/Branch');
    try {
      const response = await apiClient.get('/api/Branch');
      console.log('✅ CompanyService.getBranches: API call successful:', response);
      console.log('🔍 CompanyService.getBranches: Response data:', response.data);
      console.log('🔍 CompanyService.getBranches: Response.data type:', typeof response.data);
      console.log('🔍 CompanyService.getBranches: Response.data keys:', Object.keys(response.data || {}));
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('🔍 CompanyService.getBranches: Found data.data format, branches count:', response.data.data.length);
        return {
          data: response.data.data,
          isSuccess: !response.data.errorMessage || response.data.errorMessage.length === 0
        };
      } else if (Array.isArray(response.data)) {
        console.log('🔍 CompanyService.getBranches: Found direct array format, branches count:', response.data.length);
        return {
          data: response.data,
          isSuccess: true
        };
      } else {
        console.warn('⚠️ CompanyService.getBranches: Unexpected response format:', response.data);
        return {
          data: [],
          isSuccess: false
        };
      }
    } catch (error) {
      console.error('❌ CompanyService.getBranches: API call failed:', error);
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

  // Helper methods
  static async getBranchesByCompany(companyId: number): Promise<ApiResponse<BranchDto[]>> {
    // Backend'de query parameter çalışmıyor, tüm şubeleri çekip filtrele
    console.log('🔍 Fetching all branches and filtering for company:', companyId);
    const allBranches = await this.getBranches();
    console.log('🔍 All branches received:', allBranches.data?.map(b => ({ id: b.id, name: b.name, companyId: b.companyId })));
    console.log('🔍 First branch from backend:', allBranches.data?.[0]);
    console.log('🔍 All branch keys:', Object.keys(allBranches.data?.[0] || {}));
    console.log('🔍 First branch full object:', JSON.stringify(allBranches.data?.[0], null, 2));
    console.log('🔍 Company ID values:', allBranches.data?.map(b => ({ 
      id: b.id, 
      name: b.name, 
      companyId: b.companyId,
      companyIdType: typeof b.companyId,
      allKeys: Object.keys(b)
    })));
    
    if (allBranches.data && Array.isArray(allBranches.data)) {
      // Geçici çözüm: companyId field'ı yok, companyName ile filtrele
      // Önce şirket adını bul
      const companies = await this.getCompanies();
      const selectedCompany = companies.data?.find(c => c.id === companyId);
      
      if (selectedCompany) {
        const companyBranches = allBranches.data.filter(branch => branch.companyName === selectedCompany.name);
        console.log('🔍 Filtered branches for company (by name):', companyBranches.map(b => ({ id: b.id, name: b.name, companyName: b.companyName })));
        return {
          ...allBranches,
          data: companyBranches
        };
      }
      
      console.log('🔍 Company not found, returning empty branches');
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
