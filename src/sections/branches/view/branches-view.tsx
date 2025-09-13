import type { ChangeEvent } from 'react';

import React, { useState } from 'react';

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

import { Iconify } from 'src/components/iconify';

import { BranchForm } from '../branch-form';
import { BranchesTableRow } from '../branchs-table-row';


// Mock veri (gerçek uygulamada API'den gelir)
const initialBranches = [
  {
    id: 1,
    code: 'SB001',
    name: 'Merkez Şube',
    address: 'İstanbul, Türkiye',
    phone: '0212 123 45 67',
    isActive: true,
    companyId: 1,
    company: { id: 1, name: 'ABC Şirketi',taxNumber: '123456789',  // Eksik alanları ekledik
      address: 'İstanbul, Türkiye',
      phone: '0212 123 45 67',
      isActive: true },
  },
  {
    id: 2,
    code: 'SB002',
    name: 'Ankara Şubesi',
    address: 'Ankara, Türkiye',
    phone: '0312 987 65 43',
    isActive: true,
    companyId: 1,
    company: { id: 1, name: 'ABC Şirketi' ,taxNumber: '123456789',  // Eksik alanları ekledik
      address: 'İstanbul, Türkiye',
      phone: '0212 123 45 67',
      isActive: true},
  },
];

export function BranchesView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleFilterName = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value);
    setPage(0);
  };

  const handleView = (branch: any) => {
    setSelectedBranch(branch);
    setDetailModalOpen(true);
  };

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (branch: any) => {
    if (window.confirm(`${branch.name} şubesini silmek istediğinizden emin misiniz?`)) {
      const index = initialBranches.findIndex(b => b.id === branch.id);
      if (index > -1) {
        initialBranches.splice(index, 1);
        setSnackbar({
          open: true,
          message: `${branch.name} şubesi başarıyla silindi!`,
          severity: 'success',
        });
      }
    }
  };

  const handleNewBranch = () => {
    setSelectedBranch(null);
    setEditMode(false);
    setFormModalOpen(true);
  };

  const handleSubmitForm = (formData: any) => {
    if (editMode && selectedBranch) {
      // Şube güncelleme işlemi
      const updatedBranch = {
        ...selectedBranch,
        code: formData.code,
        name: formData.name,
        companyId: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        isActive: formData.isActive,
      };
      setSnackbar({
        open: true,
        message: `${formData.name} şubesi başarıyla güncellendi!`,
        severity: 'success',
      });
    } else {
      // Yeni şube ekleme
      const newBranch = {
        id: initialBranches.length + 1,
        ...formData,
        company: { id: 1, name: 'ABC Şirketi' }, // Mock şirket verisi
      };
      initialBranches.push(newBranch);
      setSnackbar({
        open: true,
        message: `${formData.name} şubesi başarıyla eklendi!`,
        severity: 'success',
      });
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

  const filteredBranches = initialBranches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(filterName.toLowerCase()) ||
      branch.code.toLowerCase().includes(filterName.toLowerCase())
  );

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
          <BranchForm onSubmit={handleSubmitForm} onCancel={handleCloseForm} isEditMode={editMode} initialData={selectedBranch} />
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
              <Typography variant="subtitle2" color="text.secondary">Adres</Typography>
              <Typography variant="body1">{selectedBranch.address}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
              <Typography variant="body1">{selectedBranch.phone}</Typography>
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
