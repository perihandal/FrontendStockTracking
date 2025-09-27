import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { CategoryService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

import type { MainGroupFormProps, CreateMainGroupFormData, UpdateMainGroupFormData } from './groups.types';

// Form data interface
interface MainGroupFormData {
  code: string;
  name: string;
  isActive: boolean;
}

// Validation functions
const validateForm = (data: MainGroupFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.code || data.code.length < 2) {
    errors.push('Ana grup kodu en az 2 karakter olmalıdır');
  }
  if (data.code && data.code.length > 50) {
    errors.push('Ana grup kodu en fazla 50 karakter olabilir');
  }
  if (data.code && !/^[A-Za-z0-9_-]+$/.test(data.code)) {
    errors.push('Ana grup kodu yalnızca harf, rakam, alt çizgi ve tire içerebilir');
  }
  
  if (!data.name || data.name.length < 3) {
    errors.push('Ana grup ismi en az 3 karakter olmalıdır');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Ana grup ismi en fazla 100 karakter olabilir');
  }
  
  return errors;
};

export function MainGroupForm({ open, onClose, onSuccess, mainGroup, isEdit = false }: MainGroupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MainGroupFormData>({
    code: '',
    name: '',
    isActive: true,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<MainGroupFormData>>({});

  // Set form values when editing
  useEffect(() => {
    if (isEdit && mainGroup) {
      setFormData({
        code: mainGroup.code,
        name: mainGroup.name,
        isActive: mainGroup.isActive,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        isActive: true,
      });
    }
    setFieldErrors({});
    setError(null);
  }, [isEdit, mainGroup]);

  const handleInputChange = (field: keyof MainGroupFormData, value: string | boolean) => {
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

      if (isEdit && mainGroup) {
        const updateData: UpdateMainGroupFormData = {
          code: formData.code,
          name: formData.name,
          userId,
          isActive: formData.isActive,
        };
        
        console.log('🔄 Updating main group:', mainGroup.id, updateData);
        
        const response = await CategoryService.updateMainGroup(mainGroup.id, updateData as any);
        console.log('📋 Update response:', response);
        
        // Backend'inizin response formatını kontrol et - daha esnek kontrol
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
          setError(response.errorMessage || 'Ana grup güncellenirken hata oluştu');
        }
      } else {
        const createData: CreateMainGroupFormData = {
          code: formData.code,
          name: formData.name,
          userId,
          isActive: formData.isActive,
        };
        
        console.log('➕ Creating main group:', createData);
        const response = await CategoryService.createMainGroup(createData);
        console.log('📋 Create response:', response);
        
        // Backend'inizin response formatını kontrol et - daha esnek kontrol
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
          setError(response.errorMessage || 'Ana grup oluşturulurken hata oluştu');
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
          {isEdit ? 'Ana Grup Düzenle' : 'Yeni Ana Grup'}
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
              label="Ana Grup Kodu"
              fullWidth
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
            />

            <TextField
              label="Ana Grup Adı"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
            />

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
