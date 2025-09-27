import apiClient from './api-client';
// Types
export interface CreateWarehouseRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  branchId: number;
  userId: number;
}

export interface UpdateWarehouseRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  branchId: number;
  userId: number;
}

export interface WarehouseDto {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  companyName: string;
  branchId: number;
  branchName: string;
  userFullName: string;
}

export interface WarehouseStockDto {
  warehouseId: number;
  warehouseName: string;
  stockCardId: number;
  stockCardName: string;
  stockCardCode: string;
  quantity: number;
  unit: string;
}


// API Response Types
export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string[];
  isSuccess?: boolean;
  isFail?: boolean;
  status?: number;
}

// Warehouse Service
export class WarehouseService {
  // Warehouses
  static async getWarehouses(): Promise<ApiResponse<WarehouseDto[]>> {
    console.log('🔍 WarehouseService.getWarehouses: Making API call to /api/Warehouse');
    try {
      const response = await apiClient.get('/api/Warehouse');
      console.log('✅ WarehouseService.getWarehouses: API call successful:', response);
      console.log('🔍 WarehouseService.getWarehouses: Full response object:', response);
      console.log('🔍 WarehouseService.getWarehouses: Response.data:', response.data);
      console.log('🔍 WarehouseService.getWarehouses: Response.data type:', typeof response.data);
      console.log('🔍 WarehouseService.getWarehouses: Response.data keys:', Object.keys(response.data || {}));
      
      // Backend'ten gelen response formatını kontrol et
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('🔍 WarehouseService.getWarehouses: Found data.data format, warehouses count:', response.data.data.length);
        return {
          data: response.data.data,
          isSuccess: !response.data.errorMessage || response.data.errorMessage.length === 0
        };
      } else if (Array.isArray(response.data)) {
        console.log('🔍 WarehouseService.getWarehouses: Found direct array format, warehouses count:', response.data.length);
        return {
          data: response.data,
          isSuccess: true
        };
      } else {
        console.warn('⚠️ WarehouseService.getWarehouses: Unexpected response format:', response.data);
        return {
          data: [],
          isSuccess: false
        };
      }
    } catch (error) {
      console.error('❌ WarehouseService.getWarehouses: API call failed:', error);
      throw error;
    }
  }

  static async getWarehousesByCompanyId(companyId: number): Promise<ApiResponse<WarehouseDto[]>> {
    const response = await apiClient.get<{data: WarehouseDto[], errorMessage: string | null}>('/api/Warehouse');
    if (response.data.data) {
      const filteredWarehouses = response.data.data.filter(warehouse => warehouse.companyId === companyId);
      return {
        data: filteredWarehouses,
        isSuccess: true
      };
    }
    return {
      data: [],
      isSuccess: true
    };
  }

  static async createWarehouse(data: CreateWarehouseRequest): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 WarehouseService.createWarehouse: Making API call to /api/Warehouse with data:', data);
    try {
      const response = await apiClient.post('/api/Warehouse', data);
      console.log('✅ WarehouseService.createWarehouse: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ WarehouseService.createWarehouse: API call failed:', error);
      throw error;
    }
  }

  static async updateWarehouse(id: number, data: UpdateWarehouseRequest): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 WarehouseService.updateWarehouse: Making API call to /api/Warehouse with id:', id);
    try {
      const response = await apiClient.put(`/api/Warehouse?id=${id}`, data);
      console.log('✅ WarehouseService.updateWarehouse: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ WarehouseService.updateWarehouse: API call failed:', error);
      throw error;
    }
  }

  static async deleteWarehouse(id: number): Promise<ApiResponse<{ id: number }>> {
    console.log('🔍 WarehouseService.deleteWarehouse: Making API call to /api/Warehouse with id:', id);
    try {
      const response = await apiClient.delete(`/api/Warehouse/${id}`);
      console.log('✅ WarehouseService.deleteWarehouse: API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('❌ WarehouseService.deleteWarehouse: API call failed:', error);
      throw error;
    }
  }

  // Warehouse Stock
  static async getWarehouseStocks(): Promise<ApiResponse<WarehouseStockDto[]>> {
    const response = await apiClient.get('/api/warehousestock');
    return response.data;
  }

  static async getWarehouseStockByWarehouseAndStockCard(
    warehouseId: number, 
    stockCardId: number
  ): Promise<ApiResponse<WarehouseStockDto>> {
    const response = await apiClient.get('/api/warehousestock/by-warehouse-stockcard', {
      params: { warehouseId, stockCardId }
    });
    return response.data;
  }

  // Helper methods
  static async getWarehouseStockSummary(warehouseId: number): Promise<ApiResponse<WarehouseStockDto[]>> {
    const allStocks = await this.getWarehouseStocks();
    if (allStocks.isSuccess && allStocks.data) {
      const warehouseStocks = allStocks.data.filter(stock => stock.warehouseId === warehouseId);
      return {
        data: warehouseStocks,
        isSuccess: true
      };
    }
    return allStocks;
  }

  static async getStockCardStockSummary(stockCardId: number): Promise<ApiResponse<WarehouseStockDto[]>> {
    const allStocks = await this.getWarehouseStocks();
    if (allStocks.isSuccess && allStocks.data) {
      const stockCardStocks = allStocks.data.filter(stock => stock.stockCardId === stockCardId);
      return {
        data: stockCardStocks,
        isSuccess: true
      };
    }
    return allStocks;
  }
}

export default WarehouseService;
