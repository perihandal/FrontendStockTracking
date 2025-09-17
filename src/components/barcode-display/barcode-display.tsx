import JsBarcode from 'jsbarcode';
import QRCode from 'react-qr-code';
import React, { useEffect, useRef } from 'react';

import { Box, Paper, Typography, Stack, Button } from '@mui/material';

import { printBarcode } from 'src/utils/print-utils';

import { BarcodeType, BarcodeTypeLabels } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type BarcodeDisplayProps = {
  barcodeCode: string;
  barcodeType: BarcodeType;
  stockCardName?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  onPrint?: () => void;
};

export function BarcodeDisplay({
  barcodeCode,
  barcodeType,
  stockCardName,
  showLabel = true,
  size = 'medium',
  onPrint,
}: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 200, height: 80, fontSize: 12 };
      case 'large':
        return { width: 400, height: 160, fontSize: 16 };
      default:
        return { width: 300, height: 120, fontSize: 14 };
    }
  };

  const { width, height, fontSize } = getSizeConfig();

  useEffect(() => {
    if (barcodeRef.current && barcodeType !== BarcodeType.QRCode && barcodeType !== BarcodeType.DataMatrix) {
      try {
        JsBarcode(barcodeRef.current, barcodeCode, {
          format: getJsBarcodeFormat(barcodeType),
          width: width / 100,
          height: height / 3,
          displayValue: true,
          fontSize: fontSize - 2,
          margin: 10,
        });
      } catch (error) {
        console.error('Barkod oluşturma hatası:', error);
      }
    }
  }, [barcodeCode, barcodeType, width, height, fontSize]);

  const getJsBarcodeFormat = (type: BarcodeType): string => {
    const formatMap: Record<BarcodeType, string> = {
      [BarcodeType.EAN13]: 'EAN13',
      [BarcodeType.UPC_A]: 'UPC',
      [BarcodeType.Code128]: 'CODE128',
      [BarcodeType.EAN8]: 'EAN8',
      [BarcodeType.ITF14]: 'ITF14',
      [BarcodeType.ISBN]: 'EAN13',
      [BarcodeType.QRCode]: 'QR',
      [BarcodeType.DataMatrix]: 'DATAMATRIX',
    };
    return formatMap[type] || 'CODE128';
  };

  const renderBarcode = () => {
    if (barcodeType === BarcodeType.QRCode || barcodeType === BarcodeType.DataMatrix) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <QRCode
            value={barcodeCode}
            size={Math.min(width, height)}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <svg
          ref={barcodeRef}
          width={width}
          height={height}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
    );
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        textAlign: 'center',
        minWidth: width + 40,
        maxWidth: '100%'
      }}
    >
      <Stack spacing={2} alignItems="center">
        {showLabel && (
          <Box>
            <Typography variant="h6" color="primary" gutterBottom>
              {BarcodeTypeLabels[barcodeType]}
            </Typography>
            {stockCardName && (
              <Typography variant="body2" color="text.secondary">
                {stockCardName}
              </Typography>
            )}
          </Box>
        )}

        {renderBarcode()}

        <Box sx={{ wordBreak: 'break-all' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: 'monospace',
              fontSize: fontSize - 4,
              color: 'text.secondary'
            }}
          >
            {barcodeCode}
          </Typography>
        </Box>

        {onPrint && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="eva:search-fill" />}
            onClick={onPrint}
          >
            Yazdır
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

// Barkod önizleme modal komponenti
type BarcodePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  barcodeCode: string;
  barcodeType: BarcodeType;
  stockCardName?: string;
  title?: string;
};

export function BarcodePreviewModal({
  open,
  onClose,
  barcodeCode,
  barcodeType,
  stockCardName,
  title = 'Barkod Önizleme',
}: BarcodePreviewModalProps) {
  const handlePrint = () => {
    printBarcode(
      barcodeCode,
      BarcodeTypeLabels[barcodeType],
      stockCardName,
      {
        title: 'Barkod Etiketi',
        size: 'large',
        showDate: true,
        showCode: true,
      }
    );
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          p: 3,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" textAlign="center">
            {title}
          </Typography>

          <BarcodeDisplay
            barcodeCode={barcodeCode}
            barcodeType={barcodeType}
            stockCardName={stockCardName}
            size="large"
            onPrint={handlePrint}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:search-fill" />}
              onClick={handlePrint}
            >
              Yazdır
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
            >
              Kapat
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
