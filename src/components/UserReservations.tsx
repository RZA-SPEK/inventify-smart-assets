import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Edit3, Clock, User, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isAfter, isBefore, parseISO } from "date-fns";

interface Reservation {
  id: string;
  asset_id: string;
  requester_name: string;
  requested_date: string;
  return_date: string;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  assets?: {
    type: string;
    brand: string;
    model: string;
  };
}

export const UserReservations = () => {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionType, setActionType] = useState<"edit" | "extend" | null>(null);
  const [editData, setEditData] = useState({
    requestedDate: "",
    returnDate: "",
    purpose: "",
    extensionDays: "",
    extensionReason: ""
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }

      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as "pending" | "approved" | "rejected"
      }));

      setReservations(typedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorizeReservations = (reservations: Reservation[]) => {
    const today = new Date();
    const upcoming: Reservation[] = [];
    const ongoing: Reservation[] = [];
    const past: Reservation[] = [];

    reservations.forEach(reservation => {
      const startDate = parseISO(reservation.requested_date);
      const endDate = parseISO(reservation.return_date);
      
      if (isAfter(startDate, today)) {
        upcoming.push(reservation);
      } else if (isBefore(endDate, today)) {
        past.push(reservation);
      } else {
        ongoing.push(reservation);
      }
    });

    return { upcoming, ongoing, past };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Goedgekeurd";
      case "rejected":
        return "Afgewezen";
      case "pending":
        return "In behandeling";
      default:
        return status;
    }
  };

  const handleAction = (reservation: Reservation, action: "edit" | "extend") => {
    setSelectedReservation(reservation);
    setActionType(action);
    setEditData({
      requestedDate: reservation.requested_date,
      returnDate: reservation.return_date,
      purpose: reservation.purpose,
      extensionDays: "",
      extensionReason: ""
    });
  };

  const handleSave = async () => {
    if (!selectedReservation || !actionType) return;

    try {
      if (actionType === "edit") {
        const { error } = await supabase
          .from('reservations')
          .update({
            requested_date: editData.requestedDate,
            return_date: editData.returnDate,
            purpose: editData.purpose,
            status: "pending"
          })
          .eq('id', selectedReservation.id);

        if (error) throw error;

        toast({
          title: "Reservering bijgewerkt",
          description: "Uw reservering is bijgewerkt en wordt opnieuw beoordeeld door een administrator.",
        });
      } else if (actionType === "extend") {
        const currentReturnDate = new Date(selectedReservation.return_date);
        const extensionDays = parseInt(editData.extensionDays);
        const newReturnDate = new Date(currentReturnDate);
        newReturnDate.setDate(newReturnDate.getDate() + extensionDays);

        const { error } = await supabase
          .from('reservations')
          .update({
            return_date: newReturnDate.toISOString().split('T')[0],
            status: "pending"
          })
          .eq('id', selectedReservation.id);

        if (error) throw error;

        toast({
          title: "Verlenging aangevraagd",
          description: `Uw aanvraag voor ${extensionDays} extra dagen is ingediend en wordt beoordeeld door een administrator.`,
        });
      }

      await fetchReservations();
      closeDialog();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van uw reservering.",
        variant: "destructive"
      });
    }
  };

  const closeDialog = () => {
    setSelectedReservation(null);
    setActionType(null);
    setEditData({
      requestedDate: "",
      returnDate: "",
      purpose: "",
      extensionDays: "",
      extensionReason: ""
    });
  };

  const canEdit = (reservation: Reservation) => {
    return reservation.status === "pending" || reservation.status === "rejected";
  };

  const canExtend = (reservation: Reservation) => {
    return reservation.status === "approved";
  };

  const getAssetName = (reservation: Reservation) => {
    if (reservation.assets) {
      return `${reservation.assets.brand} ${reservation.assets.model}`;
    }
    return `Asset ID: ${reservation.asset_id}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const renderReservationCard = (reservation: Reservation) => (
    <Card key={reservation.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <CardTitle className="text-lg">
                {getAssetName(reservation)}
              </CardTitle>
              <CardDescription>
                {reservation.assets?.type}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(reservation.status)}>
            <span className="capitalize">{getStatusText(reservation.status)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Periode:</span>
              <span className="text-sm font-medium">
                {formatDate(reservation.requested_date)} - {formatDate(reservation.return_date)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Aangevraagd op:</span>
              <span className="text-sm font-medium">{formatDate(reservation.created_at)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">Doel:</span>
              <p className="text-sm font-medium">{reservation.purpose}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {canEdit(reservation) && (
            <Button
              size="sm"
              onClick={() => handleAction(reservation, "edit")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Bewerk
            </Button>
          )}
          {canExtend(reservation) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(reservation, "extend")}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Clock className="h-4 w-4 mr-1" />
              Verleng
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

  const { upcoming, ongoing, past } = categorizeReservations(reservations);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mijn Reserveringen</h1>
          <p className="text-gray-600 mt-1">Beheer uw asset reserveringen</p>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Geen reserveringen</h3>
              <p className="mt-2 text-gray-500">U heeft nog geen reserveringen aangevraagd.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="ongoing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ongoing">
                Lopend ({ongoing.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Komend ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Voorbij ({past.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ongoing" className="space-y-4 mt-6">
              {ongoing.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">Geen lopende reserveringen</p>
                  </CardContent>
                </Card>
              ) : (
                ongoing.map(renderReservationCard)
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {upcoming.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">Geen komende reserveringen</p>
                  </CardContent>
                </Card>
              ) : (
                upcoming.map(renderReservationCard)
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4 mt-6">
              {past.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">Geen voorbije reserveringen</p>
                  </CardContent>
                </Card>
              ) : (
                past.map(renderReservationCard)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit/Extend Dialog */}
      {selectedReservation && actionType && (
        <Dialog open={true} onOpenChange={closeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {actionType === "edit" && "Reservering Bewerken"}
                {actionType === "extend" && "Reservering Verlengen"}
              </DialogTitle>
              <DialogDescription>
                Asset: {getAssetName(selectedReservation)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {actionType === "edit" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requestedDate">Startdatum</Label>
                      <Input
                        id="requestedDate"
                        type="date"
                        value={editData.requestedDate}
                        onChange={(e) => setEditData({ ...editData, requestedDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Einddatum</Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={editData.returnDate}
                        onChange={(e) => setEditData({ ...editData, returnDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Doel van gebruik</Label>
                    <Textarea
                      id="purpose"
                      value={editData.purpose}
                      onChange={(e) => setEditData({ ...editData, purpose: e.target.value })}
                      placeholder="Beschrijf waarvoor u dit asset nodig heeft..."
                    />
                  </div>
                </>
              )}

              {actionType === "extend" && (
                <>
                  <div>
                    <Label>Huidige periode</Label>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedReservation.requested_date)} - {formatDate(selectedReservation.return_date)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extensionDays">Aantal extra dagen</Label>
                    <Input
                      id="extensionDays"
                      type="number"
                      min="1"
                      max="30"
                      value={editData.extensionDays}
                      onChange={(e) => setEditData({ ...editData, extensionDays: e.target.value })}
                      placeholder="Aantal dagen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extensionReason">Reden voor verlenging</Label>
                    <Textarea
                      id="extensionReason"
                      value={editData.extensionReason}
                      onChange={(e) => setEditData({ ...editData, extensionReason: e.target.value })}
                      placeholder="Waarom heeft u extra tijd nodig?"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Annuleren
              </Button>
              <Button onClick={handleSave}>
                {actionType === "edit" && "Opslaan"}
                {actionType === "extend" && "Verlenging Aanvragen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
