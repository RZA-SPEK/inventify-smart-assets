
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  maintenance_type: string;
  description: string | null;
  cost: number | null;
  performed_by: string | null;
  performed_date: string;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useMaintenanceHistory = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMaintenanceHistory = async (assetId?: string) => {
    if (!user) return;
    
    setLoading(true);
    
    let query = supabase
      .from('maintenance_history')
      .select('*')
      .order('performed_date', { ascending: false });

    if (assetId) {
      query = query.eq('asset_id', assetId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching maintenance history:', error);
    } else {
      setMaintenanceRecords(data || []);
    }
    
    setLoading(false);
  };

  const addMaintenanceRecord = async (recordData: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('maintenance_history')
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error('Error adding maintenance record:', error);
      return { error: error.message };
    }

    setMaintenanceRecords(prev => [data, ...prev]);
    return { data };
  };

  const updateMaintenanceRecord = async (id: string, recordData: Partial<MaintenanceRecord>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('maintenance_history')
      .update({
        ...recordData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating maintenance record:', error);
      return { error: error.message };
    }

    setMaintenanceRecords(prev => 
      prev.map(record => record.id === id ? data : record)
    );
    return { data };
  };

  useEffect(() => {
    fetchMaintenanceHistory();
  }, [user]);

  return {
    maintenanceRecords,
    loading,
    fetchMaintenanceHistory,
    addMaintenanceRecord,
    updateMaintenanceRecord,
  };
};
