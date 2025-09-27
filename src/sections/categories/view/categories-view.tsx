import type { ChangeEvent } from 'react';

import React, { useState, useEffect } from 'react';

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
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { CategoryService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

import { TableNoData } from '../table-no-data';
import { CategoryForm } from '../category-form';
import { CategoriesTableRow } from '../categories-table-row';
import { CategoriesTableToolbar } from '../categories-table-toolbar';

import type { Category } from '../category.types';

export function CategoriesView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log('🔄 Loading categories...');
    setLoading(true);
    try {
      const response = await CategoryService.getCategories();
      console.log('📋 Categories response:', response);
      
      // Handle the actual response format from backend
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Categories loaded successfully:', response.data.length, 'items');
        setCategories(response.data);
      } else if (response.errorMessage) {
        console.log('❌ Categories load error:', response.errorMessage);
        setSnackbar({
          open: true,
          message: response.errorMessage,
          severity: 'error',
        });
      } else {
        console.log('❌ Categories load error: No data and no error message');
        setSnackbar({
          open: true,
          message: 'Kategoriler yüklenirken hata oluştu',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('❌ Error loading categories:', error);
      setSnackbar({
        open: true,
        message: 'Kategoriler yüklenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      console.log('✅ Categories loading completed');
    }
  };

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

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setDetailModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`${category.name} kategorisini silmek istediğinizden emin misiniz?`)) {
      try {
        console.log('🗑️ Deleting category:', category.id, category.name);
        
        const response = await CategoryService.deleteCategory(category.id);
        console.log('📋 Delete response:', response);
        console.log('📋 Delete response data:', response.data);
        console.log('📋 Delete response errorMessage:', response.errorMessage);
        
        // Backend'inizin response formatını kontrol et - daha esnek kontrol
        const isDeleteSuccess = !response.errorMessage || 
                               response.errorMessage === null ||
                               response.errorMessage === '' ||
                               (response.data && !response.errorMessage) ||
                               (response.data === null && !response.errorMessage);
        
        if (isDeleteSuccess) {
          console.log('✅ Delete successful');
          // Listeyi yenile
          loadCategories();
          setSnackbar({
            open: true,
            message: 'Kategori başarıyla silindi!',
            severity: 'success',
          });
        } else {
          console.log('❌ Delete failed:', response.errorMessage);
          setSnackbar({
            open: true,
            message: response.errorMessage || 'Kategori silinirken hata oluştu',
            severity: 'error',
          });
        }
      } catch (error: any) {
        console.error('❌ Error deleting category:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error data:', error.response?.data);
        
        const errorMessage = error.response?.data?.errorMessage || 
                            error.response?.data?.message || 
                            error.message || 
                            'Kategori silinirken hata oluştu';
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    }
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    console.log('🔄 Form success - reloading categories...');
    console.log('🔄 Current editingCategory:', editingCategory);
    console.log('🔄 Current categories count:', categories.length);
    
    loadCategories();
    
    setSnackbar({
      open: true,
      message: editingCategory ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla oluşturuldu!',
      severity: 'success',
    });
    
    // Reset editing category state
    setEditingCategory(null);
    
    console.log('✅ Form success handled');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(filterName.toLowerCase()) ||
    category.code.toLowerCase().includes(filterName.toLowerCase())
  );


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Kategoriler
        </Typography>
      </Box>

      <Card>
        <CategoriesTableToolbar
          filterName={filterName}
          onFilterName={handleFilterName}
          onCreateClick={handleCreateClick}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kategori Kodu</TableCell>
                <TableCell>Kategori Adı</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Şube</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>Oluşturma Tarihi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <TableNoData query={filterName} />
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((category) => (
                    <CategoriesTableRow
                      key={category.id}
                      category={category}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
              )}
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
                  <Typography variant="subtitle2" color="text.secondary">Şirket</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.companyName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Şube</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.branchName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Oluşturan</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCategory.userName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Oluşturma Tarihi</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(selectedCategory.createDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
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

      {/* Form Modal */}
      <CategoryForm
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        category={editingCategory || undefined}
        isEdit={!!editingCategory}
      />

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