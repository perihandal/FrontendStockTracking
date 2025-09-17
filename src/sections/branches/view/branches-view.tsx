import type { ChangeEvent } from 'react';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { useAuth } from 'src/contexts/auth-context';
import { BranchService, type BranchDtoType, type CreateBranchRequestType, type UpdateBranchRequestType } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

import { BranchForm } from '../branch-form';
import { BranchesTableRow } from '../branchs-table-row';


// Branch form data type
type BranchFormData = {
  code: string;
  name: string;
  address: string;
  phone: string;
  companyId: number;
  isActive: boolean;
};

export function BranchesView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<BranchDtoType | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API Queries
  const { data: branchesResult, isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('🔍 BranchesView: Fetching branches from API');
      const result = await BranchService.getBranches();
      console.log('📊 BranchesView: API response:', result);
      return result;
    },
  });

  // Mutations
  const createBranchMutation = useMutation({
    mutationFn: (data: CreateBranchRequestType) => {
      console.log('🔍 BranchesView: Creating branch with data:', data);
      return BranchService.createBranch(data);
    },
    onSuccess: () => {
      console.log('✅ BranchesView: Branch created successfully');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setSnackbar({
        open: true,
        message: 'Şube başarıyla eklendi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ BranchesView: Failed to create branch:', err);
      const errorMessage = err?.response?.data?.errorMessage?.join(', ') || 'Şube eklenirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBranchRequestType }) => {
      console.log('🔍 BranchesView: Updating branch with id:', id, 'data:', data);
      return BranchService.updateBranch(id, data);
    },
    onSuccess: () => {
      console.log('✅ BranchesView: Branch updated successfully');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setSnackbar({
        open: true,
        message: 'Şube başarıyla güncellendi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ BranchesView: Failed to update branch:', err);
      const errorMessage = err?.response?.data?.errorMessage?.join(', ') || 'Şube güncellenirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('🔍 BranchesView: Deleting branch with id:', id);
      return BranchService.deleteBranch(id);
    },
    onSuccess: () => {
      console.log('✅ BranchesView: Branch deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setSnackbar({
        open: true,
        message: 'Şube başarıyla silindi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ BranchesView: Failed to delete branch:', err);
      const errorMessage = err?.response?.data?.errorMessage?.join(', ') || 'Şube silinirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const branches = branchesResult?.data || [];

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleFilterName = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value);
    setPage(0);
  };

  const handleView = (branch: BranchDtoType) => {
    setSelectedBranch(branch);
    setDetailModalOpen(true);
  };

  const handleEdit = (branch: BranchDtoType) => {
    setSelectedBranch(branch);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (branch: BranchDtoType) => {
    if (window.confirm(`${branch.name} şubesini silmek istediğinizden emin misiniz?`)) {
      deleteBranchMutation.mutate(branch.id);
    }
  };

  const handleNewBranch = () => {
    setSelectedBranch(null);
    setEditMode(false);
    setFormModalOpen(true);
  };

  const handleSubmitForm = (formData: BranchFormData) => {
    if (editMode && selectedBranch && user?.id) {
      // Şube güncelleme işlemi
      const updateData: UpdateBranchRequestType = {
        code: formData.code,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        isActive: formData.isActive,
        companyId: formData.companyId,
        userId: user.id,
      };
      updateBranchMutation.mutate({ id: selectedBranch.id, data: updateData });
    } else if (user?.id) {
      // Yeni şube ekleme
      const createData: CreateBranchRequestType = {
        code: formData.code,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        isActive: formData.isActive,
        companyId: formData.companyId,
        userId: user.id,
      };
      createBranchMutation.mutate(createData);
    }

    setFormModalOpen(false);
    setSelectedBranch(null);
    setEditMode(false);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedBranch(null);
    setEditMode(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(filterName.toLowerCase()) ||
      branch.code.toLowerCase().includes(filterName.toLowerCase())
  );

  // Loading and error states
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Şubeler yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Şubeler yüklenirken bir hata oluştu: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Şubeler</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleNewBranch}>
          Yeni Şube
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterName}
            placeholder="Şube ara..."
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
                <TableCell>Şube Kodu</TableCell>
                <TableCell>Şube Adı</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Depolar</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBranches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((branch) => (
                <BranchesTableRow
                  key={branch.id}
                  branch={branch}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredBranches.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına kayıt:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `~${to}`}`}
        />
      </Card>

      {/* Şube Form Modal */}
      <Dialog open={formModalOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Şube Düzenle' : 'Yeni Şube'}</DialogTitle>
        <DialogContent>
          <BranchForm 
            onSubmit={handleSubmitForm} 
            onCancel={handleCloseForm} 
            isEditMode={editMode} 
            initialData={selectedBranch ? {
              code: selectedBranch.code,
              name: selectedBranch.name,
              address: selectedBranch.address,
              phone: selectedBranch.phone,
              companyId: 0, // TODO: Get companyId from selectedBranch
              isActive: selectedBranch.isActive,
            } : undefined} 
          />
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            Şube Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBranch && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Şube Kodu</Typography>
              <Typography variant="body1">{selectedBranch.code}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Şube Adı</Typography>
              <Typography variant="body1">{selectedBranch.name}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Şirket</Typography>
              <Typography variant="body1">{selectedBranch.companyName}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Adres</Typography>
              <Typography variant="body1">{selectedBranch.address}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
              <Typography variant="body1">{selectedBranch.phone}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Depolar</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedBranch.warehouseNames.map((warehouseName, index) => (
                  <Chip key={index} label={warehouseName} size="small" variant="outlined" />
                ))}
              </Box>
              <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
              <Chip label={selectedBranch.isActive ? 'Aktif' : 'Pasif'} color={selectedBranch.isActive ? 'success' : 'error'} size="small" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => { handleEdit(selectedBranch!); setDetailModalOpen(false); }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
