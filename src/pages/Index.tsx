import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Calendar, History, Bell } from "lucide-react";
import { AssetForm } from "@/components/AssetForm";
import { AssetFilters } from "@/components/AssetFilters";
import { ReservationDialog } from "@/components/ReservationDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { UserReservations } from "@/components/UserReservations";
import { AssetTableRow } from "@/components/AssetTableRow";
import { AssetMobileCard } from "@/components/AssetMobileCard";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export interface Asset {
  id: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: "Beschikbaar" | "In gebruik" | "Onderhoud" | "Buiten gebruik";
  location: string;
  assignedTo?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  purchasePrice?: number;
  penaltyAmount?: number;
  category: string;
  imageUrl?: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    type: "Laptop",
    brand: "Dell",
    model: "Latitude 7420",
    serialNumber: "DL7420001",
    status: "Beschikbaar",
    location: "Amsterdam HQ",
    purchaseDate: "2023-01-15",
    warrantyExpiry: "2026-01-15",
    purchasePrice: 1299.99,
    penaltyAmount: 500.00,
    category: "ICT",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "2",
    type: "Smartphone",
    brand: "Apple",
    model: "iPhone 14",
    serialNumber: "IP14002",
    status: "In gebruik",
    location: "Amsterdam HQ",
    assignedTo: "jan.janssen@company.com",
    purchaseDate: "2023-03-20",
    warrantyExpiry: "2024-03-20",
    purchasePrice: 899.99,
    penaltyAmount: 400.00,
    category: "ICT"
  },
  {
    id: "3",
    type: "Headset",
    brand: "Jabra",
    model: "Evolve2 65",
    serialNumber: "JB65003",
    status: "Beschikbaar",
    location: "Rotterdam Office",
    purchaseDate: "2023-05-10",
    warrantyExpiry: "2025-05-10",
    purchasePrice: 229.99,
    penaltyAmount: 100.00,
    category: "ICT"
  },
  {
    id: "4",
    type: "Monitor",
    brand: "LG",
    model: "UltraWide 34\"",
    serialNumber: "LG34004",
    status: "In gebruik",
    location: "Amsterdam HQ",
    assignedTo: "marie.peeters@company.com",
    purchaseDate: "2023-02-28",
    warrantyExpiry: "2026-02-28",
    purchasePrice: 449.99,
    penaltyAmount: 200.00,
    category: "ICT"
  },
  {
    id: "5",
    type: "Desk",
    brand: "IKEA",
    model: "Bekant",
    serialNumber: "IK005",
    status: "Beschikbaar",
    location: "Rotterdam Office",
    purchaseDate: "2023-01-10",
    purchasePrice: 149.99,
    penaltyAmount: 75.00,
    category: "Facilitair"
  }
];

const Index = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    location: "",
    category: "",
    type: ""
  });
  const [showUserReservations, setShowUserReservations] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchTerm === "" || 
        asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status === "" || asset.status === filters.status;
      const matchesLocation = filters.location === "" || asset.location === filters.location;
      const matchesCategory = filters.category === "" || asset.category === filters.category;
      const matchesType = filters.type === "" || asset.type === filters.type;

      return matchesSearch && matchesStatus && matchesLocation && matchesCategory && matchesType;
    });
  }, [assets, searchTerm, filters]);

  const handleAddAsset = (newAsset: Omit<Asset, "id">) => {
    const asset: Asset = {
      ...newAsset,
      id: Date.now().toString(),
    };
    setAssets([...assets, asset]);
    setShowForm(false);
    toast({
      title: "Asset toegevoegd",
      description: `${asset.brand} ${asset.model} is succesvol toegevoegd.`,
    });
  };

  const handleEditAsset = (updatedAsset: Asset) => {
    setAssets(assets.map(asset => 
      asset.id === updatedAsset.id ? updatedAsset : asset
    ));
    setEditingAsset(null);
    setShowForm(false);
    toast({
      title: "Asset bijgewerkt",
      description: `${updatedAsset.brand} ${updatedAsset.model} is succesvol bijgewerkt.`,
    });
  };

  const handleDeleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(assets.filter(asset => asset.id !== id));
    toast({
      title: "Asset verwijderd",
      description: `${asset?.brand} ${asset?.model} is verwijderd.`,
      variant: "destructive",
    });
  };

  const handleReserveAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowReservationDialog(true);
  };

  if (showUserReservations) {
    return <UserReservations />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-600 mt-1">Beheer alle bedrijfsassets op één plek</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <NotificationCenter />
            <Button
              onClick={() => setShowUserReservations(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Mijn Reserveringen</span>
            </Button>
            <Link to="/activity">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Activiteit</span>
              </Button>
            </Link>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Asset Toevoegen</span>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Zoek assets op type, merk, model, serienummer, locatie of toegewezen aan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <AssetFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                assets={assets}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets ({filteredAssets.length})</CardTitle>
            <CardDescription>
              Overzicht van alle bedrijfsassets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="block lg:hidden space-y-4">
              {filteredAssets.map((asset) => (
                <AssetMobileCard
                  key={asset.id}
                  asset={asset}
                  onEdit={(asset) => {
                    setEditingAsset(asset);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteAsset}
                  onReserve={handleReserveAsset}
                />
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Locatie</TableHead>
                    <TableHead>Toegewezen aan</TableHead>
                    <TableHead>Prijs</TableHead>
                    <TableHead>Boete</TableHead>
                    <TableHead>Garantie</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <AssetTableRow
                      key={asset.id}
                      asset={asset}
                      onEdit={(asset) => {
                        setEditingAsset(asset);
                        setShowForm(true);
                      }}
                      onDelete={handleDeleteAsset}
                      onReserve={handleReserveAsset}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Geen assets gevonden die voldoen aan uw zoekcriteria.
              </div>
            )}
          </CardContent>
        </Card>

        {showForm && (
          <AssetForm
            asset={editingAsset}
            onSave={editingAsset ? handleEditAsset : handleAddAsset}
            onCancel={() => {
              setShowForm(false);
              setEditingAsset(null);
            }}
          />
        )}

        {showReservationDialog && selectedAsset && (
          <ReservationDialog
            asset={selectedAsset}
            onClose={() => {
              setShowReservationDialog(false);
              setSelectedAsset(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
