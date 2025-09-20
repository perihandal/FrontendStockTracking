import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Stack,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface PriceDefinitionTableToolbarProps {
  onFilterChange: (filter: string) => void;
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function PriceDefinitionTableToolbar({
  onFilterChange,
  onCreateClick,
  canCreate = true,
}: PriceDefinitionTableToolbarProps) {
  const [filter, setFilter] = useState('');

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilter(value);
    onFilterChange(value);
  };

  return (
    <Box sx={{ p: 2.5, pb: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <TextField
          placeholder="Stok kartı, fiyat tipi veya kullanıcı ara..."
          value={filter}
          onChange={handleFilterChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: 1, sm: 'auto' } }}
        />
        
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onCreateClick}
          >
            Yeni Fiyat Tanımı
          </Button>
        )}
      </Stack>
    </Box>
  );
}
