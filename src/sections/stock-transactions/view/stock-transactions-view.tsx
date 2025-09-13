import type { ChangeEvent } from 'react';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';
import StockTransactionService, { type StockTransactionDto, type CreateStockTransactionRequest, type UpdateStockTransactionRequest } from 'src/services/api/stock-transaction-service';
import { useAuth } from 'src/contexts/auth-context';
import { mapEnumToTransactionType } from 'src/utils/stock-card-utils';

import { StockTransactionForm } from '../stock-transaction-form';
import { StockTransactionsTableRow } from '../stock-transactions-table-row';
import { StockTransactionsTableToolbar } from '../stock-transactions-table-toolbar';

type StockTransactionFormData = {
  transactionType: 'Giris' | 'Cikis' | 'Transfer';
  quantity: number;
  documentNumber: string;
  description: string;
  stockCardId: number | undefined;
  warehouseId: number | undefined;
  transactionDate: string;
};

export function StockTransactionsView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransactionDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Fetch stock transactions from backend
  const { data: stockTransactionsResponse, isLoading, error } = useQuery({
    queryKey: ['stockTransactions'],
    queryFn: async () => {
      const result = await StockTransactionService.getStockTransactions();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch stock transactions');
      }
      return result.data;
    },
  });

  const stockTransactions = Array.isArray(stockTransactionsResponse) ? stockTransactionsResponse : [];

  // Create stock transaction mutation
  const createStockTransactionMutation = useMutation({
    mutationFn: (data: CreateStockTransactionRequest) => StockTransactionService.createStockTransaction(data),
    onSuccess: (result) => {
      console.log('✅ Create mutation success:', result);
      console.log('🔄 Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['stockTransactions'] });
      console.log('✅ Queries invalidated');
      setSnackbar({
        open: true,
        message: 'Stok işlemi başarıyla eklendi!',
        severity: 'success',
      });
      setFormModalOpen(false);
      setSelectedTransaction(null);
      setEditMode(false);
    },
    onError: (error: any) => {
      console.error('❌ Create stock transaction error:', error);
      setSnackbar({
        open: true,
        message: `Hata: ${error.response?.data?.message || 'Stok işlemi eklenemedi'}`,
        severity: 'error',
      });
    },
    onSettled: (data, error) => {
      console.log('🔍 Create mutation settled - data:', data, 'error:', error);
      if (!error) {
        console.log('🔄 Invalidating queries from onSettled...');
        queryClient.invalidateQueries({ queryKey: ['stockTransactions'] });
        console.log('✅ Queries invalidated from onSettled');
        setSnackbar({
          open: true,
          message: 'Stok işlemi başarıyla eklendi!',
          severity: 'success',
        });
        setFormModalOpen(false);
        setSelectedTransaction(null);
        setEditMode(false);
      }
    },
  });

  // Update stock transaction mutation
  const updateStockTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockTransactionRequest }) => 
      StockTransactionService.updateStockTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockTransactions'] });
      setSnackbar({
        open: true,
        message: 'Stok işlemi başarıyla güncellendi!',
        severity: 'success',
      });
      setFormModalOpen(false);
      setSelectedTransaction(null);
      setEditMode(false);
    },
    onError: (error: any) => {
      console.error('❌ Update stock transaction error:', error);
      setSnackbar({
        open: true,
        message: `Hata: ${error.response?.data?.message || 'Stok işlemi güncellenemedi'}`,
        severity: 'error',
      });
    },
  });

  // Delete stock transaction mutation
  const deleteStockTransactionMutation = useMutation({
    mutationFn: (id: number) => StockTransactionService.deleteStockTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockTransactions'] });
      setSnackbar({
        open: true,
        message: 'Stok işlemi başarıyla silindi!',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      console.error('❌ Delete stock transaction error:', error);
      setSnackbar({
        open: true,
        message: `Hata: ${error.response?.data?.message || 'Stok işlemi silinemedi'}`,
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

  const handleView = (transaction: StockTransactionDto) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleEdit = (transaction: StockTransactionDto) => {
    setSelectedTransaction(transaction);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (transaction: StockTransactionDto) => {
    if (window.confirm(`${transaction.documentNumber || 'Bu'} işlemini silmek istediğinizden emin misiniz?`)) {
      deleteStockTransactionMutation.mutate(transaction.id);
    }
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setEditMode(false);
    setFormModalOpen(true);
  };

  const handleSubmitForm = (formData: StockTransactionFormData) => {
    if (!user) {
      console.warn('User not found, cannot submit form');
      return;
    }

    if (!formData.stockCardId) {
      console.warn('Stock card must be selected');
      return;
    }

    // Transfer işleminde warehouseId gerekli değil, sadece fromWarehouseId ve toWarehouseId gerekli
    if (formData.transactionType !== 'Transfer' && !formData.warehouseId) {
      console.warn('Warehouse must be selected for non-transfer transactions');
      return;
    }

    if (editMode && selectedTransaction) {
      // Update existing stock transaction
      const updateData: UpdateStockTransactionRequest = {
        type: formData.transactionType,
        quantity: formData.quantity,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        documentNumber: formData.documentNumber,
        description: formData.description,
        stockCardId: formData.stockCardId,
        // Transfer işleminde warehouseId kullanma, sadece fromWarehouseId ve toWarehouseId kullan
        warehouseId: formData.transactionType === 'Transfer' ? undefined : formData.warehouseId,
        fromWarehouseId: formData.fromWarehouseId,
        toWarehouseId: formData.toWarehouseId,
        userId: Number(user.id),
      };
      
      updateStockTransactionMutation.mutate({ id: selectedTransaction.id, data: updateData });
    } else {
      // Create new stock transaction
      const createData: CreateStockTransactionRequest = {
        type: formData.transactionType,
        quantity: formData.quantity,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        documentNumber: formData.documentNumber,
        description: formData.description,
        stockCardId: formData.stockCardId,
        // Transfer işleminde warehouseId kullanma, sadece fromWarehouseId ve toWarehouseId kullan
        warehouseId: formData.transactionType === 'Transfer' ? undefined : formData.warehouseId,
        fromWarehouseId: formData.fromWarehouseId,
        toWarehouseId: formData.toWarehouseId,
        userId: Number(user.id),
      };
      
      createStockTransactionMutation.mutate(createData);
    }
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedTransaction(null);
    setEditMode(false);
  };

  const handleDownloadReport = () => {
    setSnackbar({
      open: true,
      message: 'Rapor indirme özelliği yakında eklenecek!',
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredTransactions = stockTransactions.filter((transaction) =>
    (transaction.documentNumber?.toLowerCase().includes(filterName.toLowerCase()) || false) ||
    transaction.stockCardName.toLowerCase().includes(filterName.toLowerCase())
  );

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Stok işlemleri yükleniyor...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Stok işlemleri yüklenirken hata oluştu: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Stok İşlemleri
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:share-bold" />}
            onClick={handleDownloadReport}
          >
            Rapor İndir
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNewTransaction}
          >
            Yeni İşlem
          </Button>
        </Stack>
      </Box>

      <Card>
        <StockTransactionsTableToolbar
          filterName={filterName}
          onFilterName={handleFilterName}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>İşlem Tarihi</TableCell>
                <TableCell>Belge No</TableCell>
                <TableCell>İşlem Tipi</TableCell>
                <TableCell>Stok Kartı</TableCell>
                <TableCell>Miktar</TableCell>
                <TableCell>Depo</TableCell>
                <TableCell>Kaynak Depo</TableCell>
                <TableCell>Hedef Depo</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <StockTransactionsTableRow
                    key={transaction.id}
                    transaction={transaction}
                    onView={() => handleView(transaction)}
                    onEdit={() => handleEdit(transaction)}
                    onDelete={() => handleDelete(transaction)}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredTransactions.length}
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
          {editMode ? 'İşlem Düzenle' : 'Yeni İşlem'}
        </DialogTitle>
        <DialogContent>
          <StockTransactionForm
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isEditMode={editMode}
            initialData={selectedTransaction ? {
              transactionType: mapEnumToTransactionType(selectedTransaction.type) as any,
              quantity: selectedTransaction.quantity,
              documentNumber: selectedTransaction.documentNumber || '',
              description: selectedTransaction.description || '',
              stockCardId: selectedTransaction.stockCardId,
              warehouseId: selectedTransaction.warehouseId || undefined,
              fromWarehouseId: selectedTransaction.fromWarehouseId || undefined,
              toWarehouseId: selectedTransaction.toWarehouseId || undefined,
              transactionDate: new Date(selectedTransaction.transactionDate).toISOString().split('T')[0],
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            İşlem Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Belge No</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.documentNumber}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">İşlem Tipi</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{mapEnumToTransactionType(selectedTransaction.type)}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Stok Kartı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.stockCardName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Miktar</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.quantity}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Depo</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.warehouseName || '-'}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">İşlem Tarihi</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{new Date(selectedTransaction.transactionDate).toLocaleDateString('tr-TR')}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Kaynak Depo</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.fromWarehouseName || '-'}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Hedef Depo</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.toWarehouseName || '-'}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.description}</Typography>
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
              handleEdit(selectedTransaction!); 
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