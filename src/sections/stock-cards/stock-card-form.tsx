import type { StockCard, StockCardType } from 'src/types/stock';

import React, { useState } from 'react';

import {
  Box,
  Card,
  Button,
  Select,
  Switch,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

interface StockCardFormProps {
  onSubmit: (stockCard: {
    name: string;
    code: string;
    type: StockCardType;
    unit: string;
    tax: number;
    isActive: boolean;
    companyId: number;
    branchId: number;
    mainGroupId: number;
    subGroupId?: number;
    categoryId?: number;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: StockCard;
  isEditMode?: boolean;
}

// Mock veriler - gerçek uygulamada API'den gelecek
const mockCompanies = [
  { id: 1, name: 'ABC Şirketi' },
  { id: 2, name: 'XYZ Şirketi' },
];

const mockBranches = [
  { id: 1, name: 'Merkez Şube' },
  { id: 2, name: 'İstanbul Şube' },
];

const mockMainGroups = [
  { id: 1, name: 'Hammaddeler' },
  { id: 2, name: 'Yarı Mamüller' },
  { id: 3, name: 'Mamüller' },
];

const mockSubGroups = [
  { id: 1, name: 'Metaller', mainGroupId: 1 },
  { id: 2, name: 'Plastikler', mainGroupId: 1 },
  { id: 3, name: 'Bağlantı Elemanları', mainGroupId: 2 },
];

const mockCategories = [
  { id: 1, name: 'Çelik Ürünleri', subGroupId: 1 },
  { id: 2, name: 'Alüminyum Ürünleri', subGroupId: 1 },
  { id: 3, name: 'Vidalar', subGroupId: 3 },
];

const stockCardTypes: { value: StockCardType; label: string }[] = [
  { value: 'Hammadde', label: 'Hammadde' },
  { value: 'YarıMamul', label: 'Yarı Mamul' },
  { value: 'Mamul', label: 'Mamul' },
];

const units = ['Adet', 'Kg', 'Litre', 'Metre', 'Metrekare', 'Metreküp', 'Paket', 'Kutu'];

export function StockCardForm({ onSubmit, onCancel, isLoading = false, initialData, isEditMode = false }: StockCardFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    type: initialData?.type || 'Hammadde' as StockCardType,
    unit: initialData?.unit || 'Adet',
    tax: initialData?.tax || 18,
    isActive: initialData?.isActive ?? true,
    companyId: initialData?.companyId || 1,
    branchId: initialData?.branchId || 1,
    mainGroupId: initialData?.mainGroupId || 1,
    subGroupId: initialData?.subGroupId,
    categoryId: initialData?.categoryId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Alt grup ve kategori sıfırla
    if (field === 'mainGroupId') {
      setFormData(prev => ({ ...prev, subGroupId: undefined, categoryId: undefined }));
    } else if (field === 'subGroupId') {
      setFormData(prev => ({ ...prev, categoryId: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Stok kartı adı zorunludur';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Stok kartı kodu zorunludur';
    }

    if (formData.tax < 0 || formData.tax > 100) {
      newErrors.tax = 'Vergi oranı 0-100 arasında olmalıdır';
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

  // Filtrelenmiş veriler
  const filteredSubGroups = mockSubGroups.filter(group => group.mainGroupId === formData.mainGroupId);
  const filteredCategories = mockCategories.filter(category => category.subGroupId === formData.subGroupId);

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
        <Typography variant="h6">
          {isEditMode ? 'Stok Kartı Düzenle' : 'Yeni Stok Kartı'}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <TextField
            label="Stok Kartı Adı"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ flex: '1 1 45%' }}
            required
          />
          <TextField
            label="Stok Kartı Kodu"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            error={!!errors.code}
            helperText={errors.code}
            sx={{ flex: '1 1 45%' }}
            required
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Stok Kartı Tipi</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              label="Stok Kartı Tipi"
            >
              {stockCardTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Birim</InputLabel>
            <Select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              label="Birim"
            >
              {units.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <TextField
            label="Vergi Oranı (%)"
            type="number"
            value={formData.tax}
            onChange={(e) => handleInputChange('tax', Number(e.target.value))}
            error={!!errors.tax}
            helperText={errors.tax}
            sx={{ flex: '1 1 45%' }}
            inputProps={{ min: 0, max: 100 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
            }
            label="Aktif"
            sx={{ flex: '1 1 45%', alignItems: 'center' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Şirket</InputLabel>
            <Select
              value={formData.companyId}
              onChange={(e) => handleInputChange('companyId', Number(e.target.value))}
              label="Şirket"
            >
              {mockCompanies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Şube</InputLabel>
            <Select
              value={formData.branchId}
              onChange={(e) => handleInputChange('branchId', Number(e.target.value))}
              label="Şube"
            >
              {mockBranches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Ana Grup</InputLabel>
            <Select
              value={formData.mainGroupId}
              onChange={(e) => handleInputChange('mainGroupId', Number(e.target.value))}
              label="Ana Grup"
            >
              {mockMainGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Alt Grup</InputLabel>
            <Select
              value={formData.subGroupId || ''}
              onChange={(e) => handleInputChange('subGroupId', e.target.value ? Number(e.target.value) : undefined)}
              label="Alt Grup"
            >
              <MenuItem value="">
                <em>Seçiniz</em>
              </MenuItem>
              {filteredSubGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: '1 1 45%' }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={formData.categoryId || ''}
              onChange={(e) => handleInputChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
              label="Kategori"
            >
              <MenuItem value="">
                <em>Seçiniz</em>
              </MenuItem>
              {filteredCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            {isLoading ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
} 