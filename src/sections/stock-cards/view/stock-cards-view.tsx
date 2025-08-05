import type { StockCard } from 'src/types/stock';

import React, { useState } from 'react';

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

import { Iconify } from 'src/components/iconify';

import { StockCardForm } from '../stock-card-form';
import { StockCardsTableRow } from '../stock-cards-table-row';
import { StockCardsTableToolbar } from '../stock-cards-table-toolbar';

// Mock veri (gerçek uygulamada API'den gelir)
const initialStockCards: StockCard[] = [
  {
    id: 1,
    name: 'Çelik Levha',
    code: 'STK001',
    type: 'Hammadde',
    unit: 'Kg',
    tax: 18,
    isActive: true,
    createdDate: new Date().toISOString(),
    companyId: 1,
    company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true },
    branchId: 1,
    branch: { id: 1, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } },
    mainGroupId: 1,
    mainGroup: { id: 1, code: 'HAMMADDE', name: 'Hammaddeler', isActive: true, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, branchId: 1, branch: { id: 1, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } } },
    subGroupId: 1,
    subGroup: { id: 1, code: 'METAL', name: 'Metaller', isActive: true, mainGroupId: 1, mainGroup: { id: 1, code: 'HAMMADDE', name: 'Hammaddeler', isActive: true, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, branchId: 1, branch: { id: 1, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } } } },
    categoryId: 1,
    category: { id: 1, code: 'CAT001', name: 'Çelik Ürünleri', isActive: true, branchId: 1, branch: { id: 1, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } }, companyId: 1, company: { id: 1, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createDate: '', createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } },
    createUserId: 1,
    createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true },
    barcodeCards: [],
    priceDefinitions: [],
    stockTransactions: [],
  },
];

export function StockCardsView() {
  const [stockCards, setStockCards] = useState<StockCard[]>(initialStockCards);
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<StockCard | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

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
  const handleEdit = (card: StockCard) => { setEditMode(true); setSelected(card); setFormOpen(true); };
  const handleView = (card: StockCard) => { setSelected(card); setDetailOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setSelected(null); };
  const handleCloseDetail = () => setDetailOpen(false);

  // Ekle/güncelle
  const handleSubmit = (data: any) => {
    if (editMode && selected) {
      setStockCards(prev => prev.map(card => card.id === selected.id ? { ...card, ...data } : card));
      setSnackbar({ open: true, message: 'Stok kartı güncellendi!', severity: 'success' });
    } else {
      const newCard: StockCard = {
        ...initialStockCards[0],
        ...data,
        id: Math.max(...stockCards.map(c => c.id)) + 1,
        createdDate: new Date().toISOString(),
        company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true },
        branch: { id: data.branchId, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } },
        mainGroup: { id: data.mainGroupId, code: '', name: 'Hammaddeler', isActive: true, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, branchId: data.branchId, branch: { id: data.branchId, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } } },
        subGroup: data.subGroupId ? { id: data.subGroupId, code: '', name: 'Alt Grup', isActive: true, mainGroupId: data.mainGroupId, mainGroup: { id: data.mainGroupId, code: '', name: 'Hammaddeler', isActive: true, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, branchId: data.branchId, branch: { id: data.branchId, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } } } } : undefined,
        category: data.categoryId ? { id: data.categoryId, code: '', name: 'Kategori', isActive: true, branchId: data.branchId, branch: { id: data.branchId, code: 'MERKEZ', name: 'Merkez Şube', address: '', phone: '', isActive: true, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } }, companyId: data.companyId, company: { id: data.companyId, name: 'ABC Şirketi', taxNumber: '', address: '', phone: '', isActive: true }, createDate: '', createUserId: 1, createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true } } : undefined,
        createUser: { id: 1, fullName: 'Admin', email: '', username: '', createdDate: '', isActive: true },
      };
      setStockCards(prev => [newCard, ...prev]);
      setSnackbar({ open: true, message: 'Stok kartı eklendi!', severity: 'success' });
    }
    setFormOpen(false);
    setSelected(null);
  };

  // Silme
  const handleDelete = (card: StockCard) => {
    if (window.confirm(`${card.name} kartını silmek istiyor musunuz?`)) {
      setStockCards(prev => prev.filter(c => c.id !== card.id));
      setSnackbar({ open: true, message: 'Stok kartı silindi!', severity: 'success' });
    }
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Stok Kartları</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenForm}>
          Yeni Stok Kartı
        </Button>
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
                <TableCell>Durum</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(card => (
                <StockCardsTableRow
                  key={card.id}
                  stockCard={card}
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
          count={filtered.length}
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
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isEditMode={editMode}
            initialData={selected || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>Stok Kartı Detay</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><b>Kod:</b> {selected.code}</Typography>
              <Typography><b>Ad:</b> {selected.name}</Typography>
              <Typography><b>Tip:</b> {selected.type}</Typography>
              <Typography><b>Birim:</b> {selected.unit}</Typography>
              <Typography><b>Vergi:</b> %{selected.tax}</Typography>
              <Typography><b>Şirket:</b> {selected.company.name}</Typography>
              <Typography><b>Şube:</b> {selected.branch.name}</Typography>
              <Typography><b>Ana Grup:</b> {selected.mainGroup.name}</Typography>
              <Typography><b>Alt Grup:</b> {selected.subGroup?.name || '-'}</Typography>
              <Typography><b>Kategori:</b> {selected.category?.name || '-'}</Typography>
              <Typography><b>Durum:</b> {selected.isActive ? 'Aktif' : 'Pasif'}</Typography>
              <Typography><b>Oluşturan:</b> {selected.createUser.fullName}</Typography>
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
        autoHideDuration={4000}
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