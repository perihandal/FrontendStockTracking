import { useState } from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  Stack,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import type { PriceHistoryDto } from './prices.types';
import { Currency, getCurrencySymbol } from './prices.types';

interface PriceHistoryTableRowProps {
  priceHistory: PriceHistoryDto;
}

export function PriceHistoryTableRow({ priceHistory }: PriceHistoryTableRowProps) {
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ₺`;
  };

  const getPriceChangeColor = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) {
      return theme.palette.error.main; // Kırmızı - artış
    } else if (newPrice < oldPrice) {
      return theme.palette.success.main; // Yeşil - azalış
    } else {
      return theme.palette.text.secondary; // Gri - değişim yok
    }
  };

  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) {
      return '↗'; // Artış
    } else if (newPrice < oldPrice) {
      return '↘'; // Azalış
    } else {
      return '→'; // Değişim yok
    }
  };

  const priceChange = priceHistory.newPrice - priceHistory.oldPrice;
  const priceChangePercent = priceHistory.oldPrice > 0 ? ((priceChange / priceHistory.oldPrice) * 100) : 0;

  return (
    <TableRow hover>
      <TableCell>{priceHistory.stockCardName}</TableCell>
      
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span>{formatPrice(priceHistory.oldPrice)}</span>
          <Chip
            label="Eski"
            size="small"
            variant="outlined"
            color="default"
          />
        </Stack>
      </TableCell>
      
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span>{formatPrice(priceHistory.newPrice)}</span>
          <Chip
            label="Yeni"
            size="small"
            variant="outlined"
            color="primary"
          />
        </Stack>
      </TableCell>
      
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              color: getPriceChangeColor(priceHistory.oldPrice, priceHistory.newPrice),
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span>{getPriceChangeIcon(priceHistory.oldPrice, priceHistory.newPrice)}</span>
            <span>{formatPrice(Math.abs(priceChange))}</span>
            <span>({priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)</span>
          </Box>
        </Stack>
      </TableCell>
      
      <TableCell>
        <Chip
          label={formatDate(priceHistory.changeDate)}
          size="small"
          variant="outlined"
        />
      </TableCell>
    </TableRow>
  );
}
