
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<string>('Gebruiker');
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
          setCurrentRole(data?.role || 'Gebruiker');
        }
      } catch (error) {
        setCurrentRole('Gebruiker');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const canManageAssets = currentRole === 'ICT Admin' || currentRole === 'Admin';
  const canViewSettings = currentRole === 'ICT Admin' || currentRole === 'Admin';
  const canManageUsers = currentRole === 'ICT Admin' || currentRole === 'Admin';

  return {
    currentRole,
    loading,
    canManageAssets,
    canViewSettings,
    canManageUsers
  };
};
