import type { StockCardDto } from 'src/services/api';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { mapEnumToStockCardType } from 'src/utils/stock-card-utils';

import { Iconify } from 'src/components/iconify';

type StockCardsTableRowProps = {
  stockCard: StockCardDto;
  onView: (stockCard: StockCardDto) => void;
  onEdit?: (stockCard: StockCardDto) => void;
  onDelete?: (stockCard: StockCardDto) => void;
};

export function StockCardsTableRow({ 
  stockCard, 
  onView, 
  onEdit, 
  onDelete 
}: StockCardsTableRowProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hammadde':
        return 'primary';
      case 'AraUrun':
        return 'warning';
      case 'NihaiUrun':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <TableRow hover>
      <TableCell>{stockCard.code}</TableCell>
      <TableCell>{stockCard.name}</TableCell>
      <TableCell>
        <Chip
          label={mapEnumToStockCardType(stockCard.type as any)}
          color={getTypeColor(mapEnumToStockCardType(stockCard.type as any))}
          size="small"
        />
      </TableCell>
      <TableCell>{stockCard.unit}</TableCell>
      <TableCell>%{stockCard.tax}</TableCell>
      <TableCell>{stockCard.companyName}</TableCell>
      <TableCell>{stockCard.branchName}</TableCell>
      <TableCell>{stockCard.mainGroupName}</TableCell>
      <TableCell>{stockCard.subGroupName || '-'}</TableCell>
      <TableCell>{stockCard.categoryName || '-'}</TableCell>
      <TableCell>{new Date(stockCard.createdDate).toLocaleDateString('tr-TR')}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => onView(stockCard)}
            title="Görüntüle"
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          {onEdit && (
            <IconButton 
              size="small" 
              color="info"
              onClick={() => onEdit(stockCard)}
              title="Düzenle"
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete(stockCard)}
              title="Sil"
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
} 