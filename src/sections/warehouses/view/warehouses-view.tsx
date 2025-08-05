import type { ChangeEvent } from 'react';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
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

import { Iconify } from 'src/components/iconify';

// Mock veri
const mockWarehouses = [
  {
    id: 1,
    code: 'WH001',
    name: 'Merkez Depo',
    address: 'İstanbul, Türkiye',
    phone: '0212 123 45 67',
    isActive: true,
    company: { id: 1, name: 'ABC Şirketi' },
    branch: { id: 1, name: 'Merkez Şube' },
  },
  {
    id: 2,
    code: 'WH002',
    name: 'Ankara Depo',
    address: 'Ankara, Türkiye',
    phone: '0312 987 65 43',
    isActive: true,
    company: { id: 1, name: 'ABC Şirketi' },
    branch: { id: 2, name: 'Ankara Şubesi' },
  },
];

export function WarehousesView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

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

  const handleView = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setDetailModalOpen(true);
  };

  const handleEdit = (warehouse: any) => {
    // Düzenleme işlemi için şimdilik sadece mesaj göster
    setSnackbar({
      open: true,
      message: `${warehouse.name} deposu düzenleme özelliği yakında eklenecek!`,
      severity: 'success',
    });
  };

  const handleDelete = (warehouse: any) => {
    if (window.confirm(`${warehouse.name} deposunu silmek istediğinizden emin misiniz?`)) {
      // Mock veriden sil
      const index = mockWarehouses.findIndex(w => w.id === warehouse.id);
      if (index > -1) {
        mockWarehouses.splice(index, 1);
        setSnackbar({
          open: true,
          message: `${warehouse.name} deposu başarıyla silindi!`,
          severity: 'success',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredWarehouses = mockWarehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(filterName.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Depolar
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Yeni Depo
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterName}
            placeholder="Depo ara..."
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
                <TableCell>Depo Kodu</TableCell>
                <TableCell>Depo Adı</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Şube</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWarehouses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((warehouse) => (
                  <TableRow key={warehouse.id} hover>
                    <TableCell>{warehouse.code}</TableCell>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>{warehouse.company.name}</TableCell>
                    <TableCell>{warehouse.branch.name}</TableCell>
                    <TableCell>{warehouse.address}</TableCell>
                    <TableCell>{warehouse.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={warehouse.isActive ? 'Aktif' : 'Pasif'}
                        color={warehouse.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleView(warehouse)}
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEdit(warehouse)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(warehouse)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredWarehouses.length}
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
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            Depo Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedWarehouse && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Depo Kodu</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.code}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Depo Adı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Şirket</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.company.name}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Şube</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.branch.name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.phone}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                  <Chip
                    label={selectedWarehouse.isActive ? 'Aktif' : 'Pasif'}
                    color={selectedWarehouse.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Adres</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.address}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
          <Button 
            variant="contained" 
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => { 
              handleEdit(selectedWarehouse!); 
              setDetailModalOpen(false); 
            }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 