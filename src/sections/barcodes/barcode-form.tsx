import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CompanyService, BranchService, StockService, BarcodeService, BarcodeType, BarcodeTypeLabels } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type BarcodeFormData = {
  id?: number;
  barcodeCode: string;
  barcodeType: BarcodeType;
  isDefault: boolean;
  stockCardId: string | number;
  branchId: string | number;
  companyId: string | number;
};

type BarcodeFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BarcodeFormData) => void;
  isEditMode?: boolean;
  initialData?: BarcodeFormData;
};

export function BarcodeForm({ 
  open, 
  onClose, 
  onSubmit, 
  isEditMode = false, 
  initialData 
}: BarcodeFormProps) {
  const [formData, setFormData] = useState<BarcodeFormData>({
    barcodeCode: '',
    barcodeType: BarcodeType.EAN13,
    isDefault: false,
    stockCardId: '',
    branchId: '',
    companyId: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);

  // API Queries
  const { data: companiesResult, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      console.log('🔍 BarcodeForm: Fetching companies from API');
      const result = await CompanyService.getCompanies();
      console.log('📊 BarcodeForm: Companies API response:', result);
      return result;
    },
  });

  const { data: branchesResult, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('🔍 BarcodeForm: Fetching branches from API');
      const result = await BranchService.getBranches();
      console.log('📊 BarcodeForm: Branches API response:', result);
      return result;
    },
  });

  const { data: stockCardsResult, isLoading: stockCardsLoading } = useQuery({
    queryKey: ['stock-cards'],
    queryFn: async () => {
      console.log('🔍 BarcodeForm: Fetching stock cards from API');
      const result = await StockService.getStockCards();
      console.log('📊 BarcodeForm: Stock cards API response:', result);
      return result;
    },
  });

  // Seçilen stok kartı için mevcut barkodları çek
  const { data: existingBarcodesResult } = useQuery({
    queryKey: ['existing-barcodes', formData.stockCardId],
    queryFn: async () => {
      if (!formData.stockCardId) return { data: [] };
      console.log('🔍 BarcodeForm: Fetching existing barcodes for stock card:', formData.stockCardId);
      const result = await BarcodeService.getBarcodesByStockCardId(Number(formData.stockCardId));
      console.log('📊 BarcodeForm: Existing barcodes response:', result);
      return result;
    },
    enabled: !!formData.stockCardId,
  });

  const companies = companiesResult?.data || [];
  const allBranches = branchesResult?.data || [];
  const stockCards = stockCardsResult?.data || [];
  const existingBarcodes = existingBarcodesResult?.data || [];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        barcodeCode: '',
        barcodeType: BarcodeType.EAN13,
        isDefault: false,
        stockCardId: 0,
        branchId: 0,
        companyId: 0,
      });
    }
    setErrors({});
  }, [initialData, open]);

  useEffect(() => {
    // Şirket seçildiğinde o şirkete ait şubeleri filtrele
    if (formData.companyId) {
      const branches = allBranches.filter(branch => branch.companyId === formData.companyId);
      setAvailableBranches(branches);
      
      // Eğer seçili şube yeni şirkete ait değilse, şube seçimini sıfırla
      if (formData.branchId && !branches.find(b => b.id === formData.branchId)) {
        setFormData(prev => ({ ...prev, branchId: '' }));
      }
    } else {
      setAvailableBranches([]);
      setFormData(prev => ({ ...prev, branchId: '' }));
    }
  }, [formData.companyId, allBranches]);

  // Şirket bazında stok kartlarını filtrele
  const filteredStockCards = useMemo(() => {
    if (!formData.companyId || !stockCards) {
      return [];
    }

    console.log('🔍 BarcodeForm: Şirket seçildi:', formData.companyId);
    console.log('🔍 BarcodeForm: Tüm stok kartları:', stockCards);
    
    const filteredStockCards = stockCards.filter(stockCard => {
      console.log(`🔍 Stok kartı ${stockCard.name}: companyId=${stockCard.companyId}, seçilen company=${formData.companyId}`);
      // Şirket bazında filtreleme
      return stockCard.companyId === formData.companyId;
    });
    
    console.log('🔍 BarcodeForm: Filtrelenmiş stok kartları:', filteredStockCards);
    return filteredStockCards;
  }, [formData.companyId, stockCards]);

  // Kullanılan barkod türlerini filtrele
  const availableBarcodeTypes = useMemo(() => {
    const usedTypes = existingBarcodes.map((barcode: any) => barcode.barcodeType);
    console.log('🔍 BarcodeForm: Kullanılan barkod türleri:', usedTypes);
    
    const availableTypes = Object.values(BarcodeType).filter(value => 
      typeof value === 'number' && !usedTypes.includes(value)
    );
    
    console.log('🔍 BarcodeForm: Kullanılabilir barkod türleri:', availableTypes);
    return availableTypes;
  }, [existingBarcodes]);

  // Stok kartı seçimi temizleme
  useEffect(() => {
    if (!formData.companyId) {
      setFormData(prev => ({ ...prev, stockCardId: '' }));
    }
  }, [formData.companyId]);

  // Stok kartı değiştiğinde barkod türünü temizle
  useEffect(() => {
    if (formData.stockCardId && availableBarcodeTypes.length > 0) {
      // İlk kullanılabilir türü seç
      const firstAvailableType = availableBarcodeTypes[0] as BarcodeType;
      setFormData(prev => ({ ...prev, barcodeType: firstAvailableType }));
    }
  }, [formData.stockCardId, availableBarcodeTypes]);

  const handleInputChange = (field: keyof BarcodeFormData, value: any) => {
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

    if (!formData.stockCardId) {
      newErrors.stockCardId = 'Stok kartı seçimi gereklidir';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Şirket seçimi gereklidir';
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Şube seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getBarcodeTypeExample = (type: BarcodeType): string => {
    const examples: Record<BarcodeType, string> = {
      [BarcodeType.EAN13]: '1234567890123',
      [BarcodeType.UPC_A]: '123456789012',
      [BarcodeType.QRCode]: '{"stockId":123,"companyId":1}',
      [BarcodeType.Code128]: 'C0001S00000123',
      [BarcodeType.EAN8]: '12345678',
      [BarcodeType.ITF14]: '01234567890123',
      [BarcodeType.ISBN]: '9781234567890',
      [BarcodeType.DataMatrix]: 'DM0001S00000123'
    };
    return examples[type] || '';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mingcute:add-line" />
          <Typography variant="h6">
            {isEditMode ? 'Barkod Düzenle' : 'Yeni Barkod Oluştur'}
          </Typography>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {/* Barkod Bilgileri */}
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Barkod Bilgileri
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth error={!!errors.barcodeType}>
                  <InputLabel>Barkod Türü</InputLabel>
                  <Select
                    value={formData.barcodeType}
                    onChange={(e) => handleInputChange('barcodeType', e.target.value)}
                    label="Barkod Türü"
                    disabled={availableBarcodeTypes.length === 0}
                  >
                    {availableBarcodeTypes.length === 0 ? (
                      <MenuItem disabled>Bu stok kartı için tüm barkod türleri kullanılmış</MenuItem>
                    ) : (
                      availableBarcodeTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {BarcodeTypeLabels[type as BarcodeType]}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.barcodeType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.barcodeType}
                    </Typography>
                  )}
                </FormControl>

                {/* Barkod kodu backend tarafından otomatik oluşturulacak */}
                <Alert severity="info">
                  Barkod kodu otomatik oluşturulacaktır. Sadece tür, şirket, şube ve stok kartı seçin.
                </Alert>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    />
                  }
                  label="Varsayılan Barkod"
                />
                {formData.isDefault && (
                  <Alert severity="info">
                    Bu barkod, seçilen stok kartı için varsayılan barkod olarak işaretlenecektir.
                  </Alert>
                )}
              </Stack>
            </Card>

            <Divider />

            {/* İlişkili Bilgiler */}
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                İlişkili Bilgiler
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth error={!!errors.companyId}>
                  <InputLabel>Şirket</InputLabel>
                  <Select
                    value={formData.companyId || ''}
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
                    value={formData.branchId || ''}
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

                <FormControl fullWidth error={!!errors.stockCardId}>
                  <InputLabel>Stok Kartı</InputLabel>
                  <Select
                    value={formData.stockCardId || ''}
                    onChange={(e) => handleInputChange('stockCardId', Number(e.target.value))}
                    label="Stok Kartı"
                    disabled={!formData.companyId || stockCardsLoading}
                  >
                    {stockCardsLoading ? (
                      <MenuItem disabled>Stok kartları yükleniyor...</MenuItem>
                    ) : !formData.companyId ? (
                      <MenuItem disabled>Önce şirket seçin</MenuItem>
                    ) : filteredStockCards.length === 0 ? (
                      <MenuItem disabled>Bu şirkete ait stok kartı bulunamadı</MenuItem>
                    ) : (
                      filteredStockCards.map((stockCard) => (
                        <MenuItem key={stockCard.id} value={stockCard.id}>
                          {stockCard.name} ({stockCard.code})
                          {stockCard.companyId && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              - Şirket ID: {stockCard.companyId}
                            </Typography>
                          )}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.stockCardId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.stockCardId}
                    </Typography>
                  )}
                  {filteredStockCards.length > 0 && !stockCardsLoading && formData.companyId && (
                    <Typography variant="caption" color="info.main" sx={{ mt: 0.5 }}>
                      📋 Seçilen şirkete ait {filteredStockCards.length} stok kartı gösteriliyor.
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </Card>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            İptal
          </Button>
          <Button type="submit" variant="contained">
            {isEditMode ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
