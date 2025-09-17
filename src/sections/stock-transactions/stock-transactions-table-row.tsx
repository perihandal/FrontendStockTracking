import Box from '@mui/material/Box';
import type { StockTransactionDto } from 'src/services/api/stock-transaction-service';

import { mapEnumToTransactionType } from 'src/utils/stock-card-utils';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

type StockTransactionsTableRowProps = {
  transaction: StockTransactionDto;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function StockTransactionsTableRow({ 
  transaction, 
  onView, 
  onEdit, 
  onDelete 
}: StockTransactionsTableRowProps) {
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Giris':
        return 'success';
      case 'Cikis':
        return 'error';
      case 'Transfer':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}
      </TableCell>
      <TableCell>{transaction.documentNumber || '-'}</TableCell>
      <TableCell>
        <Chip
          label={mapEnumToTransactionType(transaction.type)}
          color={getTransactionTypeColor(mapEnumToTransactionType(transaction.type))}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transaction.stockCardName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{transaction.quantity}</TableCell>
      <TableCell>{transaction.warehouseName || '-'}</TableCell>
      <TableCell>{transaction.fromWarehouseName || '-'}</TableCell>
      <TableCell>{transaction.toWarehouseName || '-'}</TableCell>
      <TableCell>{transaction.description || '-'}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={onView} title="Görüntüle">
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton size="small" color="info" onClick={onEdit} title="Düzenle">
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton size="small" color="error" onClick={onDelete} title="Sil">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
} 