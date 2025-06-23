import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Laptop, Smartphone, Headphones, Cable, Monitor, User, Settings, BarChart3, MapPin, Calendar, LogOut } from "lucide-react";
import { AssetForm } from "@/components/AssetForm";
import { UserRole } from "@/components/UserRole";
import { DashboardStats } from "@/components/DashboardStats";
import { ReservationDialog } from "@/components/ReservationDialog";
import { BrandingSettings } from "@/components/BrandingSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAssets, Asset } from "@/hooks/useAssets";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isLoggedIn, userProfile, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { assets, loading: assetsLoading, addAsset, updateAsset } = useAssets();
  const { toast } = useToast();
  
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Medewerker" | "Gebruiker">("Gebruiker");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [reservationAsset, setReservationAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, authLoading, navigate]);

  useEffect(() => {
    if (userProfile?.role) {
      setCurrentRole(userProfile.role as "ICT Admin" | "Facilitair Medewerker" | "Gebruiker");
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p>Laden...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "laptop":
        return <Laptop className="h-4 w-4" />;
      case "telefoon":
        return <Smartphone className="h-4 w-4" />;
      case "headset":
        return <Headphones className="h-4 w-4" />;
      case "kabel":
        return <Cable className="h-4 w-4" />;
      case "monitor":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddAsset = async (assetData: Omit<Asset, "id" | "created_at" | "updated_at" | "created_by">) => {
    const { error } = await addAsset(assetData);
    
    if (error) {
      toast({
        title: "Fout bij toevoegen",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Asset toegevoegd",
        description: "Het asset is succesvol toegevoegd.",
      });
      setShowAssetForm(false);
    }
  };

  const handleEditAsset = async (assetData: Omit<Asset, "id" | "created_at" | "updated_at" | "created_by">) => {
    if (editingAsset) {
      const { error } = await updateAsset(editingAsset.id, assetData);
      
      if (error) {
        toast({
          title: "Fout bij bijwerken",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Asset bijgewerkt",
          description: "Het asset is succesvol bijgewerkt.",
        });
        setEditingAsset(null);
        setShowAssetForm(false);
      }
    }
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Asset Management Tool</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welkom, {userProfile?.full_name}</span>
              <Badge variant="outline">{currentRole}</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="users">Gebruikers</TabsTrigger>
            <TabsTrigger value="settings" disabled={currentRole !== "ICT Admin"}>
              Instellingen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats assets={filteredAssets} />
            
            <Card>
              <CardHeader>
                <CardTitle>Recente Activiteiten</CardTitle>
                <CardDescription>Laatste wijzigingen in het asset beheer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Nieuwe assets toegevoegd aan database</span>
                    <span className="text-gray-400">Nu</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Beveiligingssysteem geactiveerd</span>
                    <span className="text-gray-400">Nu</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                <Input
                  placeholder="Zoek assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="In gebruik">In gebruik</SelectItem>
                    <SelectItem value="In voorraad">In voorraad</SelectItem>
                    <SelectItem value="Defect">Defect</SelectItem>
                    <SelectItem value="Onderhoud">Onderhoud</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle categorieën</SelectItem>
                    <SelectItem value="ICT">ICT</SelectItem>
                    <SelectItem value="Facilitair">Facilitair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker") && (
                <Button onClick={() => setShowAssetForm(true)} className="flex items-center space-x-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Asset Toevoegen</span>
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Asset Overzicht</CardTitle>
                <CardDescription>
                  {filteredAssets.length} van {assets.length} assets weergegeven
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetsLoading ? (
                  <p>Assets laden...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Foto</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Merk & Model</TableHead>
                          <TableHead>Serienummer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Categorie</TableHead>
                          <TableHead>Toegewezen aan</TableHead>
                          <TableHead>Locatie</TableHead>
                          <TableHead>Specifieke Locatie</TableHead>
                          <TableHead>Acties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell>
                              {asset.image_url ? (
                                <img
                                  src={asset.image_url}
                                  alt={`${asset.brand} ${asset.model}`}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {getAssetIcon(asset.type)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getAssetIcon(asset.type)}
                                <span>{asset.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{asset.brand} {asset.model}</TableCell>
                            <TableCell className="font-mono text-sm">{asset.serial_number}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(asset.status)}>
                                {asset.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {asset.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {asset.assigned_to ? (
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{asset.assigned_to}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Niet toegewezen</span>
                              )}
                            </TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell>
                              {asset.assigned_to_location ? (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 text-blue-500" />
                                  <span className="text-sm">{asset.assigned_to_location}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Geen specifieke locatie</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {asset.status === "In voorraad" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setReservationAsset(asset)}
                                    className="flex items-center gap-1"
                                  >
                                    <Calendar className="h-3 w-3" />
                                    Reserveren
                                  </Button>
                                )}
                                {(currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditAsset(asset)}
                                  >
                                    Bewerken
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gebruikersbeheer</CardTitle>
                <CardDescription>
                  Beheer gebruikersaccounts en rechten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gebruikersbeheer</h3>
                  <p className="text-gray-600 mb-4">
                    Gebruikers kunnen zich registreren via de login pagina. Admin rechten worden automatisch toegekend aan accounts met het e-mailadres "admin@assetspek.nl".
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <BrandingSettings />
          </TabsContent>
        </Tabs>
      </div>

      {showAssetForm && (
        <AssetForm
          asset={editingAsset}
          onSave={editingAsset ? handleEditAsset : handleAddAsset}
          onCancel={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
          }}
        />
      )}

      {reservationAsset && (
        <ReservationDialog
          asset={reservationAsset}
          onClose={() => setReservationAsset(null)}
        />
      )}
    </div>
  );
};

export default Index;
