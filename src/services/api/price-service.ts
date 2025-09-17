import apiClient from './api-client';
import type { PriceDefinition, PriceHistoryDto } from 'src/sections/prices/prices.types';
import { PriceType, Currency } from 'src/sections/prices/prices.types';

export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string | null;
}

export interface CreatePriceDefinitionRequest {
  priceType: PriceType;
  price: number;
  currency: Currency;
  validFrom: string;
  validTo?: string;
  userId: number;
  stockCardId: number;
}

export interface UpdatePriceDefinitionRequest {
  priceType: PriceType;
  price: number;
  currency: Currency;
  validFrom: string;
  validTo?: string;
  userId: number;
}

export interface CreatePriceDefinitionResponse {
  id: number;
}

export class PriceService {
  // Price Definition endpoints
  static async getPriceDefinitions(): Promise<ApiResponse<PriceDefinition[]>> {
    console.log('🔄 PriceService.getPriceDefinitions - Fetching price definitions...');
    const response = await apiClient.get('/api/PriceDefinition');
    console.log('📋 Price definitions response:', response);
    return response.data;
  }

  static async getPriceDefinitionById(id: number): Promise<ApiResponse<PriceDefinition>> {
    console.log(`🔄 PriceService.getPriceDefinitionById - Fetching price definition ${id}...`);
    const response = await apiClient.get(`/api/PriceDefinition/${id}`);
    return response.data;
  }

  static async createPriceDefinition(data: CreatePriceDefinitionRequest): Promise<ApiResponse<CreatePriceDefinitionResponse>> {
    console.log('🔄 PriceService.createPriceDefinition - Creating price definition:', data);
    const response = await apiClient.post('/api/PriceDefinition', data);
    console.log('✅ Price definition created:', response);
    return response.data;
  }

  static async updatePriceDefinition(id: number, data: UpdatePriceDefinitionRequest): Promise<ApiResponse<{ id: number }>> {
    console.log(`🔄 PriceService.updatePriceDefinition - Updating price definition ${id}:`, data);
    const response = await apiClient.put(`/api/PriceDefinition/${id}`, data);
    console.log('✅ Price definition updated:', response);
    return response.data;
  }

  static async deletePriceDefinition(id: number): Promise<ApiResponse<{ id: number }>> {
    console.log(`🔄 PriceService.deletePriceDefinition - Deleting price definition ${id}...`);
    const response = await apiClient.delete(`/api/PriceDefinition/${id}`);
    console.log('✅ Price definition deleted:', response);
    return response.data;
  }

  // Price History endpoints
  static async getPriceHistory(): Promise<ApiResponse<PriceHistoryDto[]>> {
    console.log('🔄 PriceService.getPriceHistory - Fetching price history...');
    const response = await apiClient.get('/api/PriceHistory');
    console.log('📋 Price history response:', response);
    return response.data;
  }

  static async getPriceHistoryById(id: number): Promise<ApiResponse<PriceHistoryDto>> {
    console.log(`🔄 PriceService.getPriceHistoryById - Fetching price history ${id}...`);
    const response = await apiClient.get(`/api/PriceHistory/${id}`);
    return response.data;
  }
}

export default PriceService;
