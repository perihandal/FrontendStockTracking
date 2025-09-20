import type { ChangeEvent } from 'react';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { 
  WarehouseStockService, 
  type WarehouseStockDto, 
} from 'src/services/api';

import { Iconify } from 'src/components/iconify';

export function WarehouseStocksView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedWarehouseStock, setSelectedWarehouseStock] = useState<WarehouseStockDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // API Queries - Sadece GET işlemi
  const { data: warehouseStocksResult, isLoading, error, refetch } = useQuery({
    queryKey: ['warehouse-stocks'],
    queryFn: async () => {
      console.log('🔍 WarehouseStocksView: Fetching warehouse stocks from API');
      const result = await WarehouseStockService.getWarehouseStocks();
      console.log('📊 WarehouseStocksView: API response:', result);
      return result;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const warehouseStocks = warehouseStocksResult?.data || [];

  console.log('🔍 WarehouseStocksView: Current warehouse stocks data:', warehouseStocks);
  console.log('🔍 WarehouseStocksView: Sample stock structure:', warehouseStocks[0]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterName = (event: ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const handleView = (warehouseStock: WarehouseStockDto) => {
    setSelectedWarehouseStock(warehouseStock);
    setDetailModalOpen(true);
  };

  const filteredWarehouseStocks = warehouseStocks.filter((stock) =>
    (stock.warehouseName || '').toLowerCase().includes(filterName.toLowerCase()) ||
    (stock.stockCardName || '').toLowerCase().includes(filterName.toLowerCase())
  );

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num || 0);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Depo stokları yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Depo stokları yüklenirken bir hata oluştu: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Depo Stokları
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Yenile
          </Button>
        </Stack>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterName}
            placeholder="Depo, stok kartı ara..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Depo</TableCell>
                <TableCell>Depo Kodu</TableCell>
                <TableCell>Stok Kartı</TableCell>
                <TableCell>Stok Kodu</TableCell>
                <TableCell>Barkod</TableCell>
                <TableCell align="right">Toplam Miktar</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWarehouseStocks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((stock) => (
                  <TableRow key={`${stock.warehouseId || 0}-${stock.stockCardId || 0}`} hover>
                    <TableCell>{stock.warehouseName || 'Bilinmiyor'}</TableCell>
                    <TableCell>{`WHC${(stock.warehouseId || 0).toString().padStart(3, '0')}`}</TableCell>
                    <TableCell>{stock.stockCardName || 'Bilinmiyor'}</TableCell>
                    <TableCell>{`STK${(stock.stockCardId || 0).toString().padStart(3, '0')}`}</TableCell>
                    <TableCell>{`${(stock.stockCardId || 0).toString().padStart(13, '0')}`}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatNumber(stock.quantity || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleView(stock)}
                      >
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredWarehouseStocks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına kayıt:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `~${to}`}`
          }
        />
      </Card>

      {/* Detay Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            Depo Stoku Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedWarehouseStock && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              
              {/* Depo Bilgileri */}
              <Card sx={{ p: 2, backgroundColor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
                  Depo Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="subtitle2" color="text.secondary">Depo Adı</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouseStock.warehouseName || 'Bilinmiyor'}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="subtitle2" color="text.secondary">Depo Kodu</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{`WHC${(selectedWarehouseStock.warehouseId || 0).toString().padStart(3, '0')}`}</Typography>
                  </Box>
                </Box>
              </Card>

              {/* Stok Kartı Bilgileri */}
              <Card sx={{ p: 2, backgroundColor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
                  Stok Kartı Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="subtitle2" color="text.secondary">Stok Adı</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouseStock.stockCardName || 'Bilinmiyor'}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="subtitle2" color="text.secondary">Stok Kodu</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{`STK${(selectedWarehouseStock.stockCardId || 0).toString().padStart(3, '0')}`}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="subtitle2" color="text.secondary">Barkod</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{`${(selectedWarehouseStock.stockCardId || 0).toString().padStart(13, '0')}`}</Typography>
                  </Box>
                </Box>
              </Card>

              {/* Stok Miktarları */}
              <Card sx={{ p: 2, backgroundColor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} />
                  Stok Miktarları
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 100%', textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Toplam Miktar</Typography>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {formatNumber(selectedWarehouseStock.quantity || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}