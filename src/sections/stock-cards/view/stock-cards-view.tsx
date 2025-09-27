
import type { StockCardDto, CreateStockCardRequest, UpdateStockCardRequest, StockCardType } from 'src/services/api';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

import { mapStockCardTypeToEnum, mapEnumToStockCardType, mapBarcodeTypeToEnum } from 'src/utils/stock-card-utils';

import { StockService } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';
import { CanCreate } from 'src/components/permission';

import { StockCardForm } from '../stock-card-form';
import { StockCardsTableRow } from '../stock-cards-table-row';
import { StockCardsTableToolbar } from '../stock-cards-table-toolbar';


export function StockCardsView() {
  const { user, isEditor, isAdmin } = useAuth();


  const queryClient = useQueryClient();
  
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<StockCardDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // API Queries
  const { data: stockCardsResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['stockCards', page, rowsPerPage],
    queryFn: () => StockService.getStockCardsPaged(page + 1, rowsPerPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations
  const createStockCardMutation = useMutation({
    mutationFn: (data: CreateStockCardRequest) => StockService.createStockCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockCards'] });
      setSnackbar({ open: true, message: 'Stok kartı başarıyla oluşturuldu!', severity: 'success' });
      setFormOpen(false);
      setSelected(null);
    },
    onError: (apiError: any) => {
      setSnackbar({ 
        open: true, 
        message: `Hata: ${apiError.response?.data?.message || 'Stok kartı oluşturulamadı'}`, 
        severity: 'error' 
      });
    }
  });

  const updateStockCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockCardRequest }) => 
      StockService.updateStockCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockCards'] });
      setSnackbar({ open: true, message: 'Stok kartı başarıyla güncellendi!', severity: 'success' });
      setFormOpen(false);
      setSelected(null);
    },
    onError: (apiError: any) => {
      setSnackbar({ 
        open: true, 
        message: `Hata: ${apiError.response?.data?.message || 'Stok kartı güncellenemedi'}`, 
        severity: 'error' 
      });
    }
  });

  const deleteStockCardMutation = useMutation({
    mutationFn: (id: number) => StockService.deleteStockCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockCards'] });
      setSnackbar({ open: true, message: 'Stok kartı başarıyla silindi!', severity: 'success' });
    },
    onError: (apiError: any) => {
      setSnackbar({
        open: true,
        message: `Hata: ${apiError.response?.data?.message || 'Stok kartı silinemedi'}`,
        severity: 'error'
      });
    }
  });

  // Data processing
  const stockCards = stockCardsResponse?.data || [];
  const totalCount = stockCards.length || 0;

  // Filtreleme
  const filtered = stockCards.filter(card =>
    card.name.toLowerCase().includes(filterName.toLowerCase()) ||
    card.code.toLowerCase().includes(filterName.toLowerCase())
  );

  // Tablo eventleri
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Form aç/kapat
  const handleOpenForm = () => { setEditMode(false); setSelected(null); setFormOpen(true); };
  const handleEdit = (card: StockCardDto) => { 
    setEditMode(true); 
    // Convert integer enum back to string for form display
    const cardWithStringType = {
      ...card,
      type: mapEnumToStockCardType(card.type as any) as StockCardType
    };
    setSelected(cardWithStringType); 
    setFormOpen(true); 
  };
  const handleView = (card: StockCardDto) => { setSelected(card); setDetailOpen(true); };
  const handleDelete = (card: StockCardDto) => {
    if (window.confirm(`"${card.name}" stok kartını silmek istediğinizden emin misiniz?`)) {
      deleteStockCardMutation.mutate(card.id);
    }
  };
  const handleCloseForm = () => { setFormOpen(false); setSelected(null); };
  const handleCloseDetail = () => setDetailOpen(false);

  // Ekle/güncelle
  const handleSubmit = (data: any) => {
    if (!user) return;

    if (editMode && selected) {
      // Update existing stock card
      const updateData: UpdateStockCardRequest = {
        name: data.name,
        code: data.code,
        type: mapStockCardTypeToEnum(data.type) as any, // Convert to integer enum
        unit: data.unit,
        tax: data.tax,
        isActive: true, // Default to active
        companyId: data.companyId,
        userId: Number(user.id), // Backend requirement
        branchId: data.branchId,
        mainGroupId: data.mainGroupId,
        subGroupId: data.subGroupId,
        categoryId: data.categoryId,
      };
      
      updateStockCardMutation.mutate({ id: selected.id, data: updateData });
    } else {
      // Create new stock card
      const createData: CreateStockCardRequest = {
        name: data.name,
        code: data.code,
        type: mapStockCardTypeToEnum(data.type) as any, // Convert to integer enum
        unit: data.unit,
        tax: data.tax,
        companyId: data.companyId,
        userId: Number(user.id),
        branchId: data.branchId,
        mainGroupId: data.mainGroupId,
        subGroupId: data.subGroupId,
        categoryId: data.categoryId,
        createDefaultBarcode: true,
        defaultBarcodeType: mapBarcodeTypeToEnum('EAN13') as any, // Convert to integer enum
      };
      
      console.log('🔍 Creating stock card with data:', JSON.stringify(createData, null, 2));
      console.log('🔍 Form data received:', JSON.stringify(data, null, 2));
      console.log('🔍 User ID:', user.id);
      
      createStockCardMutation.mutate(createData);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (queryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Stok kartları yüklenirken hata oluştu: {queryError.message}
        </Alert>
      </Box>
    );
  }

  // Snackbar kapat
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });



  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Stok Kartları</Typography>
        <CanCreate>
          <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenForm}>
            Yeni Stok Kartı
          </Button>
        </CanCreate>
      </Box>
      
      <Card>
        <StockCardsTableToolbar filterName={filterName} onFilterName={e => setFilterName(e.target.value)} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kod</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Birim</TableCell>
                <TableCell>Vergi</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Şube</TableCell>
                <TableCell>Ana Grup</TableCell>
                <TableCell>Alt Grup</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(card => (
                <StockCardsTableRow
                  key={card.name + card.code}
                  stockCard={card}
                  onView={handleView}
                  onEdit={isEditor() ? handleEdit : undefined}
                  onDelete={isEditor() ? handleDelete : undefined}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına kayıt:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `~${to}`}`}
        />
      </Card>

      {/* Form Modal */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Stok Kartı Düzenle' : 'Yeni Stok Kartı'}</DialogTitle>
        <DialogContent>
          <StockCardForm
            editMode={editMode}
            selected={selected}
            onSubmit={handleSubmit}
            isLoading={createStockCardMutation.isPending || updateStockCardMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>Stok Kartı Detayı</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">{selected.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Kod: {selected.code} | Tip: {selected.type} | Birim: {selected.unit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Şirket: {selected.companyName} | Şube: {selected.branchName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ana Grup: {selected.mainGroupName}
                {selected.subGroupName && ` | Alt Grup: ${selected.subGroupName}`}
                {selected.categoryName && ` | Kategori: ${selected.categoryName}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vergi: %{selected.tax} | Oluşturulma: {new Date(selected.createdDate).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 