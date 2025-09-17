import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';

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

import { CompanyService, BranchService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type WarehouseFormData = {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
  branchId: number;
  isActive: boolean;
};

type Company = {
  id: number;
  name: string;
  code: string;
};

type Branch = {
  id: number;
  name: string;
  companyId: number;
};

type WarehouseFormProps = {
  onSubmit: (data: WarehouseFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: WarehouseFormData;
};

// Company ve Branch tipleri API'den gelecek
type CompanyDto = {
  id: number;
  name: string;
  code: string;
};

type BranchDto = {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
};

export function WarehouseForm({ 
  onSubmit, 
  onCancel, 
  isEditMode = false, 
  initialData 
}: WarehouseFormProps) {
  const [formData, setFormData] = useState<WarehouseFormData>({
    code: '',
    name: '',
    address: '',
    phone: '',
    companyId: 0,
    branchId: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableBranches, setAvailableBranches] = useState<BranchDto[]>([]);

  // API Queries
  const { data: companiesResult, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      console.log('🔍 WarehouseForm: Fetching companies from API');
      const result = await CompanyService.getCompanies();
      console.log('📊 WarehouseForm: Companies API response:', result);
      return result;
    },
  });

  const { data: branchesResult, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('🔍 WarehouseForm: Fetching branches from API');
      const result = await BranchService.getBranches();
      console.log('📊 WarehouseForm: Branches API response:', result);
      return result;
    },
  });

  const companies = companiesResult?.data || [];
  const allBranches = branchesResult?.data || [];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    // Şirket seçildiğinde o şirkete ait şubeleri filtrele
    if (formData.companyId) {
      const branches = allBranches.filter(branch => branch.companyId === formData.companyId);
      setAvailableBranches(branches);
      
      // Eğer seçili şube yeni şirkete ait değilse, şube seçimini sıfırla
      if (formData.branchId && !branches.find(b => b.id === formData.branchId)) {
        setFormData(prev => ({ ...prev, branchId: 0 }));
      }
    } else {
      setAvailableBranches([]);
      setFormData(prev => ({ ...prev, branchId: 0 }));
    }
  }, [formData.companyId, allBranches]);

  const handleInputChange = (field: keyof WarehouseFormData, value: any) => {
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
      newErrors.code = 'Depo kodu gereklidir';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Depo adı gereklidir';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Şirket seçilmelidir';
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Şube seçilmelidir';
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
          {isEditMode ? 'Depo Düzenle' : 'Yeni Depo'}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Depo Kodu ve Depo Adı */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Depo Kodu"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
            />
            <TextField
              fullWidth
              label="Depo Adı"
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

          {/* Şirket ve Şube Seçimi */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.companyId}>
              <InputLabel>Şirket</InputLabel>
              <Select
                value={formData.companyId}
                onChange={(e) => handleInputChange('companyId', Number(e.target.value))}
                label="Şirket"
                disabled={companiesLoading}
              >
                {companiesLoading ? (
                  <MenuItem disabled>Şirketler yükleniyor...</MenuItem>
                ) : companies.length === 0 ? (
                  <MenuItem disabled>Şirket bulunamadı</MenuItem>
                ) : (
                  companies.map((company) => (
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

            <FormControl fullWidth error={!!errors.branchId}>
              <InputLabel>Şube</InputLabel>
              <Select
                value={formData.branchId}
                onChange={(e) => handleInputChange('branchId', Number(e.target.value))}
                label="Şube"
                disabled={!formData.companyId || branchesLoading}
              >
                {branchesLoading ? (
                  <MenuItem disabled>Şubeler yükleniyor...</MenuItem>
                ) : !formData.companyId ? (
                  <MenuItem disabled>Önce şirket seçin</MenuItem>
                ) : availableBranches.length === 0 ? (
                  <MenuItem disabled>Bu şirkete ait şube bulunamadı</MenuItem>
                ) : (
                  availableBranches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.branchId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.branchId}
                </Typography>
              )}
            </FormControl>
          </Stack>

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
