import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface Reservation {
  id: string;
  asset_id: string;
  requester_id: string;
  requester_name: string;
  purpose: string;
  requested_date: string;
  return_date: string;
  status: string;
  created_at: string;
  assets?: {
    type: string;
    serial_number: string;
  };
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { canManageAssets, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Only fetch if role is loaded
    if (!roleLoading) {
      fetchReservations();
    }
  }, [roleLoading]);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          assets (
            type,
            serial_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }

      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', reservationId);

      if (error) {
        console.error('Error updating reservation:', error);
        return;
      }

      // Refresh the list
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.assets?.type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || reservation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Show loading state
  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reserveringen</h1>
          <p className="text-gray-600 mt-1">Overzicht van alle asset reserveringen</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoeken</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Zoek op naam, doel of asset..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="pending">In afwachting</SelectItem>
                    <SelectItem value="approved">Goedgekeurd</SelectItem>
                    <SelectItem value="rejected">Afgewezen</SelectItem>
                    <SelectItem value="completed">Voltooid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Reserveringen</span>
            </CardTitle>
            <CardDescription>
              {filteredReservations.length} reservering{filteredReservations.length !== 1 ? 'en' : ''} gevonden
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen reserveringen gevonden
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-4 lg:space-y-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={`flex items-center space-x-1 ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="capitalize">{reservation.status}</span>
                        </Badge>
                        <span className="font-medium">{reservation.requester_name}</span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div><strong>Asset:</strong> {reservation.assets?.type} ({reservation.assets?.serial_number})</div>
                        <div><strong>Doel:</strong> {reservation.purpose}</div>
                        <div><strong>Periode:</strong> {formatDate(reservation.requested_date)} - {formatDate(reservation.return_date)}</div>
                        <div><strong>Aangevraagd:</strong> {formatDate(reservation.created_at)}</div>
                      </div>
                    </div>
                    
                    {canManageAssets && reservation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(reservation.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Goedkeuren
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(reservation.id, 'rejected')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Afwijzen
                        </Button>
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

export default Reservations;
