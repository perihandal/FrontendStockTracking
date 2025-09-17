import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

type CompanyFormData = {
  code: string;
  name: string;
  taxNumber: string;
  address: string;
  phone: string;
  isActive: boolean;
};

type CompanyFormProps = {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: CompanyFormData;
};

export function CompanyForm({ 
  onSubmit, 
  onCancel, 
  isEditMode = false, 
  initialData 
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    code: '',
    name: '',
    taxNumber: '',
    address: '',
    phone: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
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

    if (!formData.code.trim()) {
      newErrors.code = 'Şirket kodu gereklidir';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Şirket adı gereklidir';
    }

    if (!formData.taxNumber.trim()) {
      newErrors.taxNumber = 'Vergi numarası gereklidir';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
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
          {isEditMode ? 'Şirket Düzenle' : 'Yeni Şirket'}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Şirket Kodu ve Adı */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Şirket Kodu"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
              placeholder="COMP001"
            />

            <TextField
              fullWidth
              label="Şirket Adı"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="ABC Şirketi"
            />
          </Stack>

          {/* Vergi Numarası */}
          <TextField
            fullWidth
            label="Vergi Numarası"
            value={formData.taxNumber}
            onChange={(e) => handleInputChange('taxNumber', e.target.value)}
            error={!!errors.taxNumber}
            helperText={errors.taxNumber}
            placeholder="1234567890"
          />

          {/* Telefon */}
          <TextField
            fullWidth
            label="Telefon"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="0212 123 45 67"
          />

          {/* Adres */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Adres"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            placeholder="Şirket adresi..."
          />

          {/* Durum */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                color="primary"
              />
            }
            label="Aktif Durum"
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