import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import type { StockTransactionDto } from './stock-transaction-service';

// Rapor Filtreleme Seçenekleri
export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  companyId?: number;
  warehouseId?: number;
  stockCardId?: number;
  transactionType?: 'Giris' | 'Cikis' | 'Transfer';
}

// Excel Rapor Servisi
export class ReportService {
  // Stok hareketleri Excel raporu oluştur
  static generateStockTransactionsReport(
    transactions: StockTransactionDto[], 
    filterOptions?: ReportFilterOptions
  ): void {
    try {
      // Rapor başlığı
      const reportTitle = 'Stok Hareketleri Raporu';
      const generatedDate = new Date().toLocaleDateString('tr-TR');
      
      // Filtre bilgileri
      const filterInfo = this.getFilterInfo(filterOptions);
      
      // Excel verisi hazırla
      const excelData = this.prepareExcelData(transactions, reportTitle, generatedDate, filterInfo);
      
      // Excel dosyası oluştur
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Sütun genişlikleri ayarla
      worksheet['!cols'] = [
        { width: 12 }, // Tarih
        { width: 15 }, // Belge No
        { width: 10 }, // Tip
        { width: 25 }, // Stok Kartı
        { width: 10 }, // Miktar
        { width: 20 }, // Depo
        { width: 20 }, // Kaynak Depo
        { width: 20 }, // Hedef Depo
        { width: 30 }, // Açıklama
        { width: 15 }, // Kullanıcı
      ];
      
      // Sayfayı workbook'a ekle
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Hareketleri');
      
      // Dosyayı indir
      const fileName = `Stok_Hareketleri_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, fileName);
      
      console.log('✅ Excel raporu başarıyla oluşturuldu:', fileName);
    } catch (error) {
      console.error('❌ Excel raporu oluşturulurken hata:', error);
      throw new Error('Rapor oluşturulamadı');
    }
  }

  // Filtre bilgilerini hazırla
  private static getFilterInfo(filterOptions?: ReportFilterOptions): string[] {
    const info: string[] = [];
    
    if (filterOptions?.startDate && filterOptions?.endDate) {
      info.push(`Tarih Aralığı: ${filterOptions.startDate} - ${filterOptions.endDate}`);
    }
    
    if (filterOptions?.companyId) {
      info.push(`Şirket ID: ${filterOptions.companyId}`);
    }
    
    if (filterOptions?.warehouseId) {
      info.push(`Depo ID: ${filterOptions.warehouseId}`);
    }
    
    if (filterOptions?.stockCardId) {
      info.push(`Stok Kartı ID: ${filterOptions.stockCardId}`);
    }
    
    if (filterOptions?.transactionType) {
      info.push(`İşlem Tipi: ${filterOptions.transactionType}`);
    }
    
    return info;
  }

  // Excel verisi hazırla
  private static prepareExcelData(
    transactions: StockTransactionDto[], 
    title: string, 
    generatedDate: string,
    filterInfo: string[]
  ): any[][] {
    const data: any[][] = [];
    
    // Başlık satırı
    data.push([title]);
    data.push([]);
    data.push(['Oluşturulma Tarihi:', generatedDate]);
    
    // Filtre bilgileri
    if (filterInfo.length > 0) {
      data.push(['Filtre Bilgileri:']);
      filterInfo.forEach(info => data.push([info]));
    }
    
    data.push([]);
    
    // Sütun başlıkları
    data.push([
      'Tarih',
      'Belge No',
      'İşlem Tipi',
      'Stok Kartı',
      'Miktar',
      'Depo',
      'Kaynak Depo',
      'Hedef Depo',
      'Açıklama',
      'Kullanıcı'
    ]);
    
    // Veri satırları
    transactions.forEach(transaction => {
      data.push([
        new Date(transaction.transactionDate).toLocaleDateString('tr-TR'),
        transaction.documentNumber || '-',
        this.getTransactionTypeText(transaction.type),
        transaction.stockCardName,
        transaction.quantity,
        transaction.warehouseName || '-',
        transaction.fromWarehouseName || '-',
        transaction.toWarehouseName || '-',
        transaction.description || '-',
        transaction.userFullName || '-'
      ]);
    });
    
    // Toplam satırı
    data.push([]);
    data.push(['TOPLAM İŞLEM SAYISI:', transactions.length]);
    
    return data;
  }

  // İşlem tipini metne çevir
  private static getTransactionTypeText(type: number): string {
    switch (type) {
      case 0:
        return 'Giriş';
      case 1:
        return 'Çıkış';
      case 2:
        return 'Transfer';
      default:
        return 'Bilinmeyen';
    }
  }

  // CSV raporu oluştur
  static generateStockTransactionsCSV(
    transactions: StockTransactionDto[], 
    filterOptions?: ReportFilterOptions
  ): void {
    try {
      const csvData = this.prepareCSVData(transactions);
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `Stok_Hareketleri_Raporu_${new Date().toISOString().split('T')[0]}.csv`;
      
      saveAs(blob, fileName);
      
      console.log('✅ CSV raporu başarıyla oluşturuldu:', fileName);
    } catch (error) {
      console.error('❌ CSV raporu oluşturulurken hata:', error);
      throw new Error('CSV raporu oluşturulamadı');
    }
  }

  // CSV verisi hazırla
  private static prepareCSVData(transactions: StockTransactionDto[]): string[][] {
    const data: string[][] = [];
    
    // Sütun başlıkları
    data.push([
      'Tarih',
      'Belge No',
      'İşlem Tipi',
      'Stok Kartı',
      'Miktar',
      'Depo',
      'Kaynak Depo',
      'Hedef Depo',
      'Açıklama',
      'Kullanıcı'
    ]);
    
    // Veri satırları
    transactions.forEach(transaction => {
      data.push([
        new Date(transaction.transactionDate).toLocaleDateString('tr-TR'),
        transaction.documentNumber || '',
        this.getTransactionTypeText(transaction.type),
        transaction.stockCardName,
        transaction.quantity.toString(),
        transaction.warehouseName || '',
        transaction.fromWarehouseName || '',
        transaction.toWarehouseName || '',
        transaction.description || '',
        transaction.userFullName || ''
      ]);
    });
    
    return data;
  }
}

export default ReportService;
