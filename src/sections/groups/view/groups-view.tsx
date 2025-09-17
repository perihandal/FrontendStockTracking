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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Iconify } from 'src/components/iconify';
import { CategoryService, UserService } from 'src/services/api';
import { MainGroupForm } from '../main-group-form';
import { SubGroupForm } from '../sub-group-form';
import { MainGroupsTableRow } from '../main-groups-table-row';
import { SubGroupsTableRow } from '../sub-groups-table-row';
import { MainGroupsTableToolbar } from '../main-groups-table-toolbar';
import { SubGroupsTableToolbar } from '../sub-groups-table-toolbar';
import { TableNoData } from '../table-no-data';
import type { MainGroup, SubGroup } from '../groups.types';

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
      id={`groups-tabpanel-${index}`}
      aria-labelledby={`groups-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function GroupsView() {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMainGroup, setSelectedMainGroup] = useState<MainGroup | null>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState<SubGroup | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mainGroupFormModalOpen, setMainGroupFormModalOpen] = useState(false);
  const [subGroupFormModalOpen, setSubGroupFormModalOpen] = useState(false);
  const [editingMainGroup, setEditingMainGroup] = useState<MainGroup | null>(null);
  const [editingSubGroup, setEditingSubGroup] = useState<SubGroup | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Load data on component mount
  useEffect(() => {
    loadMainGroups();
    loadSubGroups();
  }, []);

  const loadMainGroups = async () => {
    console.log('🔄 Loading main groups...');
    setLoading(true);
    try {
      const response = await CategoryService.getMainGroups();
      console.log('📋 Main groups response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Main groups loaded successfully:', response.data.length, 'items');
        
        // Users'ları çek
        const users = await UserService.getUsers();
        console.log('👥 Users loaded:', users.length, 'users');
        
        // Backend'den gelen veriyi frontend formatına çevir
        const formattedMainGroups: MainGroup[] = response.data.map((item: any) => {
          const user = users.find(u => u.id === item.userId);
          return {
            id: item.id,
            code: item.code,
            name: item.name,
            isActive: item.isActive,
            userId: item.userId || 1,
            userName: user?.fullName || user?.username || 'Bilinmeyen Kullanıcı',
          };
        });
        setMainGroups(formattedMainGroups);
      } else if (response.errorMessage) {
        console.log('❌ Main groups load error:', response.errorMessage);
        setSnackbar({
          open: true,
          message: response.errorMessage,
          severity: 'error',
        });
      } else {
        console.log('❌ Main groups load error: No data and no error message');
        setSnackbar({
          open: true,
          message: 'Ana gruplar yüklenirken hata oluştu',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('❌ Error loading main groups:', error);
      setSnackbar({
        open: true,
        message: 'Ana gruplar yüklenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      console.log('✅ Main groups loading completed');
    }
  };

  const loadSubGroups = async () => {
    console.log('🔄 Loading sub groups...');
    setLoading(true);
    try {
      const response = await CategoryService.getSubGroups();
      console.log('📋 Sub groups response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Sub groups loaded successfully:', response.data.length, 'items');
        
        // Users ve Main Groups'ları çek
        const [users, mainGroups] = await Promise.all([
          UserService.getUsers(),
          CategoryService.getMainGroups()
        ]);
        
        console.log('👥 Users loaded:', users.length, 'users');
        console.log('📁 Main groups loaded:', mainGroups.data?.length || 0, 'main groups');
        
        // Backend'den gelen veriyi frontend formatına çevir
        const formattedSubGroups: SubGroup[] = response.data.map((item: any) => {
          const user = users.find(u => u.id === item.userId);
          const mainGroup = mainGroups.data?.find(mg => mg.id === item.mainGroupId);
          return {
            id: item.id,
            code: item.code,
            name: item.name,
            isActive: item.isActive,
            userId: item.userId || 1,
            userName: user?.fullName || user?.username || 'Bilinmeyen Kullanıcı',
            mainGroupId: item.mainGroupId,
            mainGroupName: mainGroup?.name || 'Bilinmeyen Ana Grup',
          };
        });
        setSubGroups(formattedSubGroups);
      } else if (response.errorMessage) {
        console.log('❌ Sub groups load error:', response.errorMessage);
        setSnackbar({
          open: true,
          message: response.errorMessage,
          severity: 'error',
        });
      } else {
        console.log('❌ Sub groups load error: No data and no error message');
        setSnackbar({
          open: true,
          message: 'Alt gruplar yüklenirken hata oluştu',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('❌ Error loading sub groups:', error);
      setSnackbar({
        open: true,
        message: 'Alt gruplar yüklenirken hata oluştu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      console.log('✅ Sub groups loading completed');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    setFilterName('');
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

  // Main Group handlers
  const handleMainGroupView = (mainGroup: MainGroup) => {
    setSelectedMainGroup(mainGroup);
    setDetailModalOpen(true);
  };

  const handleMainGroupEdit = (mainGroup: MainGroup) => {
    setEditingMainGroup(mainGroup);
    setMainGroupFormModalOpen(true);
  };

  const handleMainGroupDelete = async (mainGroup: MainGroup) => {
    if (window.confirm(`${mainGroup.name} ana grubunu silmek istediğinizden emin misiniz?`)) {
      try {
        console.log('🗑️ Deleting main group:', mainGroup.id, mainGroup.name);
        
        const response = await CategoryService.deleteMainGroup(mainGroup.id);
        console.log('📋 Delete response:', response);
        
        const isDeleteSuccess = !response.errorMessage || 
                               response.errorMessage === null ||
                               response.errorMessage === '' ||
                               (response.data && !response.errorMessage) ||
                               (response.data === null && !response.errorMessage);
        
        if (isDeleteSuccess) {
          console.log('✅ Delete successful');
          loadMainGroups();
          setSnackbar({
            open: true,
            message: 'Ana grup başarıyla silindi!',
            severity: 'success',
          });
        } else {
          console.log('❌ Delete failed:', response.errorMessage);
          setSnackbar({
            open: true,
            message: response.errorMessage || 'Ana grup silinirken hata oluştu',
            severity: 'error',
          });
        }
      } catch (error: any) {
        console.error('❌ Error deleting main group:', error);
        setSnackbar({
          open: true,
          message: 'Ana grup silinirken hata oluştu',
          severity: 'error',
        });
      }
    }
  };

  const handleMainGroupCreateClick = () => {
    setEditingMainGroup(null);
    setMainGroupFormModalOpen(true);
  };

  const handleMainGroupFormSuccess = () => {
    console.log('🔄 Main group form success - reloading main groups...');
    loadMainGroups();
    setSnackbar({
      open: true,
      message: editingMainGroup ? 'Ana grup başarıyla güncellendi!' : 'Ana grup başarıyla oluşturuldu!',
      severity: 'success',
    });
    setEditingMainGroup(null);
    console.log('✅ Main group form success handled');
  };

  // Sub Group handlers
  const handleSubGroupView = (subGroup: SubGroup) => {
    setSelectedSubGroup(subGroup);
    setDetailModalOpen(true);
  };

  const handleSubGroupEdit = (subGroup: SubGroup) => {
    setEditingSubGroup(subGroup);
    setSubGroupFormModalOpen(true);
  };

  const handleSubGroupDelete = async (subGroup: SubGroup) => {
    if (window.confirm(`${subGroup.name} alt grubunu silmek istediğinizden emin misiniz?`)) {
      try {
        console.log('🗑️ Deleting sub group:', subGroup.id, subGroup.name);
        
        const response = await CategoryService.deleteSubGroup(subGroup.id);
        console.log('📋 Delete response:', response);
        
        const isDeleteSuccess = !response.errorMessage || 
                               response.errorMessage === null ||
                               response.errorMessage === '' ||
                               (response.data && !response.errorMessage) ||
                               (response.data === null && !response.errorMessage);
        
        if (isDeleteSuccess) {
          console.log('✅ Delete successful');
          loadSubGroups();
          setSnackbar({
            open: true,
            message: 'Alt grup başarıyla silindi!',
            severity: 'success',
          });
        } else {
          console.log('❌ Delete failed:', response.errorMessage);
          setSnackbar({
            open: true,
            message: response.errorMessage || 'Alt grup silinirken hata oluştu',
            severity: 'error',
          });
        }
      } catch (error: any) {
        console.error('❌ Error deleting sub group:', error);
        setSnackbar({
          open: true,
          message: 'Alt grup silinirken hata oluştu',
          severity: 'error',
        });
      }
    }
  };

  const handleSubGroupCreateClick = () => {
    setEditingSubGroup(null);
    setSubGroupFormModalOpen(true);
  };

  const handleSubGroupFormSuccess = () => {
    console.log('🔄 Sub group form success - reloading sub groups...');
    loadSubGroups();
    setSnackbar({
      open: true,
      message: editingSubGroup ? 'Alt grup başarıyla güncellendi!' : 'Alt grup başarıyla oluşturuldu!',
      severity: 'success',
    });
    setEditingSubGroup(null);
    console.log('✅ Sub group form success handled');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredMainGroups = mainGroups.filter((mainGroup) =>
    mainGroup.name.toLowerCase().includes(filterName.toLowerCase()) ||
    mainGroup.code.toLowerCase().includes(filterName.toLowerCase())
  );

  const filteredSubGroups = subGroups.filter((subGroup) =>
    subGroup.name.toLowerCase().includes(filterName.toLowerCase()) ||
    subGroup.code.toLowerCase().includes(filterName.toLowerCase()) ||
    subGroup.mainGroupName.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Grup Yönetimi
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="groups tabs">
            <Tab label="Ana Gruplar" />
            <Tab label="Alt Gruplar" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <MainGroupsTableToolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            onCreateClick={handleMainGroupCreateClick}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ana Grup Kodu</TableCell>
                  <TableCell>Ana Grup Adı</TableCell>
                  <TableCell>Oluşturan</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredMainGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <TableNoData query={filterName} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMainGroups
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((mainGroup) => (
                      <MainGroupsTableRow
                        key={mainGroup.id}
                        mainGroup={mainGroup}
                        onView={handleMainGroupView}
                        onEdit={handleMainGroupEdit}
                        onDelete={handleMainGroupDelete}
                      />
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredMainGroups.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına kayıt:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `~${to}`}`
            }
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SubGroupsTableToolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            onCreateClick={handleSubGroupCreateClick}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alt Grup Kodu</TableCell>
                  <TableCell>Alt Grup Adı</TableCell>
                  <TableCell>Ana Grup</TableCell>
                  <TableCell>Oluşturan</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredSubGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <TableNoData query={filterName} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubGroups
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((subGroup) => (
                      <SubGroupsTableRow
                        key={subGroup.id}
                        subGroup={subGroup}
                        onView={handleSubGroupView}
                        onEdit={handleSubGroupEdit}
                        onDelete={handleSubGroupDelete}
                      />
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredSubGroups.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına kayıt:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `~${to}`}`
            }
          />
        </TabPanel>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            {selectedMainGroup ? 'Ana Grup Detayları' : 'Alt Grup Detayları'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMainGroup && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Ana Grup Kodu</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMainGroup.code}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Ana Grup Adı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMainGroup.name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Oluşturan</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedMainGroup.userName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                  <Chip
                    label={selectedMainGroup.isActive ? 'Aktif' : 'Pasif'}
                    color={selectedMainGroup.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          )}
          {selectedSubGroup && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Alt Grup Kodu</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedSubGroup.code}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Alt Grup Adı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedSubGroup.name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Ana Grup</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedSubGroup.mainGroupName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Oluşturan</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedSubGroup.userName}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                <Chip
                  label={selectedSubGroup.isActive ? 'Aktif' : 'Pasif'}
                  color={selectedSubGroup.isActive ? 'success' : 'error'}
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
              if (selectedMainGroup) {
                handleMainGroupEdit(selectedMainGroup);
              } else if (selectedSubGroup) {
                handleSubGroupEdit(selectedSubGroup);
              }
              setDetailModalOpen(false); 
            }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Modals */}
      <MainGroupForm
        open={mainGroupFormModalOpen}
        onClose={() => setMainGroupFormModalOpen(false)}
        onSuccess={handleMainGroupFormSuccess}
        mainGroup={editingMainGroup || undefined}
        isEdit={!!editingMainGroup}
      />

      <SubGroupForm
        open={subGroupFormModalOpen}
        onClose={() => setSubGroupFormModalOpen(false)}
        onSuccess={handleSubGroupFormSuccess}
        subGroup={editingSubGroup || undefined}
        isEdit={!!editingSubGroup}
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
