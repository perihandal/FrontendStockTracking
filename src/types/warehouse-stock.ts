export interface WarehouseStockDto {
  warehouseId: number;
  warehouseName: string;
  stockCardId: number;
  stockCardName: string;
  stockCardCode?: string;
  quantity: number;
  unit?: string;
  reservedQuantity?: number;
  availableQuantity?: number;
}
