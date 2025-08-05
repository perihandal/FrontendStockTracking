import type { ChangeEvent } from 'react';

import React, { useState } from 'react';

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

import { StockTransactionForm } from '../stock-transaction-form';
import { StockTransactionsTableRow } from '../stock-transactions-table-row';
import { StockTransactionsTableToolbar } from '../stock-transactions-table-toolbar';

type StockTransaction = {
  id: number;
  transactionType: 'Giriş' | 'Çıkış' | 'Transfer';
  quantity: number;
  transactionDate: string;
  documentNumber: string;
  description: string;
  stockCard: {
    id: number;
    name: string;
    code: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
};

type StockTransactionFormData = {
  transactionType: 'Giriş' | 'Çıkış' | 'Transfer';
  quantity: number;
  documentNumber: string;
  description: string;
  stockCardId: number;
  warehouseId: number;
  transactionDate: string;
};

// Mock veri - gerçek API'den gelecek
const initialStockTransactions: StockTransaction[] = [
  {
    id: 1,
    transactionType: 'Giriş',
    quantity: 100,
    transactionDate: new Date().toISOString(),
    documentNumber: 'FTR001',
    description: 'Çelik levha girişi',
    stockCard: {
      id: 1,
      name: 'Çelik Levha',
      code: 'STK001',
    },
    warehouse: {
      id: 1,
      name: 'Ana Depo',
    },
  },
  {
    id: 2,
    transactionType: 'Çıkış',
    quantity: 25,
    transactionDate: new Date().toISOString(),
    documentNumber: 'FTR002',
    description: 'Üretim için çıkış',
    stockCard: {
      id: 1,
      name: 'Çelik Levha',
      code: 'STK001',
    },
    warehouse: {
      id: 1,
      name: 'Ana Depo',
    },
  },
];

export function StockTransactionsView() {
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(initialStockTransactions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null);
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

  const handleView = (transaction: StockTransaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleEdit = (transaction: StockTransaction) => {
    setSelectedTransaction(transaction);
    setEditMode(true);
    setFormModalOpen(true);
  };

  const handleDelete = (transaction: StockTransaction) => {
    if (window.confirm(`${transaction.documentNumber} işlemini silmek istediğinizden emin misiniz?`)) {
      setStockTransactions(prev => prev.filter(t => t.id !== transaction.id));
      setSnackbar({
        open: true,
        message: `${transaction.documentNumber} işlemi başarıyla silindi!`,
        severity: 'success',
      });
    }
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setEditMode(false);
    setFormModalOpen(true);
  };

  const handleSubmitForm = (formData: StockTransactionFormData) => {
    if (editMode && selectedTransaction) {
      // Düzenleme
      const updatedTransaction: StockTransaction = {
        ...selectedTransaction,
        transactionType: formData.transactionType,
        quantity: formData.quantity,
        documentNumber: formData.documentNumber,
        description: formData.description,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        stockCard: {
          id: formData.stockCardId,
          name: 'Çelik Levha', // Mock veri
          code: 'STK001',
        },
        warehouse: {
          id: formData.warehouseId,
          name: 'Ana Depo', // Mock veri
        },
      };

      setStockTransactions(prev => 
        prev.map(t => t.id === selectedTransaction.id ? updatedTransaction : t)
      );
      setSnackbar({
        open: true,
        message: `${formData.documentNumber} işlemi başarıyla güncellendi!`,
        severity: 'success',
      });
    } else {
      // Yeni işlem
      const newTransaction: StockTransaction = {
        id: Math.max(...stockTransactions.map(t => t.id)) + 1,
        transactionType: formData.transactionType,
        quantity: formData.quantity,
        documentNumber: formData.documentNumber,
        description: formData.description,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        stockCard: {
          id: formData.stockCardId,
          name: 'Çelik Levha', // Mock veri
          code: 'STK001',
        },
        warehouse: {
          id: formData.warehouseId,
          name: 'Ana Depo', // Mock veri
        },
      };

      setStockTransactions(prev => [newTransaction, ...prev]);
      setSnackbar({
        open: true,
        message: `${formData.documentNumber} işlemi başarıyla eklendi!`,
        severity: 'success',
      });
    }

    setFormModalOpen(false);
    setSelectedTransaction(null);
    setEditMode(false);
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
    transaction.documentNumber.toLowerCase().includes(filterName.toLowerCase()) ||
    transaction.stockCard.name.toLowerCase().includes(filterName.toLowerCase()) ||
    transaction.stockCard.code.toLowerCase().includes(filterName.toLowerCase())
  );

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
              transactionType: selectedTransaction.transactionType,
              quantity: selectedTransaction.quantity,
              documentNumber: selectedTransaction.documentNumber,
              description: selectedTransaction.description,
              stockCardId: selectedTransaction.stockCard.id,
              warehouseId: selectedTransaction.warehouse.id,
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
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.transactionType}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Stok Kartı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.stockCard.name} ({selectedTransaction.stockCard.code})</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Miktar</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.quantity}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Depo</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedTransaction.warehouse.name}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">İşlem Tarihi</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{new Date(selectedTransaction.transactionDate).toLocaleDateString('tr-TR')}</Typography>
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