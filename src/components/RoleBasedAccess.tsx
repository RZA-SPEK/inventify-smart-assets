
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export const RoleBasedAccess = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleBasedAccessProps) => {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <>{fallback}</>;
  }
  
  if (!allowedRoles.includes(userProfile.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Specific role-based components for common use cases
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedAccess allowedRoles={['ICT Admin']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const AdminAndFacilitair = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedAccess allowedRoles={['ICT Admin', 'Facilitair Medewerker']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);
