import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Laptop, Smartphone, Headphones, Cable, Monitor, User, Settings, BarChart3 } from "lucide-react";
import { AssetForm } from "@/components/AssetForm";
import { AssetFilters } from "@/components/AssetFilters";
import { AssetTableRow } from "@/components/AssetTableRow";
import { AssetMobileCard } from "@/components/AssetMobileCard";
import { UserRole } from "@/components/UserRole";
import { DashboardStats } from "@/components/DashboardStats";
import { ReservationDialog } from "@/components/ReservationDialog";
import { SettingsForm } from "@/components/SettingsForm";
import { SystemConfiguration } from "@/components/SystemConfiguration";
import { NotificationCenter } from "@/components/NotificationCenter";
import Reservations from "./Reservations";

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
    
    if (currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") {
      return matchesSearch && matchesStatus && matchesCategory && asset.category === "Facilitair";
    }
    
    if (currentRole === "Gebruiker") {
      return matchesSearch && matchesStatus && matchesCategory && asset.assignedTo === "Jan Janssen";
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

  const handleDeleteAsset = (assetId: string, reason: string) => {
    console.log(`Deleting asset ${assetId} with reason: ${reason}`);
    setAssets(assets.map(asset => 
      asset.id === assetId ? { ...asset, status: "Deleted" as const } : asset
    ));
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Settings saved:', settings);
    // Here you would typically save to your backend/database
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
            <div className="flex items-center space-x-4">
              {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && (
                <NotificationCenter />
              )}
              <UserRole currentRole={currentRole} onRoleChange={setCurrentRole} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:w-[500px]">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="assets" className="text-xs sm:text-sm">Assets</TabsTrigger>
            <TabsTrigger value="reservations" disabled={currentRole === "Gebruiker"} className="text-xs sm:text-sm">
              Reserveringen
            </TabsTrigger>
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
              <AssetFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onCategoryFilterChange={setCategoryFilter}
              />
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
                    <AssetMobileCard
                      key={asset.id}
                      asset={asset}
                      currentRole={currentRole}
                      onEdit={startEditAsset}
                      onDelete={handleDeleteAsset}
                      onReserve={setReservationAsset}
                      getAssetIcon={getAssetIcon}
                      getStatusColor={getStatusColor}
                      getCategoryDisplayName={getCategoryDisplayName}
                    />
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
                        <AssetTableRow
                          key={asset.id}
                          asset={asset}
                          currentRole={currentRole}
                          onEdit={startEditAsset}
                          onDelete={handleDeleteAsset}
                          onReserve={setReservationAsset}
                          getAssetIcon={getAssetIcon}
                          getStatusColor={getStatusColor}
                          getCategoryDisplayName={getCategoryDisplayName}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <Reservations />
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
            <Tabs defaultValue="fields" className="space-y-4">
              <TabsList>
                <TabsTrigger value="fields">Veld Opties</TabsTrigger>
                <TabsTrigger value="system">Systeem Config</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fields">
                <SettingsForm onSave={handleSaveSettings} />
              </TabsContent>
              
              <TabsContent value="system">
                <SystemConfiguration />
              </TabsContent>
            </Tabs>
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
