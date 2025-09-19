import { ReactNode } from 'react';

import { useAuth } from 'src/contexts/auth-context';

// Base Permission Guard Component
interface PermissionGuardProps {
  children: ReactNode;
  roles?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // Default false: any role matches, true: all roles required
}

export function PermissionGuard({ 
  children, 
  roles = [], 
  fallback = null, 
  requireAll = false 
}: PermissionGuardProps) {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (roles.length === 0) {
    return <>{children}</>;
  }

  const hasPermission = requireAll 
    ? roles.every(role => hasRole(role))
    : roles.some(role => hasRole(role));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role-specific components
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['Admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function EditorAndAbove({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['Admin', 'Editor']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// Permission-based components
export function CanCreate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canCreate } = useAuth();
  
  if (!canCreate()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function CanEdit({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canEdit } = useAuth();
  
  if (!canEdit()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function CanDelete({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canDelete } = useAuth();
  
  if (!canDelete()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function CanViewAll({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canViewAll } = useAuth();
  
  if (!canViewAll()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
