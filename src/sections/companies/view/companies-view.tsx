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
import { CompanyService, type CompanyDto, type CreateCompanyRequest, type UpdateCompanyRequest } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { CanCreate } from 'src/components/permission';

import { CompanyForm } from '../company-form';

type CompanyFormData = {
  code: string;
  name: string;
  taxNumber: string;
  address: string;
  phone: string;
  isActive: boolean;
};

export function CompaniesView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // API Queries
  const { data: companiesResponse, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      console.log('🔍 CompaniesView: Starting to fetch companies...');
      try {
        const result = await CompanyService.getCompanies();
        console.log('🔍 CompaniesView: API response received:', result);
        console.log('🔍 CompaniesView: API response data field:', result.data);
        console.log('🔍 CompaniesView: API response keys:', Object.keys(result));
        
        // Backend'den dönen ServiceResult formatında success kontrolü
        if (result.errorMessage && result.errorMessage.length > 0) {
          console.error('❌ CompaniesView: API returned errors:', result.errorMessage);
          throw new Error(result.errorMessage.join(', ') || 'Failed to fetch companies');
        }
        console.log('✅ CompaniesView: Companies fetched successfully:', result.data);
        return result.data;
      } catch (apiError) {
        console.error('❌ CompaniesView: API call failed:', apiError);
        throw apiError;
      }
    },
  });

  const companies = Array.isArray(companiesResponse) ? companiesResponse : [];

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: (data: CreateCompanyRequest) => CompanyService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setSnackbar({ open: true, message: 'Şirket başarıyla oluşturuldu!', severity: 'success' });
      setFormModalOpen(false);
      setSelectedCompany(null);
    },
    onError: (apiError: any) => {
      const errorMessage = apiError.response?.data?.errorMessage?.join(', ') || 
                          apiError.response?.data?.message || 
                          'Şirket oluşturulamadı';
      setSnackbar({ 
        open: true, 
        message: `Hata: ${errorMessage}`, 
        severity: 'error' 
      });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyRequest }) => 
      CompanyService.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setSnackbar({ open: true, message: 'Şirket başarıyla güncellendi!', severity: 'success' });
      setFormModalOpen(false);
      setSelectedCompany(null);
      setEditMode(false);
    },
    onError: (apiError: any) => {
      const errorMessage = apiError.response?.data?.errorMessage?.join(', ') || 
                          apiError.response?.data?.message || 
                          'Şirket güncellenemedi';
      setSnackbar({ 
        open: true, 
        message: `Hata: ${errorMessage}`, 
        severity: 'error' 
      });
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('🔍 CompaniesView: Deleting company with id:', id);
      return CompanyService.deleteCompany(id);
    },
    onSuccess: () => {
      console.log('✅ CompaniesView: Company deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setSnackbar({
        open: true,
        message: 'Şirket başarıyla silindi!',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      console.error('❌ CompaniesView: Failed to delete company:', err);
      const errorMessage = err?.response?.data?.errorMessage?.join(', ') || 'Şirket silinirken bir hata oluştu';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

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

  const handleView = (company: CompanyDto) => {
    setSelectedCompany(company);
    setDetailModalOpen(true);
  };

  const handleEdit = (company: CompanyDto) => {
    setSelectedCompany(company);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (company: CompanyDto) => {
    if (window.confirm(`${company.name} şirketini silmek istediğinizden emin misiniz?`)) {
      deleteCompanyMutation.mutate(company.id);
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
      const updateData: UpdateCompanyRequest = {
        name: formData.name,
        code: formData.code,
        taxNumber: formData.taxNumber,
        address: formData.address,
        phone: formData.phone,
      };
      updateCompanyMutation.mutate({ id: selectedCompany.id, data: updateData });
    } else {
      // Yeni şirket
      const createData: CreateCompanyRequest = {
        name: formData.name,
        code: formData.code,
        taxNumber: formData.taxNumber,
        address: formData.address,
        phone: formData.phone,
        userId: Number(user?.id),
      };
      createCompanyMutation.mutate(createData);
    }
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Şirketler yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Şirketler yüklenirken bir hata oluştu: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Şirketler
        </Typography>
        <CanCreate>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNewCompany}
          >
            Yeni Şirket
          </Button>
        </CanCreate>
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
                <TableCell>Vergi Numarası</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Şubeler</TableCell>
                <TableCell>Depolar</TableCell>
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
                    <TableCell>{company.taxNumber}</TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>
                      {company.branchNames && company.branchNames.length > 0 ? (
                        <Stack direction="column" spacing={0.5}>
                          {company.branchNames.slice(0, 2).map((branch, index) => (
                            <Chip
                              key={index}
                              label={branch}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          ))}
                          {company.branchNames.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{company.branchNames.length - 2} daha
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Şube yok
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.warehouseNames && company.warehouseNames.length > 0 ? (
                        <Stack direction="column" spacing={0.5}>
                          {company.warehouseNames.slice(0, 2).map((warehouse, index) => (
                            <Chip
                              key={index}
                              label={warehouse}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          ))}
                          {company.warehouseNames.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{company.warehouseNames.length - 2} daha
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Depo yok
                        </Typography>
                      )}
                    </TableCell>
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
              taxNumber: selectedCompany.taxNumber,
              address: selectedCompany.address,
              phone: selectedCompany.phone,
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
                  <Typography variant="subtitle2" color="text.secondary">Vergi Numarası</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.taxNumber}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.phone}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Adres</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany.address}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Şubeler ({selectedCompany.branchNames?.length || 0})
                  </Typography>
                  {selectedCompany.branchNames && selectedCompany.branchNames.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedCompany.branchNames.map((branch, index) => (
                        <Chip
                          key={index}
                          label={branch}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Şube bulunmuyor
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Depolar ({selectedCompany.warehouseNames?.length || 0})
                  </Typography>
                  {selectedCompany.warehouseNames && selectedCompany.warehouseNames.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedCompany.warehouseNames.map((warehouse, index) => (
                        <Chip
                          key={index}
                          label={warehouse}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Depo bulunmuyor
                    </Typography>
                  )}
                </Box>
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