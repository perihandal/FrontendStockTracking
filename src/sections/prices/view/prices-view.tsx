import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

import { PriceDefinitionForm } from '../price-definition-form';
import { PriceDefinitionTableRow } from '../price-definition-table-row';
import { PriceDefinitionTableToolbar } from '../price-definition-table-toolbar';
import { PriceHistoryTableRow } from '../price-history-table-row';
import { PriceHistoryTableToolbar } from '../price-history-table-toolbar';
import { TableNoData } from '../table-no-data';

import type { PriceDefinition, PriceHistoryDto } from '../prices.types';
import { PriceService } from 'src/services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`price-tabpanel-${index}`}
      aria-labelledby={`price-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function PricesView() {
  const [currentTab, setCurrentTab] = useState(0);
  
  // Price Definitions state
  const [priceDefinitions, setPriceDefinitions] = useState<PriceDefinition[]>([]);
  const [filteredPriceDefinitions, setFilteredPriceDefinitions] = useState<PriceDefinition[]>([]);
  const [priceDefinitionFilter, setPriceDefinitionFilter] = useState('');
  
  // Price History state
  const [priceHistory, setPriceHistory] = useState<PriceHistoryDto[]>([]);
  const [filteredPriceHistory, setFilteredPriceHistory] = useState<PriceHistoryDto[]>([]);
  const [priceHistoryFilter, setPriceHistoryFilter] = useState('');
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPriceDefinition, setEditingPriceDefinition] = useState<PriceDefinition | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data functions
  const loadPriceDefinitions = async () => {
    console.log('🔄 Loading price definitions...');
    setLoading(true);
    try {
      const response = await PriceService.getPriceDefinitions();
      console.log('📋 Price definitions response:', response);

      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Price definitions loaded successfully:', response.data.length, 'items');
        setPriceDefinitions(response.data);
        setFilteredPriceDefinitions(response.data);
      } else if (response.errorMessage) {
        console.log('❌ Price definitions load error:', response.errorMessage);
        setSnackbar({
          open: true,
          message: Array.isArray(response.errorMessage) ? response.errorMessage.join(', ') : response.errorMessage,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('❌ Error loading price definitions:', error);
      setSnackbar({
        open: true,
        message: 'Fiyat tanımları yüklenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPriceHistory = async () => {
    console.log('🔄 Loading price history...');
    setLoading(true);
    try {
      const response = await PriceService.getPriceHistory();
      console.log('📋 Price history response:', response);

      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Price history loaded successfully:', response.data.length, 'items');
        setPriceHistory(response.data);
        setFilteredPriceHistory(response.data);
      } else if (response.errorMessage) {
        console.log('❌ Price history load error:', response.errorMessage);
        setSnackbar({
          open: true,
          message: Array.isArray(response.errorMessage) ? response.errorMessage.join(', ') : response.errorMessage,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('❌ Error loading price history:', error);
      setSnackbar({
        open: true,
        message: 'Fiyat geçmişi yüklenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (currentTab === 0) {
      loadPriceDefinitions();
    } else if (currentTab === 1) {
      loadPriceHistory();
    }
  }, [currentTab]);

  // Filter functions
  const handlePriceDefinitionFilterChange = (filter: string) => {
    setPriceDefinitionFilter(filter);
    const filtered = priceDefinitions.filter(
      (item) =>
        item.stockCardName.toLowerCase().includes(filter.toLowerCase()) ||
        item.userFullName.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredPriceDefinitions(filtered);
  };

  const handlePriceHistoryFilterChange = (filter: string) => {
    setPriceHistoryFilter(filter);
    const filtered = priceHistory.filter(
      (item) =>
        item.stockCardName.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredPriceHistory(filtered);
  };

  // Form handlers
  const handleCreateClick = () => {
    setEditingPriceDefinition(null);
    setIsEdit(false);
    setFormOpen(true);
  };

  const handleEdit = (priceDefinition: PriceDefinition) => {
    setEditingPriceDefinition(priceDefinition);
    setIsEdit(true);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await PriceService.deletePriceDefinition(id);
      if (response.data && !response.errorMessage) {
        setSnackbar({
          open: true,
          message: 'Fiyat tanımı başarıyla silindi',
          severity: 'success',
        });
        loadPriceDefinitions();
      } else {
        setSnackbar({
          open: true,
          message: 'Fiyat tanımı silinirken hata oluştu',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting price definition:', error);
      setSnackbar({
        open: true,
        message: 'Fiyat tanımı silinirken hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleFormSuccess = () => {
    console.log('🎉 Form success callback triggered');
    loadPriceDefinitions();
    setFormOpen(false);
    setEditingPriceDefinition(null);
    setIsEdit(false);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedPriceDefinitions = useMemo(() => {
    return filteredPriceDefinitions.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredPriceDefinitions, page, rowsPerPage]);

  const paginatedPriceHistory = useMemo(() => {
    return filteredPriceHistory.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredPriceHistory, page, rowsPerPage]);

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Fiyat Yönetimi</Typography>
      </Stack>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            aria-label="price management tabs"
          >
            <Tab
              label="Fiyat Tanımları"
              icon={<Iconify icon="solar:tag-price-bold" />}
              iconPosition="start"
            />
            <Tab
              label="Fiyat Geçmişi"
              icon={<Iconify icon="solar:history-bold" />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Price Definitions Tab */}
        <TabPanel value={currentTab} index={0}>
          <PriceDefinitionTableToolbar
            onFilterChange={handlePriceDefinitionFilterChange}
            onCreateClick={handleCreateClick}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stok Kartı</TableCell>
                  <TableCell>Fiyat Tipi</TableCell>
                  <TableCell>Fiyat</TableCell>
                  <TableCell>Geçerlilik Başlangıcı</TableCell>
                  <TableCell>Geçerlilik Bitişi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Oluşturan</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedPriceDefinitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <TableNoData />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPriceDefinitions.map((priceDefinition) => (
                    <PriceDefinitionTableRow
                      key={priceDefinition.id}
                      priceDefinition={priceDefinition}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPriceDefinitions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına satır:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </TabPanel>

        {/* Price History Tab */}
        <TabPanel value={currentTab} index={1}>
          <PriceHistoryTableToolbar onFilterChange={handlePriceHistoryFilterChange} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stok Kartı</TableCell>
                  <TableCell>Eski Fiyat</TableCell>
                  <TableCell>Yeni Fiyat</TableCell>
                  <TableCell>Değişim</TableCell>
                  <TableCell>Değişim Tarihi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedPriceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <TableNoData />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPriceHistory.map((history, index) => (
                    <PriceHistoryTableRow
                      key={index}
                      priceHistory={history}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPriceHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına satır:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </TabPanel>
      </Card>

      {/* Form Dialog */}
      <PriceDefinitionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        priceDefinition={editingPriceDefinition || undefined}
        isEdit={isEdit}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
