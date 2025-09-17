// Main Group Types
export interface MainGroup {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  userId: number;
  userName: string;
}

export interface CreateMainGroupFormData {
  code: string;
  name: string;
  userId: number;
  isActive: boolean;
}

export interface UpdateMainGroupFormData {
  code: string;
  name: string;
  userId: number;
  isActive: boolean;
}

// Sub Group Types
export interface SubGroup {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  userId: number;
  userName: string;
  mainGroupId: number;
  mainGroupName: string;
}

export interface CreateSubGroupFormData {
  code: string;
  name: string;
  userId: number;
  isActive: boolean;
  mainGroupId: number;
}

export interface UpdateSubGroupFormData {
  code: string;
  name: string;
  userId: number;
  isActive: boolean;
  mainGroupId: number;
}

// Form Props
export interface MainGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mainGroup?: MainGroup;
  isEdit?: boolean;
}

export interface SubGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subGroup?: SubGroup;
  isEdit?: boolean;
}
