
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { userProfile } = useAuth();
  
  const hasRole = (role: string) => {
    return userProfile?.role === role;
  };
  
  const hasAnyRole = (roles: string[]) => {
    return userProfile ? roles.includes(userProfile.role) : false;
  };
  
  const canViewAssets = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker', 'Gebruiker']);
  };
  
  const canCreateAssets = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  const canEditAssets = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  const canDeleteAssets = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  const canManageReservations = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  const canViewAllReservations = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  const canManageMaintenance = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  const canViewAuditLogs = () => {
    return hasRole('ICT Admin');
  };
  
  const canCreateNotifications = () => {
    return hasAnyRole(['ICT Admin', 'Facilitair Medewerker']);
  };
  
  return {
    hasRole,
    hasAnyRole,
    canViewAssets,
    canCreateAssets,
    canEditAssets,
    canDeleteAssets,
    canManageReservations,
    canViewAllReservations,
    canManageMaintenance,
    canViewAuditLogs,
    canCreateNotifications,
    isAdmin: hasRole('ICT Admin'),
    isFacilitair: hasRole('Facilitair Medewerker'),
    isUser: hasRole('Gebruiker'),
  };
};
