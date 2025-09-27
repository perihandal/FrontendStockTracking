import { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';

import { PriceService } from 'src/services/api';
import { StockService } from 'src/services/api';

import { PriceType, Currency, getPriceTypeLabel, getCurrencyLabel } from './prices.types';

import type {
  PriceDefinition,
  CreatePriceDefinitionFormData,
  UpdatePriceDefinitionFormData,
  PriceDefinitionFormProps,
} from './prices.types';


export function PriceDefinitionForm({
  open,
  onClose,
  onSuccess,
  priceDefinition,
  isEdit = false,
}: PriceDefinitionFormProps) {
  const [formData, setFormData] = useState<CreatePriceDefinitionFormData>({
    priceType: PriceType.Satış,
    price: 0,
    currency: Currency.TRY,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: undefined,
    isActive: true,
    stockCardId: 0,
    userId: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [stockCards, setStockCards] = useState<any[]>([]);
  const [loadingStockCards, setLoadingStockCards] = useState(false);

  // Load stock cards on component mount
  useEffect(() => {
    if (open) {
      loadStockCards();
    }
  }, [open]);

  // Set form data when editing
  useEffect(() => {
    if (isEdit && priceDefinition) {
      setFormData({
        priceType: priceDefinition.priceType,
        price: priceDefinition.price,
        currency: priceDefinition.currency,
        validFrom: priceDefinition.validFrom.split('T')[0],
        validTo: priceDefinition.validTo ? priceDefinition.validTo.split('T')[0] : undefined,
        isActive: priceDefinition.isActive,
        stockCardId: priceDefinition.stockCardId,
        userId: priceDefinition.userId,
      });
    } else if (!isEdit) {
      // Reset form for create
      setFormData({
        priceType: PriceType.Satış,
        price: 0,
        currency: Currency.TRY,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: undefined,
        isActive: true,
        stockCardId: 0,
        userId: 1,
      });
    }
  }, [isEdit, priceDefinition, open]);

  const loadStockCards = async () => {
    setLoadingStockCards(true);
    try {
      const response = await StockService.getStockCards();
      if (response.data && response.success) {
        setStockCards(response.data);
      } else {
        console.error('Error loading stock cards:', response.errors);
      }
    } catch (err) {
      console.error('Error loading stock cards:', err);
    } finally {
      setLoadingStockCards(false);
    }
  };

  const handleInputChange = (field: keyof CreatePriceDefinitionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.priceType) {
      newErrors.priceType = 'Fiyat tipi gereklidir';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Fiyat 0\'dan büyük olmalıdır';
    }

    if (!formData.currency) {
      newErrors.currency = 'Para birimi gereklidir';
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Geçerlilik başlangıç tarihi gereklidir';
    }

    if (formData.stockCardId === 0) {
      newErrors.stockCardId = 'Stok kartı seçimi gereklidir';
    }

    if (formData.validTo && formData.validFrom && formData.validTo < formData.validFrom) {
      newErrors.validTo = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setErrors({ general: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.' });
        return;
      }

      if (isEdit && priceDefinition) {
        const updateData: UpdatePriceDefinitionFormData = {
          priceType: formData.priceType,
          price: formData.price,
          currency: formData.currency,
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          isActive: formData.isActive,
          userId: formData.userId,
        };

        console.log('🔄 Updating price definition:', priceDefinition.id, updateData);
        const response = await PriceService.updatePriceDefinition(priceDefinition.id, updateData);
        console.log('📋 Update response:', response);
        
        if (!response.errorMessage) {
          console.log('✅ Price definition updated successfully');
          onSuccess();
          handleClose();
        } else {
          console.error('❌ Update failed:', response.errorMessage);
          setErrors({ general: 'Fiyat tanımı güncellenirken hata oluştu' });
        }
      } else {
        const createData: CreatePriceDefinitionFormData = {
          priceType: formData.priceType,
          price: formData.price,
          currency: formData.currency,
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          isActive: formData.isActive,
          stockCardId: formData.stockCardId,
          userId: formData.userId,
        };

        console.log('🔄 Creating price definition:', createData);
        const response = await PriceService.createPriceDefinition(createData);
        
        if (response.data && !response.errorMessage) {
          console.log('✅ Price definition created successfully');
          onSuccess();
          handleClose();
        } else {
          console.error('❌ Create failed:', response.errorMessage);
          setErrors({ general: 'Fiyat tanımı oluşturulurken hata oluştu' });
        }
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setErrors({ general: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      priceType: PriceType.Satış,
      price: 0,
      currency: Currency.TRY,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: undefined,
      isActive: true,
      stockCardId: 0,
      userId: 1,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Fiyat Tanımını Düzenle' : 'Yeni Fiyat Tanımı'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Stock Card Selection */}
            <FormControl fullWidth error={!!errors.stockCardId}>
              <InputLabel>Stok Kartı</InputLabel>
              <Select
                value={formData.stockCardId || ''}
                onChange={(e) => handleInputChange('stockCardId', Number(e.target.value))}
                disabled={isEdit || loadingStockCards}
                label="Stok Kartı"
              >
                {stockCards.map((stockCard) => (
                  <MenuItem key={stockCard.id} value={stockCard.id}>
                    {stockCard.name} ({stockCard.code})
                  </MenuItem>
                ))}
              </Select>
              {errors.stockCardId && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {errors.stockCardId}
                </Box>
              )}
            </FormControl>

            {/* Price Type */}
            <FormControl fullWidth error={!!errors.priceType}>
              <InputLabel>Fiyat Tipi</InputLabel>
              <Select
                value={formData.priceType}
                onChange={(e) => handleInputChange('priceType', e.target.value as PriceType)}
                label="Fiyat Tipi"
              >
                {Object.values(PriceType).filter(value => typeof value === 'number').map((priceType) => (
                  <MenuItem key={priceType} value={priceType}>
                    {getPriceTypeLabel(priceType as PriceType)}
                  </MenuItem>
                ))}
              </Select>
              {errors.priceType && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {errors.priceType}
                </Box>
              )}
            </FormControl>

            {/* Price and Currency */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Fiyat"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0, step: 0.01 }}
              />
              
              <FormControl fullWidth error={!!errors.currency}>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
                  label="Para Birimi"
                >
                  {Object.values(Currency).filter(value => typeof value === 'number').map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {getCurrencyLabel(currency as Currency)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.currency && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.currency}
                  </Box>
                )}
              </FormControl>
            </Box>

            {/* Valid From and To Dates */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Geçerlilik Başlangıcı"
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                error={!!errors.validFrom}
                helperText={errors.validFrom}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Geçerlilik Bitişi (Opsiyonel)"
                type="date"
                value={formData.validTo || ''}
                onChange={(e) => handleInputChange('validTo', e.target.value || undefined)}
                error={!!errors.validTo}
                helperText={errors.validTo}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Active Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  color="primary"
                />
              }
              label="Aktif"
              sx={{ justifyContent: 'flex-start' }}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {isEdit ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
