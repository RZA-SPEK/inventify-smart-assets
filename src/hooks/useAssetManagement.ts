
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

      // Don't proceed if role is still loading
      if (roleLoading) {
        return;
      }

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

      // Filter assets based on user role and role categories
      let finalAssets = transformedAssets;
      
      if (canManageAssets) {
        // Get user's role categories to filter assets
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileData?.role) {
            // Get role ID for the user's role
            const { data: roleData } = await supabase
              .from('roles')
              .select('id')
              .eq('name', profileData.role)
              .single();

            if (roleData) {
              // Get allowed categories for this role
              const { data: categoriesData } = await supabase
                .from('role_categories')
                .select('category')
                .eq('role_id', roleData.id);

              // If role has specific categories, filter assets by those categories
              if (categoriesData && categoriesData.length > 0) {
                const allowedCategories = categoriesData.map(c => c.category);
                finalAssets = transformedAssets.filter(asset => 
                  allowedCategories.includes(asset.category)
                );
              } else {
                // If no specific categories are set, show all assets (for Superadmin or roles without category restrictions)
                finalAssets = transformedAssets;
              }
            }
          }
        }
      } else {
        // Regular users only see reservable assets
        finalAssets = transformedAssets.filter(asset => asset.reservable === true);
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
