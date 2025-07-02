import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Activity } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { AssetFilters } from "@/components/AssetFilters";
import { AssetForm } from "@/components/AssetForm";
import { AssetMobileCard } from "@/components/AssetMobileCard";
import { AssetTableRow } from "@/components/AssetTableRow";
import { ReservationDialog } from "@/components/ReservationDialog";
import { UserRole } from "@/components/UserRole";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useToast } from "@/hooks/use-toast";
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
import { Label } from "@/components/ui/label";

export default function Index() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: assets, refetch } = useQuery({
    queryKey: [
      "assets",
      searchTerm,
      categoryFilter,
      locationFilter,
      statusFilter,
    ],
    queryFn: async () => {
      let query = supabase
        .from("assets")
        .select("*")
        .ilike("type", `%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (locationFilter !== "all") {
        query = query.eq("location", locationFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
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
      }
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("category")
        .distinct();
      if (error) {
        toast({
          title: "Error!",
          description: "Failed to fetch categories",
          variant: "destructive",
        });
      }
      return data?.map((item) => item.category);
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("location")
        .distinct();
      if (error) {
        toast({
          title: "Error!",
          description: "Failed to fetch locations",
          variant: "destructive",
        });
      }
      return data?.map((item) => item.location);
    },
  });

  const { data: statuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("status")
        .distinct();
      if (error) {
        toast({
          title: "Error!",
          description: "Failed to fetch statuses",
          variant: "destructive",
        });
      }
      return data?.map((item) => item.status);
    },
  });

  const handleAssetCreated = () => {
    refetch();
  };

  const handleAssetUpdated = () => {
    refetch();
  };

  const openReservationDialog = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsReservationDialogOpen(true);
  };

  const closeReservationDialog = () => {
    setSelectedAssetId(null);
    setIsReservationDialogOpen(false);
  };

  const confirmDeleteAsset = (assetId: string) => {
    setAssetToDelete(assetId);
    setIsDeleteDialogOpen(true);
  };

  const cancelDeleteAsset = () => {
    setAssetToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const deleteAsset = async () => {
    if (assetToDelete) {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", assetToDelete);

      if (error) {
        toast({
          title: "Error!",
          description: "Failed to delete asset",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Asset deleted successfully.",
        });
        refetch();
      }

      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
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

        setUserRole(profileData?.role || "Gebruiker");
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
            <UserRole />
            {userRole === 'ICT Admin' && (
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
              onClick={() => setIsFormOpen(true)}
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
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-2"
              />
              <AssetFilters
                categories={categories || []}
                locations={locations || []}
                statuses={statuses || []}
                categoryFilter={categoryFilter}
                locationFilter={locationFilter}
                statusFilter={statusFilter}
                setCategoryFilter={setCategoryFilter}
                setLocationFilter={setLocationFilter}
                setStatusFilter={setStatusFilter}
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
                    <TableHead>Type</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets?.map((asset) => (
                    <AssetTableRow
                      key={asset.id}
                      asset={asset}
                      openReservationDialog={openReservationDialog}
                      confirmDeleteAsset={confirmDeleteAsset}
                      refetch={refetch}
                      handleAssetUpdated={handleAssetUpdated}
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
                  openReservationDialog={openReservationDialog}
                  confirmDeleteAsset={confirmDeleteAsset}
                  refetch={refetch}
                  handleAssetUpdated={handleAssetUpdated}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Make sure to fill in all the required fields.
            </DialogDescription>
          </DialogHeader>
          <AssetForm
            onAssetCreated={handleAssetCreated}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ReservationDialog
        isOpen={isReservationDialogOpen}
        onClose={closeReservationDialog}
        assetId={selectedAssetId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              asset from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteAsset}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteAsset}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isBarcodeScannerOpen} onOpenChange={setIsBarcodeScannerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Point your camera at the barcode to scan.
            </DialogDescription>
          </DialogHeader>
          <BarcodeScanner onScan={handleBarcodeScan} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
