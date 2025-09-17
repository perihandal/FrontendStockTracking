import apiClient from './api-client';

// Barkod türleri enum'u
export enum BarcodeType {
  EAN13 = 1,
  UPC_A = 2,
  QRCode = 3,
  Code128 = 4,
  EAN8 = 5,
  ITF14 = 6,
  ISBN = 7,
  DataMatrix = 8
}

// Barkod türleri için açıklamalar
export const BarcodeTypeLabels: Record<BarcodeType, string> = {
  [BarcodeType.EAN13]: 'EAN-13 (13 Haneli)',
  [BarcodeType.UPC_A]: 'UPC-A (12 Haneli)',
  [BarcodeType.QRCode]: 'QR Code',
  [BarcodeType.Code128]: 'Code 128',
  [BarcodeType.EAN8]: 'EAN-8 (8 Haneli)',
  [BarcodeType.ITF14]: 'ITF-14 (14 Haneli)',
  [BarcodeType.ISBN]: 'ISBN-13',
  [BarcodeType.DataMatrix]: 'Data Matrix'
};

// DTOs
export interface BarcodeCardDto {
  id: number;
  barcodeCode: string;
  barcodeType: BarcodeType;
  isDefault: boolean;
  stockCardId: number;
  stockCardName?: string;
  userId?: number;
  createDate: string;
  branchId: number;
  companyId: number;
}

// Request DTOs
export interface CreateBarcodeCardRequest {
  barcodeType: BarcodeType;
  isDefault: boolean;
  stockCardId: number;
  userId?: number;
  branchId: number;
  companyId: number;
}

export interface UpdateBarcodeCardRequest {
  isDefault: boolean;
  userId?: number;
  branchId: number;
}

export interface CreateBarcodeCardResponse {
  id: number;
  barcodeCode: string;
}

// API Response tipi
export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  errorMessage?: string[];
  errors?: string[];
}

class BarcodeService {
  private static readonly BASE_URL = '/api/BarcodeCard';

  // Tüm barkodları getir
  static async getBarcodes(): Promise<ApiResponse<BarcodeCardDto[]>> {
    try {
      console.log('🔍 BarcodeService: Fetching all barcodes');
      const response = await apiClient.get<ApiResponse<BarcodeCardDto[]>>('/api/BarcodeCard');
      console.log('📊 BarcodeService: Get barcodes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error fetching barcodes:', error);
      throw error;
    }
  }

  // ID'ye göre barkod getir
  static async getBarcodeById(id: number): Promise<ApiResponse<BarcodeCardDto>> {
    try {
      console.log('🔍 BarcodeService: Fetching barcode by ID:', id);
      const response = await apiClient.get<ApiResponse<BarcodeCardDto>>(`/api/BarcodeCard/${id}`);
      console.log('📊 BarcodeService: Get barcode by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error fetching barcode by ID:', error);
      throw error;
    }
  }

  // Stok kartına göre barkodları getir
  static async getBarcodesByStockCardId(stockCardId: number): Promise<ApiResponse<BarcodeCardDto[]>> {
    try {
      console.log('🔍 BarcodeService: Fetching barcodes by stock card ID:', stockCardId);
      const response = await apiClient.get<ApiResponse<BarcodeCardDto[]>>(`/api/BarcodeCard/by-stockcard/${stockCardId}`);
      console.log('📊 BarcodeService: Get barcodes by stock card ID response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error fetching barcodes by stock card ID:', error);
      throw error;
    }
  }

  // Yeni barkod oluştur
  static async createBarcode(request: CreateBarcodeCardRequest): Promise<ApiResponse<CreateBarcodeCardResponse>> {
    try {
      console.log('🔍 BarcodeService: Creating barcode:', request);
      const response = await apiClient.post<ApiResponse<CreateBarcodeCardResponse>>('/api/BarcodeCard', request);
      console.log('📊 BarcodeService: Create barcode response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error creating barcode:', error);
      throw error;
    }
  }

  // Barkod güncelle
  static async updateBarcode(id: number, request: UpdateBarcodeCardRequest): Promise<ApiResponse<void>> {
    try {
      console.log('🔍 BarcodeService: Updating barcode:', id, request);
      const response = await apiClient.put<ApiResponse<void>>(`/api/BarcodeCard/${id}`, request);
      console.log('📊 BarcodeService: Update barcode response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error updating barcode:', error);
      throw error;
    }
  }

  // Barkod sil
  static async deleteBarcode(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('🔍 BarcodeService: Deleting barcode:', id);
      const response = await apiClient.delete<ApiResponse<void>>(`/api/BarcodeCard/${id}`);
      console.log('📊 BarcodeService: Delete barcode response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error deleting barcode:', error);
      throw error;
    }
  }

  // Barkodu varsayılan yap
  static async setAsDefault(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('🔍 BarcodeService: Setting barcode as default:', id);
      const response = await apiClient.put<ApiResponse<void>>(`/api/BarcodeCard/${id}/set-default`);
      console.log('📊 BarcodeService: Set as default response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error setting barcode as default:', error);
      throw error;
    }
  }

  // Barkod doğrula
  static async validateBarcode(barcodeCode: string, barcodeType: BarcodeType): Promise<ApiResponse<void>> {
    try {
      console.log('🔍 BarcodeService: Validating barcode:', barcodeCode, barcodeType);
      const response = await apiClient.get<ApiResponse<void>>('/api/BarcodeCard/validate', {
        params: { barcodeCode, barcodeType }
      });
      console.log('📊 BarcodeService: Validate barcode response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarcodeService: Error validating barcode:', error);
      throw error;
    }
  }

  // Barkod türüne göre açıklama getir
  static getBarcodeTypeLabel(type: BarcodeType): string {
    return BarcodeTypeLabels[type] || 'Bilinmeyen Tip';
  }

  // Barkod türüne göre örnek format getir
  static getBarcodeTypeExample(type: BarcodeType): string {
    const examples: Record<BarcodeType, string> = {
      [BarcodeType.EAN13]: '1234567890123',
      [BarcodeType.UPC_A]: '123456789012',
      [BarcodeType.QRCode]: '{"stockId":123,"companyId":1}',
      [BarcodeType.Code128]: 'C0001S00000123',
      [BarcodeType.EAN8]: '12345678',
      [BarcodeType.ITF14]: '01234567890123',
      [BarcodeType.ISBN]: '9781234567890',
      [BarcodeType.DataMatrix]: 'DM0001S00000123'
    };
    return examples[type] || '';
  }

  // Barkod türüne göre maksimum uzunluk getir
  static getBarcodeTypeMaxLength(type: BarcodeType): number {
    const maxLengths: Record<BarcodeType, number> = {
      [BarcodeType.EAN13]: 13,
      [BarcodeType.UPC_A]: 12,
      [BarcodeType.QRCode]: 1000, // QR Code değişken uzunluk
      [BarcodeType.Code128]: 50,  // Code128 değişken uzunluk
      [BarcodeType.EAN8]: 8,
      [BarcodeType.ITF14]: 14,
      [BarcodeType.ISBN]: 13,
      [BarcodeType.DataMatrix]: 100 // DataMatrix değişken uzunluk
    };
    return maxLengths[type] || 50;
  }
}

export default BarcodeService;
