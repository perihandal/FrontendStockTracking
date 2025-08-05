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

import { CompanyForm } from '../company-form';

type Company = {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
};

type CompanyFormData = {
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
};

// Mock veri
const initialCompanies: Company[] = [
  {
    id: 1,
    code: 'COMP001',
    name: 'ABC Şirketi',
    address: 'İstanbul, Türkiye',
    phone: '0212 123 45 67',
    email: 'info@abc.com',
    isActive: true,
  },
  {
    id: 2,
    code: 'COMP002',
    name: 'XYZ Şirketi',
    address: 'Ankara, Türkiye',
    phone: '0312 987 65 43',
    email: 'info@xyz.com',
    isActive: true,
  },
];

export function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
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

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setDetailModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (company: Company) => {
    if (window.confirm(`${company.name} şirketini silmek istediğinizden emin misiniz?`)) {
      setCompanies(prev => prev.filter(c => c.id !== company.id));
      setSnackbar({
        open: true,
        message: `${company.name} şirketi başarıyla silindi!`,
        severity: 'success',
      });
    }
  };

  const handleNewCompany = () => {
    setSelectedCompany(null);
    setEditMode(false);
    setFormModalOpen(true);
  };

  const handleSubmitForm = (formData: CompanyFormData) => {
    if (editMode && selectedCompany) {
      // Düzenleme
      const updatedCompany: Company = {
        ...selectedCompany,
        ...formData,
      };

      setCompanies(prev => 
        prev.map(c => c.id === selectedCompany.id ? updatedCompany : c)
      );
      setSnackbar({
        open: true,
        message: `${formData.name} şirketi başarıyla güncellendi!`,
        severity: 'success',
      });
    } else {
      // Yeni şirket
      const newCompany: Company = {
        id: Math.max(...companies.map(c => c.id)) + 1,
        ...formData,
      };

      setCompanies(prev => [newCompany, ...prev]);
      setSnackbar({
        open: true,
        message: `${formData.name} şirketi başarıyla eklendi!`,
        severity: 'success',
      });
    }

    setFormModalOpen(false);
    setSelectedCompany(null);
    setEditMode(false);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedCompany(null);
    setEditMode(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(filterName.toLowerCase()) ||
    company.code.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Şirketler
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleNewCompany}
        >
          Yeni Şirket
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterName}
            placeholder="Şirket ara..."
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
                <TableCell>Şirket Kodu</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>{company.code}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.isActive ? 'Aktif' : 'Pasif'}
                        color={company.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleView(company)}
                          title="Görüntüle"
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEdit(company)}
                          title="Düzenle"
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(company)}
                          title="Sil"
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
          count={filteredCompanies.length}
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

      {/* Form Modal */}
      <Dialog open={formModalOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Şirket Düzenle' : 'Yeni Şirket'}
        </DialogTitle>
        <DialogContent>
          <CompanyForm
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isEditMode={editMode}
            initialData={selectedCompany ? {
              code: selectedCompany.code,
              name: selectedCompany.name,
              address: selectedCompany.address,
              phone: selectedCompany.phone,
              email: selectedCompany.email,
              isActive: selectedCompany.isActive,
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            Şirket Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCompany && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Şirket Kodu</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.code}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Şirket Adı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.phone}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">E-posta</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.email}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Adres</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.address}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                <Chip
                  label={selectedCompany.isActive ? 'Aktif' : 'Pasif'}
                  color={selectedCompany.isActive ? 'success' : 'error'}
                  size="small"
                />
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
              handleEdit(selectedCompany!); 
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