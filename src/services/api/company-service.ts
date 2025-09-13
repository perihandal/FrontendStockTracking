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
  userId: number;
  userName: string;
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
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Company Service
export class CompanyService {
  // Companies
  static async getCompanies(): Promise<ApiResponse<CompanyDto[]>> {
    const response = await apiClient.get('/api/Company');
    return response.data;
  }

  static async createCompany(data: CreateCompanyRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/Company', data);
    return response.data;
  }

  static async updateCompany(id: number, data: UpdateCompanyRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/Company/${id}`, data);
    return response.data;
  }

  // Branches
  static async getBranches(): Promise<ApiResponse<BranchDto[]>> {
    const response = await apiClient.get('/api/Branch');
    return response.data;
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
    if (allCompanies.success && allCompanies.data) {
      return allCompanies.data.find(company => company.id === companyId) || null;
    }
    return null;
  }
}

export default CompanyService;
