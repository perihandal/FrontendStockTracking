import apiClient from './api-client';

// WarehouseStock types - Backend response ile uyumlu
export interface WarehouseStockDto {
  warehouseId: number;
  warehouseName: string;
  stockCardId: number;
  stockCardName: string;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
}

export interface CreateWarehouseStockRequest {
  warehouseId: number;
  stockCardId: number;
  quantity: number;
  reservedQuantity?: number;
  userId: number;
}

export interface UpdateWarehouseStockRequest {
  warehouseId: number;
  stockCardId: number;
  quantity: number;
  reservedQuantity?: number;
  userId: number;
}

export interface WarehouseStockQueryParams {
  warehouseId?: number;
  stockCardId?: number;
  warehouseCode?: string;
  stockCardCode?: string;
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  data: T;
  errorMessage?: string[] | null;
}

export class WarehouseStockService {
  private static readonly BASE_URL = '/api/WarehouseStock';

  /**
   * Tüm depo stoklarını getir
   */
  static async getWarehouseStocks(params?: WarehouseStockQueryParams): Promise<ApiResponse<WarehouseStockDto[]>> {
    try {
      console.log('🔍 WarehouseStockService: Fetching warehouse stocks with params:', params);
      
      const queryParams = new URLSearchParams();
      if (params?.warehouseId) queryParams.append('warehouseId', params.warehouseId.toString());
      if (params?.stockCardId) queryParams.append('stockCardId', params.stockCardId.toString());
      if (params?.warehouseCode) queryParams.append('warehouseCode', params.warehouseCode);
      if (params?.stockCardCode) queryParams.append('stockCardCode', params.stockCardCode);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = queryParams.toString() 
        ? `${this.BASE_URL}?${queryParams.toString()}`
        : this.BASE_URL;

      const response = await apiClient.get<ApiResponse<WarehouseStockDto[]>>(url);
      console.log('✅ WarehouseStockService: Warehouse stocks fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error fetching warehouse stocks:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stokları alınamadı');
    }
  }

  /**
   * Belirli depo ve stok kartına göre depo stoku getir
   */
  static async getWarehouseStockByWarehouseAndStockCard(
    warehouseId: number, 
    stockCardId: number
  ): Promise<ApiResponse<WarehouseStockDto>> {
    try {
      console.log('🔍 WarehouseStockService: Fetching warehouse stock by warehouse and stock card:', { warehouseId, stockCardId });
      
      const response = await apiClient.get<ApiResponse<WarehouseStockDto>>(
        `${this.BASE_URL}/by-warehouse-stockcard?warehouseId=${warehouseId}&stockCardId=${stockCardId}`
      );
      console.log('✅ WarehouseStockService: Warehouse stock fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error fetching warehouse stock:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stoku alınamadı');
    }
  }

  /**
   * Belirli ID'ye sahip depo stokunu getir
   */
  static async getWarehouseStockById(id: number): Promise<ApiResponse<WarehouseStockDto>> {
    try {
      console.log('🔍 WarehouseStockService: Fetching warehouse stock by id:', id);
      
      const response = await apiClient.get<ApiResponse<WarehouseStockDto>>(`${this.BASE_URL}/${id}`);
      console.log('✅ WarehouseStockService: Warehouse stock fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error fetching warehouse stock:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stoku alınamadı');
    }
  }

  /**
   * Yeni depo stoku oluştur
   */
  static async createWarehouseStock(data: CreateWarehouseStockRequest): Promise<ApiResponse<WarehouseStockDto>> {
    try {
      console.log('🔍 WarehouseStockService: Creating warehouse stock with data:', data);
      
      const response = await apiClient.post<ApiResponse<WarehouseStockDto>>(this.BASE_URL, data);
      console.log('✅ WarehouseStockService: Warehouse stock created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error creating warehouse stock:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stoku oluşturulamadı');
    }
  }

  /**
   * Depo stokunu güncelle
   */
  static async updateWarehouseStock(id: number, data: UpdateWarehouseStockRequest): Promise<ApiResponse<WarehouseStockDto>> {
    try {
      console.log('🔍 WarehouseStockService: Updating warehouse stock with id:', id, 'data:', data);
      
      const response = await apiClient.put<ApiResponse<WarehouseStockDto>>(`${this.BASE_URL}/${id}`, data);
      console.log('✅ WarehouseStockService: Warehouse stock updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error updating warehouse stock:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stoku güncellenemedi');
    }
  }

  /**
   * Depo stokunu sil
   */
  static async deleteWarehouseStock(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('🔍 WarehouseStockService: Deleting warehouse stock with id:', id);
      
      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_URL}/${id}`);
      console.log('✅ WarehouseStockService: Warehouse stock deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error deleting warehouse stock:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stoku silinemedi');
    }
  }

  /**
   * Belirli depoya ait tüm stokları getir
   */
  static async getWarehouseStocksByWarehouse(warehouseId: number): Promise<ApiResponse<WarehouseStockDto[]>> {
    try {
      console.log('🔍 WarehouseStockService: Fetching warehouse stocks by warehouse id:', warehouseId);
      
      const response = await apiClient.get<ApiResponse<WarehouseStockDto[]>>(
        `${this.BASE_URL}/by-warehouse/${warehouseId}`
      );
      console.log('✅ WarehouseStockService: Warehouse stocks by warehouse fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error fetching warehouse stocks by warehouse:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stokları alınamadı');
    }
  }

  /**
   * Belirli stok kartına ait tüm depo stoklarını getir
   */
  static async getWarehouseStocksByStockCard(stockCardId: number): Promise<ApiResponse<WarehouseStockDto[]>> {
    try {
      console.log('🔍 WarehouseStockService: Fetching warehouse stocks by stock card id:', stockCardId);
      
      const response = await apiClient.get<ApiResponse<WarehouseStockDto[]>>(
        `${this.BASE_URL}/by-stockcard/${stockCardId}`
      );
      console.log('✅ WarehouseStockService: Warehouse stocks by stock card fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ WarehouseStockService: Error fetching warehouse stocks by stock card:', error);
      throw new Error(error.response?.data?.errorMessage?.[0] || 'Depo stokları alınamadı');
    }
  }
}