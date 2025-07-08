import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, User, Package, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Reservation {
  id: string;
  asset_id: string;
  requester_name: string;
  requested_date: string;
  return_date: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  asset?: {
    brand: string;
    model: string;
    type: string;
  };
}

const Reservations = () => {
  const { canManageAssets } = useUserRole();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      console.log('Fetching reservations...');
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          assets:asset_id (
            brand,
            model,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van reserveringen.",
          variant: "destructive",
        });
        return;
      }

      console.log('Reservations fetched:', data?.length || 0);
      
      // Transform the data to match our interface with proper status typing
      const transformedReservations: Reservation[] = (data || []).map(reservation => ({
        id: reservation.id,
        asset_id: reservation.asset_id,
        requester_name: reservation.requester_name,
        requested_date: reservation.requested_date,
        return_date: reservation.return_date,
        purpose: reservation.purpose,
        status: (reservation.status || 'pending') as 'pending' | 'approved' | 'rejected',
        created_at: reservation.created_at,
        asset: reservation.assets ? {
          brand: reservation.assets.brand,
          model: reservation.assets.model,
          type: reservation.assets.type
        } : undefined
      }));

      setReservations(transformedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Fout bij laden",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'approved' })
        .eq('id', reservationId);

      if (error) {
        console.error('Error approving reservation:', error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het goedkeuren van de reservering.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setReservations(prev => prev.map(r => 
        r.id === reservationId ? { ...r, status: 'approved' as const } : r
      ));

      toast({
        title: "Reservering goedgekeurd",
        description: "De reservering is succesvol goedgekeurd.",
      });
    } catch (error) {
      console.error('Error approving reservation:', error);
    }
  };

  const handleReject = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'rejected' })
        .eq('id', reservationId);

      if (error) {
        console.error('Error rejecting reservation:', error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het afwijzen van de reservering.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setReservations(prev => prev.map(r => 
        r.id === reservationId ? { ...r, status: 'rejected' as const } : r
      ));

      toast({
        title: "Reservering afgewezen",
        description: "De reservering is afgewezen.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error rejecting reservation:', error);
    }
  };

  const handleDelete = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) {
        console.error('Error deleting reservation:', error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het verwijderen van de reservering.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setReservations(prev => prev.filter(r => r.id !== reservationId));

      toast({
        title: "Reservering verwijderd",
        description: "De reservering is succesvol verwijderd.",
      });
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Reserveringen</h1>
          <p className="text-gray-600 mt-1">Beheer asset reserveringen en aanvragen</p>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Geen reserveringen</h3>
              <p className="mt-2 text-gray-500">Er zijn nog geen reserveringen aangevraagd.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <CardTitle className="text-lg">
                          {reservation.asset ? 
                            `${reservation.asset.brand} ${reservation.asset.model}` : 
                            'Asset niet gevonden'
                          }
                        </CardTitle>
                        <CardDescription>
                          {reservation.asset?.type}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusIcon(reservation.status)}
                        <span className="ml-1 capitalize">{reservation.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Aanvrager:</span>
                        <span className="text-sm font-medium">{reservation.requester_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Periode:</span>
                        <span className="text-sm font-medium">
                          {formatDate(reservation.requested_date)} - {formatDate(reservation.return_date)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Doel:</span>
                        <p className="text-sm font-medium">{reservation.purpose}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Aangevraagd op:</span>
                        <span className="text-sm font-medium">{formatDate(reservation.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {canManageAssets && (
                    <div className="mt-4 flex space-x-2">
                      {reservation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reservation.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Goedkeuren
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(reservation.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Afwijzen
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Verwijderen
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reservering verwijderen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet u zeker dat u deze reservering wilt verwijderen? 
                              Deze actie kan niet ongedaan worden gemaakt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(reservation.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
