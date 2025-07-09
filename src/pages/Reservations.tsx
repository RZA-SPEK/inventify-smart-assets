
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Package } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Reservation {
  id: string;
  requested_date: string;
  return_date: string;
  start_time: string | null;
  end_time: string | null;
  purpose: string | null;
  status: string | null;
  requester_name: string | null;
  asset_id: string | null;
  assets?: {
    type: string;
    brand: string | null;
    model: string | null;
  };
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          assets (
            type,
            brand,
            model
          )
        `)
        .order('requested_date', { ascending: false });

      if (error) {
        throw error;
      }

      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'goedgekeurd':
        return 'bg-green-100 text-green-800';
      case 'afgewezen':
        return 'bg-red-100 text-red-800';
      case 'in_afwachting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Reserveringen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto mobile-spacing py-4 sm:py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reserveringen</h1>
          <div className="text-sm text-gray-600">
            {reservations.length} reservering{reservations.length !== 1 ? 'en' : ''}
          </div>
        </div>

        <div className="grid gap-4">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">Geen reserveringen gevonden</p>
              </CardContent>
            </Card>
          ) : (
            reservations.map((reservation) => (
              <Card key={reservation.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {reservation.assets ? 
                        `${reservation.assets.type} - ${reservation.assets.brand} ${reservation.assets.model}` :
                        'Asset niet gevonden'
                      }
                    </CardTitle>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status || 'in_afwachting'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Aanvrager:</span>
                        <span>{reservation.requester_name || 'Onbekend'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Periode:</span>
                        <span>
                          {format(new Date(reservation.requested_date), 'dd MMM yyyy', { locale: nl })} - {' '}
                          {format(new Date(reservation.return_date), 'dd MMM yyyy', { locale: nl })}
                        </span>
                      </div>
                      {(reservation.start_time || reservation.end_time) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Tijd:</span>
                          <span>
                            {reservation.start_time && reservation.end_time
                              ? `${reservation.start_time} - ${reservation.end_time}`
                              : reservation.start_time || reservation.end_time || 'Hele dag'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {reservation.purpose && (
                      <div className="text-sm">
                        <span className="font-medium">Doel:</span>
                        <p className="mt-1 text-gray-600">{reservation.purpose}</p>
                      </div>
                    )}
                  </div>
                  
                  {reservation.status === 'in_afwachting' && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => updateReservationStatus(reservation.id, 'goedgekeurd')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Goedkeuren
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReservationStatus(reservation.id, 'afgewezen')}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Afwijzen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
