import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

export interface TableNoDataProps {
  query: string;
}

export function TableNoData({ query }: TableNoDataProps) {
  return (
    <TableRow>
      <TableCell colSpan={6} sx={{ p: 0 }}>
        <Paper
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" paragraph>
            Veri bulunamadı!
          </Typography>

          <Typography variant="body2">
            {query ? (
              <>
                &quot;
                <Box component="span" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                  {query}
                </Box>
                &quot; için sonuç bulunamadı.
              </>
            ) : (
              'Henüz hiç veri yok.'
            )}
          </Typography>
        </Paper>
      </TableCell>
    </TableRow>
  );
}
