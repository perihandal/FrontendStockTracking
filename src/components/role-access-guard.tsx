import React from 'react';

import { Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';


interface RoleAccessGuardProps {
  children: React.ReactNode;
}

export function RoleAccessGuard({ children }: RoleAccessGuardProps) {
  const { user, logout } = useAuth();

  // Kullanıcının rolü yoksa veya boş dizi ise
  if (user && (!user.roles || user.roles.length === 0)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Iconify
                icon="solar:shield-keyhole-bold-duotone"
                sx={{ fontSize: 64, color: 'warning.main' }}
              />
            </Box>
            
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Hesap Erişimi Beklemede
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Hesabınız oluşturulmuş ancak henüz yetkilendirilmemiş durumda. 
              Sisteme erişebilmek için sistem yöneticisi tarafından size rol atanması gerekiyor.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Ne yapmalısınız?</strong><br />
                • Sistem yöneticisi ile iletişime geçin<br />
                • Size uygun rol atanmasını talep edin<br />
                • Rol atandıktan sonra tekrar giriş yapın
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.href = 'mailto:admin@company.com?subject=Rol Atama Talebi'}
                startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
              >
                Admin ile İletişime Geç
              </Button>
              
              <Button
                variant="outlined"
                onClick={logout}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Çıkış Yap
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Kullanıcı: {user.username} ({user.email})
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Kullanıcının rolü varsa normal içeriği göster
  return <>{children}</>;
}