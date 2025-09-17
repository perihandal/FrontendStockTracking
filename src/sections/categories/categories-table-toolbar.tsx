import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

interface CategoriesTableToolbarProps {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateClick: () => void;
}

export function CategoriesTableToolbar({ 
  filterName, 
  onFilterName, 
  onCreateClick 
}: CategoriesTableToolbarProps) {
  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Kategori ara..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onCreateClick}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Yeni Kategori
        </Button>
      </Box>
    </Box>
  );
}
