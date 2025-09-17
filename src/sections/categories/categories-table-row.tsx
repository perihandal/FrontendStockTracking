import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import type { Category } from './category.types';

interface CategoriesTableRowProps {
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesTableRow({ category, onView, onEdit, onDelete }: CategoriesTableRowProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {category.code}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {category.name}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {category.companyName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {category.branchName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {category.userName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatDate(category.createDate)}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={category.isActive ? 'Aktif' : 'Pasif'}
          color={category.isActive ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onView(category)}
            title="Görüntüle"
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          
          <IconButton
            size="small"
            color="info"
            onClick={() => onEdit(category)}
            title="Düzenle"
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(category)}
            title="Sil"
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
