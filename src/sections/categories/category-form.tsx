import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { CategoryService, CompanyService } from 'src/services/api';
import type { CategoryFormProps, CreateCategoryFormData, UpdateCategoryFormData } from './category.types';

// Form data interface
interface CategoryFormData {
  code: string;
  name: string;
  branchId: number;
  companyId: number;
  isActive: boolean;
}

// Validation functions
const validateForm = (data: CategoryFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.code || data.code.length < 2) {
    errors.push('Kategori kodu en az 2 karakter olmalıdır');
  }
  if (data.code && data.code.length > 50) {
    errors.push('Kategori kodu en fazla 50 karakter olabilir');
  }
  if (data.code && !/^[A-Za-z0-9_-]+$/.test(data.code)) {
    errors.push('Kategori kodu yalnızca harf, rakam, alt çizgi ve tire içerebilir');
  }
  
  if (!data.name || data.name.length < 3) {
    errors.push('Kategori ismi en az 3 karakter olmalıdır');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Kategori ismi en fazla 100 karakter olabilir');
  }
  
  if (!data.companyId || data.companyId <= 0) {
    errors.push('Şirket seçimi gereklidir');
  }
  
  if (!data.branchId || data.branchId <= 0) {
    errors.push('Şube seçimi gereklidir');
  }
  
  return errors;
};

export function CategoryForm({ open, onClose, onSuccess, category, isEdit = false }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    code: '',
    name: '',
    branchId: 0,
    companyId: 0,
    isActive: true,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<CategoryFormData>>({});

  // Load companies and branches
  useEffect(() => {
    if (open) {
      loadCompanies();
    }
  }, [open]);

  // Load branches when company changes
  useEffect(() => {
    if (formData.companyId && formData.companyId > 0) {
      loadBranches(formData.companyId);
    } else {
      setBranches([]);
      setFormData(prev => ({ ...prev, branchId: 0 }));
    }
  }, [formData.companyId]);

  // Set form values when editing
  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        code: category.code,
        name: category.name,
        companyId: category.companyId,
        branchId: category.branchId,
        isActive: category.isActive,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        branchId: 0,
        companyId: 0,
        isActive: true,
      });
    }
    setFieldErrors({});
    setError(null);
  }, [isEdit, category]);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await CompanyService.getCompanies();
      if (response.data && !response.errorMessage) {
        setCompanies(response.data);
      } else {
        setError(Array.isArray(response.errorMessage) ? response.errorMessage.join(', ') : response.errorMessage || 'Şirketler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('Şirketler yüklenirken hata oluştu');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadBranches = async (companyId: number) => {
    setLoadingBranches(true);
    try {
      const response = await CompanyService.getBranchesByCompany(companyId);
      if (response.data && !response.errorMessage) {
        setBranches(response.data);
      } else {
        setError(Array.isArray(response.errorMessage) ? response.errorMessage.join(', ') : response.errorMessage || 'Şubeler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error loading branches:', err);
      setError('Şubeler yüklenirken hata oluştu');
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const userId = parseInt(localStorage.getItem('userId') || '1', 10);
      const token = localStorage.getItem('accessToken');
      
      console.log('🔑 User ID:', userId);
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      if (isEdit && category) {
        const updateData: UpdateCategoryFormData = {
          code: formData.code,
          name: formData.name,
          branchId: formData.branchId,
          companyId: formData.companyId,
          userId,
          isActive: formData.isActive,
        };
        
        console.log('🔄 Updating category:', category.id, updateData);
        console.log('🔄 Request URL:', `PUT /api/Category?id=${category.id}`);
        console.log('🔄 Request Headers:', {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : 'No token'
        });
        
        const response = await CategoryService.updateCategory(category.id, updateData as any);
        console.log('📋 Update response:', response);
        console.log('📋 Response data:', response.data);
        console.log('📋 Response errorMessage:', response.errorMessage);
        console.log('📋 Response success check:', response.data && !response.errorMessage);
        
        // Backend'inizin response formatını kontrol et - daha esnek kontrol
        // HTTP 200 status code alındıysa ve errorMessage yoksa başarılı sayılır
        const isSuccess = !response.errorMessage || 
                         response.errorMessage === null ||
                         response.errorMessage === '' ||
                         (response.data && !response.errorMessage) ||
                         (response.data === null && !response.errorMessage);
        
        if (isSuccess) {
          console.log('✅ Update successful');
          onSuccess();
          onClose();
        } else {
          console.log('❌ Update failed:', response.errorMessage);
          setError(response.errorMessage || 'Kategori güncellenirken hata oluştu');
        }
      } else {
        const createData: CreateCategoryFormData = {
          code: formData.code,
          name: formData.name,
          branchId: formData.branchId,
          companyId: formData.companyId,
          userId,
          isActive: formData.isActive,
        };
        
        console.log('➕ Creating category:', createData);
        const response = await CategoryService.createCategory(createData);
        console.log('📋 Create response:', response);
        console.log('📋 Create response data:', response.data);
        console.log('📋 Create response errorMessage:', response.errorMessage);
        
        // Backend'inizin response formatını kontrol et - daha esnek kontrol
        // HTTP 200 status code alındıysa ve errorMessage yoksa başarılı sayılır
        const isCreateSuccess = !response.errorMessage || 
                               response.errorMessage === null ||
                               response.errorMessage === '' ||
                               (response.data && !response.errorMessage) ||
                               (response.data === null && !response.errorMessage);
        
        if (isCreateSuccess) {
          console.log('✅ Create successful');
          onSuccess();
          onClose();
        } else {
          console.log('❌ Create failed:', response.errorMessage);
          setError(response.errorMessage || 'Kategori oluşturulurken hata oluştu');
        }
      }
    } catch (err: any) {
      console.error('❌ Error submitting form:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      
      // Backend'inizin error formatına göre hata mesajını al
      const errorMessage = err.response?.data?.errorMessage || 
                          err.response?.data?.message || 
                          err.message || 
                          'Bir hata oluştu';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        code: '',
        name: '',
        branchId: 0,
        companyId: 0,
        isActive: true,
      });
      setFieldErrors({});
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Iconify 
            icon={isEdit ? "solar:pen-bold" : "mingcute:add-line"} 
            sx={{ mr: 1 }} 
          />
          {isEdit ? 'Kategori Düzenle' : 'Yeni Kategori'}
        </Box>
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              label="Kategori Kodu"
              fullWidth
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
            />

            <TextField
              label="Kategori Adı"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
            />

            <FormControl fullWidth disabled={loadingCompanies || loading}>
              <InputLabel>Şirket</InputLabel>
              <Select
                label="Şirket"
                value={formData.companyId || ''}
                onChange={(e) => handleInputChange('companyId', e.target.value as number)}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={loadingBranches || loading || !formData.companyId}>
              <InputLabel>Şube</InputLabel>
              <Select
                label="Şube"
                value={formData.branchId > 0 ? formData.branchId : ''}
                onChange={(e) => handleInputChange('branchId', e.target.value as number)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Aktif Durumu"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
