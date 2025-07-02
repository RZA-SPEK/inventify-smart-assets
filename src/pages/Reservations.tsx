
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Reservations = () => {
  const navigate = useNavigate();

  // Mock reservations data for demonstration
  const [reservations] = useState([
    {
      id: "1",
      assetName: "Laptop Dell XPS 13",
      assetTag: "MVDS-50010",
      requesterName: "John Doe",
      requestedDate: "2024-07-05",
      returnDate: "2024-07-12",
      purpose: "Thuiswerken project",
      status: "pending" as const
    },
    {
      id: "2", 
      assetName: "Beamer Epson EB-X41",
      assetTag: "MVDS-50025",
      requesterName: "Jane Smith",
      requestedDate: "2024-07-03",
      returnDate: "2024-07-04",
      purpose: "Presentatie vergadering",
      status: "approved" as const
    },
    {
      id: "3",
      assetName: "Camera Canon EOS R5",
      assetTag: "MVDS-50030",
      requesterName: "Mike Johnson",
      requestedDate: "2024-07-01",
      returnDate: "2024-07-02",
      purpose: "Marketing fotoshoot",
      status: "rejected" as const
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />In behandeling</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Goedgekeurd</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Afgewezen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (reservationId: string) => {
    console.log("Approving reservation:", reservationId);
    // In a real app, this would make an API call to update the reservation status
  };

  const handleReject = (reservationId: string) => {
    console.log("Rejecting reservation:", reservationId);
    // In a real app, this would make an API call to update the reservation status
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar Dashboard</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Reserveringen</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Asset Reserveringen ({reservations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen reserveringen gevonden.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Aanvrager</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Doel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{reservation.assetName}</div>
                              <div className="text-sm text-gray-500">{reservation.assetTag}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{reservation.requesterName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{reservation.requestedDate}</div>
                            <div className="text-gray-500">tot {reservation.returnDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={reservation.purpose}>
                            {reservation.purpose}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(reservation.status)}
                        </TableCell>
                        <TableCell>
                          {reservation.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(reservation.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Goedkeuren
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(reservation.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Afwijzen
                              </Button>
                            </div>
                          )}
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
  );
};

export default Reservations;
