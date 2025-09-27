import React from 'react';

import Chip from '@mui/material/Chip';
import { IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { BarcodeCardDto, BarcodeTypeLabels } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

type BarcodesTableRowProps = {
  barcode: BarcodeCardDto;
  selected: boolean;
  onSelectClick: (event: React.MouseEvent<unknown>) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onPreview: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
};

export function BarcodesTableRow({
  barcode,
  selected,
  onSelectClick,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
  onPreview,
  canEdit = true,
  canDelete = true,
}: BarcodesTableRowProps) {
  const theme = useTheme();

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR');

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        {canDelete && (
          <Checkbox checked={selected} onChange={(event, checked) => onSelectClick(event as unknown as React.MouseEvent)} />
        )}
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" noWrap>
          {barcode.barcodeCode}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={BarcodeTypeLabels[barcode.barcodeType]}
          size="small"
          color="primary"
          variant="outlined"
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {barcode.stockCardName || 'Bilinmeyen Stok Kartı'}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={barcode.isDefault ? 'Varsayılan' : 'Normal'}
          size="small"
          color={barcode.isDefault ? 'success' : 'default'}
          variant={barcode.isDefault ? 'filled' : 'outlined'}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatDate(barcode.createDate)}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <IconButton onClick={onView} size="small" title="Detayları Görüntüle">
          <Iconify icon="solar:eye-bold" />
        </IconButton>
        
        <IconButton onClick={onPreview} size="small" color="info" title="Barkod Önizleme">
          <Iconify icon="eva:search-fill" />
        </IconButton>
        
        {canEdit && (
          <IconButton onClick={onEdit} size="small" title="Düzenle">
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        )}

        {canEdit && !barcode.isDefault && (
          <IconButton onClick={onSetDefault} size="small" color="warning" title="Varsayılan Yap">
            <Iconify icon="eva:search-fill" />
          </IconButton>
        )}

        {canDelete && (
          <IconButton onClick={onDelete} size="small" color="error" title="Sil">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}
