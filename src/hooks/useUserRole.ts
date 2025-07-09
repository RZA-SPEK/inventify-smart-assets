
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'ICT Admin' | 'Facilitair Admin' | 'Gebruiker';

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Gebruiker');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setCurrentRole('Gebruiker');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          setCurrentRole('Gebruiker');
        } else {
          // Cast the role to UserRole type, with fallback to 'Gebruiker'
          const role = data?.role as UserRole;
          setCurrentRole(role && ['ICT Admin', 'Facilitair Admin', 'Gebruiker'].includes(role) ? role : 'Gebruiker');
        }
      } catch (error) {
        setCurrentRole('Gebruiker');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const canManageAssets = currentRole === 'ICT Admin' || currentRole === 'Facilitair Admin';
  const canViewSettings = currentRole === 'ICT Admin' || currentRole === 'Facilitair Admin';
  const canManageUsers = currentRole === 'ICT Admin' || currentRole === 'Facilitair Admin';

  return {
    currentRole,
    loading,
    canManageAssets,
    canViewSettings,
    canManageUsers
  };
};
