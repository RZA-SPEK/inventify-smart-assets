
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, Activity, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ActivityLogChanges } from "@/components/ActivityLogChanges";

const ITEMS_PER_PAGE = 20;

export default function ActivityLog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['audit-logs', searchTerm, actionFilter, tableFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      if (tableFilter !== "all") {
        query = query.eq('table_name', tableFilter);
      }

      if (searchTerm) {
        query = query.or(`user_id.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return data;
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ['audit-logs-count', searchTerm, actionFilter, tableFilter],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true });

      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      if (tableFilter !== "all") {
        query = query.eq('table_name', tableFilter);
      }

      if (searchTerm) {
        query = query.or(`user_id.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%`);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJsonValue = (value: any) => {
    if (!value) return 'N/A';
    return JSON.stringify(value, null, 2);
  };

  const getTableDisplayName = (tableName: string) => {
    const tableMap: { [key: string]: string } = {
      'assets': 'Assets',
      'reservations': 'Reserveringen',
      'maintenance_history': 'Onderhoud',
      'profiles': 'Profielen',
      'notifications': 'Notificaties'
    };
    
    return tableMap[tableName] || tableName;
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading activity log: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar Dashboard
        </Button>
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Activiteitenlog</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Beveiligings Auditlog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek op gebruiker ID, actie of tabel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter op actie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Acties</SelectItem>
                <SelectItem value="INSERT">Toevoegen</SelectItem>
                <SelectItem value="UPDATE">Bijwerken</SelectItem>
                <SelectItem value="DELETE">Verwijderen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter op tabel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Tabelen</SelectItem>
                <SelectItem value="assets">Assets</SelectItem>
                <SelectItem value="reservations">Reserveringen</SelectItem>
                <SelectItem value="maintenance_history">Onderhoud</SelectItem>
                <SelectItem value="profiles">Profielen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Activiteitenlog laden...</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tijdstip</TableHead>
                      <TableHead>Actie</TableHead>
                      <TableHead>Tabel</TableHead>
                      <TableHead>Gebruiker ID</TableHead>
                      <TableHead>Wijzigingen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getTableDisplayName(log.table_name)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Systeem'}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <ActivityLogChanges
                            action={log.action}
                            tableName={log.table_name}
                            oldValues={log.old_values}
                            newValues={log.new_values}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
