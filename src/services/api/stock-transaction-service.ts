import { mapTransactionTypeToEnum, mapEnumToTransactionType } from 'src/utils/stock-card-utils';

import apiClient from './api-client';

// TransactionType enum mapping
export type TransactionType = 'Giris' | 'Cikis' | 'Transfer';

// StockTransaction DTO from backend (type comes as integer from backend)
export interface StockTransactionDto {
  id: number;
  type: number; // Integer enum from backend
  quantity: number;
  transactionDate: string;
  documentNumber?: string;
  description?: string;
  stockCardId: number;
  stockCardName: string;
  warehouseId?: number;
  warehouseName?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  userId?: number;
  userFullName?: string;
}

// Create StockTransaction Request
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

// Update StockTransaction Request
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
  userId?: number;
}

// Create StockTransaction Response
export interface CreateStockTransactionResponse {
  id: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class StockTransactionService {
  private baseUrl = '/api/stocktransaction';

  // Get all stock transactions
  async getStockTransactions(): Promise<ApiResponse<StockTransactionDto[]>> {
    console.log('🔍 Fetching stock transactions from:', this.baseUrl);
    const response = await apiClient.get<{data: StockTransactionDto[], errorMessage: string | null}>(this.baseUrl);
    console.log('✅ Stock transactions API result:', response.data);
    console.log('✅ Stock transactions data:', response.data.data);
    
    // Backend'den {data: [...], errorMessage: null} yapısında geliyor
    return {
      success: true,
      data: response.data.data,
      message: 'Stock transactions fetched successfully'
    };
  }

  // Get stock transaction by ID
  async getStockTransactionById(id: number): Promise<ApiResponse<StockTransactionDto>> {
    console.log('🔍 Fetching stock transaction by ID:', id);
    const response = await apiClient.get<StockTransactionDto>(`${this.baseUrl}/${id}`);
    console.log('✅ Stock transaction API result:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Stock transaction fetched successfully'
    };
  }

  // Create new stock transaction
  async createStockTransaction(data: CreateStockTransactionRequest): Promise<ApiResponse<CreateStockTransactionResponse>> {
    console.log('🔍 Creating stock transaction with data:', JSON.stringify(data, null, 2));
    
    // Convert string TransactionType to integer enum for backend
    const backendData = {
      ...data,
      type: mapTransactionTypeToEnum(data.type) as any
    };
    
    console.log('🔍 Backend data with converted type:', JSON.stringify(backendData, null, 2));
    const response = await apiClient.post<CreateStockTransactionResponse>(this.baseUrl, backendData);
    console.log('✅ Stock transaction created:', response.data);
    
    const result = {
      success: true,
      data: response.data,
      message: 'Stock transaction created successfully'
    };
    console.log('🔍 Service returning:', result);
    return result;
  }

  // Update stock transaction
  async updateStockTransaction(id: number, data: UpdateStockTransactionRequest): Promise<ApiResponse<void>> {
    console.log('🔍 Updating stock transaction:', id, JSON.stringify(data, null, 2));
    
    // Convert string TransactionType to integer enum for backend
    const backendData = {
      ...data,
      type: mapTransactionTypeToEnum(data.type) as any
    };
    
    console.log('🔍 Backend data with converted type:', JSON.stringify(backendData, null, 2));
    const response = await apiClient.put<void>(`${this.baseUrl}/${id}`, backendData);
    console.log('✅ Stock transaction updated:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Stock transaction updated successfully'
    };
  }

  // Delete stock transaction
  async deleteStockTransaction(id: number): Promise<ApiResponse<void>> {
    console.log('🔍 Deleting stock transaction:', id);
    const response = await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    console.log('✅ Stock transaction deleted:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Stock transaction deleted successfully'
    };
  }
}

// Create instance
const stockTransactionService = new StockTransactionService();
export default stockTransactionService;
