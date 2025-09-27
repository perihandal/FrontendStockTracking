import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { useAuthContext } from 'src/contexts/auth-context';
import { WarehouseService, StockService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type WarehouseStockFormData = {
  warehouseId: number;
  stockCardId: number;
  quantity: number;
  reservedQuantity: number;
};

type WarehouseDto = {
  id: number;
  name: string;
  code: string;
  companyId: number;
  branchId: number;
  companyName: string;
  branchName: string;
  isActive: boolean;
};

type StockCardDto = {
  id: number;
  name: string;
  code: string;
  barcodes: string[];
  categoryId?: number;
  categoryName?: string;
  type: string;
  unit: string;
  tax: number;
};

type WarehouseStockFormProps = {
  onSubmit: (data: WarehouseStockFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: WarehouseStockFormData;
};

export function WarehouseStockForm({ 
  onSubmit, 
  onCancel, 
  isEditMode = false, 
  initialData 
}: WarehouseStockFormProps) {
  const { isAdminUser, isEditorUser, getCompanyId, getBranchId } = useAuthContext();
  
  const [formData, setFormData] = useState<WarehouseStockFormData>({
    warehouseId: 0,
    stockCardId: 0,
    quantity: 0,
    reservedQuantity: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // API Queries with role-based filtering
  const { data: warehousesResult, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses', isAdminUser ? 'all' : getCompanyId()],
    queryFn: async () => {
      console.log('🔍 WarehouseStockForm: Fetching warehouses from API');
      const result = await WarehouseService.getWarehouses();
      console.log('📊 WarehouseStockForm: Warehouses API response:', result);
      
      // Filter warehouses based on user role
      if (isAdminUser) {
        console.log('👑 WarehouseStockForm: Admin user - showing all warehouses');
        return result;
      } else if (isEditorUser) {
        const userCompanyId = getCompanyId();
        console.log('✏️ WarehouseStockForm: Editor user - filtering to company:', userCompanyId);
        const filteredData = result.data ? result.data.filter(warehouse => warehouse.companyId === userCompanyId) : [];
        return { ...result, data: filteredData };
      } else {
        const userBranchId = getBranchId();
        console.log('👤 WarehouseStockForm: Regular user - filtering to branch:', userBranchId);
        const filteredData = result.data ? result.data.filter(warehouse => warehouse.branchId === userBranchId) : [];
        return { ...result, data: filteredData };
      }
    },
  });

  const { data: stockCardsResult, isLoading: stockCardsLoading } = useQuery({
    queryKey: ['stock-cards'],
    queryFn: async () => {
      console.log('🔍 WarehouseStockForm: Fetching stock cards from API');
      const result = await StockService.getStockCards();
      console.log('📊 WarehouseStockForm: Stock cards API response:', result);
      
      // Return all stock cards (we'll add filtering later if needed)
      console.log('📊 WarehouseStockForm: Stock cards API response:', result);
      return result;
    },
  });

  const warehouses = warehousesResult?.data || [];
  const stockCards = stockCardsResult?.data || [];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof WarehouseStockFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Depo seçilmelidir';
    }

    if (!formData.stockCardId) {
      newErrors.stockCardId = 'Stok kartı seçilmelidir';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Miktar 0 veya daha büyük olmalıdır';
    }

    if (formData.reservedQuantity < 0) {
      newErrors.reservedQuantity = 'Rezerve miktar 0 veya daha büyük olmalıdır';
    }

    if (formData.reservedQuantity > formData.quantity) {
      newErrors.reservedQuantity = 'Rezerve miktar toplam miktardan büyük olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Helper function to format numbers
 const formatNumber = (num: number) => new Intl.NumberFormat('tr-TR').format(num);

  // Calculate available quantity
  const availableQuantity = formData.quantity - formData.reservedQuantity;

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">
          <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
          {isEditMode ? 'Depo Stoku Düzenle' : 'Yeni Depo Stoku'}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Depo ve Stok Kartı Seçimi */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.warehouseId}>
              <InputLabel>Depo</InputLabel>
              <Select
                value={formData.warehouseId}
                onChange={(e) => handleInputChange('warehouseId', Number(e.target.value))}
                label="Depo"
                disabled={warehousesLoading || isEditMode} // Edit modunda depo değiştirilemez
              >
                {warehousesLoading ? (
                  <MenuItem disabled>Depolar yükleniyor...</MenuItem>
                ) : warehouses.length === 0 ? (
                  <MenuItem disabled>Depo bulunamadı</MenuItem>
                ) : (
                  warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      <Box>
                        <Typography variant="body2">{warehouse.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {warehouse.code} - {warehouse.companyName} / {warehouse.branchName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.warehouseId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.warehouseId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.stockCardId}>
              <InputLabel>Stok Kartı</InputLabel>
              <Select
                value={formData.stockCardId}
                onChange={(e) => handleInputChange('stockCardId', Number(e.target.value))}
                label="Stok Kartı"
                disabled={stockCardsLoading || isEditMode} // Edit modunda stok kartı değiştirilemez
              >
                {stockCardsLoading ? (
                  <MenuItem disabled>Stok kartları yükleniyor...</MenuItem>
                ) : stockCards.length === 0 ? (
                  <MenuItem disabled>Stok kartı bulunamadı</MenuItem>
                ) : (
                  stockCards.map((stockCard) => (
                    <MenuItem key={stockCard.id} value={stockCard.id}>
                      <Box>
                        <Typography variant="body2">{stockCard.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stockCard.code} - {stockCard.barcodes.length > 0 ? stockCard.barcodes[0] : 'Barkod yok'} ({stockCard.categoryName || 'Kategori yok'})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.stockCardId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.stockCardId}
                </Typography>
              )}
            </FormControl>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Miktar Bilgileri */}
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
            Miktar Bilgileri
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Toplam Miktar"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              error={!!errors.quantity}
              helperText={errors.quantity}
              inputProps={{ min: 0, step: 1 }}
            />
            <TextField
              fullWidth
              label="Rezerve Miktar"
              type="number"
              value={formData.reservedQuantity}
              onChange={(e) => handleInputChange('reservedQuantity', Number(e.target.value))}
              error={!!errors.reservedQuantity}
              helperText={errors.reservedQuantity}
              inputProps={{ min: 0, max: formData.quantity, step: 1 }}
            />
          </Stack>

          {/* Hesaplanan Kullanılabilir Miktar */}
          {formData.quantity > 0 && (
            <Card sx={{ p: 2, backgroundColor: 'background.neutral' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Hesaplanan Değerler
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Toplam Miktar</Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatNumber(formData.quantity)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Rezerve Miktar</Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatNumber(formData.reservedQuantity)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Kullanılabilir Miktar</Typography>
                  <Typography variant="h6" color="success.main">
                    {formatNumber(availableQuantity)}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Edit Mode Uyarısı */}
          {isEditMode && (
            <Card sx={{ p: 2, backgroundColor: 'warning.lighter' }}>
              <Stack direction="row" alignItems="center">
                <Iconify icon="solar:share-bold" sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" color="warning.dark">
                  Düzenleme modunda depo ve stok kartı değiştirilemez. Sadece miktar bilgileri güncellenebilir.
                </Typography>
              </Stack>
            </Card>
          )}

          {/* Butonlar */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>İptal</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}