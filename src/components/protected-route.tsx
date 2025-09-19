import { Navigate, useLocation } from 'react-router';

import { useAuth } from 'src/contexts/auth-context';
import { RoleAccessGuard } from './role-access-guard';

// ----------------------------------------------------------------------

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Loading durumunda spinner göster
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa sign-in sayfasına yönlendir
  if (!isAuthenticated) {
    console.log('🔐 User not authenticated, redirecting to sign-in');
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  console.log('🔐 User authenticated, rendering protected content');

  // Eğer kullanıcı giriş yapmışsa children'ı RoleAccessGuard ile kontrol ederek render et
  return (
    <RoleAccessGuard>
      {children}
    </RoleAccessGuard>
  );
}
