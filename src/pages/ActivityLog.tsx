import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Filter, Search, RefreshCw, AlertTriangle, User, Package, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface ActivityLogEntry {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  record_id: string | null;
  user_id: string | null;
  user_email?: string;
  user_name?: string;
  user_role?: string;
  asset_info?: {
    type: string;
    brand: string;
    model: string;
    asset_tag: string;
    serial_number: string;
    location: string;
    status: string;
    assigned_to: string;
  };
  reservation_info?: {
    requester_name: string;
    requested_date: string;
    return_date: string;
    purpose: string;
    status: string;
    asset_type: string;
  };
  profile_info?: {
    email: string;
    full_name: string;
    role: string;
  };
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const { loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading) {
      fetchActivityLog();
    }
  }, [roleLoading]);

  const fetchActivityLog = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to fetch activity log...");
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activity log:', error);
        
        if (error.message && error.message.includes('role "admin" does not exist')) {
          console.log('Database role error detected');
          setError('Database configuratie wordt momenteel bijgewerkt. De activiteiten log is tijdelijk niet beschikbaar.');
        } else {
          setError('Kan activiteiten log niet laden. Probeer het later opnieuw.');
        }
        setActivities([]);
      } else {
        console.log('Successfully fetched activity log:', data?.length || 0, 'entries');
        
        // Enrich the data with additional information
        const enrichedActivities = await enrichActivitiesWithDetails(data || []);
        setActivities(enrichedActivities);
        setError(null);
      }
    } catch (error) {
      console.error('Unexpected error fetching activity log:', error);
      setError('Onverwachte fout bij laden van activiteiten log');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const enrichActivitiesWithDetails = async (activities: ActivityLogEntry[]) => {
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const enrichedActivity = { ...activity };

        // Get asset information if it's an asset-related activity
        if (activity.table_name === 'assets' && activity.record_id) {
          try {
            const { data: assetData } = await supabase
              .from('assets')
              .select('type, brand, model, asset_tag, serial_number, location, status, assigned_to')
              .eq('id', activity.record_id)
              .single();
            
            if (assetData) {
              enrichedActivity.asset_info = {
                type: assetData.type || 'Onbekend',
                brand: assetData.brand || 'Onbekend',
                model: assetData.model || 'Onbekend',
                asset_tag: assetData.asset_tag || 'Geen tag',
                serial_number: assetData.serial_number || 'Geen serienummer',
                location: assetData.location || 'Onbekende locatie',
                status: assetData.status || 'Onbekende status',
                assigned_to: assetData.assigned_to || 'Niet toegewezen'
              };
            }
          } catch (error) {
            console.log('Could not fetch asset info for:', activity.record_id);
          }
        }

        // Get reservation information if it's a reservation-related activity
        if (activity.table_name === 'reservations' && activity.record_id) {
          try {
            const { data: reservationData } = await supabase
              .from('reservations')
              .select(`
                requester_name,
                requested_date,
                return_date,
                purpose,
                status,
                assets!inner(type)
              `)
              .eq('id', activity.record_id)
              .single();
            
            if (reservationData) {
              enrichedActivity.reservation_info = {
                requester_name: reservationData.requester_name || 'Onbekende aanvrager',
                requested_date: reservationData.requested_date || 'Onbekende datum',
                return_date: reservationData.return_date || 'Onbekende datum',
                purpose: reservationData.purpose || 'Geen doel opgegeven',
                status: reservationData.status || 'Onbekende status',
                asset_type: reservationData.assets?.type || 'Onbekend type'
              };
            }
          } catch (error) {
            console.log('Could not fetch reservation info for:', activity.record_id);
          }
        }

        // Get profile information if it's a profile-related activity
        if (activity.table_name === 'profiles' && activity.record_id) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email, full_name, role')
              .eq('id', activity.record_id)
              .single();
            
            if (profileData) {
              enrichedActivity.profile_info = {
                email: profileData.email || 'Geen email',
                full_name: profileData.full_name || 'Onbekende naam',
                role: profileData.role || 'Geen rol'
              };
            }
          } catch (error) {
            console.log('Could not fetch profile info for:', activity.record_id);
          }
        }

        // Get user information if we have a user_id
        if (activity.user_id) {
          try {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email, full_name, role')
              .eq('id', activity.user_id)
              .single();
            
            if (userData) {
              enrichedActivity.user_email = userData.email || undefined;
              enrichedActivity.user_name = userData.full_name || userData.email || undefined;
              enrichedActivity.user_role = userData.role || 'Onbekende rol';
            }
          } catch (error) {
            console.log('Could not fetch user info for:', activity.user_id);
            // If we can't find the profile, show "Onbekende gebruiker"
            enrichedActivity.user_name = 'Onbekende gebruiker';
            enrichedActivity.user_role = 'Onbekende rol';
          }
        } else {
          // No user_id means it was a system action or from before the enhancement
          enrichedActivity.user_name = 'Systeem';
          enrichedActivity.user_email = undefined;
          enrichedActivity.user_role = 'Systeem';
        }

        return enrichedActivity;
      })
    );

    return enriched;
  };

  const handleRefresh = () => {
    fetchActivityLog();
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('insert')) return 'bg-green-100 text-green-800';
    if (actionLower.includes('update')) return 'bg-blue-100 text-blue-800';
    if (actionLower.includes('delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (tableName: string) => {
    switch (tableName) {
      case 'assets':
        return <Package className="h-4 w-4" />;
      case 'profiles':
        return <User className="h-4 w-4" />;
      case 'reservations':
        return <CalendarDays className="h-4 w-4" />;
      case 'roles':
        return <User className="h-4 w-4" />;
      case 'permissions':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFriendlyTableName = (tableName: string) => {
    switch (tableName) {
      case 'assets':
        return 'Asset';
      case 'profiles':
        return 'Gebruiker';
      case 'reservations':
        return 'Reservering';
      case 'roles':
        return 'Rol';
      case 'permissions':
        return 'Permissie';
      case 'role_permissions':
        return 'Rol Permissie';
      default:
        return tableName;
    }
  };

  const getFriendlyActionName = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return 'Toegevoegd';
      case 'update':
        return 'Bijgewerkt';
      case 'delete':
        return 'Verwijderd';
      default:
        return action;
    }
  };

  const getActivityDescription = (activity: ActivityLogEntry) => {
    const tableName = getFriendlyTableName(activity.table_name);
    const actionName = getFriendlyActionName(activity.action);
    
    let description = `${tableName} ${actionName.toLowerCase()}`;
    
    if (activity.asset_info) {
      const assetDescription = [
        activity.asset_info.brand,
        activity.asset_info.model,
        `(${activity.asset_info.type})`
      ].filter(Boolean).join(' ');
      
      if (assetDescription) {
        description += `: ${assetDescription}`;
      }
      
      if (activity.asset_info.asset_tag && activity.asset_info.asset_tag !== 'Geen tag') {
        description += ` - Tag: ${activity.asset_info.asset_tag}`;
      }
    }
    
    if (activity.reservation_info) {
      description += `: ${activity.reservation_info.asset_type} door ${activity.reservation_info.requester_name}`;
    }
    
    if (activity.profile_info) {
      description += `: ${activity.profile_info.full_name} (${activity.profile_info.email})`;
    }
    
    return description;
  };

  const getUserDisplayName = (activity: ActivityLogEntry) => {
    if (activity.user_name) {
      return activity.user_name;
    }
    if (activity.user_email) {
      return activity.user_email;
    }
    return 'Onbekende gebruiker';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredActivities = activities.filter(activity => {
    const searchableText = [
      getFriendlyActionName(activity.action),
      getFriendlyTableName(activity.table_name),
      activity.asset_info?.brand,
      activity.asset_info?.model,
      activity.asset_info?.type,
      activity.asset_info?.asset_tag,
      activity.asset_info?.serial_number,
      activity.asset_info?.location,
      activity.asset_info?.status,
      activity.reservation_info?.requester_name,
      activity.reservation_info?.purpose,
      activity.reservation_info?.status,
      activity.profile_info?.email,
      activity.profile_info?.full_name,
      activity.profile_info?.role,
      activity.user_name,
      activity.user_email,
      activity.user_role,
      activity.record_id
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesTable = selectedTable === "all" || activity.table_name === selectedTable;
    const matchesAction = selectedAction === "all" || activity.action.toLowerCase().includes(selectedAction.toLowerCase());
    return matchesSearch && matchesTable && matchesAction;
  });

  const uniqueTables = [...new Set(activities.map(a => a.table_name))];

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto mobile-spacing py-4 sm:py-6 max-w-7xl">
        <div className="mb-4 sm:mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Activiteiten Log</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Overzicht van alle systeemactiviteiten en wijzigingen</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Vernieuwen
          </Button>
        </div>

        {error && (
          <Card className="mb-4 sm:mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Database Synchronisatie</h3>
                  <p className="text-yellow-700 text-sm mt-1">{error}</p>
                  <p className="text-yellow-600 text-xs mt-2">
                    Dit is een tijdelijk probleem dat automatisch wordt opgelost. Probeer over een paar minuten opnieuw.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoeken</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Zoek op actie, type, gebruiker..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="all">Alle types</SelectItem>
                    {uniqueTables.map(table => (
                      <SelectItem key={table} value={table}>{getFriendlyTableName(table)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Actie</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer actie" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="all">Alle acties</SelectItem>
                    <SelectItem value="insert">Toegevoegd</SelectItem>
                    <SelectItem value="update">Bijgewerkt</SelectItem>
                    <SelectItem value="delete">Verwijderd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              <span>Activiteiten</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {activities.length > 0 ? `Toont de laatste ${activities.length} activiteiten` : 'Geen activiteiten beschikbaar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Laden...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Activiteiten log tijdelijk niet beschikbaar</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Opnieuw proberen
                </Button>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {activities.length === 0 ? (
                  <div>
                    <p>Geen activiteiten beschikbaar</p>
                    <p className="text-sm mt-2">Activiteiten worden getoond zodra ze beschikbaar zijn</p>
                  </div>
                ) : (
                  "Geen activiteiten gevonden met de huidige filters"
                )}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col space-y-3 p-4 sm:p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          {getActionIcon(activity.table_name)}
                          <Badge className={`${getActionColor(activity.action)} text-xs`}>
                            {getFriendlyActionName(activity.action)}
                          </Badge>
                        </div>
                        <span className="font-medium text-sm sm:text-base">
                          {getActivityDescription(activity)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tijdstip:</span> {formatTimestamp(activity.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Gebruiker:</span> {getUserDisplayName(activity)}
                        {activity.user_role && activity.user_role !== 'Onbekende rol' && (
                          <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {activity.user_role}
                          </span>
                        )}
                      </div>
                      {activity.record_id && (
                        <div>
                          <span className="font-medium">ID:</span> 
                          <span className="font-mono ml-1">
                            {activity.record_id.substring(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional details section */}
                    {(activity.asset_info || activity.reservation_info || activity.profile_info) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs sm:text-sm">
                          
                          {activity.asset_info && (
                            <div className="bg-blue-50 p-3 rounded-md">
                              <h4 className="font-medium text-blue-800 mb-2">Asset Details</h4>
                              <div className="space-y-1 text-blue-700">
                                <div><span className="font-medium">Locatie:</span> {activity.asset_info.location}</div>
                                <div><span className="font-medium">Status:</span> {activity.asset_info.status}</div>
                                {activity.asset_info.serial_number !== 'Geen serienummer' && (
                                  <div><span className="font-medium">Serienummer:</span> {activity.asset_info.serial_number}</div>
                                )}
                                {activity.asset_info.assigned_to !== 'Niet toegewezen' && (
                                  <div><span className="font-medium">Toegewezen aan:</span> {activity.asset_info.assigned_to}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {activity.reservation_info && (
                            <div className="bg-green-50 p-3 rounded-md">
                              <h4 className="font-medium text-green-800 mb-2">Reservering Details</h4>
                              <div className="space-y-1 text-green-700">
                                <div><span className="font-medium">Van:</span> {new Date(activity.reservation_info.requested_date).toLocaleDateString('nl-NL')}</div>
                                <div><span className="font-medium">Tot:</span> {new Date(activity.reservation_info.return_date).toLocaleDateString('nl-NL')}</div>
                                <div><span className="font-medium">Status:</span> {activity.reservation_info.status}</div>
                                {activity.reservation_info.purpose && activity.reservation_info.purpose !== 'Geen doel opgegeven' && (
                                  <div><span className="font-medium">Doel:</span> {activity.reservation_info.purpose}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {activity.profile_info && (
                            <div className="bg-purple-50 p-3 rounded-md">
                              <h4 className="font-medium text-purple-800 mb-2">Gebruiker Details</h4>
                              <div className="space-y-1 text-purple-700">
                                <div><span className="font-medium">Email:</span> {activity.profile_info.email}</div>
                                <div><span className="font-medium">Naam:</span> {activity.profile_info.full_name}</div>
                                <div><span className="font-medium">Rol:</span> {activity.profile_info.role}</div>
                              </div>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLog;
