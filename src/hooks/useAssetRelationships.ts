
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AssetRelationship {
  id: string;
  parent_asset_id: string | null;
  child_asset_id: string | null;
  relationship_type: 'component' | 'accessory' | 'dependency';
  created_at: string;
}

export const useAssetRelationships = () => {
  const [relationships, setRelationships] = useState<AssetRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchRelationships = async (assetId?: string) => {
    if (!user) return;
    
    setLoading(true);
    
    let query = supabase
      .from('asset_relationships')
      .select('*')
      .order('created_at', { ascending: false });

    if (assetId) {
      query = query.or(`parent_asset_id.eq.${assetId},child_asset_id.eq.${assetId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching asset relationships:', error);
    } else {
      const typedRelationships = (data || []).map(item => ({
        ...item,
        relationship_type: item.relationship_type as AssetRelationship['relationship_type']
      })) as AssetRelationship[];
      setRelationships(typedRelationships);
    }
    
    setLoading(false);
  };

  const createRelationship = async (relationshipData: Omit<AssetRelationship, 'id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('asset_relationships')
      .insert(relationshipData)
      .select()
      .single();

    if (error) {
      console.error('Error creating asset relationship:', error);
      return { error: error.message };
    }

    const typedRelationship = {
      ...data,
      relationship_type: data.relationship_type as AssetRelationship['relationship_type']
    } as AssetRelationship;

    setRelationships(prev => [typedRelationship, ...prev]);
    return { data: typedRelationship };
  };

  const deleteRelationship = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('asset_relationships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset relationship:', error);
      return { error: error.message };
    }

    setRelationships(prev => prev.filter(rel => rel.id !== id));
    return { error: null };
  };

  useEffect(() => {
    fetchRelationships();
  }, [user]);

  return {
    relationships,
    loading,
    fetchRelationships,
    createRelationship,
    deleteRelationship,
  };
};
