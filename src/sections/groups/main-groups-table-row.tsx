import type { MouseEvent } from 'react';
import React from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import type { MainGroup } from './groups.types';

export interface MainGroupsTableRowProps {
  mainGroup: MainGroup;
  onView: (mainGroup: MainGroup) => void;
  onEdit: (mainGroup: MainGroup) => void;
  onDelete: (mainGroup: MainGroup) => void;
}

export function MainGroupsTableRow({ mainGroup, onView, onEdit, onDelete }: MainGroupsTableRowProps) {
  return (
    <TableRow hover>
      <TableCell>{mainGroup.code}</TableCell>
      <TableCell>{mainGroup.name}</TableCell>
      <TableCell>
        <Typography variant="body2">
          {mainGroup.userName}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={mainGroup.isActive ? 'Aktif' : 'Pasif'}
          color={mainGroup.isActive ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onView(mainGroup)}
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => onEdit(mainGroup)}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(mainGroup)}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
