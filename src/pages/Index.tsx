
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Activity, Laptop, Monitor, Smartphone, Headphones, Printer, HardDrive, Wifi, Camera, Coffee, Utensils, Truck, Package, User, MapPin, Calendar, Tag, Trash2 } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { AssetFilters } from "@/components/AssetFilters";
import { AssetForm } from "@/components/AssetForm";
import { AssetMobileCard } from "@/components/AssetMobileCard";
import { AssetTableRow } from "@/components/AssetTableRow";
import { ReservationDialog } from "@/components/ReservationDialog";
import { UserRole } from "@/components/UserRole";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@/types/asset";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Index() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("Gebruiker");
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: assets, refetch } = useQuery({
    queryKey: [
      "assets",
      searchTerm,
      categoryFilter,
      statusFilter,
      typeFilter,
      scannedBarcode,
    ],
    queryFn: async () => {
      let query = supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      // Enhanced search across all fields
      if (searchTerm) {
        query = query.or(`type.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,asset_tag.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,assigned_to.ilike.%${searchTerm}%,assigned_to_location.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      if (scannedBarcode) {
        query = query.eq("asset_tag", scannedBarcode);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error!",
          description: "Failed to fetch assets",
          variant: "destructive",
        });
        return [];
      }

      // Transform the data to match our Asset interface
      return data?.map((item: any) => ({
        id: item.id,
        type: item.type,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serial_number,
        assetTag: item.asset_tag,
        purchaseDate: item.purchase_date,
        status: item.status,
        location: item.location,
        category: item.category,
        assignedTo: item.assigned_to,
        assignedToLocation: item.assigned_to_location,
        image: item.image_url,
        purchasePrice: item.purchase_price,
        penaltyAmount: item.penalty_amount,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
      })) || [];
    },
  });

  const handleAssetSave = async (assetData: Omit<Asset, "id">) => {
    try {
      const dbData = {
        type: assetData.type,
        brand: assetData.brand,
        model: assetData.model,
        serial_number: assetData.serialNumber,
        asset_tag: assetData.assetTag,
        purchase_date: assetData.purchaseDate,
        status: assetData.status,
        location: assetData.location,
        category: assetData.category,
        assigned_to: assetData.assignedTo,
        assigned_to_location: assetData.assignedToLocation,
        image_url: assetData.image,
        purchase_price: assetData.purchasePrice,
        penalty_amount: assetData.penaltyAmount,
      };

      let result;
      if (editingAsset) {
        result = await supabase
          .from("assets")
          .update(dbData)
          .eq("id", editingAsset.id);
      } else {
        result = await supabase
          .from("assets")
          .insert([dbData]);
      }

      if (result.error) {
        toast({
          title: "Error!",
          description: `Failed to ${editingAsset ? 'update' : 'create'} asset`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Asset ${editingAsset ? 'updated' : 'created'} successfully.`,
        });
        refetch();
        setIsFormOpen(false);
        setEditingAsset(null);
      }
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleReserve = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsReservationDialogOpen(true);
  };

  const handleDelete = async (assetId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("assets")
        .update({ status: "Deleted" })
        .eq("id", assetId);

      if (error) {
        toast({
          title: "Error!",
          description: "Failed to delete asset",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Asset marked as deleted successfully.",
        });
        refetch();
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleBarcodeScan = (result: string) => {
    setScannedBarcode(result);
    setIsBarcodeScannerOpen(false);
    toast({
      title: "Barcode Scanned!",
      description: `Asset Tag: ${result}`,
    });
  };

  const getAssetIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Laptop": <Laptop className="h-4 w-4" />,
      "Desktop": <Monitor className="h-4 w-4" />,
      "Monitor": <Monitor className="h-4 w-4" />,
      "Telefoon": <Smartphone className="h-4 w-4" />,
      "Tablet": <Smartphone className="h-4 w-4" />,
      "Headset": <Headphones className="h-4 w-4" />,
      "Printer": <Printer className="h-4 w-4" />,
      "Scanner": <Camera className="h-4 w-4" />,
      "Router": <Wifi className="h-4 w-4" />,
      "Switch": <Wifi className="h-4 w-4" />,
      "Camera": <Camera className="h-4 w-4" />,
      "Koffiezetapparaat": <Coffee className="h-4 w-4" />,
      "Magnetron": <Utensils className="h-4 w-4" />,
      "Koelkast": <Package className="h-4 w-4" />,
      "Vorkheftruck": <Truck className="h-4 w-4" />,
      "Trolley": <Truck className="h-4 w-4" />,
    };
    return iconMap[type] || <Package className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      "In voorraad": "bg-green-100 text-green-800",
      "In gebruik": "bg-blue-100 text-blue-800",
      "Defect": "bg-red-100 text-red-800",
      "Onderhoud": "bg-yellow-100 text-yellow-800",
      "Deleted": "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getCategoryDisplayName = (category: string) => {
    const displayMap: { [key: string]: string } = {
      "ICT": "ICT",
      "Facilitair": "Facilitair",
      "Catering": "Catering",
      "Logistics": "Logistiek",
    };
    return displayMap[category] || category;
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      const userId = data.session?.user.id;

      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setCurrentRole(profileData?.role || "Gebruiker");
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-600 mt-2">Manage and track your organization's assets</p>
          </div>
          <div className="flex gap-2">
            <UserRole 
              currentRole={currentRole}
              onRoleChange={setCurrentRole}
            />
            {currentRole === 'ICT Admin' && (
              <Button 
                onClick={() => window.location.href = '/activity-log'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Activity Log
              </Button>
            )}
            <Button 
              onClick={() => {
                setEditingAsset(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        <DashboardStats assets={assets || []} />

        <Card>
          <CardHeader>
            <CardTitle>Asset Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <AssetFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                typeFilter={typeFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onCategoryFilterChange={setCategoryFilter}
                onTypeFilterChange={setTypeFilter}
              />
              <Button
                variant="outline"
                onClick={() => setIsBarcodeScannerOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden sm:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Brand/Model</TableHead>
                    <TableHead className="hidden lg:table-cell">Serial Number</TableHead>
                    <TableHead className="hidden lg:table-cell">Asset Tag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                    <TableHead className="hidden xl:table-cell">Location</TableHead>
                    <TableHead className="hidden xl:table-cell">Specific Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets?.map((asset) => (
                    <AssetTableRow
                      key={asset.id}
                      asset={asset}
                      currentRole={currentRole}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReserve={handleReserve}
                      getAssetIcon={getAssetIcon}
                      getStatusColor={getStatusColor}
                      getCategoryDisplayName={getCategoryDisplayName}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="sm:hidden grid gap-4">
              {assets?.map((asset) => (
                <AssetMobileCard
                  key={asset.id}
                  asset={asset}
                  currentRole={currentRole}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReserve={handleReserve}
                  getAssetIcon={getAssetIcon}
                  getStatusColor={getStatusColor}
                  getCategoryDisplayName={getCategoryDisplayName}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          onSave={handleAssetSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingAsset(null);
          }}
        />
      )}

      {isReservationDialogOpen && selectedAsset && (
        <ReservationDialog
          asset={selectedAsset}
          onClose={() => {
            setIsReservationDialogOpen(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {isBarcodeScannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsBarcodeScannerOpen(false)}
        />
      )}
    </div>
  );
}
