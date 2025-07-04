
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
  const [error, setError] = useState<string | null>(null);
  const { canViewSettings, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Always try to fetch, regardless of role permissions for now
    if (!roleLoading) {
      fetchRecentActivity();
    }
  }, [roleLoading]);

  const fetchRecentActivity = async () => {
    try {
      console.log("Attempting to fetch recent activity...");
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('id, action, table_name, created_at, record_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent activity:', error);
        
        // Handle the specific "role admin does not exist" error
        if (error.message && error.message.includes('role "admin" does not exist')) {
          console.log('Database role error detected, showing empty state');
          setError('Database configuratie wordt bijgewerkt. Probeer over een paar minuten opnieuw.');
        } else {
          setError('Kan recente activiteit niet laden');
        }
        setActivities([]);
      } else {
        console.log('Successfully fetched recent activity:', data?.length || 0, 'entries');
        setActivities(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('Unexpected error fetching recent activity:', error);
      setError('Onverwachte fout bij laden van activiteit');
      setActivities([]);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Activiteit</CardTitle>
        <CardDescription>Laatste wijzigingen in het systeem</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Laden...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-yellow-600 bg-yellow-50 p-3 rounded-lg">
              <p className="font-medium">Tijdelijke database issue</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Geen recente activiteit beschikbaar</p>
            <p className="text-sm mt-2">Activiteiten worden getoond zodra ze beschikbaar zijn</p>
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
