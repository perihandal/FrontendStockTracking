import type { ChangeEvent } from 'react';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

import { useAuth } from 'src/contexts/auth-context';
import { WarehouseService, type WarehouseDto, type CreateWarehouseRequest, type UpdateWarehouseRequest } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { CanCreate } from 'src/components/permission';

import { WarehouseForm } from '../warehouse-form';

// Warehouse form data type
type WarehouseFormData = {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
  branchId: number;
  isActive: boolean;
};


export function WarehousesView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // API Queries
  const { data: warehousesResult, isLoading, error } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      console.log('🔍 WarehousesView: Fetching warehouses from API');
      const result = await WarehouseService.getWarehouses();
      console.log('📊 WarehousesView: API response:', result);
      if (result.data) {
        console.log('📦 WarehousesView: Warehouses data:');
        result.data.forEach((warehouse, index) => {
          console.log(`📦 [${index}] ID=${warehouse.id}, Code='${warehouse.code}', Name='${warehouse.name}'`);
        });
      }
      return result;
    },
  });

  // Mutations
  const createWarehouseMutation = useMutation({
    mutationFn: (data: CreateWarehouseRequest) => {
      console.log('🔍 WarehousesView: Creating warehouse with data:', data);
      return WarehouseService.createWarehouse(data);
    },
    onSuccess: () => {
      console.log('✅ WarehousesView: Warehouse created successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setSnackbar({
        open: true,
        message: 'Depo başarıyla eklendi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ WarehousesView: Failed to create warehouse:', err);
      const errorMessage = (err as any)?.response?.data?.errorMessage?.join(', ') || 'Depo eklenirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarehouseRequest }) => {
      console.log('🔍 WarehousesView: Updating warehouse with id:', id, 'data:', data);
      return WarehouseService.updateWarehouse(id, data);
    },
    onSuccess: () => {
      console.log('✅ WarehousesView: Warehouse updated successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setSnackbar({
        open: true,
        message: 'Depo başarıyla güncellendi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ WarehousesView: Failed to update warehouse:', err);
      const errorMessage = (err as any)?.response?.data?.errorMessage?.join(', ') || 'Depo güncellenirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('🔍 WarehousesView: Deleting warehouse with id:', id);
      return WarehouseService.deleteWarehouse(id);
    },
    onSuccess: () => {
      console.log('✅ WarehousesView: Warehouse deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setSnackbar({
        open: true,
        message: 'Depo başarıyla silindi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ WarehousesView: Failed to delete warehouse:', err);
      const errorMessage = (err as any)?.response?.data?.errorMessage?.join(', ') || 'Depo silinirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const warehouses = warehousesResult?.data || [];

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

  const handleView = (warehouse: WarehouseDto) => {
    setSelectedWarehouse(warehouse);
    setDetailModalOpen(true);
  };

  const handleEdit = (warehouse: WarehouseDto) => {
    setSelectedWarehouse(warehouse);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (warehouse: WarehouseDto) => {
    if (window.confirm(`${warehouse.name} deposunu silmek istediğinizden emin misiniz?`)) {
      deleteWarehouseMutation.mutate(warehouse.id);
    }
  };

  const handleNewWarehouse = () => {
    setSelectedWarehouse(null);
    setEditMode(false);
    setFormModalOpen(true);
  };

  const handleSubmitForm = (formData: WarehouseFormData) => {
    if (editMode && selectedWarehouse && user?.id) {
      // Depo güncelleme işlemi
      const updateData: UpdateWarehouseRequest = {
        code: formData.code,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        isActive: formData.isActive,
        companyId: formData.companyId,
        branchId: formData.branchId,
        userId: user.id,
      };
      updateWarehouseMutation.mutate({ id: selectedWarehouse.id, data: updateData });
    } else if (user?.id) {
      // Yeni depo ekleme
      const createData: CreateWarehouseRequest = {
        code: formData.code,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        isActive: formData.isActive,
        companyId: formData.companyId,
        branchId: formData.branchId,
        userId: user.id,
      };
      createWarehouseMutation.mutate(createData);
    }

    setFormModalOpen(false);
    setSelectedWarehouse(null);
    setEditMode(false);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedWarehouse(null);
    setEditMode(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(filterName.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(filterName.toLowerCase())
  );

  // Loading and error states
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Depolar yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Depolar yüklenirken bir hata oluştu: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Depolar
        </Typography>
        <CanCreate>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNewWarehouse}
          >
            Yeni Depo
          </Button>
        </CanCreate>
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
                    <TableCell>{warehouse.companyName}</TableCell>
                    <TableCell>{warehouse.branchName}</TableCell>
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

      {/* Depo Form Modal */}
      <Dialog open={formModalOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Depo Düzenle' : 'Yeni Depo'}</DialogTitle>
        <DialogContent>
          <WarehouseForm 
            onSubmit={handleSubmitForm} 
            onCancel={handleCloseForm} 
            isEditMode={editMode} 
            initialData={selectedWarehouse ? {
              code: selectedWarehouse.code,
              name: selectedWarehouse.name,
              address: selectedWarehouse.address,
              phone: selectedWarehouse.phone,
              companyId: selectedWarehouse.companyId,
              branchId: selectedWarehouse.branchId,
              isActive: selectedWarehouse.isActive,
            } : undefined} 
          />
        </DialogContent>
      </Dialog>

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
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.companyName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Şube</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWarehouse.branchName}</Typography>
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