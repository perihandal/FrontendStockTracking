import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function TableNoData() {
  return (
    <Box
      sx={{
        py: 10,
        textAlign: 'center',
      }}
    >
      <Iconify
        icon="solar:eye-bold"
        sx={{
          width: 64,
          height: 64,
          color: 'text.disabled',
          mb: 2,
        }}
      />
      
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
        Veri Bulunamadı
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        Henüz hiç veri bulunmuyor.
      </Typography>
    </Box>
  );
}
