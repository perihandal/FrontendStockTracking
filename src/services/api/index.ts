// API Client
export { default as apiClient } from './api-client';

// Authentication Service
export { default as AuthService } from './auth-service';
// Stock Service
export { default as StockService } from './stock-service';

// Company Service
export { default as CompanyService } from './company-service';
// Category Service
export { default as CategoryService } from './category-service';

// Warehouse Service
export { default as WarehouseService } from './warehouse-service';
export type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ChangePasswordRequest 
} from './auth-service';

export type { 
  WarehouseDto, 
  WarehouseStockDto, 
  CreateWarehouseRequest, 
  UpdateWarehouseRequest 
} from './warehouse-service';
export type { 
  BranchDto, 
  CompanyDto, 
  CreateBranchRequest,
  UpdateBranchRequest,
  CreateCompanyRequest,
  UpdateCompanyRequest
} from './company-service';

export type { 
  CategoryDto, 
  SubGroupDto, 
  MainGroupDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateSubGroupRequest,
  UpdateSubGroupRequest,
  CreateMainGroupRequest,
  UpdateMainGroupRequest
} from './category-service';
export type { 
  ApiResponse, 
  StockCardDto,
  StockCardType, 
  PagedResponse, 
  TransactionType,
  CreateStockCardRequest,
  UpdateStockCardRequest,
  CreateStockTransactionRequest,
  UpdateStockTransactionRequest
} from './stock-service';