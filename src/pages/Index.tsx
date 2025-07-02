
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Laptop, Smartphone, Headphones, Cable, Monitor, User, Settings, BarChart3, MapPin, Calendar, Tag } from "lucide-react";
import { AssetForm } from "@/components/AssetForm";
import { UserRole } from "@/components/UserRole";
import { DashboardStats } from "@/components/DashboardStats";
import { ReservationDialog } from "@/components/ReservationDialog";

export interface Asset {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  assetTag?: string;
  purchaseDate: string;
  status: "In gebruik" | "In voorraad" | "Defect" | "Onderhoud";
  location: string;
  category: "ICT" | "Facilitair";
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
      default:
        return "bg-gray-100 text-gray-800";
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
            <UserRole currentRole={currentRole} onRoleChange={setCurrentRole} />
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
                    <span className="text-gray-600">Jan Janssen heeft Dell Latitude 7420 toegewezen gekregen</span>
                    <span className="text-gray-400">2 uur geleden</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Nieuw asset toegevoegd: iPhone 14</span>
                    <span className="text-gray-400">1 dag geleden</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Jabra Headset naar onderhoud</span>
                    <span className="text-gray-400">3 dagen geleden</span>
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
              {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && (
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Foto</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Merk & Model</TableHead>
                        <TableHead>Serienummer</TableHead>
                        <TableHead>Asset Tag</TableHead>
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
                              <span>{asset.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{asset.brand} {asset.model}</TableCell>
                          <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                          <TableCell>
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
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {asset.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {asset.assignedTo ? (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{asset.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Niet toegewezen</span>
                            )}
                          </TableCell>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>
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
                              {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && (
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
