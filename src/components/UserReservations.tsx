
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit3, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reservation {
  id: string;
  assetId: string;
  assetName: string;
  requesterName: string;
  requestedDate: string;
  returnDate: string;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Mock data for current user's reservations
const mockUserReservations: Reservation[] = [
  {
    id: "1",
    assetId: "1",
    assetName: "Dell Latitude 7420",
    requesterName: "Current User",
    requestedDate: "2024-01-15",
    returnDate: "2024-01-20",
    purpose: "Zakelijke reis naar client meeting",
    status: "approved",
    createdAt: "2024-01-10"
  },
  {
    id: "4",
    assetId: "4",
    assetName: "MacBook Pro 16",
    requesterName: "Current User",
    requestedDate: "2024-01-25",
    returnDate: "2024-01-30",
    purpose: "Thuiswerken project",
    status: "pending",
    createdAt: "2024-01-20"
  }
];

export const UserReservations = () => {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>(mockUserReservations);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionType, setActionType] = useState<"edit" | "extend" | null>(null);
  const [editData, setEditData] = useState({
    requestedDate: "",
    returnDate: "",
    purpose: "",
    extensionDays: "",
    extensionReason: ""
  });

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
      requestedDate: reservation.requestedDate,
      returnDate: reservation.returnDate,
      purpose: reservation.purpose,
      extensionDays: "",
      extensionReason: ""
    });
  };

  const handleSave = () => {
    if (!selectedReservation || !actionType) return;

    if (actionType === "edit") {
      const updatedReservations = reservations.map(reservation => {
        if (reservation.id === selectedReservation.id) {
          return {
            ...reservation,
            requestedDate: editData.requestedDate,
            returnDate: editData.returnDate,
            purpose: editData.purpose,
            status: "pending" as const // Reset to pending when edited
          };
        }
        return reservation;
      });
      setReservations(updatedReservations);

      toast({
        title: "Reservering bijgewerkt",
        description: "Uw reservering is bijgewerkt en wordt opnieuw beoordeeld door een administrator.",
      });
    } else if (actionType === "extend") {
      // Calculate new return date
      const currentReturnDate = new Date(selectedReservation.returnDate);
      const extensionDays = parseInt(editData.extensionDays);
      const newReturnDate = new Date(currentReturnDate);
      newReturnDate.setDate(newReturnDate.getDate() + extensionDays);

      const updatedReservations = reservations.map(reservation => {
        if (reservation.id === selectedReservation.id) {
          return {
            ...reservation,
            returnDate: newReturnDate.toISOString().split('T')[0],
            status: "pending" as const // Reset to pending for extension request
          };
        }
        return reservation;
      });
      setReservations(updatedReservations);

      toast({
        title: "Verlenging aangevraagd",
        description: `Uw aanvraag voor ${extensionDays} extra dagen is ingediend en wordt beoordeeld door een administrator.`,
      });
    }

    closeDialog();
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mijn Reserveringen</h1>
        <p className="text-gray-600">Beheer uw asset reserveringen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uw Reserveringen</CardTitle>
          <CardDescription>
            {reservations.filter(r => r.status === "pending").length} van {reservations.length} reserveringen wachten op goedkeuring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Doel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aangemaakt</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.assetName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(reservation.requestedDate).toLocaleDateString()} - {new Date(reservation.returnDate).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-[200px]" title={reservation.purpose}>
                        {reservation.purpose}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusText(reservation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(reservation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {canEdit(reservation) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(reservation, "edit")}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        {canExtend(reservation) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(reservation, "extend")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                Asset: {selectedReservation.assetName}
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
                      {new Date(selectedReservation.requestedDate).toLocaleDateString()} - {new Date(selectedReservation.returnDate).toLocaleDateString()}
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
