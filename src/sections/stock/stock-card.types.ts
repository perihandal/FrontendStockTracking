export type StockCardType = 'NihaiUrun' | 'AraUrun' | 'Hammadde';

export interface StockCard {
  id: number;
  name: string;
  code: string;
  type: StockCardType;
  unit: string;
  tax: number;
  isActive: boolean;
  createdDate: string; // ISO string

  companyId: number;
  company: { id: number; name: string };

  branchId: number;
  branch: { id: number; name: string };

  mainGroupId: number;
  mainGroup: { id: number; name: string };

  subGroupId?: number;
  subGroup?: { id: number; name: string };

  categoryId?: number;
  category?: { id: number; name: string };

  createUserId: number;
  createUser: { id: number; name: string };

  barcodeCards?: Array<{ id: number; code: string }>;
  priceDefinitions?: Array<{ id: number; name: string }>;
  stockTransactions?: Array<{ id: number; type: string }>;
}