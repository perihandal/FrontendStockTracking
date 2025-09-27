import type { StockCardDto, StockCardType } from 'src/services/api';

import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  CircularProgress,
} from '@mui/material';

import { useAuth } from 'src/contexts/auth-context';
import { CompanyService, CategoryService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

interface StockCardFormProps {
  onSubmit: (stockCard: {
    name: string;
    code: string;
    type: StockCardType;
    unit: string;
    tax: number;
    companyId?: number;
    branchId?: number;
    mainGroupId?: number;
    subGroupId?: number;
    categoryId?: number;
  }) => void;
  editMode?: boolean;
  selected?: StockCardDto | null;
  isLoading?: boolean;
}

// Stock card types - Backend enum'ları ile uyumlu
const stockCardTypes: { value: StockCardType; label: string }[] = [
  { value: 'Hammadde', label: 'Hammadde' },
  { value: 'AraUrun', label: 'Ara Ürün' },
  { value: 'NihaiUrun', label: 'Nihai Ürün' },
];

const units = ['Adet', 'Kg', 'Litre', 'Metre', 'Metrekare', 'Metreküp', 'Paket', 'Kutu'];

export function StockCardForm({ onSubmit, editMode = false, selected, isLoading = false }: StockCardFormProps) {
  const { user, isAdminUser, getCompanyId } = useAuth();
  
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    type: StockCardType;
    unit: string;
    tax: number;
    companyId?: number;
    branchId?: number;
    mainGroupId?: number;
    subGroupId?: number;
    categoryId?: number;
  }>({
    name: selected?.name || '',
    code: selected?.code || '',
    type: selected?.type || 'Hammadde' as StockCardType,
    unit: selected?.unit || 'Adet',
    tax: selected?.tax || 18,
    companyId: undefined, // No default value
    branchId: undefined,  // No default value
    mainGroupId: undefined, // No default value
    subGroupId: undefined,
    categoryId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // API Queries with error handling
  const { data: companiesResponse, error: companiesError, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        console.log('🔍 StockCardForm - Fetching companies from API...');
        console.log('🔍 StockCardForm - Current user:', user);
        console.log('🔍 StockCardForm - Is Admin User:', isAdminUser);
        
        const result = await CompanyService.getCompanies();
        console.log('✅ StockCardForm - Companies API result:', result);
        console.log('✅ StockCardForm - Companies data:', result?.data);
        console.log('✅ StockCardForm - Companies success:', result?.isSuccess);
        
        if (!result?.isSuccess) {
          console.error('❌ StockCardForm - Companies API returned success: false');
          console.error('❌ StockCardForm - Companies API message:', result?.errorMessage);
        }
        
        // Role-based filtering
        let companiesData = result?.data || [];
        console.log('🔍 StockCardForm - Original companies data:', companiesData);
        console.log('🔍 StockCardForm - Original companies count:', companiesData.length);
        
        if (!isAdminUser && user) {
          const userCompanyId = getCompanyId();
          console.log('🔍 StockCardForm - Editor user company ID from token:', userCompanyId);
          
          if (userCompanyId) {
            const filteredCompanies = companiesData.filter((company: any) => company.id === userCompanyId);
            console.log('🔍 StockCardForm - Filtered companies for Editor:', filteredCompanies);
            console.log('🔍 StockCardForm - Filtered companies count:', filteredCompanies.length);
            companiesData = filteredCompanies;
          } else {
            console.warn('⚠️ StockCardForm - Editor user has no company ID in token');
          }
        }
        
        const finalResult = { ...result, data: companiesData };
        console.log('✅ StockCardForm - Final companies result:', finalResult);
        return finalResult;
      } catch (error) {
        console.error('❌ StockCardForm - Companies API error:', error);
        console.error('❌ StockCardForm - Companies API error details:', {
          message: (error as any).message,
          response: (error as any).response,
          request: (error as any).request
        });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: branchesResponse, error: branchesError, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching branches from:', CompanyService.getBranches);
        const result = await CompanyService.getBranches();
        console.log('✅ Branches API result:', result);
        console.log('✅ Branches data:', result?.data);
        console.log('✅ Branches success:', result?.isSuccess);
        if (!result?.isSuccess) {
          console.error('❌ Branches API returned success: false');
          console.error('❌ Branches API message:', result?.errorMessage);
        }
        return result;
      } catch (error) {
        console.error('❌ Branches API error:', error);
        console.error('❌ Branches API error details:', {
          message: (error as any).message,
          response: (error as any).response,
          request: (error as any).request
        });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: mainGroupsResponse, error: mainGroupsError, isLoading: mainGroupsLoading } = useQuery({
    queryKey: ['mainGroups'],
    queryFn: async () => {
      console.log('🔍 Fetching main groups from:', CategoryService.getMainGroups);
      const result = await CategoryService.getMainGroups();
      console.log('✅ Main groups API result:', result);
      console.log('✅ Main groups data:', result?.data);
      return result;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: subGroupsResponse, error: subGroupsError, isLoading: subGroupsLoading } = useQuery({
    queryKey: ['subGroups', formData.mainGroupId],
    queryFn: async () => {
      console.log('🔍 Fetching sub groups for main group:', formData.mainGroupId);
      console.log('🔍 From:', CategoryService.getSubGroupsByMainGroup);
      if (!formData.mainGroupId) throw new Error('MainGroupId is required');
      const result = await CategoryService.getSubGroupsByMainGroup(formData.mainGroupId);
      console.log('✅ Sub groups API result:', result);
      console.log('✅ Sub groups data:', result?.data);
      return result;
    },
    enabled: !!formData.mainGroupId,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: categoriesResponse, error: categoriesError, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('🔍 Fetching categories from:', CategoryService.getCategories);
      const result = await CategoryService.getCategories();
      console.log('✅ Categories API result:', result);
      console.log('✅ Categories data:', result?.data);
      return result;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });





  // Auto-select company for Editor users
  useEffect(() => {
    console.log('🔍 StockCardForm - Auto-select company effect triggered');
    console.log('🔍 StockCardForm - isAdminUser:', isAdminUser);
    console.log('🔍 StockCardForm - user:', user);
    console.log('🔍 StockCardForm - companiesResponse:', companiesResponse);
    console.log('🔍 StockCardForm - companiesResponse?.data:', companiesResponse?.data);
    console.log('🔍 StockCardForm - companiesResponse?.data?.length:', companiesResponse?.data?.length);
    console.log('🔍 StockCardForm - formData.companyId:', formData.companyId);
    
    if (!isAdminUser && user && companiesResponse?.data?.length && companiesResponse.data.length > 0) {
      const userCompanyId = getCompanyId();
      console.log('🔍 StockCardForm - userCompanyId from token:', userCompanyId);
      
      if (userCompanyId && formData.companyId === undefined) {
        console.log('✅ StockCardForm - Auto-selecting company for Editor:', userCompanyId);
        setFormData(prev => ({ ...prev, companyId: userCompanyId }));
      } else {
        console.log('⚠️ StockCardForm - Not auto-selecting company:', { userCompanyId, 'formData.companyId': formData.companyId });
      }
    } else {
      console.log('⚠️ StockCardForm - Auto-select conditions not met:', {
        isAdminUser,
        hasUser: !!user,
        hasCompaniesData: !!companiesResponse?.data,
        companiesDataLength: companiesResponse?.data?.length,
        formDataCompanyId: formData.companyId
      });
    }
  }, [isAdminUser, user, companiesResponse, getCompanyId, formData.companyId]);

  // Data processing
  const companies = companiesResponse?.data || [];
  const branches = branchesResponse?.data || [];
  const mainGroups = mainGroupsResponse?.data || [];
  const subGroups = subGroupsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Filter branches by selected company
  const filteredBranches = branches.filter(branch => branch.companyId === formData.companyId);

  // Filter categories by selected branch
  const filteredCategories = categories.filter(category => category.branchId === formData.branchId);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Cascade updates
    if (field === 'companyId') {
      setFormData(prev => ({
        ...prev,
        companyId: value,
        branchId: undefined, // Reset branch selection
        mainGroupId: undefined, // Reset main group selection
        subGroupId: undefined, // Reset sub group selection
        categoryId: undefined, // Reset category selection
      }));
    } else if (field === 'branchId') {
      setFormData(prev => ({
        ...prev,
        branchId: value,
        mainGroupId: undefined, // Reset main group selection
        subGroupId: undefined, // Reset sub group selection
        categoryId: undefined, // Reset category selection
      }));
    } else if (field === 'mainGroupId') {
      setFormData(prev => ({
        ...prev,
        mainGroupId: value,
        subGroupId: undefined, // Reset sub group selection
        categoryId: undefined, // Reset category selection
      }));
    } else if (field === 'subGroupId') {
      setFormData(prev => ({
        ...prev,
        subGroupId: value,
        categoryId: undefined, // Reset category selection
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Stok kartı adı gereklidir';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Stok kartı kodu gereklidir';
    }
    if (formData.tax < 0 || formData.tax > 100) {
      newErrors.tax = 'Vergi oranı 0-100 arasında olmalıdır';
    }

    // Optional fields - artık zorunlu değil
    // if (!formData.companyId) {
    //   newErrors.companyId = 'Şirket seçimi gereklidir';
    // }
    // if (!formData.branchId) {
    //   newErrors.branchId = 'Şube seçimi gereklidir';
    // }
    // if (!formData.mainGroupId) {
    //   newErrors.mainGroupId = 'Ana grup seçimi gereklidir';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Form submit - formData:', JSON.stringify(formData, null, 2));
    console.log('🔍 Form validation result:', validateForm());
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {/* Basic Information */}
        <TextField
          fullWidth
          label="Stok Kartı Adı"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="Stok Kartı Kodu"
          value={formData.code}
          onChange={(e) => handleInputChange('code', e.target.value)}
          error={!!errors.code}
          helperText={errors.code}
          disabled={isLoading}
        />

        <FormControl fullWidth error={!!errors.type}>
          <InputLabel>Stok Kartı Tipi</InputLabel>
          <Select
            value={formData.type}
            label="Stok Kartı Tipi"
            onChange={(e) => handleInputChange('type', e.target.value)}
            disabled={isLoading}
          >
            {stockCardTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Birim</InputLabel>
          <Select
            value={formData.unit}
            label="Birim"
            onChange={(e) => handleInputChange('unit', e.target.value)}
            disabled={isLoading}
          >
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Vergi Oranı (%)"
          type="number"
          value={formData.tax}
          onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
          error={!!errors.tax}
          helperText={errors.tax}
          disabled={isLoading}
          inputProps={{ min: 0, max: 100, step: 0.01 }}
        />

        <Box /> {/* Empty box for grid alignment */}

        <Divider sx={{ gridColumn: '1 / -1' }} />

        {/* Company and Branch Selection */}
        <FormControl fullWidth error={!!errors.companyId}>
          <InputLabel>Şirket</InputLabel>
          <Select
            value={formData.companyId || ''}
            label="Şirket"
            onChange={(e) => handleInputChange('companyId', e.target.value || undefined)}
            disabled={isLoading || companiesLoading}
          >
            <MenuItem value="">
              <em>Şirket Seçiniz</em>
            </MenuItem>
            {companiesLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Yükleniyor...
              </MenuItem>
            ) : companiesError ? (
              <MenuItem disabled>
                Hata: Şirketler yüklenemedi ({companiesError.message})
              </MenuItem>
            ) : companies.length === 0 ? (
              <MenuItem disabled>
                Hiç şirket bulunamadı
              </MenuItem>
            ) : (
              companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.companyId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {errors.companyId}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth error={!!errors.branchId}>
          <InputLabel>Şube</InputLabel>
          <Select
            value={formData.branchId || ''}
            label="Şube"
            onChange={(e) => handleInputChange('branchId', e.target.value || undefined)}
            disabled={isLoading || !formData.companyId || branchesLoading}
          >
            <MenuItem value="">
              <em>Şube Seçiniz</em>
            </MenuItem>
            {branchesLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Yükleniyor...
              </MenuItem>
            ) : branchesError ? (
              <MenuItem disabled>
                Hata: Şubeler yüklenemedi ({branchesError.message})
              </MenuItem>
            ) : filteredBranches.length === 0 ? (
              <MenuItem disabled>
                {formData.companyId ? 'Bu şirkete ait şube bulunamadı' : 'Önce şirket seçiniz'}
              </MenuItem>
            ) : (
              filteredBranches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.branchId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {errors.branchId}
            </Typography>
          )}
        </FormControl>

        <Divider sx={{ gridColumn: '1 / -1' }} />

        {/* Category Selection */}
        <FormControl fullWidth error={!!errors.mainGroupId}>
          <InputLabel>Ana Grup</InputLabel>
          <Select
            value={formData.mainGroupId || ''}
            label="Ana Grup"
            onChange={(e) => handleInputChange('mainGroupId', e.target.value || undefined)}
            disabled={isLoading || !formData.branchId || mainGroupsLoading}
          >
            <MenuItem value="">
              <em>Ana Grup Seçiniz</em>
            </MenuItem>
            {mainGroupsLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Yükleniyor...
              </MenuItem>
            ) : mainGroupsError ? (
              <MenuItem disabled>
                Hata: Ana gruplar yüklenemedi
              </MenuItem>
            ) : (
              mainGroups.map((mainGroup) => (
                <MenuItem key={mainGroup.id} value={mainGroup.id}>
                  {mainGroup.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.mainGroupId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {errors.mainGroupId}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Alt Grup</InputLabel>
          <Select
            value={formData.subGroupId || ''}
            label="Alt Grup"
            onChange={(e) => handleInputChange('subGroupId', e.target.value || undefined)}
            disabled={isLoading || !formData.mainGroupId || subGroupsLoading}
          >
            <MenuItem value="">
              <em>Alt Grup Seçiniz</em>
            </MenuItem>
            {subGroupsLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Yükleniyor...
              </MenuItem>
            ) : subGroupsError ? (
              <MenuItem disabled>
                Hata: Alt gruplar yüklenemedi
              </MenuItem>
            ) : (
              subGroups.map((subGroup) => (
                <MenuItem key={subGroup.id} value={subGroup.id}>
                  {subGroup.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={formData.categoryId || ''}
            label="Kategori"
            onChange={(e) => handleInputChange('categoryId', e.target.value || undefined)}
            disabled={isLoading || !formData.branchId || categoriesLoading}
          >
            <MenuItem value="">
              <em>Kategori Seçiniz</em>
            </MenuItem>
            {categoriesLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Yükleniyor...
              </MenuItem>
            ) : categoriesError ? (
              <MenuItem disabled>
                Hata: Kategoriler yüklenemedi
              </MenuItem>
            ) : (
              filteredCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Box /> {/* Empty box for grid alignment */}
      </Box>

      {/* Submit Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Iconify icon="mingcute:add-line" />}
        >
          {isLoading ? 'Kaydediliyor...' : (editMode ? 'Güncelle' : 'Kaydet')}
        </Button>
      </Box>
    </Box>
  );
} 