import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Filter, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface ActivityLogEntry {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  user_id: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
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
        setActivities(data || []);
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
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.record_id && activity.record_id.includes(searchTerm));
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
                    placeholder="Zoek op actie, tabel of ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tabel</label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer tabel" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="all">Alle tabellen</SelectItem>
                    {uniqueTables.map(table => (
                      <SelectItem key={table} value={table}>{table}</SelectItem>
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
                    <SelectItem value="insert">Insert</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
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
                    className="flex flex-col space-y-2 p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge className={`${getActionColor(activity.action)} text-xs`}>
                          {activity.action}
                        </Badge>
                        <span className="font-medium text-sm sm:text-base">{activity.table_name}</span>
                        {activity.record_id && (
                          <span className="text-xs sm:text-sm text-gray-500 font-mono">
                            ID: {activity.record_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tijdstip:</span> {formatTimestamp(activity.created_at)}
                      </div>
                      {activity.user_id && (
                        <div>
                          <span className="font-medium">Gebruiker:</span> {activity.user_id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
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
