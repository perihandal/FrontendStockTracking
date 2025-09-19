import { ReactNode } from 'react';
import { Navigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  requireAll?: boolean; // Default false: any role matches, true: all roles required
  fallbackPath?: string; // Where to redirect if access denied
  showErrorMessage?: boolean; // Show error message instead of redirect
}

export function RoleGuard({ 
  children, 
  requiredRoles = [], 
  requireAll = false,
  fallbackPath = '/dashboard',
  showErrorMessage = true
}: RoleGuardProps) {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();

  // Loading durumunda spinner göster
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa sign-in sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Eğer required roles belirtilmemişse tüm authenticated kullanıcılar geçebilir
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Role kontrolü
  const hasPermission = requireAll 
    ? requiredRoles.every(role => hasRole(role))
    : requiredRoles.some(role => hasRole(role));

  if (!hasPermission) {
    if (showErrorMessage) {
      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Erişim Reddedildi
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Bu sayfaya erişim yetkiniz bulunmamaktadır. 
              {requiredRoles.length === 1 
                ? ` Bu sayfaya erişmek için '${requiredRoles[0]}' rolüne sahip olmanız gerekmektedir.`
                : ` Bu sayfaya erişmek için şu rollerden ${requireAll ? 'hepsine' : 'birine'} sahip olmanız gerekmektedir: ${requiredRoles.join(', ')}.`
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mevcut rolünüz: {user?.roles?.join(', ') || 'Rol bilgisi yok'}
            </Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            Geri Dön
          </Button>
          <Button 
            variant="outlined" 
            href="/dashboard"
          >
            Ana Sayfaya Git
          </Button>
        </Box>
      );
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

// Specific role guards for convenience
export function AdminOnlyGuard({ children, fallbackPath, showErrorMessage }: { 
  children: ReactNode; 
  fallbackPath?: string; 
  showErrorMessage?: boolean; 
}) {
  return (
    <RoleGuard 
      requiredRoles={['Admin']} 
      fallbackPath={fallbackPath}
      showErrorMessage={showErrorMessage}
    >
      {children}
    </RoleGuard>
  );
}

export function EditorAndAboveGuard({ children, fallbackPath, showErrorMessage }: { 
  children: ReactNode; 
  fallbackPath?: string; 
  showErrorMessage?: boolean; 
}) {
  return (
    <RoleGuard 
      requiredRoles={['Admin', 'Editor']} 
      fallbackPath={fallbackPath}
      showErrorMessage={showErrorMessage}
    >
      {children}
    </RoleGuard>
  );
}
