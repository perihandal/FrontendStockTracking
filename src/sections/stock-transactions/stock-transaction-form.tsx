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

import { Iconify } from 'src/components/iconify';

type StockTransactionFormData = {
  transactionType: 'Giriş' | 'Çıkış' | 'Transfer';
  quantity: number;
  documentNumber: string;
  description: string;
  stockCardId: number;
  warehouseId: number;
  transactionDate: string;
};

type StockCard = {
  id: number;
  name: string;
  code: string;
};

type Warehouse = {
  id: number;
  name: string;
};

type StockTransactionFormProps = {
  onSubmit: (data: StockTransactionFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: StockTransactionFormData;
};

// Mock veriler
const mockStockCards: StockCard[] = [
  { id: 1, name: 'Çelik Levha', code: 'STK001' },
  { id: 2, name: 'Alüminyum Profil', code: 'STK002' },
  { id: 3, name: 'Plastik Hammadde', code: 'STK003' },
];

const mockWarehouses: Warehouse[] = [
  { id: 1, name: 'Ana Depo' },
  { id: 2, name: 'Yan Depo' },
  { id: 3, name: 'Üretim Deposu' },
];

export function StockTransactionForm({ 
  onSubmit, 
  onCancel, 
  isEditMode = false, 
  initialData 
}: StockTransactionFormProps) {
  const [formData, setFormData] = useState<StockTransactionFormData>({
    transactionType: 'Giriş',
    quantity: 0,
    documentNumber: '',
    description: '',
    stockCardId: 0,
    warehouseId: 0,
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof StockTransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Miktar 0\'dan büyük olmalıdır';
    }

    if (!formData.stockCardId) {
      newErrors.stockCardId = 'Stok kartı seçilmelidir';
    }

    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Depo seçilmelidir';
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
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
          </Stack>

          {/* Stok Kartı ve Depo */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.stockCardId}>
              <InputLabel>Stok Kartı</InputLabel>
              <Select
                value={formData.stockCardId}
                label="Stok Kartı"
                onChange={(e) => handleInputChange('stockCardId', Number(e.target.value))}
              >
                {mockStockCards.map((card) => (
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

            <FormControl fullWidth error={!!errors.warehouseId}>
              <InputLabel>Depo</InputLabel>
              <Select
                value={formData.warehouseId}
                label="Depo"
                onChange={(e) => handleInputChange('warehouseId', Number(e.target.value))}
              >
                {mockWarehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.warehouseId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.warehouseId}
                </Typography>
              )}
            </FormControl>
          </Stack>

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