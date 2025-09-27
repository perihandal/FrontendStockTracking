import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { PriceType, Currency, getPriceTypeLabel, getCurrencyLabel, getCurrencySymbol } from './prices.types';

import type { PriceDefinition } from './prices.types';

interface PriceDefinitionTableRowProps {
  priceDefinition: PriceDefinition;
  onEdit: (priceDefinition: PriceDefinition) => void;
  onDelete: (id: number) => void;
  onView: (priceDefinition: PriceDefinition) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function PriceDefinitionTableRow({
  priceDefinition,
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR');

  const formatPrice = (price: number, currency: number) => `${price.toFixed(2)} ${getCurrencySymbol(currency)}`;

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
          <Tooltip title="Detayları Görüntüle">
            <IconButton
              size="small"
              onClick={() => onView(priceDefinition)}
              sx={{ color: theme.palette.info.main }}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
          
          {canEdit && (
            <Tooltip title="Düzenle">
              <IconButton
                size="small"
                onClick={() => onEdit(priceDefinition)}
                sx={{ color: theme.palette.primary.main }}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}
          
          {canDelete && (
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
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
