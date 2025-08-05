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
const mockCategories = [
  {
    id: 1,
    code: 'CAT001',
    name: 'Elektronik',
    description: 'Elektronik ürünler',
    isActive: true,
    mainGroup: { id: 1, name: 'Teknoloji' },
    subGroup: { id: 1, name: 'Elektronik' },
  },
  {
    id: 2,
    code: 'CAT002',
    name: 'Gıda',
    description: 'Gıda ürünleri',
    isActive: true,
    mainGroup: { id: 2, name: 'Tüketim' },
    subGroup: { id: 2, name: 'Gıda' },
  },
];

export function CategoriesView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
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

  const handleView = (category: any) => {
    setSelectedCategory(category);
    setDetailModalOpen(true);
  };

  const handleEdit = (category: any) => {
    // Düzenleme işlemi için şimdilik sadece mesaj göster
    setSnackbar({
      open: true,
      message: `${category.name} kategorisi düzenleme özelliği yakında eklenecek!`,
      severity: 'success',
    });
  };

  const handleDelete = (category: any) => {
    if (window.confirm(`${category.name} kategorisini silmek istediğinizden emin misiniz?`)) {
      // Mock veriden sil
      const index = mockCategories.findIndex(c => c.id === category.id);
      if (index > -1) {
        mockCategories.splice(index, 1);
        setSnackbar({
          open: true,
          message: `${category.name} kategorisi başarıyla silindi!`,
          severity: 'success',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(filterName.toLowerCase()) ||
    category.code.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Kategoriler
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Yeni Kategori
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterName}
            placeholder="Kategori ara..."
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
                <TableCell>Kategori Kodu</TableCell>
                <TableCell>Kategori Adı</TableCell>
                <TableCell>Ana Grup</TableCell>
                <TableCell>Alt Grup</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.mainGroup.name}</TableCell>
                    <TableCell>{category.subGroup.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Aktif' : 'Pasif'}
                        color={category.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleView(category)}
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEdit(category)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(category)}
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
          count={filteredCategories.length}
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
            Kategori Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Kategori Kodu</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.code}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Kategori Adı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Ana Grup</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.mainGroup.name}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Alt Grup</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.subGroup.name}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.description}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                <Chip
                  label={selectedCategory.isActive ? 'Aktif' : 'Pasif'}
                  color={selectedCategory.isActive ? 'success' : 'error'}
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
              handleEdit(selectedCategory!); 
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