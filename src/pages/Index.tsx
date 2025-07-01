import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, FileDown, FileUp, Settings, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetForm } from "@/components/AssetForm";
import { ReservationDialog } from "@/components/ReservationDialog";
import { DashboardStats } from "@/components/DashboardStats";
import { UserRole } from "@/components/UserRole";
import { SecurityBanner } from "@/components/SecurityBanner";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { MaintenanceTracker } from "@/components/MaintenanceTracker";
import { useAssets } from "@/hooks/useAssets";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Index = () => {
  const { user, userProfile, logout, loading: authLoading } = useAuth();
  const { assets, loading: assetsLoading, fetchAssets, searchAssets, addAsset, updateAsset } = useAssets();
  const { reservations, createReservation, updateReservationStatus } = useReservations();
  const { toast } = useToast();

  const [showAssetForm, setShowAssetForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [reservationAsset, setReservationAsset] = useState<any>(null);
  const [selectedMaintenanceAsset, setSelectedMaintenanceAsset] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = async (filters: any) => {
    setIsSearching(true);
    await searchAssets(filters);
    setIsSearching(false);
  };

  const handleClearSearch = async () => {
    setIsSearching(false);
    await fetchAssets();
  };

  const handleSaveAsset = async (assetData: any) => {
    try {
      let result;
      if (selectedAsset) {
        result = await updateAsset(selectedAsset.id, assetData);
      } else {
        result = await addAsset(assetData);
      }

      if (result.error) {
        toast({
          title: "Fout bij opslaan",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: selectedAsset ? "Asset bijgewerkt" : "Asset toegevoegd",
          description: selectedAsset 
            ? "Het asset is succesvol bijgewerkt." 
            : "Het nieuwe asset is succesvol toegevoegd.",
        });
        setShowAssetForm(false);
        setSelectedAsset(null);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: "Onverwachte fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  };

  const handleReservation = async (reservationData: any) => {
    const result = await createReservation(reservationData);
    if (result.error) {
      toast({
        title: "Reservering mislukt",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reservering aangemaakt",
        description: "Je reservering is ter goedkeuring verzonden.",
      });
      setShowReservationDialog(false);
      setReservationAsset(null);
    }
  };

  const handleApproveReservation = async (reservationId: string, newStatus: any) => {
    const result = await updateReservationStatus(reservationId, newStatus, userProfile?.full_name || 'Admin');
    if (result.error) {
      toast({
        title: "Fout bij goedkeuring",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reservering bijgewerkt",
        description: `Reservering is ${newStatus === 'approved' ? 'goedgekeurd' : 'afgewezen'}.`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In gebruik":
        return "bg-green-100 text-green-800";
      case "In voorraad":
        return "bg-blue-100 text-blue-800";
      case "Defect":
        return "bg-red-100 text-red-800";
      case "Onderhoud":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canUserModifyAssets = () => {
    return userProfile?.role === 'ICT Admin' || userProfile?.role === 'Facilitair Medewerker';
  };

  const visibleAssets = useMemo(() => {
    if (userProfile?.role === 'ICT Admin') {
      return assets;
    } else if (userProfile?.role === 'Facilitair Medewerker') {
      return assets.filter(asset => asset.category === 'Facilitair');
    } else {
      return assets.filter(asset => asset.assigned_to === userProfile?.email);
    }
  }, [assets, userProfile]);

  const pendingReservations = reservations.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AssetSpek</h1>
              <p className="text-sm text-gray-600">Asset Management Systeem</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <UserRole role={userProfile?.role || 'Gebruiker'} />
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SecurityBanner />
        
        <DashboardStats 
          totalAssets={visibleAssets.length}
          availableAssets={visibleAssets.filter(a => a.status === "In voorraad").length}
          inUseAssets={visibleAssets.filter(a => a.status === "In gebruik").length}
          pendingReservations={pendingReservations.length}
        />

        {canUserModifyAssets() && pendingReservations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Goedkeuring vereist</CardTitle>
              <CardDescription>
                {pendingReservations.length} reservering(en) wachten op goedkeuring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium">{reservation.requester_name}</p>
                      <p className="text-sm text-gray-600">
                        {reservation.purpose} • {format(new Date(reservation.requested_date), 'dd MMM yyyy')} - {format(new Date(reservation.return_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveReservation(reservation.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Goedkeuren
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveReservation(reservation.id, 'rejected')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Afwijzen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <AdvancedSearch 
            onSearch={handleSearch} 
            onClear={handleClearSearch}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>
                    {isSearching ? "Zoekresultaten" : `${visibleAssets.length} asset(s) gevonden`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {canUserModifyAssets() && (
                    <>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        Exporteren
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileUp className="h-4 w-4 mr-2" />
                        Importeren
                      </Button>
                      <Button onClick={() => setShowAssetForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Asset toevoegen
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Assets laden...</p>
                </div>
              ) : visibleAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">Geen assets gevonden</p>
                  <p className="text-sm">
                    {isSearching ? "Probeer andere zoektermen" : "Voeg je eerste asset toe om te beginnen"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Merk/Model</TableHead>
                        <TableHead>Serienummer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Locatie</TableHead>
                        <TableHead>Categorie</TableHead>
                        {userProfile?.role === 'ICT Admin' && <TableHead>Toegewezen aan</TableHead>}
                        <TableHead>Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.type}</TableCell>
                          <TableCell>
                            {asset.brand && asset.model 
                              ? `${asset.brand} ${asset.model}`
                              : asset.brand || asset.model || '-'
                            }
                          </TableCell>
                          <TableCell className="font-mono text-sm">{asset.serial_number}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{asset.category}</Badge>
                          </TableCell>
                          {userProfile?.role === 'ICT Admin' && (
                            <TableCell>{asset.assigned_to || '-'}</TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canUserModifyAssets() && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setShowAssetForm(true);
                                    }}
                                  >
                                    Bewerken
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMaintenanceAsset(asset);
                                    }}
                                  >
                                    Onderhoud
                                  </Button>
                                </>
                              )}
                              {asset.status === "In voorraad" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReservationAsset(asset);
                                    setShowReservationDialog(true);
                                  }}
                                >
                                  Reserveren
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
      </main>

      {showAssetForm && (
        <AssetForm
          asset={selectedAsset}
          onSave={handleSaveAsset}
          onCancel={() => {
            setShowAssetForm(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {showReservationDialog && reservationAsset && (
        <ReservationDialog
          asset={reservationAsset}
          onReserve={handleReservation}
          onCancel={() => {
            setShowReservationDialog(false);
            setReservationAsset(null);
          }}
        />
      )}

      {selectedMaintenanceAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Onderhoud: {selectedMaintenanceAsset.type}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedMaintenanceAsset(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <MaintenanceTracker
                assetId={selectedMaintenanceAsset.id}
                assetName={`${selectedMaintenanceAsset.type} (${selectedMaintenanceAsset.serial_number})`}
              />
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default Index;
