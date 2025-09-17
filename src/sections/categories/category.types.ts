export interface Category {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  userId: number;
  userName: string;
  createDate: string;
}

export interface CreateCategoryFormData {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
  userId: number;
  isActive: boolean;
}

export interface UpdateCategoryFormData {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
  userId: number;
  isActive: boolean;
}

export interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category;
  isEdit?: boolean;
}
