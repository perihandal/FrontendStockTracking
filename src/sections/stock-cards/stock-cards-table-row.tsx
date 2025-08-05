import type { StockCard } from 'src/types/stock';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

type StockCardsTableRowProps = {
  stockCard: StockCard;
  onView: (stockCard: StockCard) => void;
  onEdit: (stockCard: StockCard) => void;
  onDelete: (stockCard: StockCard) => void;
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
      case 'YarıMamul':
        return 'warning';
      case 'Mamul':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => (isActive ? 'success' : 'error');

  return (
    <TableRow hover>
      <TableCell>{stockCard.code}</TableCell>
      <TableCell>{stockCard.name}</TableCell>
      <TableCell>
        <Chip
          label={stockCard.type}
          color={getTypeColor(stockCard.type)}
          size="small"
        />
      </TableCell>
      <TableCell>{stockCard.unit}</TableCell>
      <TableCell>%{stockCard.tax}</TableCell>
      <TableCell>{stockCard.company.name}</TableCell>
      <TableCell>{stockCard.branch.name}</TableCell>
      <TableCell>{stockCard.mainGroup.name}</TableCell>
      <TableCell>{stockCard.subGroup?.name || '-'}</TableCell>
      <TableCell>{stockCard.category?.name || '-'}</TableCell>
      <TableCell>
        <Chip
          label={stockCard.isActive ? 'Aktif' : 'Pasif'}
          color={getStatusColor(stockCard.isActive)}
          size="small"
        />
      </TableCell>
      <TableCell>{stockCard.createUser.fullName}</TableCell>
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
          <IconButton 
            size="small" 
            color="info"
            onClick={() => onEdit(stockCard)}
            title="Düzenle"
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => onDelete(stockCard)}
            title="Sil"
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
} 