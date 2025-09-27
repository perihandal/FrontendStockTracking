import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';  
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { fDateTime } from 'src/utils/format-time';

import { useAuth } from 'src/contexts/auth-context';
import { CompanyService, BranchService, WarehouseService, AuthService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { user, changePassword, getCompanyId, getBranchId } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const companyId = getCompanyId();
  const branchId = getBranchId();

  // Fetch current user profile (herkes erişebilir)
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => AuthService.getUserProfile(),
    enabled: !!user,
  });

  // Fetch user status (aktif/pasif kontrolü için)
  const { data: userStatus } = useQuery({
    queryKey: ['userStatus'],
    queryFn: () => AuthService.getUserStatus(),
    enabled: !!user,
  });

  // En güncel kullanıcı bilgisi (profile API'sinden)
  const currentUser = userProfile || user;
  
  // isActive değerini userStatus'tan al (her zaman boolean)
  const isUserActive = userStatus?.isActive || currentUser?.isActive || false;

  // Fetch company data - eğer profile'da yoksa companies listesinden bulalım
  const effectiveCompanyId = companyId || userProfile?.companyId;
  const effectiveBranchId = branchId || userProfile?.branchId;

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => CompanyService.getCompanies(),
    enabled: !!effectiveCompanyId && !userProfile?.companyName,
  });

  const company = userProfile?.companyName ? 
    { name: userProfile.companyName } : 
    companies?.data?.find((c: any) => c.id === effectiveCompanyId);

  // Fetch branch data - eğer profile'da yoksa API'den çek
  const { data: branchResponse } = useQuery({
    queryKey: ['branch', effectiveBranchId],
    queryFn: () => BranchService.getBranchById(effectiveBranchId!),
    enabled: !!effectiveBranchId && !userProfile?.branchName,
  });

  const branch = userProfile?.branchName ?
    { name: userProfile.branchName } :
    branchResponse?.data;

  // Fetch warehouses based on user's branch
  const { data: warehousesResponse } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => WarehouseService.getWarehouses(),
    enabled: !!effectiveBranchId,
  });

  const warehouses = warehousesResponse?.data?.filter((w: any) => w.branchId === effectiveBranchId);

  // Debug user data
  console.log('🔍 ProfileView - User data:', user);
  console.log('🔍 ProfileView - User profile:', userProfile);
  console.log('🔍 ProfileView - User status:', userStatus);
  console.log('🔍 ProfileView - User roles:', user?.roles);
  console.log('🔍 ProfileView - Current user data:', currentUser);
  console.log('🔍 ProfileView - Is user active:', isUserActive);
  console.log('🔍 ProfileView - Company ID from JWT:', companyId);
  console.log('🔍 ProfileView - Branch ID from JWT:', branchId);
  console.log('🔍 ProfileView - Company from profile:', userProfile?.companyId, userProfile?.companyName);
  console.log('🔍 ProfileView - Branch from profile:', userProfile?.branchId, userProfile?.branchName);
  console.log('🔍 ProfileView - LocalStorage user:', localStorage.getItem('user'));

  const handleChangePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: '⚠️ Yeni parolalar eşleşmiyor! Lütfen parolaları tekrar kontrol edin.',
        severity: 'error',
      });
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setSnackbar({
        open: true,
        message: '📝 Lütfen tüm alanları doldurun! Mevcut parola ve yeni parola gereklidir.',
        severity: 'error',
      });
      return;
    }

    try {
      const success = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (success) {
        setSnackbar({
          open: true,
          message: '✅ Parolanız başarıyla değiştirildi! Yeni parolanızla giriş yapabilirsiniz.',
          severity: 'success',
        });
        setChangePasswordOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setSnackbar({
          open: true,
          message: '❌ Parola değiştirilemedi. Lütfen mevcut parolanızın doğru olduğundan emin olun.',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: '🔧 Bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Kullanıcı bilgileri yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          Profil
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profil Kartı */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {currentUser.fullName?.charAt(0).toUpperCase() || currentUser.username?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {currentUser.fullName || currentUser.username}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {currentUser.email}
            </Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                {currentUser.roles?.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    color={role === 'Admin' ? 'error' : role === 'Editor' ? 'warning' : 'default'}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            <Chip
              label={isUserActive ? 'Aktif' : 'Pasif'}
              color={isUserActive ? 'success' : 'error'}
              size="small"
            />

            <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={() => setChangePasswordOpen(true)}
              >
                Parola Değiştir
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Kullanıcı Detayları */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:pen-bold" />
                  Kullanıcı Bilgileri
                </Box>
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={3}>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kullanıcı Adı
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {currentUser.username}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ad Soyad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {currentUser.fullName || 'Belirtilmemiş'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      E-posta
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {currentUser.email}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hesap Durumu
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      <Chip
                        label={isUserActive ? 'Aktif' : 'Pasif'}
                        color={isUserActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Şirket
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {userProfile?.companyName || 
                       company?.name || 
                       (user?.roles?.includes('Admin') ? 'Tüm Şirketler' : 'Belirtilmemiş')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kayıt Tarihi
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {user?.createdDate ? fDateTime(user.createdDate) : 'Bilinmiyor'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Şube
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {userProfile?.branchName || 
                       branch?.name || 
                       (user?.roles?.includes('Admin') ? 'Tüm Şubeler' : 'Belirtilmemiş')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Erişilebilir Depolar
                    </Typography>
                    {user?.roles?.includes('Admin') ? (
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
                        🏢 Tüm depolara erişim yetkisi
                      </Typography>
                    ) : warehouses && warehouses.length > 0 ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {warehouses.map((warehouse: any) => (
                          <Chip
                            key={warehouse.id}
                            label={warehouse.name}
                            color="primary"
                            variant="outlined"
                            size="small"
                            icon={<Iconify icon="solar:pen-bold" />}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {effectiveBranchId ? 'Bu şubeye ait depo bulunamadı' : 'Şube bilgisi bulunamadı'}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Roller
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {currentUser.roles?.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            color={role === 'Admin' ? 'error' : role === 'Editor' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Parola Değiştirme Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:pen-bold" />
            Parola Değiştir
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Mevcut Parola"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
            <TextField
              fullWidth
              type="password"
              label="Yeni Parola"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <TextField
              fullWidth
              type="password"
              label="Yeni Parola (Tekrar)"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePasswordSubmit}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Parola Değiştir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            fontWeight: 'medium'
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}