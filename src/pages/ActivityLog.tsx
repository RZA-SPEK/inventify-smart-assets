
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Search, Calendar, User, Database, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface ActivityLogEntry {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  user_id: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

const ActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs: ActivityLogEntry[] = [
      {
        id: "1",
        action: "INSERT",
        table_name: "assets",
        record_id: "asset-1",
        user_id: "user-1",
        user_email: "admin@company.com",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0...",
        new_values: { type: "Laptop", brand: "Dell", model: "Latitude 7420" },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "2",
        action: "UPDATE",
        table_name: "assets",
        record_id: "asset-2",
        user_id: "user-2",
        user_email: "facilitor@company.com",
        ip_address: "192.168.1.101",
        old_values: { status: "In voorraad" },
        new_values: { status: "In gebruik", assignedTo: "Jan Janssen" },
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "3",
        action: "INSERT",
        table_name: "reservations",
        record_id: "reservation-1",
        user_id: "user-3",
        user_email: "user@company.com",
        ip_address: "192.168.1.102",
        new_values: { asset_id: "asset-3", purpose: "Thuiswerken", requested_date: "2024-01-15" },
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "4",
        action: "DELETE",
        table_name: "assets",
        record_id: "asset-4",
        user_id: "user-1",
        user_email: "admin@company.com",
        ip_address: "192.168.1.100",
        old_values: { type: "Monitor", brand: "LG", status: "Defect" },
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "5",
        action: "UPDATE",
        table_name: "reservations",
        record_id: "reservation-2",
        user_id: "user-2",
        user_email: "facilitor@company.com",
        ip_address: "192.168.1.101",
        old_values: { status: "pending" },
        new_values: { status: "approved", approved_by: "user-2" },
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tableFilter !== "all") {
      filtered = filtered.filter(log => log.table_name === tableFilter);
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, tableFilter, actionFilter, logs]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "INSERT":
        return <Database className="h-3 w-3" />;
      case "UPDATE":
        return <Eye className="h-3 w-3" />;
      case "DELETE":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Database className="h-3 w-3" />;
    }
  };

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case "assets":
        return "Assets";
      case "reservations":
        return "Reserveringen";
      case "profiles":
        return "Gebruikers";
      case "notifications":
        return "Notificaties";
      default:
        return tableName;
    }
  };

  const uniqueTables = [...new Set(logs.map(log => log.table_name))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activiteiten Log</h1>
            <p className="text-gray-600 mt-1">Bekijk alle systeem activiteiten en wijzigingen</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Laatste 24 uur</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoeken..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle tabellen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle tabellen</SelectItem>
                  {uniqueTables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {getTableDisplayName(table)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle acties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle acties</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setTableFilter("all");
                  setActionFilter("all");
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activiteiten ({filteredLogs.length})</CardTitle>
            <CardDescription>
              Chronologisch overzicht van alle systeem activiteiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Tijd</TableHead>
                    <TableHead className="w-24">Actie</TableHead>
                    <TableHead className="w-32">Tabel</TableHead>
                    <TableHead>Gebruiker</TableHead>
                    <TableHead className="hidden lg:table-cell">IP Adres</TableHead>
                    <TableHead className="hidden xl:table-cell">Record ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "dd/MM HH:mm", { locale: nl })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} flex items-center gap-1 w-fit`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTableDisplayName(log.table_name)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-sm truncate max-w-32" title={log.user_email}>
                            {log.user_email || "Systeem"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-xs text-gray-500">
                        {log.ip_address}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs">
                        {log.record_id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs overflow-hidden">
                          {log.action === "INSERT" && log.new_values && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium text-green-700">Toegevoegd: </span>
                              {Object.entries(log.new_values).slice(0, 2).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                          {log.action === "UPDATE" && (log.old_values || log.new_values) && (
                            <div className="text-xs text-gray-600">
                              {log.old_values && (
                                <div>
                                  <span className="font-medium text-red-700">Van: </span>
                                  {Object.entries(log.old_values).slice(0, 2).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {log.new_values && (
                                <div>
                                  <span className="font-medium text-green-700">Naar: </span>
                                  {Object.entries(log.new_values).slice(0, 2).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {log.action === "DELETE" && log.old_values && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium text-red-700">Verwijderd: </span>
                              {Object.entries(log.old_values).slice(0, 2).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Geen activiteiten gevonden</h3>
                <p className="text-gray-600">
                  Er zijn geen activiteiten die voldoen aan de huidige filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLog;
