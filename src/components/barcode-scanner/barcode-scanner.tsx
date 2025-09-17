import { BrowserMultiFormatReader } from '@zxing/library';
import React, { useState, useRef, useEffect } from 'react';

import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Stack, 
  Alert,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

type BarcodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  allowManualEntry?: boolean;
};

export function BarcodeScanner({
  open,
  onClose,
  onScan,
  title = 'Barkod Tarayıcı',
  allowManualEntry = true,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [hasCamera, setHasCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (open) {
      checkCameraAvailability();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);
      
      if (videoDevices.length === 0) {
        setError('Kamera bulunamadı. Manuel giriş kullanabilirsiniz.');
      }
    } catch (err) {
      console.error('Kamera kontrolü hatası:', err);
      setError('Kamera erişimi kontrol edilemedi.');
      setHasCamera(false);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);
      
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const result = await reader.decodeFromVideoDevice(
        null, // Tüm kameraları dene
        videoRef.current,
        (scanResult, scanError) => {
          if (scanResult) {
            const barcode = scanResult.getText();
            console.log('Tarama sonucu:', barcode);
            onScan(barcode);
            stopScanning();
            onClose();
          }
          
          if (scanError && !((scanError as any).name === 'NotFoundException')) {
            console.error('Tarama hatası:', scanError);
            setError('Barkod taranırken hata oluştu: ' + (scanError as any).message);
          }
        }
      );
    } catch (err) {
      console.error('Tarama başlatma hatası:', err);
      setError('Kamera başlatılamadı: ' + (err as Error).message);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  const handleClose = () => {
    stopScanning();
    setError(null);
    setManualCode('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:eye-bold" />
            <Typography variant="h6">{title}</Typography>
          </Stack>
          <IconButton onClick={handleClose}>
            <Iconify icon="eva:search-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Kamera Görüntüsü */}
          {hasCamera && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Kamera ile Tarama
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 300,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.100',
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  muted
                />
                {!isScanning && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="eva:search-fill" />}
                      onClick={startScanning}
                    >
                      Taramayı Başlat
                    </Button>
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Barkodu kameraya tutun ve otomatik olarak taranacaktır
              </Typography>
            </Box>
          )}

          {/* Manuel Giriş */}
          {allowManualEntry && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Manuel Barkod Girişi
              </Typography>
              <TextField
                fullWidth
                label="Barkod Kodu"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleManualSubmit}
                        disabled={!manualCode.trim()}
                        color="primary"
                      >
                        <Iconify icon="eva:checkmark-fill" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Barkod kodunu manuel olarak girin"
              />
            </Box>
          )}

          {!hasCamera && !allowManualEntry && (
            <Alert severity="warning">
              Kamera bulunamadı ve manuel giriş devre dışı. Lütfen farklı bir yöntem deneyin.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {isScanning && (
          <Button onClick={stopScanning} color="error">
            Taramayı Durdur
          </Button>
        )}
        <Button onClick={handleClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Basit barkod giriş modalı
type BarcodeInputModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (barcode: string) => void;
  title?: string;
  label?: string;
  placeholder?: string;
};

export function BarcodeInputModal({
  open,
  onClose,
  onConfirm,
  title = 'Barkod Girişi',
  label = 'Barkod Kodu',
  placeholder = 'Barkod kodunu girin',
}: BarcodeInputModalProps) {
  const [barcode, setBarcode] = useState('');

  const handleSubmit = () => {
    if (barcode.trim()) {
      onConfirm(barcode.trim());
      setBarcode('');
      onClose();
    }
  };

  const handleClose = () => {
    setBarcode('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:share-bold" />
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label={label}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          autoFocus
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!barcode.trim()}
        >
          Onayla
        </Button>
      </DialogActions>
    </Dialog>
  );
}
