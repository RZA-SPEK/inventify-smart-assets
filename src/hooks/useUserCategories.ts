import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export const useUserCategories = () => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const { currentRole } = useUserRole();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUserId();
  }, []);

  useEffect(() => {
    const fetchUserCategories = async () => {
      if (!userId) return;

      try {
        // Get user's role from profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Get role ID from roles table
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', profileData.role)
          .single();

        if (roleError) throw roleError;

        // Get categories assigned to this role
        const { data: categoryData, error: categoryError } = await supabase
          .from('role_categories')
          .select('category')
          .eq('role_id', roleData.id);

        if (categoryError) throw categoryError;

        const categories = categoryData.map(item => item.category);
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching user categories:', error);
        // Fallback to all categories if there's an error
        setAvailableCategories(['ICT', 'Facilitair', 'Catering', 'Logistiek']);
      }
    };

    fetchUserCategories();
  }, [userId, currentRole]);

  return { availableCategories };
};