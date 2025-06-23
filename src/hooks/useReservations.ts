
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reservation {
  id: string;
  asset_id: string;
  requester_id: string;
  requester_name: string;
  requested_date: string;
  return_date: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchReservations = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
    } else {
      setReservations(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const createReservation = async (reservationData: {
    asset_id: string;
    requester_name: string;
    requested_date: string;
    return_date: string;
    purpose: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...reservationData,
        requester_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      return { error: error.message };
    }

    setReservations(prev => [data, ...prev]);
    return { data };
  };

  const updateReservationStatus = async (
    id: string, 
    status: Reservation['status'], 
    approved_by?: string
  ) => {
    if (!user) return { error: 'Not authenticated' };

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved' && approved_by) {
      updateData.approved_by = approved_by;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation:', error);
      return { error: error.message };
    }

    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id ? data : reservation
      )
    );
    return { data };
  };

  return {
    reservations,
    loading,
    createReservation,
    updateReservationStatus,
    fetchReservations,
  };
};
