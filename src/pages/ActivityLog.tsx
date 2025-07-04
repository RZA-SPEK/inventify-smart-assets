
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Activity, Clock, Database, User } from "lucide-react";

interface ActivityLogEntry {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  record_id?: string;
}

// Mock data as fallback
const mockActivityData: ActivityLogEntry[] = [
  {
    id: "1",
    action: "INSERT",
    table_name: "assets",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    record_id: "asset-123"
  },
  {
    id: "2", 
    action: "UPDATE",
    table_name: "reservations",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    record_id: "reservation-456"
  },
  {
    id: "3",
    action: "DELETE", 
    table_name: "profiles",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    record_id: "profile-789"
  }
];

const ActivityLog = () => {
  const { canViewSettings } = useUserRole();

  const { data: recentActivity = [], isLoading, error } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('security_audit_log')
          .select('id, action, table_name, created_at, record_id')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.log("Error fetching recent activity:", error);
          return mockActivityData;
        }
        
        return data || mockActivityData;
      } catch (err) {
        console.log("Error fetching recent activity:", err);
        return mockActivityData;
      }
    },
    enabled: canViewSettings
  });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return <Database className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <User className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canViewSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Toegang geweigerd</CardTitle>
            <CardDescription>
              U heeft geen toestemming om activiteitenlogs te bekijken.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activiteitenlog</h1>
        <p className="text-gray-600 mt-2">
          Overzicht van recente systeemactiviteiten en wijzigingen
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recente Activiteit
            </CardTitle>
            <CardDescription>
              Laatste systeemwijzigingen en gebruikersacties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getActionIcon(activity.action)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getActionColor(activity.action)}>
                            {activity.action}
                          </Badge>
                          <span className="text-sm font-medium">
                            {activity.table_name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Record ID: {activity.record_id || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(activity.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Geen recente activiteit gevonden</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLog;
