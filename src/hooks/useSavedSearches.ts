
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  search_criteria: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSavedSearches = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved searches:', error);
    } else {
      setSavedSearches(data || []);
    }
    
    setLoading(false);
  };

  const saveSearch = async (name: string, searchCriteria: Record<string, any>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name,
        search_criteria: searchCriteria,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving search:', error);
      return { error: error.message };
    }

    setSavedSearches(prev => [data, ...prev]);
    return { data };
  };

  const deleteSearch = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting saved search:', error);
      return { error: error.message };
    }

    setSavedSearches(prev => prev.filter(search => search.id !== id));
    return { error: null };
  };

  useEffect(() => {
    fetchSavedSearches();
  }, [user]);

  return {
    savedSearches,
    loading,
    fetchSavedSearches,
    saveSearch,
    deleteSearch,
  };
};
