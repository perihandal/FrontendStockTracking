import { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

import type { PriceDefinition } from './prices.types';
import { PriceType, Currency, getPriceTypeLabel, getCurrencyLabel, getCurrencySymbol } from './prices.types';

interface PriceDefinitionTableRowProps {
  priceDefinition: PriceDefinition;
  onEdit: (priceDefinition: PriceDefinition) => void;
  onDelete: (id: number) => void;
}

export function PriceDefinitionTableRow({
  priceDefinition,
  onEdit,
  onDelete,
}: PriceDefinitionTableRowProps) {
  const theme = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Bu fiyat tanımını silmek istediğinizden emin misiniz?')) {
      setIsDeleting(true);
      try {
        await onDelete(priceDefinition.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatPrice = (price: number, currency: number) => {
    return `${price.toFixed(2)} ${getCurrencySymbol(currency)}`;
  };

  return (
    <TableRow hover>
      <TableCell>{priceDefinition.stockCardName}</TableCell>
      
      <TableCell>
        <Chip
          label={getPriceTypeLabel(priceDefinition.priceType)}
          size="small"
          color={priceDefinition.priceType === 1 ? 'primary' : 
                 priceDefinition.priceType === 2 ? 'success' : 
                 priceDefinition.priceType === 3 ? 'warning' : 'default'}
        />
      </TableCell>
      
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span>{formatPrice(priceDefinition.price, priceDefinition.currency)}</span>
          <Chip
            label={getCurrencyLabel(priceDefinition.currency)}
            size="small"
            variant="outlined"
          />
        </Stack>
      </TableCell>
      
      <TableCell>{formatDate(priceDefinition.validFrom)}</TableCell>
      
      <TableCell>
        {priceDefinition.validTo ? formatDate(priceDefinition.validTo) : 'Süresiz'}
      </TableCell>
      
      <TableCell>
        <Chip
          label={priceDefinition.isActive ? 'Aktif' : 'Pasif'}
          size="small"
          color={priceDefinition.isActive ? 'success' : 'error'}
        />
      </TableCell>
      
      <TableCell>{priceDefinition.userFullName}</TableCell>
      
      <TableCell align="right">
        <Stack direction="row" spacing={1}>
          <Tooltip title="Düzenle">
            <IconButton
              size="small"
              onClick={() => onEdit(priceDefinition)}
              sx={{ color: theme.palette.primary.main }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Sil">
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={isDeleting}
              sx={{ color: theme.palette.error.main }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
