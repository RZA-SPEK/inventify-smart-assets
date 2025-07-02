import { useState } from "react";
import { AssetForm } from "@/components/AssetForm";
import { ReservationDialog } from "@/components/ReservationDialog";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { DashboardStats } from "@/components/DashboardStats";
import { PageHeader } from "@/components/PageHeader";
import { FiltersSection } from "@/components/FiltersSection";
import { AssetListSection } from "@/components/AssetListSection";
import { useToast } from "@/hooks/use-toast";
import { useAssetManagement } from "@/hooks/useAssetManagement";
import { useUserRole } from "@/hooks/useUserRole";
import { Asset } from "@/types/asset";

export default function Index() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { currentRole, actualRole, setCurrentRole } = useUserRole();
  const { assets, refetch, handleAssetSave, handleDelete } = useAssetManagement(
    searchTerm,
    categoryFilter,
    statusFilter,
    typeFilter,
    scannedBarcode,
    currentRole // Pass the current role to the hook
  );

  console.log("Index component - assets:", assets);
  console.log("Index component - currentRole:", currentRole);
  console.log("Index component - actualRole:", actualRole);

  const handleAssetSaveWrapper = async (assetData: Omit<Asset, "id">) => {
    await handleAssetSave(assetData, editingAsset);
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleEdit = (asset: Asset) => {
    console.log("Editing asset:", asset);
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleReserve = (asset: Asset) => {
    console.log("Reserving asset:", asset);
    setSelectedAsset(asset);
    setIsReservationDialogOpen(true);
  };

  const handleBarcodeScan = (result: string) => {
    console.log("Barcode scanned:", result);
    setScannedBarcode(result);
    setIsBarcodeScannerOpen(false);
    toast({
      title: "Barcode Scanned!",
      description: `Asset Tag: ${result}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 space-y-6">
        <PageHeader
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onAddAsset={() => {
            console.log("Add asset clicked");
            setEditingAsset(null);
            setIsFormOpen(true);
          }}
        />

        <DashboardStats assets={assets || []} />

        <FiltersSection
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          typeFilter={typeFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onTypeFilterChange={setTypeFilter}
          onShowBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        />

        <AssetListSection
          assets={assets}
          currentRole={currentRole}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReserve={handleReserve}
        />
      </div>

      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          onSave={handleAssetSaveWrapper}
          onCancel={() => {
            console.log("Asset form canceled");
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
