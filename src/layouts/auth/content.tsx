import type { BoxProps } from '@mui/material/Box';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Logo } from 'src/components/logo';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export type AuthContentProps = BoxProps;

export function AuthContent({ sx, children, className, ...other }: AuthContentProps) {
  const theme = useTheme();

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        px: 0,
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          width: '100%',
          minHeight: '80vh',
          borderRadius: { xs: 0, md: 2 },
          overflow: 'hidden',
          boxShadow: { xs: 0, md: '0 20px 40px rgba(0,0,0,0.1)' },
          mx: { xs: 0, md: 2 }
        }}
      >
        {/* Sol Kolon - Marka ve Açıklama */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.primary.dark} 100%)`,
              opacity: 0.9,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 4 }}>
            {/* Logo ve StokNet yan yana */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', // Geri center yap
              mb: 0,  
            }}>
              <Logo 
                sx={{ 
                  width: 140,
                  height: 140,
                  mr: -2,  
                }} 
              />
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '3rem',
                  color: 'inherit',
                  ml: -2,  
                }}
              >
                StokNet
              </Typography>
            </Box>

            {/* Slogan - Tam altına */}
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4,
                opacity: 0.95,
                fontWeight: 500,
                fontStyle: 'italic',
                mt: 0,  
                transform: 'translateY(-20px)', 
                textAlign: 'center', 
                width: '100%', // Tam genişlik
              }}
            >
              Stoklarınız Kontrol Altında
            </Typography>

            {/* Ana Açıklama */}
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 3,
                opacity: 0.9,
                fontWeight: 400,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.4,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Envanterinizi kolayca yönetin, stok takibinizi dijitalleştirin
            </Typography>
          </Box>
        </Box>

        {/* Sağ Kolon - Login Formu */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            py: { xs: 1, md: 0 }, // Daha az padding
          }}
        >
          <Box
            className={mergeClasses([layoutClasses.content, className])}
            sx={[
              {
                py: { xs: 2, md: 2 }, // Çok az padding
                px: { xs: 3, md: 4 },
                width: '100%',
                maxWidth: 480,
                display: 'flex',
                flexDirection: 'column',
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
