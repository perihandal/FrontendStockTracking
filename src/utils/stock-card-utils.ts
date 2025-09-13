// Utility functions for stock card type conversions

// Map string StockCardType to integer enum (for backend)
export const mapStockCardTypeToEnum = (type: string): number => {
  const typeMapping: Record<string, number> = {
    'NihaiUrun': 0,
    'AraUrun': 1,
    'Hammadde': 2
  };
  return typeMapping[type] || 0; // Default to NihaiUrun if not found
};

// Map integer enum back to StockCardType string (for frontend display)
export const mapEnumToStockCardType = (enumValue: number): string => {
  const typeMapping: Record<number, string> = {
    0: 'NihaiUrun',
    1: 'AraUrun',
    2: 'Hammadde'
  };
  return typeMapping[enumValue] || 'NihaiUrun'; // Default to NihaiUrun if not found
};

// Map string BarcodeType to integer enum (for backend)
export const mapBarcodeTypeToEnum = (type: string): number => {
  const barcodeMapping: Record<string, number> = {
    'EAN13': 1,
    'UPC_A': 2,
    'QRCode': 3,
    'Code128': 4,
    'EAN8': 5,
    'ITF14': 6,
    'ISBN': 7,
    'DataMatrix': 8
  };
  return barcodeMapping[type] || 1; // Default to EAN13 if not found
};

// TransactionType utility functions

// Map string TransactionType to integer enum (for backend)
export const mapTransactionTypeToEnum = (type: string): number => {
  const typeMapping: Record<string, number> = {
    'Giris': 1,
    'Cikis': 2,
    'Transfer': 3
  };
  return typeMapping[type] || 1; // Default to Giris if not found
};

// Map integer enum back to TransactionType string (for frontend display)
export const mapEnumToTransactionType = (enumValue: number): string => {
  const typeMapping: Record<number, string> = {
    1: 'Giris',
    2: 'Cikis',
    3: 'Transfer'
  };
  return typeMapping[enumValue] || 'Giris'; // Default to Giris if not found
};

// Map form TransactionType to backend TransactionType
export const mapFormTransactionTypeToEnum = (type: string): string => {
  const typeMapping: Record<string, string> = {
    'Giriş': 'Giris',
    'Çıkış': 'Cikis',
    'Transfer': 'Transfer'
  };
  return typeMapping[type] || 'Giris'; // Default to Giris if not found
};