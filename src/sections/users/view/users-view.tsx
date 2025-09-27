import type { ChangeEvent } from 'react';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useAuth } from 'src/contexts/auth-context';
import { CompanyService, type CompanyDto, type BranchDto } from 'src/services/api/company-service';
import { UserService, type UserDto, type UserUpdateDto, type CompanyAssignDto } from 'src/services/api/user-service';

import { Iconify } from 'src/components/iconify';


export function UsersView() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(['Admin', 'Editor', 'User']);
  const [editFormData, setEditFormData] = useState<{
    fullName: string;
    email: string;
    isActive: boolean;
    roles: string[];
    companyId?: number;
    branchId?: number;
  }>({
    fullName: '',
    email: '',
    isActive: true,
    roles: [],
    companyId: undefined,
    branchId: undefined,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // API'den kullanıcıları yükle
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await UserService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        setSnackbar({
          open: true,
          message: 'Kullanıcılar yüklenirken hata oluştu!',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    // Sadece admin kullanıcıları için veri yükle
    if (isAdmin()) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Companies, branches ve roles yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesResponse, branchesResponse, rolesData] = await Promise.all([
          CompanyService.getCompanies(),
          CompanyService.getBranches(),
          UserService.getAllRoles()
        ]);

        if (companiesResponse.data) {
          setCompanies(companiesResponse.data);
        }
        
        if (branchesResponse.data) {
          setBranches(branchesResponse.data);
        }

        setAvailableRoles(rolesData);
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
      }
    };

    if (isAdmin()) {
      fetchData();
    }
  }, [isAdmin]);

  // Admin kontrolü - admin değilse erişim yok
  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Bu sayfaya erişim izniniz yok. Sadece Admin kullanıcıları kullanıcıları görüntüleyebilir.
        </Alert>
      </Box>
    );
  }

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

  const handleView = (user: UserDto) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleEdit = async (user: UserDto) => {
    try {
      // Kullanıcının güncel detaylarını API'den al
      const userDetails = await UserService.getUserById(user.id);
      
      setSelectedUser(userDetails);
      setEditFormData({
        fullName: userDetails.fullName,
        email: userDetails.email,
        isActive: userDetails.isActive,
        roles: userDetails.roles || [],
        companyId: userDetails.companyId,
        branchId: userDetails.branchId,
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error('Kullanıcı detayları yüklenirken hata:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcı detayları yüklenirken hata oluştu!',
        severity: 'error',
      });
    }
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;

    try {
      // 1. Temel kullanıcı bilgilerini güncelle
      const userUpdateData: UserUpdateDto = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        isActive: editFormData.isActive,
        companyId: editFormData.companyId || null,
        branchId: editFormData.branchId || null,
        roles: editFormData.roles,
      };

      const updateResponse = await UserService.updateUser(selectedUser.id, userUpdateData);
      
      if (updateResponse.errorMessage) {
        setSnackbar({
          open: true,
          message: updateResponse.errorMessage,
          severity: 'error',
        });
        return;
      }

      // 2. Rolleri ayrı olarak güncelle
      const rolesResponse = await UserService.updateUserRoles(selectedUser.id, editFormData.roles);
      
      if (rolesResponse.errorMessage) {
        console.warn('Rol güncelleme hatası:', rolesResponse.errorMessage);
      }

      // 3. Şirket/branch bilgilerini güncelle (eğer seçilmişse)
      if (editFormData.companyId) {
        const companyAssignData: CompanyAssignDto = {
          companyId: editFormData.companyId,
          branchId: editFormData.branchId || null,
        };

        const companyResponse = await UserService.assignCompany(selectedUser.id, companyAssignData);
        
        if (companyResponse.errorMessage) {
          console.warn('Şirket atama hatası:', companyResponse.errorMessage);
        }
      } else {
        // Şirket seçimi kaldırılmışsa şirketten çıkar
        await UserService.removeCompany(selectedUser.id);
      }

      // Kullanıcı listesini güncelle
      const updatedUsers = await UserService.getUsers();
      setUsers(updatedUsers);

      setSnackbar({
        open: true,
        message: `${selectedUser.fullName} kullanıcısı başarıyla güncellendi!`,
        severity: 'success',
      });

      setEditModalOpen(false);
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcı güncellenirken hata oluştu!',
        severity: 'error',
      });
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setEditFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
  };

  const handleCompanyChange = (companyId: number) => {
    setEditFormData(prev => ({
      ...prev,
      companyId,
      branchId: undefined, // Şirket değiştiğinde branch'i sıfırla
    }));
  };

  const getFilteredBranches = () => {
    if (!editFormData.companyId) return [];
    return branches.filter(branch => branch.companyId === editFormData.companyId);
  };

  const handleDelete = (user: UserDto) => {
    if (window.confirm(`${user.fullName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      // API'den sil
      setSnackbar({
        open: true,
        message: `${user.fullName} kullanıcısı silme özelliği yakında eklenecek!`,
        severity: 'success',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(filterName.toLowerCase()) ||
    user.username.toLowerCase().includes(filterName.toLowerCase()) ||
    user.email.toLowerCase().includes(filterName.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Kullanıcılar
        </Typography>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterName}
            placeholder="Kullanıcı ara..."
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
                <TableCell>Kullanıcı Adı</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Aktif' : 'Pasif'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleView(user)}
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEdit(user)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(user)}
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
          count={filteredUsers.length}
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
            Kullanıcı Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Kullanıcı Adı</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.username}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Ad Soyad</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.fullName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">E-posta</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.email}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                  <Chip
                    label={selectedUser.isActive ? 'Aktif' : 'Pasif'}
                    color={selectedUser.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
              {selectedUser.roles && selectedUser.roles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Roller</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {selectedUser.roles.map((role) => (
                      <Chip key={role} label={role} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
              {(selectedUser.companyName || selectedUser.branchName) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {selectedUser.companyName && (
                    <Box sx={{ flex: '1 1 45%' }}>
                      <Typography variant="subtitle2" color="text.secondary">Şirket</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.companyName}</Typography>
                    </Box>
                  )}
                  {selectedUser.branchName && (
                    <Box sx={{ flex: '1 1 45%' }}>
                      <Typography variant="subtitle2" color="text.secondary">Şube</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.branchName}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
          <Button 
            variant="contained" 
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => { 
              handleEdit(selectedUser!); 
              setDetailModalOpen(false); 
            }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kullanıcı Düzenleme Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            Kullanıcı Düzenle
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Kullanıcı Bilgileri */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Kullanıcı Bilgileri</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 45%' }}>
                      <Typography variant="body2" color="text.secondary">Kullanıcı Adı</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{selectedUser.username}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%' }}>
                      <TextField
                        fullWidth
                        label="Ad Soyad"
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="E-posta"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Durum */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Durum</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label={editFormData.isActive ? 'Aktif' : 'Pasif'}
                />
              </Box>

              {/* Rol Atama */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Roller</Typography>
                <Stack direction="row" flexWrap="wrap" spacing={2}>
                  {availableRoles.map((role) => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Switch
                          checked={editFormData.roles.includes(role)}
                          onChange={(e) => handleRoleChange(role, e.target.checked)}
                        />
                      }
                      label={role}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Şirket ve Şube Atama */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Şirket ve Şube</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <FormControl fullWidth>
                      <InputLabel>Şirket</InputLabel>
                      <Select
                        value={editFormData.companyId || ''}
                        onChange={(e) => handleCompanyChange(Number(e.target.value))}
                        label="Şirket"
                      >
                        <MenuItem value="">
                          <em>Şirket Seçin</em>
                        </MenuItem>
                        {companies.map((company) => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <FormControl fullWidth disabled={!editFormData.companyId}>
                      <InputLabel>Şube</InputLabel>
                      <Select
                        value={editFormData.branchId || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, branchId: Number(e.target.value) }))}
                        label="Şube"
                      >
                        <MenuItem value="">
                          <em>Şube Seçin</em>
                        </MenuItem>
                        {getFilteredBranches().map((branch) => (
                          <MenuItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleEditSave}
            startIcon={<Iconify icon="solar:eye-bold" />}
          >
            Kaydet
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