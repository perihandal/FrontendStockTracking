import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { AuthService } from 'src/services/api';

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    const { firstName, lastName, username, email, password, confirmPassword } = formData;

    if (!firstName.trim()) {
      setError('Ad gereklidir');
      return false;
    }
    if (!lastName.trim()) {
      setError('Soyad gereklidir');
      return false;
    }
    if (!username.trim()) {
      setError('Kullanıcı adı gereklidir');
      return false;
    }
    if (!email.trim()) {
      setError('E-posta gereklidir');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return false;
    }
    if (!password.trim()) {
      setError('Şifre gereklidir');
      return false;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }

    return true;
  };

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // API çağrısı yap
      const registerData = {
        username: formData.username,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      };

      const response = await AuthService.register(registerData);
      
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      console.log('✅ Registration successful:', response);
      
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [formData, router]);

  const handleSignInRedirect = () => {
    router.push('/sign-in');
  };

  const renderForm = (
    <Box
      component="form"
      onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%' }}>
        <TextField
          fullWidth
          name="firstName"
          label="Ad"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          disabled={isLoading}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
        <TextField
          fullWidth
          name="lastName"
          label="Soyad"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          disabled={isLoading}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
      </Box>

      <TextField
        fullWidth
        name="username"
        label="Kullanıcı Adı"
        value={formData.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        sx={{ mb: 3 }}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="email"
        label="E-posta"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        sx={{ mb: 3 }}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Rol</InputLabel>
        <Select
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          label="Rol"
          disabled={isLoading}
        >
          <MenuItem value="User">Kullanıcı</MenuItem>
          <MenuItem value="Editor">Editör</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        name="password"
        label="Şifre"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        type={showPassword ? 'text' : 'password'}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Şifre Tekrar"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        type={showConfirmPassword ? 'text' : 'password'}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
      >
        {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Kayıt Ol</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Zaten hesabınız var mı?
          <Typography
            component="span"
            variant="subtitle2"
            sx={{ ml: 0.5, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={handleSignInRedirect}
          >
            Giriş Yap
          </Typography>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          VEYA
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}