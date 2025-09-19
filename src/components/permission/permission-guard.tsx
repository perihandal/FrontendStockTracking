import type { ReactNode } from 'react';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

interface PermissionGuardProps {
  children: ReactNode;
  roles?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // true: tüm roller gerekli, false: herhangi biri yeterli
}

export function PermissionGuard({ 
  children, 
  roles = [], 
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) {
  const { user, hasRole } = useAuth();

  // Eğer kullanıcı giriş yapmamışsa
  if (!user) {
    return <>{fallback}</>;
  }

  // Eğer rol kontrolü yoksa, herkese izin ver
  if (roles.length === 0) {
    return <>{children}</>;
  }

  // Rol kontrolleri
  const hasPermission = requireAll
    ? roles.every((role) => hasRole(role)) // Tüm roller gerekli
    : roles.some((role) => hasRole(role));  // Herhangi biri yeterli

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Yardımcı component'ler
interface RoleGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminOnly = ({ children, fallback = null }: RoleGuardProps) => (
  <PermissionGuard roles={['Admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const EditorAndAbove = ({ children, fallback = null }: RoleGuardProps) => (
  <PermissionGuard roles={['Admin', 'Editor']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const UserAndAbove = ({ children, fallback = null }: RoleGuardProps) => (
  <PermissionGuard roles={['Admin', 'Editor', 'User']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// CRUD işlemleri için özel guard'lar
export const CanCreate = ({ children, fallback = null }: RoleGuardProps) => {
  const { canCreate } = useAuth();
  return canCreate() ? <>{children}</> : <>{fallback}</>;
};

export const CanEdit = ({ children, fallback = null }: RoleGuardProps) => {
  const { canEdit } = useAuth();
  return canEdit() ? <>{children}</> : <>{fallback}</>;
};

export const CanDelete = ({ children, fallback = null }: RoleGuardProps) => {
  const { canDelete } = useAuth();
  return canDelete() ? <>{children}</> : <>{fallback}</>;
};

export const CanViewAll = ({ children, fallback = null }: RoleGuardProps) => {
  const { canViewAll } = useAuth();
  return canViewAll() ? <>{children}</> : <>{fallback}</>;
};
