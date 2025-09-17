import type { TableRowProps } from '@mui/material/TableRow';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = TableRowProps & {
  searchQuery: string;
};

export function TableNoData({ searchQuery, ...other }: TableNoDataProps) {
  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={8}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Barkod bulunamadı
          </Typography>

          <Typography variant="body2">
            &quot;<strong>{searchQuery}</strong>&quot; arama kriterlerinize uygun barkod bulunamadı.
            <br /> Arama terimini kontrol edin veya farklı kelimeler deneyin.
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
