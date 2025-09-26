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
        width: '100%',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            width: '100%',
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            width: '100%',
            borderRadius: 2,
          }}
        >
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 1.5, width: '100%' }}>
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
        sx={{ mb: 1.5 }}
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
        sx={{ mb: 1.5 }}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

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
        sx={{ mb: 1.5 }}
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
        sx={{ mb: 2 }}
      />

      <Button
        fullWidth
        size="medium"
        type="submit"
        variant="contained"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
        sx={{
          py: 1.2,
          borderRadius: 2,
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 1.5, // Daha da azaltıldı
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h6" // Daha da küçültüldü
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.25 
          }}
        >
          StokNet'e Kayıt Ol
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: 300, // Daha da azaltıldı
            lineHeight: 1.3, // Daha da azaltıldı
          }}
        >
          Hesabınızı oluşturun ve stok yönetimini dijitalleştirmeye başlayın.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.25, // Daha da azaltıldı
          }}
        >
          Zaten hesabınız var mı?{' '}
          <Typography
            component="span"
            variant="body2"
            sx={{ 
              color: 'primary.main',
              cursor: 'pointer', 
              textDecoration: 'underline',
              fontWeight: 500,
              '&:hover': {
                color: 'primary.dark',
              }
            }}
            onClick={handleSignInRedirect}
          >
            Giriş Yap
          </Typography>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}