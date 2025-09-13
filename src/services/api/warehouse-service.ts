import apiClient from './api-client';

// Types
export interface CreateWarehouseRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
  branchId: number;
  userId: number;
}

export interface UpdateWarehouseRequest {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
  branchId: number;
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
  userId: number;
  userName: string;
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
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Warehouse Service
export class WarehouseService {
  // Warehouses
  static async getWarehouses(): Promise<ApiResponse<WarehouseDto[]>> {
    const response = await apiClient.get<{data: WarehouseDto[], errorMessage: string | null}>('/api/warehouse');
    return {
      success: true,
      data: response.data.data,
      message: 'Warehouses fetched successfully'
    };
  }

  static async createWarehouse(data: CreateWarehouseRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/warehouse', data);
    return response.data;
  }

  static async updateWarehouse(id: number, data: UpdateWarehouseRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/warehouse/${id}`, data);
    return response.data;
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
    if (allStocks.success && allStocks.data) {
      const warehouseStocks = allStocks.data.filter(stock => stock.warehouseId === warehouseId);
      return {
        success: true,
        data: warehouseStocks
      };
    }
    return allStocks;
  }

  static async getStockCardStockSummary(stockCardId: number): Promise<ApiResponse<WarehouseStockDto[]>> {
    const allStocks = await this.getWarehouseStocks();
    if (allStocks.success && allStocks.data) {
      const stockCardStocks = allStocks.data.filter(stock => stock.stockCardId === stockCardId);
      return {
        success: true,
        data: stockCardStocks
      };
    }
    return allStocks;
  }
}

export default WarehouseService;
