
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit3, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

      // Type assertion to match our interface
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
            status: "pending" // Reset to pending when edited
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
            status: "pending" // Reset to pending for extension request
          })
          .eq('id', selectedReservation.id);

        if (error) throw error;

        toast({
          title: "Verlenging aangevraagd",
          description: `Uw aanvraag voor ${extensionDays} extra dagen is ingediend en wordt beoordeeld door een administrator.`,
        });
      }

      await fetchReservations(); // Refresh the list
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
      return `${reservation.assets.brand} ${reservation.assets.model} (${reservation.assets.type})`;
    }
    return `Asset ID: ${reservation.asset_id}`;
  };

  if (loading) {
    return (
      <div className="responsive-container responsive-section">
        <div className="text-center">Laden...</div>
      </div>
    );
  }

  return (
    <div className="responsive-container responsive-section">
      <div className="responsive-spacing">
        <div className="flex flex-col responsive-gap">
          <div>
            <h1 className="responsive-text-3xl font-bold text-foreground">Mijn Reserveringen</h1>
            <p className="responsive-text-base text-muted-foreground mt-2">Beheer uw asset reserveringen</p>
          </div>

          <Card className="responsive-card">
            <CardHeader className="responsive-padding">
              <CardTitle className="responsive-text-xl">Uw Reserveringen</CardTitle>
              <CardDescription className="responsive-text-base">
                {reservations.filter(r => r.status === "pending").length} van {reservations.length} reserveringen wachten op goedkeuring
              </CardDescription>
            </CardHeader>
            <CardContent className="responsive-padding">
              {reservations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground responsive-text-base">
                  U heeft nog geen reserveringen aangevraagd.
                </div>
              ) : (
                <div className="table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="responsive-text-sm">Asset</TableHead>
                        <TableHead className="responsive-text-sm mobile-hidden">Periode</TableHead>
                        <TableHead className="responsive-text-sm mobile-hidden">Doel</TableHead>
                        <TableHead className="responsive-text-sm">Status</TableHead>
                        <TableHead className="responsive-text-sm desktop-only">Aangemaakt</TableHead>
                        <TableHead className="responsive-text-sm">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium responsive-text-sm">
                            <div className="truncate max-w-[200px]" title={getAssetName(reservation)}>
                              {getAssetName(reservation)}
                            </div>
                          </TableCell>
                          <TableCell className="mobile-hidden">
                            <div className="flex items-center responsive-gap text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span className="responsive-text-sm">
                                {new Date(reservation.requested_date).toLocaleDateString()} - {new Date(reservation.return_date).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="mobile-hidden">
                            <span className="responsive-text-sm truncate max-w-[150px] block" title={reservation.purpose}>
                              {reservation.purpose}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(reservation.status)} responsive-text-sm`}>
                              {getStatusText(reservation.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="desktop-only responsive-text-sm text-muted-foreground">
                            {new Date(reservation.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex responsive-gap">
                              {canEdit(reservation) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(reservation, "edit")}
                                  className="text-blue-600 hover:text-blue-700 touch-target"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  <span className="mobile-hidden ml-2">Bewerk</span>
                                </Button>
                              )}
                              {canExtend(reservation) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(reservation, "extend")}
                                  className="text-green-600 hover:text-green-700 touch-target"
                                >
                                  <Clock className="h-4 w-4" />
                                  <span className="mobile-hidden ml-2">Verleng</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit/Extend Dialog */}
      {selectedReservation && actionType && (
        <Dialog open={true} onOpenChange={closeDialog}>
          <DialogContent className="dialog-content responsive-padding">
            <DialogHeader>
              <DialogTitle className="responsive-text-lg">
                {actionType === "edit" && "Reservering Bewerken"}
                {actionType === "extend" && "Reservering Verlengen"}
              </DialogTitle>
              <DialogDescription className="responsive-text-base">
                Asset: {getAssetName(selectedReservation)}
              </DialogDescription>
            </DialogHeader>

            <div className="responsive-spacing">
              {actionType === "edit" && (
                <>
                  <div className="responsive-grid-1-2 responsive-gap">
                    <div className="responsive-spacing">
                      <Label htmlFor="requestedDate" className="responsive-text-sm">Startdatum</Label>
                      <Input
                        id="requestedDate"
                        type="date"
                        value={editData.requestedDate}
                        onChange={(e) => setEditData({ ...editData, requestedDate: e.target.value })}
                        className="touch-padding"
                      />
                    </div>
                    <div className="responsive-spacing">
                      <Label htmlFor="returnDate" className="responsive-text-sm">Einddatum</Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={editData.returnDate}
                        onChange={(e) => setEditData({ ...editData, returnDate: e.target.value })}
                        className="touch-padding"
                      />
                    </div>
                  </div>
                  <div className="responsive-spacing">
                    <Label htmlFor="purpose" className="responsive-text-sm">Doel van gebruik</Label>
                    <Textarea
                      id="purpose"
                      value={editData.purpose}
                      onChange={(e) => setEditData({ ...editData, purpose: e.target.value })}
                      placeholder="Beschrijf waarvoor u dit asset nodig heeft..."
                      className="touch-padding"
                    />
                  </div>
                </>
              )}

              {actionType === "extend" && (
                <>
                  <div>
                    <Label className="responsive-text-sm">Huidige periode</Label>
                    <p className="responsive-text-sm text-muted-foreground">
                      {new Date(selectedReservation.requested_date).toLocaleDateString()} - {new Date(selectedReservation.return_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="responsive-spacing">
                    <Label htmlFor="extensionDays" className="responsive-text-sm">Aantal extra dagen</Label>
                    <Input
                      id="extensionDays"
                      type="number"
                      min="1"
                      max="30"
                      value={editData.extensionDays}
                      onChange={(e) => setEditData({ ...editData, extensionDays: e.target.value })}
                      placeholder="Aantal dagen"
                      className="touch-padding"
                    />
                  </div>
                  <div className="responsive-spacing">
                    <Label htmlFor="extensionReason" className="responsive-text-sm">Reden voor verlenging</Label>
                    <Textarea
                      id="extensionReason"
                      value={editData.extensionReason}
                      onChange={(e) => setEditData({ ...editData, extensionReason: e.target.value })}
                      placeholder="Waarom heeft u extra tijd nodig?"
                      className="touch-padding"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="responsive-flex responsive-gap">
              <Button variant="outline" onClick={closeDialog} className="touch-target">
                Annuleren
              </Button>
              <Button onClick={handleSave} className="touch-target">
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
