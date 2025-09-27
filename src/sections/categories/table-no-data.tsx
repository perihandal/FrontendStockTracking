import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

interface TableNoDataProps {
  query?: string;
}

export function TableNoData({ query }: TableNoDataProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Iconify icon="solar:cart-3-bold" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        {query ? 'Arama kriterlerinize uygun kategori bulunamadı' : 'Henüz kategori bulunmuyor'}
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {query 
          ? 'Farklı arama terimleri deneyebilir veya filtreleri temizleyebilirsiniz'
          : 'Yeni kategori oluşturmak için "Yeni Kategori" butonunu kullanabilirsiniz'
        }
      </Typography>
    </Box>
  );
}
