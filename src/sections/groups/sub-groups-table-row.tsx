import type { MouseEvent } from 'react';
import React from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import type { SubGroup } from './groups.types';

export interface SubGroupsTableRowProps {
  subGroup: SubGroup;
  onView: (subGroup: SubGroup) => void;
  onEdit: (subGroup: SubGroup) => void;
  onDelete: (subGroup: SubGroup) => void;
}

export function SubGroupsTableRow({ subGroup, onView, onEdit, onDelete }: SubGroupsTableRowProps) {
  return (
    <TableRow hover>
      <TableCell>{subGroup.code}</TableCell>
      <TableCell>{subGroup.name}</TableCell>
      <TableCell>{subGroup.mainGroupName}</TableCell>
      <TableCell>
        <Typography variant="body2">
          {subGroup.userName}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={subGroup.isActive ? 'Aktif' : 'Pasif'}
          color={subGroup.isActive ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onView(subGroup)}
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => onEdit(subGroup)}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(subGroup)}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
