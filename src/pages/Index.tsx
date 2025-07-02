
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Laptop, Smartphone, Headphones, Cable, Monitor, User, Settings, BarChart3, MapPin, Calendar, Tag, Trash2 } from "lucide-react";
import { AssetForm } from "@/components/AssetForm";
import { UserRole } from "@/components/UserRole";
import { DashboardStats } from "@/components/DashboardStats";
import { ReservationDialog } from "@/components/ReservationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface Asset {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  assetTag?: string;
  purchaseDate: string;
  status: "In gebruik" | "In voorraad" | "Defect" | "Onderhoud" | "Deleted";
  location: string;
  category: "ICT" | "Facilitair" | "Catering" | "Logistics";
  assignedTo?: string;
  assignedToLocation?: string;
  image?: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    type: "Laptop",
    brand: "Dell",
    model: "Latitude 7420",
    serialNumber: "DL7420001",
    assetTag: "MVDS-LAP001",
    purchaseDate: "2023-01-15",
    status: "In gebruik",
    location: "Kantoor Amsterdam",
    category: "ICT",
    assignedTo: "Jan Janssen",
    assignedToLocation: "Werkplek A-101"
  },
  {
    id: "2",
    type: "Telefoon",
    brand: "Apple",
    model: "iPhone 14",
    serialNumber: "IP14002",
    assetTag: "MVDS-PHN002",
    purchaseDate: "2023-03-20",
    status: "In voorraad",
    location: "ICT Magazijn",
    category: "ICT",
    assignedToLocation: "Magazijn Rek B-3"
  },
  {
    id: "3",
    type: "Headset",
    brand: "Jabra",
    model: "Evolve2 65",
    serialNumber: "JB65003",
    assetTag: "MVDS-HDS003",
    purchaseDate: "2023-02-10",
    status: "In gebruik",
    location: "Kantoor Utrecht",
    category: "ICT",
    assignedTo: "Marie Peeters",
    assignedToLocation: "Werkplek U-205"
  },
  {
    id: "4",
    type: "Bureau",
    brand: "IKEA",
    model: "Bekant",
    serialNumber: "IK-BK004",
    assetTag: "MVDS-DSK004",
    purchaseDate: "2022-11-01",
    status: "In gebruik",
    location: "Kantoor Amsterdam",
    category: "Facilitair",
    assignedTo: "Tom de Vries",
    assignedToLocation: "Werkplek A-150"
  }
];

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("ICT Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [reservationAsset, setReservationAsset] = useState<Asset | null>(null);

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
      case "Deleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "ICT":
        return "ICT";
      case "Facilitair":
        return "Facilitair";
      case "Catering":
        return "Catering";
      case "Logistics":
        return "Logistiek";
      default:
        return category;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    
    // Role-based filtering
    if (currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") {
      return matchesSearch && matchesStatus && matchesCategory && asset.category === "Facilitair";
    }
    
    if (currentRole === "Gebruiker") {
      return matchesSearch && matchesStatus && matchesCategory && asset.assignedTo === "Jan Janssen"; // Mock current user
    }
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddAsset = (assetData: Omit<Asset, "id">) => {
    const newAsset: Asset = {
      ...assetData,
      id: Date.now().toString()
    };
    setAssets([...assets, newAsset]);
    setShowAssetForm(false);
  };

  const handleEditAsset = (assetData: Omit<Asset, "id">) => {
    if (editingAsset) {
      setAssets(assets.map(asset => 
        asset.id === editingAsset.id ? { ...assetData, id: editingAsset.id } : asset
      ));
      setEditingAsset(null);
      setShowAssetForm(false);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, status: "Deleted" as const } : asset
    ));
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Asset Management Tool</h1>
              </div>
            </div>
            <div className="flex justify-end">
              <UserRole currentRole={currentRole} onRoleChange={setCurrentRole} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="assets" className="text-xs sm:text-sm">Assets</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Gebruikers</TabsTrigger>
            <TabsTrigger value="settings" disabled={currentRole !== "ICT Admin"} className="text-xs sm:text-sm">
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
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600">Jan Janssen heeft Dell Latitude 7420 toegewezen gekregen</span>
                    </div>
                    <span className="text-gray-400 text-xs sm:text-sm ml-5 sm:ml-0">2 uur geleden</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600">Nieuw asset toegevoegd: iPhone 14</span>
                    </div>
                    <span className="text-gray-400 text-xs sm:text-sm ml-5 sm:ml-0">1 dag geleden</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600">Jabra Headset naar onderhoud</span>
                    </div>
                    <span className="text-gray-400 text-xs sm:text-sm ml-5 sm:ml-0">3 dagen geleden</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder="Zoek assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statussen</SelectItem>
                      <SelectItem value="In gebruik">In gebruik</SelectItem>
                      <SelectItem value="In voorraad">In voorraad</SelectItem>
                      <SelectItem value="Defect">Defect</SelectItem>
                      <SelectItem value="Onderhoud">Onderhoud</SelectItem>
                      <SelectItem value="Deleted">Verwijderd</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle categorieën</SelectItem>
                      <SelectItem value="ICT">ICT</SelectItem>
                      <SelectItem value="Facilitair">Facilitair</SelectItem>
                      <SelectItem value="Catering">Catering</SelectItem>
                      <SelectItem value="Logistics">Logistiek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && (
                <div className="flex justify-end">
                  <Button onClick={() => setShowAssetForm(true)} className="flex items-center space-x-2 w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4" />
                    <span>Asset Toevoegen</span>
                  </Button>
                </div>
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
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-4">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {asset.image ? (
                            <img
                              src={asset.image}
                              alt={`${asset.brand} ${asset.model}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getAssetIcon(asset.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getAssetIcon(asset.type)}
                            <h3 className="font-medium text-lg truncate">{asset.type}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{asset.brand} {asset.model}</p>
                          <p className="text-xs text-gray-500 font-mono mb-2">{asset.serialNumber}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status === "Deleted" ? "Verwijderd" : asset.status}
                            </Badge>
                            <Badge variant="outline">
                              {getCategoryDisplayName(asset.category)}
                            </Badge>
                          </div>
                          {asset.assignedTo && (
                            <div className="flex items-center space-x-1 mb-2">
                              <User className="h-3 w-3" />
                              <span className="text-sm">{asset.assignedTo}</span>
                            </div>
                          )}
                          <div className="flex flex-col space-y-1 text-sm text-gray-600">
                            <span>{asset.location}</span>
                            {asset.assignedToLocation && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span className="text-xs">{asset.assignedToLocation}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {asset.status === "In voorraad" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReservationAsset(asset)}
                                className="flex items-center gap-1 text-xs"
                              >
                                <Calendar className="h-3 w-3" />
                                Reserveren
                              </Button>
                            )}
                            {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && asset.status !== "Deleted" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditAsset(asset)}
                                className="text-xs"
                              >
                                Bewerken
                              </Button>
                            )}
                            {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin") && asset.status !== "Deleted" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Asset verwijderen</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Weet je zeker dat je dit asset wilt verwijderen? Het asset wordt gemarkeerd als "Deleted" en kan later worden hersteld.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAsset(asset.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Verwijderen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Foto</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Merk & Model</TableHead>
                        <TableHead className="hidden lg:table-cell">Serienummer</TableHead>
                        <TableHead className="hidden lg:table-cell">Asset Tag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Categorie</TableHead>
                        <TableHead className="hidden lg:table-cell">Toegewezen aan</TableHead>
                        <TableHead className="hidden xl:table-cell">Locatie</TableHead>
                        <TableHead className="hidden xl:table-cell">Specifieke Locatie</TableHead>
                        <TableHead>Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            {asset.image ? (
                              <img
                                src={asset.image}
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
                              <div>
                                <span className="font-medium">{asset.type}</span>
                                <div className="block md:hidden text-xs text-gray-500">
                                  {asset.brand} {asset.model}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{asset.brand} {asset.model}</TableCell>
                          <TableCell className="hidden lg:table-cell font-mono text-sm">{asset.serialNumber}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {asset.assetTag ? (
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3 w-3 text-blue-500" />
                                <span className="font-mono text-sm">{asset.assetTag}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Geen tag</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status === "Deleted" ? "Verwijderd" : asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">
                              {getCategoryDisplayName(asset.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {asset.assignedTo ? (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{asset.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Niet toegewezen</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">{asset.location}</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {asset.assignedToLocation ? (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span className="text-sm">{asset.assignedToLocation}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Geen specifieke locatie</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {asset.status === "In voorraad" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReservationAsset(asset)}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Calendar className="h-3 w-3" />
                                  <span className="hidden sm:inline">Reserveren</span>
                                </Button>
                              )}
                              {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && asset.status !== "Deleted" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditAsset(asset)}
                                  className="text-xs"
                                >
                                  <span className="hidden sm:inline">Bewerken</span>
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                              )}
                              {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin") && asset.status !== "Deleted" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Asset verwijderen</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Weet je zeker dat je dit asset wilt verwijderen? Het asset wordt gemarkeerd als "Deleted" en kan later worden hersteld.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteAsset(asset.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Verwijderen
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Directory Gebruikers</CardTitle>
                <CardDescription>
                  Gebruikers gesynchroniseerd vanuit Microsoft Entra ID
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AD Integratie Required</h3>
                  <p className="text-gray-600 mb-4">
                    Voor volledige AD-integratie moet backend functionaliteit worden toegevoegd.
                  </p>
                  <p className="text-sm text-gray-500">
                    Mock gebruikers: Jan Janssen, Marie Peeters, Tom de Vries
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Systeem Instellingen</CardTitle>
                <CardDescription>Configuratie opties voor ICT Administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Instellingen</h3>
                    <p className="text-gray-600">
                      Systeem configuratie en AD synchronisatie instellingen komen hier.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
