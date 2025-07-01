
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read_at: string | null;
  related_asset_id: string | null;
  related_reservation_id: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      const typedNotifications = (data || []).map(item => ({
        ...item,
        type: item.type as Notification['type']
      })) as Notification[];
      
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.read_at).length);
    }
    
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return { error: error.message };
    }

    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    return { error: null };
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const unreadIds = notifications
      .filter(n => !n.read_at)
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { error: error.message };
    }

    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read_at: notification.read_at || new Date().toISOString()
      }))
    );
    
    setUnreadCount(0);
    return { error: null };
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
