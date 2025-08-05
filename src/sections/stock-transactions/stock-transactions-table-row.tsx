import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

type StockTransaction = {
  id: number;
  transactionType: 'Giriş' | 'Çıkış' | 'Transfer';
  quantity: number;
  transactionDate: string;
  documentNumber: string;
  description: string;
  stockCard: {
    id: number;
    name: string;
    code: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
};

type StockTransactionsTableRowProps = {
  transaction: StockTransaction;
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
      case 'Giriş':
        return 'success';
      case 'Çıkış':
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
      <TableCell>{transaction.documentNumber}</TableCell>
      <TableCell>
        <Chip
          label={transaction.transactionType}
          color={getTransactionTypeColor(transaction.transactionType)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transaction.stockCard.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {transaction.stockCard.code}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{transaction.quantity}</TableCell>
      <TableCell>{transaction.warehouse.name}</TableCell>
      <TableCell>{transaction.description}</TableCell>
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