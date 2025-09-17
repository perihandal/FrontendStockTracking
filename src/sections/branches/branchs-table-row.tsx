import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { type BranchDtoType } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type BranchesTableRowProps = {
  branch: BranchDtoType;
  onView: (branch: BranchDtoType) => void;
  onEdit: (branch: BranchDtoType) => void;
  onDelete: (branch: BranchDtoType) => void;
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
      <TableCell>{branch.companyName}</TableCell>
      <TableCell>{branch.address}</TableCell>
      <TableCell>{branch.phone}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {branch.warehouseNames.slice(0, 2).map((warehouseName, index) => (
            <Chip key={index} label={warehouseName} size="small" variant="outlined" />
          ))}
          {branch.warehouseNames.length > 2 && (
            <Chip 
              label={`+${branch.warehouseNames.length - 2} daha`} 
              size="small" 
              variant="outlined" 
              color="secondary"
            />
          )}
        </Stack>
      </TableCell>
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