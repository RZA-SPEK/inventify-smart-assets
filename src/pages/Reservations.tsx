
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Edit3, Calendar, User, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserReservations } from "@/components/UserReservations";
import { Link } from "react-router-dom";

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

const mockReservations: Reservation[] = [
  {
    id: "1",
    assetId: "1",
    assetName: "Dell Latitude 7420",
    requesterName: "Jan Janssen",
    requestedDate: "2024-01-15",
    returnDate: "2024-01-20",
    purpose: "Zakelijke reis naar client meeting",
    status: "pending",
    createdAt: "2024-01-10"
  },
  {
    id: "2",
    assetId: "2",
    assetName: "iPhone 14",
    requesterName: "Marie Peeters",
    requestedDate: "2024-01-18",
    returnDate: "2024-01-25",
    purpose: "Thuiswerken tijdens vakantie",
    status: "approved",
    createdAt: "2024-01-12"
  },
  {
    id: "3",
    assetId: "3",
    assetName: "Jabra Evolve2 65",
    requesterName: "Tom de Vries",
    requestedDate: "2024-01-20",
    returnDate: "2024-01-22",
    purpose: "Externe vergaderingen",
    status: "rejected",
    createdAt: "2024-01-13"
  }
];

const Reservations = () => {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "edit" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [currentUserRole] = useState<"admin" | "user">("admin"); // Mock role - should come from auth
  const [showUserView, setShowUserView] = useState(false);

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

  const handleAction = (reservation: Reservation, action: "approve" | "reject" | "edit") => {
    setSelectedReservation(reservation);
    setActionType(action);
    setRejectReason("");
  };

  const confirmAction = () => {
    if (!selectedReservation || !actionType) return;

    const updatedReservations = reservations.map(reservation => {
      if (reservation.id === selectedReservation.id) {
        return {
          ...reservation,
          status: actionType === "approve" ? "approved" as const : 
                  actionType === "reject" ? "rejected" as const : 
                  reservation.status
        };
      }
      return reservation;
    });

    setReservations(updatedReservations);

    toast({
      title: `Reservering ${actionType === "approve" ? "goedgekeurd" : actionType === "reject" ? "afgewezen" : "bewerkt"}`,
      description: `Reservering voor ${selectedReservation.assetName} is ${actionType === "approve" ? "goedgekeurd" : actionType === "reject" ? "afgewezen" : "bewerkt"}`,
      variant: actionType === "reject" ? "destructive" : "default"
    });

    setSelectedReservation(null);
    setActionType(null);
    setRejectReason("");
  };

  const closeDialog = () => {
    setSelectedReservation(null);
    setActionType(null);
    setRejectReason("");
  };

  // Show user view if requested or if user is not admin
  if (showUserView || currentUserRole === "user") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Assets
              </Button>
            </Link>
            {currentUserRole === "admin" && (
              <Button 
                onClick={() => setShowUserView(false)}
                variant="outline"
                size="sm"
              >
                Admin View
              </Button>
            )}
          </div>
          <UserReservations />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Assets
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reserveringsbeheer</h1>
              <p className="text-gray-600">Beheer alle asset reserveringsaanvragen</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowUserView(true)}
              variant="outline"
              size="sm"
            >
              Gebruiker View
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reserveringsaanvragen</CardTitle>
            <CardDescription>
              {reservations.filter(r => r.status === "pending").length} van {reservations.length} aanvragen wachten op goedkeuring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Aanvrager</TableHead>
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
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{reservation.requesterName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(reservation.requestedDate).toLocaleDateString()} - {new Date(reservation.returnDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm truncate max-w-[200px]" title={reservation.purpose}>
                            {reservation.purpose}
                          </span>
                        </div>
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
                          {reservation.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(reservation, "approve")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(reservation, "reject")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(reservation, "edit")}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Action Dialog */}
        {selectedReservation && actionType && (
          <Dialog open={true} onOpenChange={closeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === "approve" && "Reservering Goedkeuren"}
                  {actionType === "reject" && "Reservering Afwijzen"}
                  {actionType === "edit" && "Reservering Bewerken"}
                </DialogTitle>
                <DialogDescription>
                  Asset: {selectedReservation.assetName} voor {selectedReservation.requesterName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Periode</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReservation.requestedDate).toLocaleDateString()} - {new Date(selectedReservation.returnDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <Label>Doel</Label>
                  <p className="text-sm text-gray-600">{selectedReservation.purpose}</p>
                </div>

                {actionType === "reject" && (
                  <div>
                    <Label htmlFor="rejectReason">Reden voor afwijzing</Label>
                    <Textarea
                      id="rejectReason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Geef een reden op waarom deze reservering wordt afgewezen..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Annuleren
                </Button>
                <Button 
                  onClick={confirmAction}
                  variant={actionType === "reject" ? "destructive" : "default"}
                >
                  {actionType === "approve" && "Goedkeuren"}
                  {actionType === "reject" && "Afwijzen"}
                  {actionType === "edit" && "Opslaan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Reservations;
