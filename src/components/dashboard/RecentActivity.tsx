
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface ActivityItem {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  record_id: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { canViewSettings, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Only fetch if role is loaded and user has permission
    if (!roleLoading && canViewSettings) {
      fetchRecentActivity();
    } else if (!roleLoading) {
      // If user doesn't have permission, stop loading
      setLoading(false);
    }
  }, [canViewSettings, roleLoading]);

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('id, action, table_name, created_at, record_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const action = activity.action.toLowerCase();
    const table = activity.table_name;
    
    switch (table) {
      case 'assets':
        if (action.includes('insert')) return 'Asset toegevoegd';
        if (action.includes('update')) return 'Asset bijgewerkt';
        if (action.includes('delete')) return 'Asset verwijderd';
        break;
      case 'reservations':
        if (action.includes('insert')) return 'Nieuwe reservering';
        if (action.includes('update')) return 'Reservering bijgewerkt';
        break;
      default:
        return `${action} in ${table}`;
    }
    return action;
  };

  const getActivityColor = (activity: ActivityItem) => {
    const action = activity.action.toLowerCase();
    if (action.includes('insert')) return 'bg-blue-50';
    if (action.includes('update')) return 'bg-green-50';
    if (action.includes('delete')) return 'bg-red-50';
    return 'bg-gray-50';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Nu";
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    return `${Math.floor(diffInHours / 24)} dag${Math.floor(diffInHours / 24) > 1 ? 'en' : ''} geleden`;
  };

  // Don't show the component if user doesn't have permission
  if (!canViewSettings && !roleLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Activiteit</CardTitle>
        <CardDescription>Laatste wijzigingen in het systeem</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Laden...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Geen recente activiteit gevonden
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-3 ${getActivityColor(activity)} rounded-lg`}
              >
                <div>
                  <p className="font-medium">{getActivityDescription(activity)}</p>
                  <p className="text-sm text-gray-600">Record ID: {activity.record_id}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
