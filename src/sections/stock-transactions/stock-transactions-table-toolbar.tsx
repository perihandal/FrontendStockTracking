import type { ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type StockTransactionsTableToolbarProps = {
  filterName: string;
  onFilterName: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function StockTransactionsTableToolbar({ 
  filterName, 
  onFilterName
}: StockTransactionsTableToolbarProps) {

  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={2} flexGrow={1}>
        <TextField
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="İşlem ara..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Box>
  );
} 