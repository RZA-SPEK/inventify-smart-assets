import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import { AssetForm } from "@/components/AssetForm";
import { AssetTable } from "@/components/AssetTable";
import { AssetFilters } from "@/components/AssetFilters";
import { UserRole } from "@/components/UserRole";
import { DashboardStats } from "@/components/DashboardStats";
import { ReservationDialog } from "@/components/ReservationDialog";
import { User, Settings } from "lucide-react";

export interface Asset {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber: string;
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
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Medewerker" | "Gebruiker">("ICT Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [reservationAsset, setReservationAsset] = useState<Asset | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    
    if (currentRole === "Facilitair Medewerker") {
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
            <AssetFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              currentRole={currentRole}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onAddAsset={() => setShowAssetForm(true)}
            />

            <Card>
              <CardHeader>
                <CardTitle>Asset Overzicht</CardTitle>
                <CardDescription>
                  {filteredAssets.length} van {assets.length} assets weergegeven
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetTable
                  assets={filteredAssets}
                  currentRole={currentRole}
                  onEditAsset={startEditAsset}
                  onReserveAsset={setReservationAsset}
                />
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
