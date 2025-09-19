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
import { CategoryService } from 'src/services/api';
import { useAuthContext } from 'src/contexts/auth-context';
import type { SubGroupFormProps, CreateSubGroupFormData, UpdateSubGroupFormData, MainGroup } from './groups.types';

// Form data interface
interface SubGroupFormData {
  code: string;
  name: string;
  mainGroupId: number;
  isActive: boolean;
}

// Validation functions
const validateForm = (data: SubGroupFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.code || data.code.length < 2) {
    errors.push('Alt grup kodu en az 2 karakter olmalıdır');
  }
  if (data.code && data.code.length > 50) {
    errors.push('Alt grup kodu en fazla 50 karakter olabilir');
  }
  if (data.code && !/^[A-Za-z0-9_-]+$/.test(data.code)) {
    errors.push('Alt grup kodu yalnızca harf, rakam, alt çizgi ve tire içerebilir');
  }
  
  if (!data.name || data.name.length < 3) {
    errors.push('Alt grup ismi en az 3 karakter olmalıdır');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Alt grup ismi en fazla 100 karakter olabilir');
  }
  
  if (!data.mainGroupId || data.mainGroupId <= 0) {
    errors.push('Ana grup seçimi gereklidir');
  }
  
  return errors;
};

export function SubGroupForm({ open, onClose, onSuccess, subGroup, isEdit = false }: SubGroupFormProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [loadingMainGroups, setLoadingMainGroups] = useState(false);
  
  const [formData, setFormData] = useState<SubGroupFormData>({
    code: '',
    name: '',
    mainGroupId: 0,
    isActive: true,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<SubGroupFormData>>({});

  // Load main groups when dialog opens
  useEffect(() => {
    if (open) {
      loadMainGroups();
    }
  }, [open]);

  // Set form values when editing
  useEffect(() => {
    if (isEdit && subGroup) {
      setFormData({
        code: subGroup.code,
        name: subGroup.name,
        mainGroupId: subGroup.mainGroupId,
        isActive: subGroup.isActive,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        mainGroupId: 0,
        isActive: true,
      });
    }
    setFieldErrors({});
    setError(null);
  }, [isEdit, subGroup]);

  const loadMainGroups = async () => {
    setLoadingMainGroups(true);
    setError(null);
    
    try {
      console.log('🔄 Loading main groups...');
      const response = await CategoryService.getMainGroups();
      console.log('📋 Main groups response:', response);
      
      if (response.data && !response.errorMessage) {
        // Backend'den gelen veriyi frontend formatına çevir
        const formattedMainGroups: MainGroup[] = response.data.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          isActive: item.isActive,
          userId: item.userId || 1,
          userName: user?.fullName || 'Sistem Kullanıcısı',
        }));
        
        console.log('✅ Formatted main groups:', formattedMainGroups);
        setMainGroups(formattedMainGroups);
      } else {
        const errorMsg = Array.isArray(response.errorMessage) 
          ? response.errorMessage.join(', ') 
          : response.errorMessage || 'Ana gruplar yüklenirken hata oluştu';
        
        console.log('❌ Main groups error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ Error loading main groups:', err);
      console.error('❌ Error response:', err.response);
      
      const errorMessage = err.response?.data?.errorMessage || 
                          err.response?.data?.message || 
                          err.message || 
                          'Ana gruplar yüklenirken hata oluştu';
      
      setError(errorMessage);
    } finally {
      setLoadingMainGroups(false);
    }
  };

  const handleInputChange = (field: keyof SubGroupFormData, value: string | number | boolean) => {
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
      const userId = user?.id || parseInt(localStorage.getItem('userId') || '1', 10);
      const token = localStorage.getItem('accessToken');
      
      console.log('🔑 User ID:', userId);
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      if (isEdit && subGroup) {
        const updateData: UpdateSubGroupFormData = {
          code: formData.code,
          name: formData.name,
          userId,
          isActive: formData.isActive,
          mainGroupId: formData.mainGroupId,
        };
        
        console.log('🔄 Updating sub group:', subGroup.id, updateData);
        
        const response = await CategoryService.updateSubGroup(subGroup.id, updateData as any);
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
          setError(response.errorMessage || 'Alt grup güncellenirken hata oluştu');
        }
      } else {
        const createData: CreateSubGroupFormData = {
          code: formData.code,
          name: formData.name,
          userId,
          isActive: formData.isActive,
          mainGroupId: formData.mainGroupId,
        };
        
        console.log('➕ Creating sub group:', createData);
        const response = await CategoryService.createSubGroup(createData);
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
          setError(response.errorMessage || 'Alt grup oluşturulurken hata oluştu');
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
        mainGroupId: 0,
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
          {isEdit ? 'Alt Grup Düzenle' : 'Yeni Alt Grup'}
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
              label="Alt Grup Kodu"
              fullWidth
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
            />

            <TextField
              label="Alt Grup Adı"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
            />

            <FormControl fullWidth disabled={loadingMainGroups || loading}>
              <InputLabel>Ana Grup</InputLabel>
              <Select
                label="Ana Grup"
                value={formData.mainGroupId > 0 ? formData.mainGroupId : ''}
                onChange={(e) => handleInputChange('mainGroupId', e.target.value as number)}
              >
                {loadingMainGroups ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      Ana gruplar yükleniyor...
                    </Box>
                  </MenuItem>
                ) : mainGroups.length === 0 ? (
                  <MenuItem disabled>Ana grup bulunamadı</MenuItem>
                ) : (
                  mainGroups.map((mainGroup) => (
                    <MenuItem key={mainGroup.id} value={mainGroup.id}>
                      {mainGroup.name}
                    </MenuItem>
                  ))
                )}
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
