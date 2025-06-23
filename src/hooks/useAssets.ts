
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
      // Type cast the data from Supabase to our Asset interface
      const typedAssets: Asset[] = (data || []).map(item => ({
        id: item.id,
        type: item.type,
        brand: item.brand,
        model: item.model,
        serial_number: item.serial_number,
        purchase_date: item.purchase_date,
        status: item.status as Asset['status'],
        location: item.location,
        category: item.category as Asset['category'],
        assigned_to: item.assigned_to,
        assigned_to_location: item.assigned_to_location,
        image_url: item.image_url,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      setAssets(typedAssets);
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

    // Type cast the returned data
    const typedAsset: Asset = {
      id: data.id,
      type: data.type,
      brand: data.brand,
      model: data.model,
      serial_number: data.serial_number,
      purchase_date: data.purchase_date,
      status: data.status as Asset['status'],
      location: data.location,
      category: data.category as Asset['category'],
      assigned_to: data.assigned_to,
      assigned_to_location: data.assigned_to_location,
      image_url: data.image_url,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setAssets(prev => [typedAsset, ...prev]);
    return { data: typedAsset };
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

    // Type cast the returned data
    const typedAsset: Asset = {
      id: data.id,
      type: data.type,
      brand: data.brand,
      model: data.model,
      serial_number: data.serial_number,
      purchase_date: data.purchase_date,
      status: data.status as Asset['status'],
      location: data.location,
      category: data.category as Asset['category'],
      assigned_to: data.assigned_to,
      assigned_to_location: data.assigned_to_location,
      image_url: data.image_url,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setAssets(prev => prev.map(asset => asset.id === id ? typedAsset : asset));
    return { data: typedAsset };
  };

  return {
    assets,
    loading,
    fetchAssets,
    addAsset,
    updateAsset,
  };
};
