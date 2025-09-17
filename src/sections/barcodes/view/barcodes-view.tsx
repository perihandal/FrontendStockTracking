import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useAuth } from 'src/contexts/auth-context';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { printMultipleBarcodes } from 'src/utils/print-utils';

import { BarcodeService, CompanyService, BranchService, BarcodeCardDto, BarcodeType, BarcodeTypeLabels } from 'src/services/api';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BarcodeScanner, BarcodeInputModal } from 'src/components/barcode-scanner/barcode-scanner';
import { BarcodeDisplay, BarcodePreviewModal } from 'src/components/barcode-display/barcode-display';

import { BarcodeForm } from '../barcode-form';
import { TableNoData } from '../table-no-data';
import { BarcodesTableRow } from '../barcodes-table-row';
import { BarcodesTableToolbar } from '../barcodes-table-toolbar';

type BarcodeFormData = {
  id?: number;
  barcodeCode: string;
  barcodeType: BarcodeType;
  isDefault: boolean;
  stockCardId: string | number;
  branchId: string | number;
  companyId: string | number;
};

export function BarcodesView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('createDate');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openForm, setOpenForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<BarcodeCardDto | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewBarcode, setPreviewBarcode] = useState<BarcodeCardDto | null>(null);
  const [openScanner, setOpenScanner] = useState(false);
  const [openInput, setOpenInput] = useState(false);

  // API Queries
  const { data: barcodesResult, isLoading, error } = useQuery({
    queryKey: ['barcodes'],
    queryFn: async () => {
      console.log('🔍 BarcodesView: Fetching barcodes from API');
      const result = await BarcodeService.getBarcodes();
      console.log('📊 BarcodesView: Barcodes API response:', result);
      return result;
    },
  });

  const barcodes = barcodesResult?.data || [];

  // Company & Branch lookup for detail modal names
  const { data: companiesResult } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => CompanyService.getCompanies(),
  });
  const { data: branchesResult } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => BranchService.getBranches(),
  });

  const companyNameById = (id?: number) => {
    const list = companiesResult?.data || [];
    const found = list.find((c: any) => c.id === id);
    return found?.name || `#${id}`;
    };

  const branchNameById = (id?: number) => {
    const list = branchesResult?.data || [];
    const found = list.find((b: any) => b.id === id);
    return found?.name || `#${id}`;
  };

  // Mutations
  const createBarcodeMutation = useMutation({
    mutationFn: BarcodeService.createBarcode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] });
      setOpenForm(false);
    },
    onError: (err) => {
      console.error('❌ BarcodesView: Error creating barcode:', err);
    },
  });

  const updateBarcodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => BarcodeService.updateBarcode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] });
      setOpenForm(false);
    },
    onError: (err) => {
      console.error('❌ BarcodesView: Error updating barcode:', err);
    },
  });

  const deleteBarcodeMutation = useMutation({
    mutationFn: BarcodeService.deleteBarcode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] });
    },
    onError: (err) => {
      console.error('❌ BarcodesView: Error deleting barcode:', err);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: BarcodeService.setAsDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] });
    },
    onError: (err) => {
      console.error('❌ BarcodesView: Error setting default barcode:', err);
    },
  });

  // Handlers
  const handleSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = barcodes.map((barcode) => barcode.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleNewBarcode = () => {
    setSelectedBarcode(null);
    setIsEditMode(false);
    setOpenForm(true);
  };

  const handleView = (barcode: BarcodeCardDto) => {
    setSelectedBarcode(barcode);
    setOpenDetail(true);
  };

  const handlePreview = (barcode: BarcodeCardDto) => {
    setPreviewBarcode(barcode);
    setOpenPreview(true);
  };

  const handleScan = (scannedCode: string) => {
    // Taranan barkodu arama
    const foundBarcode = (barcodes || []).find(b => b.barcodeCode === scannedCode);
    if (foundBarcode) {
      handleView(foundBarcode);
    } else {
      alert('Taranan barkod bulunamadı: ' + scannedCode);
    }
  };

  const handleManualInput = (inputCode: string) => {
    handleScan(inputCode);
  };

  const handleBulkPrint = () => {
    const selectedBarcodes = (barcodes || []).filter(barcode => selected.includes(barcode.id));
    if (selectedBarcodes.length === 0) {
      alert('Yazdırmak için en az bir barkod seçin.');
      return;
    }

    const printData = selectedBarcodes.map(barcode => ({
      barcodeCode: barcode.barcodeCode,
      barcodeType: BarcodeTypeLabels[barcode.barcodeType],
      stockCardName: barcode.stockCardName,
    }));

    printMultipleBarcodes(printData, {
      title: 'Barkod Etiketleri',
      size: 'medium',
      showDate: true,
      showCode: true,
    });
  };

  const handleEdit = (barcode: BarcodeCardDto) => {
    setSelectedBarcode(barcode);
    setIsEditMode(true);
    setOpenForm(true);
  };

  const handleDelete = (barcode: BarcodeCardDto) => {
    if (window.confirm('Bu barkodu silmek istediğinizden emin misiniz?')) {
      deleteBarcodeMutation.mutate(barcode.id);
    }
  };

  const handleSetDefault = (barcode: BarcodeCardDto) => {
    setDefaultMutation.mutate(barcode.id);
  };

  const handleSubmitForm = (formData: BarcodeFormData) => {
    if (isEditMode && selectedBarcode) {
      updateBarcodeMutation.mutate({
        id: selectedBarcode.id,
        data: {
          isDefault: formData.isDefault,
          branchId: Number(formData.branchId),
          userId: user?.id,
        },
      });
    } else {
      const requestData = {
        barcodeType: formData.barcodeType,
        isDefault: formData.isDefault,
        stockCardId: Number(formData.stockCardId),
        branchId: Number(formData.branchId),
        companyId: Number(formData.companyId),
        userId: user?.id,
      };
      
      console.log('🔍 BarcodesView: User info:', user);
      console.log('🔍 BarcodesView: User ID:', user?.id);
      console.log('🔍 BarcodesView: Request data:', requestData);
      
      createBarcodeMutation.mutate(requestData);
    }
  };

  // Filter and sort data
  const filteredBarcodes = (barcodes || []).filter((barcode) =>
    barcode.barcodeCode.toLowerCase().includes(filterName.toLowerCase()) ||
    barcode.stockCardName?.toLowerCase().includes(filterName.toLowerCase()) ||
    BarcodeTypeLabels[barcode.barcodeType].toLowerCase().includes(filterName.toLowerCase())
  );

  const sortedBarcodes = filteredBarcodes.sort((a, b) => {
    if (order === 'asc') {
      return (a[orderBy as keyof BarcodeCardDto] as string) < (b[orderBy as keyof BarcodeCardDto] as string) ? -1 : 1;
    }
    return (a[orderBy as keyof BarcodeCardDto] as string) > (b[orderBy as keyof BarcodeCardDto] as string) ? -1 : 1;
  });

  const paginatedBarcodes = sortedBarcodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const isNotFound = !filteredBarcodes.length && !!filterName;

  const initialData: BarcodeFormData = selectedBarcode ? {
    id: selectedBarcode.id,
    barcodeCode: selectedBarcode.barcodeCode,
    barcodeType: selectedBarcode.barcodeType,
    isDefault: selectedBarcode.isDefault,
    stockCardId: selectedBarcode.stockCardId,
    branchId: selectedBarcode.branchId,
    companyId: selectedBarcode.companyId,
  } : {
    barcodeCode: '',
    barcodeType: BarcodeType.EAN13,
    isDefault: false,
    stockCardId: 0,
    branchId: 0,
    companyId: 0,
  };

  return (
    <>
      <Stack spacing={2.5}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Barkod Yönetimi</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="info"
              startIcon={<Iconify icon="eva:search-fill" />}
              onClick={() => setOpenScanner(true)}
            >
              Barkod Tara
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => setOpenInput(true)}
            >
              Manuel Giriş
            </Button>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:checkmark-fill" />}
              onClick={handleNewBarcode}
            >
              Yeni Barkod
            </Button>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mingcute:add-line" color="primary.main" />
              <Typography variant="h6">{barcodes?.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Barkod
              </Typography>
            </Stack>
          </Card>
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:checkmark-fill" color="success.main" />
              <Typography variant="h6">
                {barcodes?.filter(b => b.isDefault).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Varsayılan Barkod
              </Typography>
            </Stack>
          </Card>
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mingcute:add-line" color="info.main" />
              <Typography variant="h6">
                {new Set(barcodes?.map(b => b.barcodeType) || []).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Barkod Türü
              </Typography>
            </Stack>
          </Card>
        </Stack>

        {/* Table */}
        <Card>
          <BarcodesTableToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDelete={() => {
              // Toplu silme işlemi
              selected.forEach(id => deleteBarcodeMutation.mutate(id));
              setSelected([]);
            }}
            onBulkPrint={handleBulkPrint}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <BarcodesTableHead
                  order={order}
                  orderBy={orderBy}
                  numSelected={selected.length}
                  rowCount={barcodes.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {paginatedBarcodes.map((barcode) => (
                    <BarcodesTableRow
                      key={barcode.id}
                      barcode={barcode}
                      selected={selected.indexOf(barcode.id) !== -1}
                      onSelectClick={(event) => handleSelectClick(event, barcode.id)}
                      onView={() => handleView(barcode)}
                      onEdit={() => handleEdit(barcode)}
                      onDelete={() => handleDelete(barcode)}
                      onSetDefault={() => handleSetDefault(barcode)}
                      onPreview={() => handlePreview(barcode)}
                    />
                  ))}

                  {isNotFound && <TableNoData searchQuery={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            page={page}
            component="div"
            count={filteredBarcodes.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Stack>

      {/* Forms */}
      <BarcodeForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmitForm}
        isEditMode={isEditMode}
        initialData={initialData}
      />

      {/* Detay Modalı */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Barkod Detayı</DialogTitle>
        <DialogContent dividers>
          {selectedBarcode ? (
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Kod</Typography>
              <Typography variant="body2">{selectedBarcode.barcodeCode}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 1 }}>Tür</Typography>
              <Typography variant="body2">{BarcodeTypeLabels[selectedBarcode.barcodeType]}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 1 }}>Stok Kartı</Typography>
              <Typography variant="body2">{selectedBarcode.stockCardName || 'Bilinmiyor'}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 1 }}>Durum</Typography>
              <Typography variant="body2">{selectedBarcode.isDefault ? 'Varsayılan' : 'Normal'}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 1 }}>Şirket / Şube</Typography>
              <Typography variant="body2">{companyNameById(selectedBarcode.companyId)} / {branchNameById(selectedBarcode.branchId)}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 1 }}>Oluşturma Tarihi</Typography>
              <Typography variant="body2">{new Date(selectedBarcode.createDate).toLocaleString('tr-TR')}</Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Kayıt bulunamadı.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Barkod Önizleme */}
      {previewBarcode && (
        <BarcodePreviewModal
          open={openPreview}
          onClose={() => setOpenPreview(false)}
          barcodeCode={previewBarcode.barcodeCode}
          barcodeType={previewBarcode.barcodeType}
          stockCardName={previewBarcode.stockCardName}
          title={`${BarcodeTypeLabels[previewBarcode.barcodeType]} - Önizleme`}
        />
      )}

      {/* Barkod Tarayıcı */}
      <BarcodeScanner
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        onScan={handleScan}
        title="Barkod Tarayıcı"
        allowManualEntry
      />

      {/* Manuel Barkod Girişi */}
      <BarcodeInputModal
        open={openInput}
        onClose={() => setOpenInput(false)}
        onConfirm={handleManualInput}
        title="Manuel Barkod Girişi"
        label="Barkod Kodu"
        placeholder="Taranacak barkod kodunu girin"
      />
    </>
  );
}

// Table Head Component
interface BarcodesTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: string;
  numSelected: number;
  rowCount: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function BarcodesTableHead({
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  onSelectAllClick,
}: BarcodesTableHeadProps) {
  const headLabel = [
    { id: 'barcodeCode', label: 'Barkod Kodu' },
    { id: 'barcodeType', label: 'Barkod Türü' },
    { id: 'stockCardName', label: 'Stok Kartı' },
    { id: 'isDefault', label: 'Varsayılan' },
    { id: 'createDate', label: 'Oluşturma Tarihi' },
    { id: 'actions', label: 'İşlemler' },
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <div onClick={(event) => onRequestSort(event, headCell.id)}>
              {headCell.label}
            </div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
