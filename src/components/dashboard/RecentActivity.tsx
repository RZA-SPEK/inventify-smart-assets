
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Package, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActivityItem {
  id: string;
  type: 'asset' | 'reservation' | 'user';
  action: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent assets
      const { data: assets } = await supabase
        .from('assets')
        .select('id, type, brand, model, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id, requester_name, status, created_at, asset_id')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivities: ActivityItem[] = [];

      // Add asset activities
      (assets || []).forEach(asset => {
        recentActivities.push({
          id: `asset-${asset.id}`,
          type: 'asset',
          action: 'Toegevoegd',
          description: `${asset.brand} ${asset.model} (${asset.type})`,
          timestamp: asset.created_at,
          status: asset.status
        });
      });

      // Add reservation activities
      (reservations || []).forEach(reservation => {
        recentActivities.push({
          id: `reservation-${reservation.id}`,
          type: 'reservation',
          action: 'Reservering',
          description: `Reservering aangevraagd door ${reservation.requester_name}`,
          timestamp: reservation.created_at,
          user: reservation.requester_name,
          status: reservation.status
        });
      });

      // Sort by timestamp (most recent first)
      recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(recentActivities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon recente activiteit niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <Package className="h-4 w-4" />;
      case 'reservation':
        return <Calendar className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'in voorraad':
        return "bg-green-100 text-green-800";
      case 'in gebruik':
      case 'assigned':
        return "bg-blue-100 text-blue-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Nu";
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}u geleden`;
    return `${Math.floor(diffInMinutes / 1440)}d geleden`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Activiteit</CardTitle>
        <CardDescription>Laatste wijzigingen en activiteiten</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Geen recente activiteit
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-2">
                      {activity.status && (
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      door {activity.user}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
