
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Reservations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          assets:asset_id (
            type,
            brand,
            model,
            serial_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, status, approved_by }: { id: string; status: string; approved_by?: string }) => {
      const { error } = await supabase
        .from("reservations")
        .update({
          status,
          approved_by,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast({
        title: "Reservering bijgewerkt",
        description: "De status van de reservering is succesvol bijgewerkt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de reservering.",
        variant: "destructive",
      });
      console.error("Error updating reservation:", error);
    },
  });

  const handleApprove = async (reservationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    updateReservationMutation.mutate({
      id: reservationId,
      status: "approved",
      approved_by: user?.id,
    });
  };

  const handleReject = async (reservationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    updateReservationMutation.mutate({
      id: reservationId,
      status: "rejected",
      approved_by: user?.id,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />In afwachting</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Goedgekeurd</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Afgewezen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReservations = reservations?.filter(reservation => {
    if (filter === "all") return true;
    return reservation.status === filter;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="text-center">Reserveringen laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Terug naar Dashboard</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Reserveringen Beheer</h1>
          </div>
        </div>

        <div className="flex space-x-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status as typeof filter)}
              className="capitalize"
            >
              {status === "all" ? "Alle" : 
               status === "pending" ? "In afwachting" :
               status === "approved" ? "Goedgekeurd" : "Afgewezen"}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reserveringen</CardTitle>
            <CardDescription>
              Beheer alle reserveringsaanvragen voor assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aanvrager</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Doel</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aangevraagd op</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{reservation.requester_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {reservation.assets?.type} - {reservation.assets?.brand} {reservation.assets?.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            SN: {reservation.assets?.serial_number}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={reservation.purpose}>
                        {reservation.purpose}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div className="text-sm">
                          <div>{new Date(reservation.requested_date).toLocaleDateString('nl-NL')}</div>
                          <div className="text-gray-500">
                            tot {new Date(reservation.return_date).toLocaleDateString('nl-NL')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reservation.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(reservation.created_at).toLocaleDateString('nl-NL')}
                    </TableCell>
                    <TableCell>
                      {reservation.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reservation.id)}
                            disabled={updateReservationMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Goedkeuren
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(reservation.id)}
                            disabled={updateReservationMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Afwijzen
                          </Button>
                        </div>
                      )}
                      {reservation.status !== "pending" && (
                        <span className="text-gray-500 text-sm">Verwerkt</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredReservations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Geen reserveringen gevonden voor de geselecteerde filter.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
