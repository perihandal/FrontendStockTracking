import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/contexts/auth-context';
import { CompanyService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type BranchFormData = {
  code: string;
  name: string;
  address: string;
  companyId: number;
  phone: string;
  isActive: boolean;
};

type Company = {
  id: number;
  name: string;
  code: string;
};

type BranchFormProps = {
  onSubmit: (data: BranchFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: BranchFormData;
};

export function BranchForm({ 
  onSubmit, 
  onCancel, 
  isEditMode = false, 
  initialData 
}: BranchFormProps) {
  const { user, isAdminUser, getCompanyId } = useAuth();

  // Şirketleri API'den çek
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await CompanyService.getCompanies();
        console.log('🔍 Branch Form - Companies response:', response);
        
        let companiesData = response.data || [];
        
        // Editor ise sadece kendi şirketini göster
        if (!isAdminUser && user) {
          const userCompanyId = getCompanyId();
          if (userCompanyId) {
            companiesData = companiesData.filter((company: any) => company.id === userCompanyId);
          }
        }
        
        return companiesData;
      } catch (error) {
        console.error('❌ Branch Form - Companies error:', error);
        return [];
      }
    },
  });
  const [formData, setFormData] = useState<BranchFormData>({
    code: '',
    name: '',
    address: '',
    companyId: 0,
    phone: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (!isAdminUser && user) {
      // Editor ise otomatik olarak kendi şirketini seç
      const userCompanyId = getCompanyId();
      if (userCompanyId) {
        setFormData(prev => ({ ...prev, companyId: userCompanyId }));
      }
    }
  }, [initialData, isAdminUser, user, getCompanyId]);

  const handleInputChange = (field: keyof BranchFormData, value: any) => {
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

    if (!formData.code.trim()) {
      newErrors.code = 'Şube kodu gereklidir';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Şube adı gereklidir';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Şirket seçilmelidir';
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
          {isEditMode ? 'Şube Düzenle' : 'Yeni Şube'}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Şube Kodu ve Şube Adı */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Şube Kodu"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
            />
            <TextField
              fullWidth
              label="Şube Adı"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Stack>

          {/* Adres ve Telefon */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Adres"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
            />
            <TextField
              fullWidth
              label="Telefon"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Şirket Seçimi */}
          <FormControl fullWidth error={!!errors.companyId}>
            <InputLabel>Şirket</InputLabel>
            <Select
              value={formData.companyId}
              onChange={(e) => handleInputChange('companyId', Number(e.target.value))}
              label="Şirket"
              disabled={companiesLoading} // Sadece loading sırasında disabled
            >
              {companiesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Yükleniyor...
                </MenuItem>
              ) : (
                companies.map((company: any) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.companyId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.companyId}
              </Typography>
            )}
          </FormControl>

          {/* Aktif/Pasif Durumu */}
          <FormControl fullWidth>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Durum:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    color="primary"
                  />
                }
                label={formData.isActive ? 'Aktif' : 'Pasif'}
              />
            </Stack>
          </FormControl>

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
