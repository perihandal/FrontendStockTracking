import type { ChangeEvent } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';
import { CanCreate } from 'src/components/permission';

export interface MainGroupsTableToolbarProps {
  filterName: string;
  onFilterName: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreateClick: () => void;
}

export function MainGroupsTableToolbar({ filterName, onFilterName, onCreateClick }: MainGroupsTableToolbarProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Ana grup ara..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 300 }}
      />
      <CanCreate>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onCreateClick}
        >
          Yeni Ana Grup
        </Button>
      </CanCreate>
    </Box>
  );
}
