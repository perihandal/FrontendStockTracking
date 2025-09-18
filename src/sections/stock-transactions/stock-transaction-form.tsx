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

import { StockService } from 'src/services/api/stock-service';
import { WarehouseService, type WarehouseDto } from 'src/services/api/warehouse-service';

import { Iconify } from 'src/components/iconify';

export type StockTransactionFormData = {
  transactionType: 'Giriş' | 'Çıkış' | 'Transfer';
  quantity: number;
  documentNumber: string;
  description: string;
  stockCardId: number | undefined;
  warehouseId: number | undefined;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  transactionDate: string;
};

type StockCard = {
  id: number;
  name: string;
  code: string;
  companyId: number;
};

type Warehouse = {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  branchId: number;
  branchName: string;
  isActive: boolean;
};

type StockTransactionFormProps = {
  onSubmit: (data: StockTransactionFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: StockTransactionFormData;
};

// API'den veri çekme

export function StockTransactionForm({ 
  onSubmit, 
  onCancel, 
  isEditMode = false, 
  initialData 
}: StockTransactionFormProps) {
  // API'den stok kartları ve depoları çek
  const { data: stockCardsResponse, isLoading: stockCardsLoading } = useQuery({
    queryKey: ['stockCards'],
    queryFn: async () => {
      const result = await StockService.getStockCards();
      console.log('🔍 Debug - Raw stock cards API response:', result);
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch stock cards');
      }
      console.log('🔍 Debug - Stock cards data from API:', result.data);
      return result.data;
    },
  });

  const { data: warehousesResponse, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const result = await WarehouseService.getWarehouses();
      console.log('🔍 Debug - Raw warehouses API response:', result);
      console.log('🔍 Debug - Warehouses response type:', typeof result);
      console.log('🔍 Debug - Warehouses response keys:', Object.keys(result || {}));
      
      // Backend'ten gelen response formatını kontrol et
      let warehouses: Warehouse[] = [];
      
      if (result && result.data && Array.isArray(result.data)) {
        // ServiceResult formatı: { data: [...], errorMessage: null }
        console.log('🔍 Debug - Found ServiceResult format, warehouses count:', result.data.length);
        warehouses = result.data as Warehouse[];
      } else if (Array.isArray(result)) {
        // Direkt array formatı
        console.log('🔍 Debug - Found direct array format, warehouses count:', result.length);
        warehouses = result as Warehouse[];
      } else {
        console.warn('⚠️ Warning - Unexpected warehouses response format:', result);
        warehouses = [];
      }
      
      console.log('🔍 Debug - Final warehouses data:', warehouses);
      console.log('🔍 Debug - Final warehouses count:', warehouses.length);
      
      return warehouses;
    },
  });

  const stockCards = Array.isArray(stockCardsResponse) ? stockCardsResponse : [];
  const allWarehouses = Array.isArray(warehousesResponse) ? warehousesResponse : [];

  const [formData, setFormData] = useState<StockTransactionFormData>({
    transactionType: 'Giriş',
    quantity: 1,
    documentNumber: '',
    description: '',
    stockCardId: undefined,
    warehouseId: undefined,
    fromWarehouseId: undefined,
    toWarehouseId: undefined,
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedStockCardCompanyId, setSelectedStockCardCompanyId] = useState<number | null>(null);
  const [selectedStockCardCompanyName, setSelectedStockCardCompanyName] = useState<string | null>(null);
  
  // Seçilen stok kartının company ID'sine göre depoları filtrele
  const warehouses = React.useMemo(() => {
    if (!selectedStockCardCompanyId && !selectedStockCardCompanyName) {
      console.log('🔍 Debug - No company info selected, showing all warehouses');
      return allWarehouses;
    }
    
    console.log('🔍 Debug - Filtering warehouses for:', {
      companyId: selectedStockCardCompanyId,
      companyName: selectedStockCardCompanyName
    });
    console.log('🔍 Debug - allWarehouses before filter:', allWarehouses);
    console.log('🔍 Debug - allWarehouses details:', allWarehouses.map(w => ({
      id: w.id,
      name: w.name,
      companyId: w.companyId,
      companyName: w.companyName,
      isActive: w.isActive,
      isActiveType: typeof w.isActive
    })));
    
    const filtered = allWarehouses.filter(warehouse => {
      // Önce companyId ile filtrele, yoksa companyName ile filtrele
      let matches = false;
      
      if (selectedStockCardCompanyId && warehouse.companyId) {
        // Güvenli karşılaştırma - hem number hem string olabilir
        matches = Number(warehouse.companyId) === Number(selectedStockCardCompanyId);
      } else if (selectedStockCardCompanyName && warehouse.companyName) {
        matches = warehouse.companyName === selectedStockCardCompanyName;
      }
      
      // Sadece aktif depoları dahil et
      const isActive = warehouse.isActive === true;
      
      console.log(`🔍 Debug - Warehouse ${warehouse.name} (companyId: ${warehouse.companyId}, companyName: ${warehouse.companyName}, isActive: ${warehouse.isActive}, isActiveType: ${typeof warehouse.isActive}) matches:`, matches && isActive);
      return matches && isActive;
    });
    
    console.log('🔍 Debug - filtered warehouses after filter:', filtered);
    
    // Debug: Aktif olmayan depoları da göster
    const inactiveWarehouses = allWarehouses.filter(warehouse => {
      let matches = false;
      if (selectedStockCardCompanyId && warehouse.companyId) {
        // Güvenli karşılaştırma - hem number hem string olabilir
        matches = Number(warehouse.companyId) === Number(selectedStockCardCompanyId);
      } else if (selectedStockCardCompanyName && warehouse.companyName) {
        matches = warehouse.companyName === selectedStockCardCompanyName;
      }
      // Aktif olmayan depoları filtrele
      const isInactive = warehouse.isActive === false;
      return matches && isInactive;
    });
    
    if (inactiveWarehouses.length > 0) {
      console.log('🔍 Debug - Found inactive warehouses for this company:', inactiveWarehouses);
    }
    
    return filtered;
  }, [selectedStockCardCompanyId, selectedStockCardCompanyName, allWarehouses]);

  // Aktif olmayan depo sayısını hesapla
  const inactiveWarehouseCount = React.useMemo(() => {
    if (!selectedStockCardCompanyId && !selectedStockCardCompanyName) {
      return 0;
    }
    
    return allWarehouses.filter(warehouse => {
      let matches = false;
      if (selectedStockCardCompanyId && warehouse.companyId) {
        // Güvenli karşılaştırma - hem number hem string olabilir
        matches = Number(warehouse.companyId) === Number(selectedStockCardCompanyId);
      } else if (selectedStockCardCompanyName && warehouse.companyName) {
        matches = warehouse.companyName === selectedStockCardCompanyName;
      }
      // Aktif olmayan depoları say
      const isInactive = warehouse.isActive === false;
      return matches && isInactive;
    }).length;
  }, [selectedStockCardCompanyId, selectedStockCardCompanyName, allWarehouses]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof StockTransactionFormData, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // Transaction type değiştiğinde warehouseId'yi temizle
      if (field === 'transactionType' && value === 'Transfer') {
        newFormData.warehouseId = undefined;
      }
      
      // Stok kartı seçildiğinde company ID'sini al ve depo seçimlerini temizle
      if (field === 'stockCardId') {
        console.log('🔍 Debug - Stock card selection changed to:', value);
        console.log('🔍 Debug - Available stock cards:', stockCards);
        
        const selectedCard = stockCards.find(card => card.id === value);
        console.log('🔍 Debug - selectedCard found:', selectedCard);
        
        if (selectedCard) {
          console.log('🔍 Debug - Card details:', {
            id: selectedCard.id,
            name: selectedCard.name,
            companyId: selectedCard.companyId,
            companyName: selectedCard.companyName,
            companyIdType: typeof selectedCard.companyId
          });
          console.log('🔍 Debug - setting companyId to:', selectedCard.companyId);
          console.log('🔍 Debug - setting companyName to:', selectedCard.companyName);
          
          // CompanyId'nin number olup olmadığını kontrol et
          if (typeof selectedCard.companyId !== 'number') {
            console.warn('⚠️ Warning - selectedCard.companyId is not a number:', selectedCard.companyId, typeof selectedCard.companyId);
          }
          
          setSelectedStockCardCompanyId(selectedCard.companyId);
          setSelectedStockCardCompanyName(selectedCard.companyName);
          // Depo seçimlerini temizle çünkü yeni şirkete göre filtreleme yapılacak
          newFormData.warehouseId = undefined;
          newFormData.fromWarehouseId = undefined;
          newFormData.toWarehouseId = undefined;
        } else {
          console.log('🔍 Debug - no card found, setting company info to null');
          setSelectedStockCardCompanyId(null);
          setSelectedStockCardCompanyName(null);
        }
      }
      
      return newFormData;
    });
    
    // Hata mesajını temizle
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

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Belge numarası gereklidir';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Miktar 1\'den küçük olamaz';
    }

    if (!formData.stockCardId) {
      newErrors.stockCardId = 'Stok kartı seçilmelidir';
    }

    // Transfer işleminde warehouseId gerekli değil
    if (formData.transactionType !== 'Transfer' && !formData.warehouseId) {
      newErrors.warehouseId = 'Depo seçilmelidir';
    }

    // Transfer işlemleri için kaynak ve hedef depo kontrolü
    if (formData.transactionType === 'Transfer') {
      if (!formData.fromWarehouseId) {
        newErrors.fromWarehouseId = 'Kaynak depo seçilmelidir';
      }
      if (!formData.toWarehouseId) {
        newErrors.toWarehouseId = 'Hedef depo seçilmelidir';
      }
      if (formData.fromWarehouseId === formData.toWarehouseId) {
        newErrors.toWarehouseId = 'Kaynak ve hedef depo aynı olamaz';
      }
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'İşlem tarihi gereklidir';
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

  // Loading state
  if (stockCardsLoading || warehousesLoading) {
    return (
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography>Veriler yükleniyor...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">
          <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
          {isEditMode ? 'İşlem Düzenle' : 'Yeni İşlem'}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* İşlem Tipi ve Tarih */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.transactionType}>
              <InputLabel>İşlem Tipi</InputLabel>
              <Select
                value={formData.transactionType}
                label="İşlem Tipi"
                onChange={(e) => handleInputChange('transactionType', e.target.value)}
              >
                <MenuItem value="Giriş">Giriş</MenuItem>
                <MenuItem value="Çıkış">Çıkış</MenuItem>
                <MenuItem value="Transfer">Transfer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="İşlem Tarihi"
              value={formData.transactionDate}
              onChange={(e) => handleInputChange('transactionDate', e.target.value)}
              error={!!errors.transactionDate}
              helperText={errors.transactionDate}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* Belge No ve Miktar */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Belge Numarası"
              value={formData.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              error={!!errors.documentNumber}
              helperText={errors.documentNumber}
            />

            <TextField
              fullWidth
              type="number"
              label="Miktar"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value ? Number(e.target.value) : 0)}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
          </Stack>

          {/* Stok Kartı ve Depo */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.stockCardId}>
              <InputLabel>Stok Kartı</InputLabel>
              <Select
                value={formData.stockCardId ?? ''}
                label="Stok Kartı"
                onChange={(e) => handleInputChange('stockCardId', e.target.value ? Number(e.target.value) : undefined)}
              >
                <MenuItem value=""><em>Stok kartı seçin</em></MenuItem>
                {stockCards.map((card) => (
                  <MenuItem key={card.id} value={card.id}>
                    {card.name} ({card.code})
                  </MenuItem>
                ))}
              </Select>
              {errors.stockCardId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.stockCardId}
                </Typography>
              )}
            </FormControl>

            {/* Transfer işleminde warehouseId alanını gizle */}
            {formData.transactionType !== 'Transfer' && (
              <FormControl fullWidth error={!!errors.warehouseId}>
                <InputLabel>Depo</InputLabel>
                <Select
                  value={formData.warehouseId ?? ''}
                  label="Depo"
                  onChange={(e) => handleInputChange('warehouseId', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <MenuItem value="">
                    <em>
                      {selectedStockCardCompanyId 
                        ? 'Stok kartının şirketine ait depolar yükleniyor...' 
                        : 'Önce stok kartı seçin'
                      }
                    </em>
                  </MenuItem>
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.companyName})
                    </MenuItem>
                  ))}
                </Select>
                {errors.warehouseId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.warehouseId}
                  </Typography>
                )}
                {selectedStockCardCompanyId && warehouses.length === 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    {inactiveWarehouseCount > 0 
                      ? `Bu şirkete ait ${inactiveWarehouseCount} adet depo var ancak hiçbiri aktif değil. Lütfen depoları aktif hale getirin.`
                      : 'Bu şirkete ait aktif depo bulunamadı. Lütfen önce bu şirket için aktif bir depo oluşturun.'
                    }
                  </Typography>
                )}
              </FormControl>
            )}
          </Stack>

          {/* Transfer İşlemleri için Kaynak ve Hedef Depo */}
          {formData.transactionType === 'Transfer' && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth error={!!errors.fromWarehouseId}>
                <InputLabel>Kaynak Depo</InputLabel>
                <Select
                  value={formData.fromWarehouseId ?? ''}
                  label="Kaynak Depo"
                  onChange={(e) => handleInputChange('fromWarehouseId', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <MenuItem value="">
                    <em>
                      {selectedStockCardCompanyId 
                        ? 'Stok kartının şirketine ait depolar yükleniyor...' 
                        : 'Önce stok kartı seçin'
                      }
                    </em>
                  </MenuItem>
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.companyName})
                    </MenuItem>
                  ))}
                </Select>
                {errors.fromWarehouseId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.fromWarehouseId}
                  </Typography>
                )}
                {selectedStockCardCompanyId && warehouses.length === 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    {inactiveWarehouseCount > 0 
                      ? `Bu şirkete ait ${inactiveWarehouseCount} adet depo var ancak hiçbiri aktif değil. Lütfen depoları aktif hale getirin.`
                      : 'Bu şirkete ait aktif depo bulunamadı. Lütfen önce bu şirket için aktif bir depo oluşturun.'
                    }
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.toWarehouseId}>
                <InputLabel>Hedef Depo</InputLabel>
                <Select
                  value={formData.toWarehouseId ?? ''}
                  label="Hedef Depo"
                  onChange={(e) => handleInputChange('toWarehouseId', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <MenuItem value="">
                    <em>
                      {selectedStockCardCompanyId 
                        ? 'Stok kartının şirketine ait depolar yükleniyor...' 
                        : 'Önce stok kartı seçin'
                      }
                    </em>
                  </MenuItem>
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.companyName})
                    </MenuItem>
                  ))}
                </Select>
                {errors.toWarehouseId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.toWarehouseId}
                  </Typography>
                )}
                {selectedStockCardCompanyId && warehouses.length === 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    {inactiveWarehouseCount > 0 
                      ? `Bu şirkete ait ${inactiveWarehouseCount} adet depo var ancak hiçbiri aktif değil. Lütfen depoları aktif hale getirin.`
                      : 'Bu şirkete ait aktif depo bulunamadı. Lütfen önce bu şirket için aktif bir depo oluşturun.'
                    }
                  </Typography>
                )}
              </FormControl>
            </Stack>
          )}

          {/* Açıklama */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Açıklama"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="İşlem hakkında açıklama..."
          />

          <Divider sx={{ my: 2 }} />

          {/* Butonlar */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>
              İptal
            </Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
} 