import type { Branch } from 'src/types/stock';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

type BranchesTableRowProps = {
  branch: Branch;
  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
};

export function BranchesTableRow({ 
  branch, 
  onView, 
  onEdit, 
  onDelete 
}: BranchesTableRowProps) {
  const getStatusColor = (isActive: boolean) => (isActive ? 'success' : 'error');

  return (
    <TableRow hover>
      <TableCell>{branch.code}</TableCell>
      <TableCell>{branch.name}</TableCell>
      <TableCell>{branch.company.name}</TableCell>
      <TableCell>{branch.address}</TableCell>
      <TableCell>{branch.phone}</TableCell>
      <TableCell>
        <Chip
          label={branch.isActive ? 'Aktif' : 'Pasif'}
          color={getStatusColor(branch.isActive)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => onView(branch)}
            title="Görüntüle"
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton 
            size="small" 
            color="info"
            onClick={() => onEdit(branch)}
            title="Düzenle"
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => onDelete(branch)}
            title="Sil"
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}