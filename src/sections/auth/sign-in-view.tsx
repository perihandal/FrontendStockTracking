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

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login({ username, password });
      router.push('/dashboard'); // Dashboard'a yönlendir
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login başarısız');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, login, router]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 400,
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

      <TextField
        fullWidth
        name="username"
        label="Kullanıcı Adı"
        placeholder="Kullanıcı adınızı girin"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          }
        }}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Şifre"
        placeholder="Şifrenizi girin"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowPassword(!showPassword)} 
                  edge="end"
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ 
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          }
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          mb: 3,
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>

      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Hesabınız yok mu?{' '}
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
            onClick={() => router.push('/sign-up')}
          >
            Kayıt Ol
          </Typography>
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1 
          }}
        >
          StokNet&apos;e Hoşgeldiniz
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          Envanterinizi kolayca yönetin, stok takibinizi dijitalleştirin.
          Hesabınızla giriş yaparak başlayın.
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
