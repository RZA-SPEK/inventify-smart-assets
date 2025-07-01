
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
    
    const { data, error } = await (supabase as any)
      .from('saved_searches')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved searches:', error);
    } else {
      const typedSavedSearches: SavedSearch[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        search_criteria: item.search_criteria as Record<string, any>,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      setSavedSearches(typedSavedSearches);
    }
    
    setLoading(false);
  };

  const saveSearch = async (name: string, searchCriteria: Record<string, any>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await (supabase as any)
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

    const typedSavedSearch: SavedSearch = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      search_criteria: data.search_criteria as Record<string, any>,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setSavedSearches(prev => [typedSavedSearch, ...prev]);
    return { data: typedSavedSearch };
  };

  const deleteSearch = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await (supabase as any)
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
