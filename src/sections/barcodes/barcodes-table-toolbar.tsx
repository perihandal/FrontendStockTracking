import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type BarcodesTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onBulkPrint?: () => void;
  canDelete?: boolean;
};

export function BarcodesTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  onDelete,
  onBulkPrint,
  canDelete = true,
}: BarcodesTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} seçili
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Barkod Listesi
        </Typography>
      )}

      {numSelected > 0 ? (
        <>
          <Tooltip title="Yazdır">
            <IconButton onClick={onBulkPrint} color="primary">
              <Iconify icon="eva:search-fill" />
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title="Sil">
              <IconButton onClick={onDelete} color="error">
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        <Box sx={{ flex: '1 1 auto' }} />
      )}

      <TextField
        value={filterName}
        onChange={onFilterName}
        placeholder="Barkod ara..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{ width: { xs: 1, sm: 'auto' } }}
      />
    </Toolbar>
  );
}
