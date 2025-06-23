
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Asset {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number: string;
  purchase_date: string;
  status: "In gebruik" | "In voorraad" | "Defect" | "Onderhoud";
  location: string;
  category: "ICT" | "Facilitair";
  assigned_to?: string;
  assigned_to_location?: string;
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAssets = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
    } else {
      setAssets(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const addAsset = async (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('assets')
      .insert({
        ...assetData,
        serial_number: assetData.serial_number,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      return { error: error.message };
    }

    setAssets(prev => [data, ...prev]);
    return { data };
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('assets')
      .update({
        ...assetData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      return { error: error.message };
    }

    setAssets(prev => prev.map(asset => asset.id === id ? data : asset));
    return { data };
  };

  return {
    assets,
    loading,
    fetchAssets,
    addAsset,
    updateAsset,
  };
};
