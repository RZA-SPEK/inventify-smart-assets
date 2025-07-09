
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import type { Asset } from '@/types/asset';

export const useAssetManagement = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canManageAssets, currentRole, loading: roleLoading } = useUserRole();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const transformedAssets: Asset[] = (data || []).map(asset => ({
        id: asset.id,
        type: asset.type,
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serial_number || '',
        assetTag: asset.asset_tag || '',
        status: asset.status as Asset['status'] || 'In voorraad',
        location: asset.location || '',
        assignedTo: asset.assigned_to || '',
        assignedToLocation: asset.assigned_to_location || '',
        purchaseDate: asset.purchase_date || '',
        warrantyExpiry: asset.warranty_expiry || '',
        purchasePrice: asset.purchase_price || 0,
        penaltyAmount: asset.penalty_amount || 0,
        category: asset.category as Asset['category'] || 'ICT',
        image: asset.image_url || '',
        comments: asset.comments || '',
        reservable: asset.reservable !== undefined ? asset.reservable : true,
      }));

      // Filter assets based on user role
      let finalAssets = transformedAssets;
      
      if (!roleLoading) {
        if (canManageAssets) {
          // Admin users see all assets
          finalAssets = transformedAssets;
        } else {
          // Regular users only see reservable assets
          finalAssets = transformedAssets.filter(asset => asset.reservable === true);
        }
      }

      setAssets(finalAssets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (id: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [canManageAssets, roleLoading]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    deleteAsset
  };
};
