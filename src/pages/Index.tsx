
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AssetForm } from "@/components/AssetForm";
import { AssetFilters } from "@/components/AssetFilters";
import { ReservationDialog } from "@/components/ReservationDialog";
import { UserReservations } from "@/components/UserReservations";
import { AssetHeader } from "@/components/AssetHeader";
import { AssetList } from "@/components/AssetList";
import { mockAssets } from "@/data/mockAssets";
import { Asset } from "@/types/asset";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useAssetManagement } from "@/hooks/useAssetManagement";

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [showUserReservations, setShowUserReservations] = useState(false);

  // Mock current user role - in a real app, this would come from authentication
  const currentRole = "ICT Admin";

  const {
    assets,
    showForm,
    setShowForm,
    editingAsset,
    handleAddAsset,
    handleEditAsset,
    handleDeleteAsset,
    handleEditClick,
    handleFormCancel
  } = useAssetManagement(mockAssets);

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    assetTypes,
    clearFilters,
    filteredAssets
  } = useAssetFilters(assets);

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
        <AssetHeader
          onAddAsset={() => setShowForm(true)}
          onShowUserReservations={() => setShowUserReservations(true)}
        />

        <Card className="mb-6">
          <CardContent className="pt-6">
            <AssetFilters 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              typeFilter={typeFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onTypeFilterChange={setTypeFilter}
              onClearFilters={clearFilters}
              assetTypes={assetTypes}
            />
          </CardContent>
        </Card>

        <AssetList
          assets={filteredAssets}
          currentRole={currentRole}
          onEdit={handleEditClick}
          onDelete={handleDeleteAsset}
          onReserve={handleReserveAsset}
        />

        {showForm && (
          <AssetForm
            asset={editingAsset}
            onSave={editingAsset ? handleEditAsset : handleAddAsset}
            onCancel={handleFormCancel}
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
