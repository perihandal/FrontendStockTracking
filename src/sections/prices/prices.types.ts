// Price Management Types

export enum PriceType {
  Alış = 1,
  Satış = 2,
  İndirimli = 3,
  Normal = 4
}

export enum Currency {
  TRY = 1,
  USD = 2,
  EUR = 3,
  GBP = 4
}

export interface PriceDefinition {
  id: number;
  priceType: PriceType;
  price: number;
  currency: Currency;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  stockCardId: number;
  stockCardName: string;
  userId: number;
  userFullName: string;
}

export interface CreatePriceDefinitionFormData {
  priceType: PriceType;
  price: number;
  currency: Currency;
  validFrom: string;
  validTo?: string;
  stockCardId: number;
  userId: number;
}

export interface UpdatePriceDefinitionFormData {
  priceType: PriceType;
  price: number;
  currency: Currency;
  validFrom: string;
  validTo?: string;
  userId: number;
}

export interface PriceDefinitionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  priceDefinition?: PriceDefinition;
  isEdit?: boolean;
}

export interface PriceHistory {
  id: number;
  priceType: PriceType;
  oldPrice: number;
  newPrice: number;
  changeDate: string;
  priceDefinitionId: number;
  stockCardName: string;
}

export interface PriceHistoryDto {
  stockCardName: string;
  oldPrice: number;
  newPrice: number;
  changeDate: string;
}

// Helper functions for enum display
export const getPriceTypeLabel = (priceType: PriceType): string => {
  switch (priceType) {
    case PriceType.Alış:
      return 'Alış';
    case PriceType.Satış:
      return 'Satış';
    case PriceType.İndirimli:
      return 'İndirimli';
    case PriceType.Normal:
      return 'Normal';
    default:
      return 'Bilinmeyen';
  }
};

export const getCurrencyLabel = (currency: Currency): string => {
  switch (currency) {
    case Currency.TRY:
      return 'TRY';
    case Currency.USD:
      return 'USD';
    case Currency.EUR:
      return 'EUR';
    case Currency.GBP:
      return 'GBP';
    default:
      return 'TRY';
  }
};

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case Currency.TRY:
      return '₺';
    case Currency.USD:
      return '$';
    case Currency.EUR:
      return '€';
    case Currency.GBP:
      return '£';
    default:
      return '₺';
  }
};
