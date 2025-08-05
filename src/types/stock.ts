// Stok Kartı Tipleri
export type StockCardType = 'Hammadde' | 'YarıMamul' | 'Mamul';

export interface StockCard {
  id: number;
  name: string;
  code: string;
  type: StockCardType;
  unit: string;
  tax: number;
  isActive: boolean;
  createdDate: string;
  
  companyId: number;
  company: Company;
  
  branchId: number;
  branch: Branch;
  
  mainGroupId: number;
  mainGroup: MainGroup;
  
  subGroupId?: number;
  subGroup?: SubGroup;
  
  categoryId?: number;
  category?: Category;
  
  createUserId: number;
  createUser: User;
  
  barcodeCards?: BarcodeCard[];
  priceDefinitions?: PriceDefinition[];
  stockTransactions?: StockTransaction[];
}

// Şirket
export interface Company {
  id: number;
  name: string;
  taxNumber: string;
  address: string;
  phone: string;
  isActive: boolean;
}

// Şube
export interface Branch {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  companyId: number;
  company: Company;
  createUserId: number;
  createUser: User;
}

// Depo
export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  companyId: number;
  company: Company;
  branchId: number;
  branch: Branch;
  createUserId: number;
  createUser: User;
}

// Ana Grup
export interface MainGroup {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  companyId: number;
  company: Company;
  branchId: number;
  branch: Branch;
}

// Alt Grup
export interface SubGroup {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  mainGroupId: number;
  mainGroup: MainGroup;
}

// Kategori
export interface Category {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  branchId: number;
  branch: Branch;
  companyId: number;
  company: Company;
  createDate: string;
  createUserId: number;
  createUser: User;
}

// Barkod
export interface BarcodeCard {
  id: number;
  barcode: string;
  barcodeType: string;
  isDefault: boolean;
  stockCardId: number;
  stockCard: StockCard;
}

// Fiyat Tanımı
export interface PriceDefinition {
  id: number;
  priceType: string;
  price: number;
  currency: string;
  validFrom: string;
  validTo: string;
  stockCardId: number;
  stockCard: StockCard;
  createUserId: number;
  createUser: User;
}

// Stok İşlemi
export interface StockTransaction {
  id: number;
  transactionType: 'Giriş' | 'Çıkış' | 'Transfer';
  quantity: number;
  transactionDate: string;
  documentNumber: string;
  description: string;
  stockCardId: number;
  stockCard: StockCard;
  warehouseId: number;
  warehouse: Warehouse;
}

// Kullanıcı
export interface User {
  id: number;
  fullName: string;
  email: string;
  username: string;
  createdDate: string;
  isActive: boolean;
  roles?: UserRole[];
}

// Rol
export interface Role {
  id: number;
  name: string;
}

// Kullanıcı Rolü
export interface UserRole {
  userId: number;
  roleId: number;
  user: User;
  role: Role;
} 