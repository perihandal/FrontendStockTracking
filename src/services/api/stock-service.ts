import apiClient from './api-client';

// Types - Backend'deki enum'lar ile uyumlu
export type StockCardType = 'NihaiUrun' | 'AraUrun' | 'Hammadde';
export type TransactionType = 'Giris' | 'Cikis' | 'Transfer';

// Stock Card Types
export interface CreateStockCardRequest {
  name: string;
  code: string;
  type: StockCardType;
  unit: string;
  tax: number;
  companyId?: number;
  userId: number;
  branchId?: number;
  mainGroupId?: number;
  subGroupId?: number;
  categoryId?: number;
  createDefaultBarcode?: boolean;
  defaultBarcodeType?: string;
}

export interface UpdateStockCardRequest {
  name: string;
  code: string;
  type: StockCardType;
  unit: string;
  tax: number;
  companyId?: number;
  branchId?: number;
  mainGroupId?: number;
  subGroupId?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface StockCardDto {
  id: number;
  name: string;
  code: string;
  type: StockCardType;
  unit: string;
  tax: number;
  createdDate: string;
  companyId: number;
  companyName: string;
  branchId: number;
  branchName: string;
  mainGroupId: number;
  mainGroupName: string;
  subGroupId?: number;
  subGroupName?: string;
  categoryId?: number;
  categoryName?: string;
  barcodes: string[];
}

// Stock Transaction Types
export interface CreateStockTransactionRequest {
  type: TransactionType;
  quantity: number;
  transactionDate: string;
  documentNumber?: string;
  description?: string;
  stockCardId: number;
  warehouseId?: number;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  userId?: number;
}

export interface UpdateStockTransactionRequest {
  type: TransactionType;
  quantity: number;
  transactionDate: string;
  documentNumber?: string;
  description?: string;
  stockCardId: number;
  warehouseId?: number;
  fromWarehouseId?: number;
  toWarehouseId?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Stock Service
export class StockService {
  // Stock Cards
  static async getStockCards(): Promise<ApiResponse<StockCardDto[]>> {
    const response = await apiClient.get<{data: StockCardDto[], errorMessage: string | null}>('/api/stockcard');
    return {
      success: true,
      data: response.data.data,
      message: 'Stock cards fetched successfully'
    };
  }

  static async getStockCardsPaged(pageNumber: number, pageSize: number): Promise<ApiResponse<StockCardDto[]>> {
    const response = await apiClient.get(`/api/stockcard/${pageNumber}/${pageSize}`);
    return response.data;
  }

  static async createStockCard(data: CreateStockCardRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/stockcard', data);
    return response.data;
  }

  static async updateStockCard(id: number, data: UpdateStockCardRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/stockcard/${id}`, data);
    return response.data;
  }

  static async deleteStockCard(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.delete(`/api/stockcard/${id}`);
    return response.data;
  }

  // Stock Transactions
  static async getStockTransactions(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/api/stocktransaction');
    return response.data;
  }

  static async getStockTransactionById(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/api/stocktransaction/${id}`);
    return response.data;
  }

  static async createStockTransaction(data: CreateStockTransactionRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post('/api/stocktransaction', data);
    return response.data;
  }

  static async updateStockTransaction(id: number, data: UpdateStockTransactionRequest): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.put(`/api/stocktransaction/${id}`, data);
    return response.data;
  }

  static async deleteStockTransaction(id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.delete(`/api/stocktransaction/${id}`);
    return response.data;
  }
}

export default StockService;
