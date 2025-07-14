import { useAssetManagement } from "@/hooks/useAssetManagement";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { AssetHeader } from "@/components/AssetHeader";
import { AssetFilters } from "@/components/AssetFilters";
import { AssetList } from "@/components/AssetList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Assets = () => {
  const navigate = useNavigate();
  const { canManageAssets, currentRole, loading: roleLoading } = useUserRole();
  const { 
    assets, 
    loading, 
    error, 
    refetch,
    deleteAsset 
  } = useAssetManagement();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    filteredAssets
  } = useAssetFilters(assets);

  const handleCreateAsset = () => {
    navigate('/assets/create');
  };

  const handleViewAsset = (id: string) => {
    navigate(`/assets/${id}`);
  };

  const handleEditAsset = (id: string) => {
    navigate(`/assets/${id}/edit`);
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteAsset(id);
      refetch();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="responsive-container responsive-section">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center responsive-gap-lg mb-8">
            <div className="space-y-3">
              <div className="h-10 w-64 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-5 w-48 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-muted rounded-lg animate-pulse"></div>
            </div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="card-elevated mb-6">
            <div className="responsive-padding">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 responsive-gap">
                <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Assets List Skeleton */}
          <div className="card-elevated">
            <div className="responsive-padding border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4 responsive-padding">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                  <div className="h-6 w-20 bg-muted rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-elevated max-w-md w-full text-center responsive-padding">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Er is een fout opgetreden</h2>
          <p className="text-muted-foreground mb-6">
            De assets konden niet worden geladen. Controleer uw internetverbinding en probeer het opnieuw.
          </p>
          <Button 
            onClick={() => refetch()}
            className="gradient-primary shadow-md hover:shadow-lg transition-all"
          >
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="responsive-container responsive-section">
        <AssetHeader 
          canManageAssets={canManageAssets}
          onCreateAsset={handleCreateAsset}
          totalAssets={assets.length}
          filteredAssets={filteredAssets.length}
        />
        
        <div className="responsive-spacing">
          <AssetFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            assets={assets}
          />
          
          <AssetList
            assets={filteredAssets}
            canManageAssets={canManageAssets}
            onViewAsset={handleViewAsset}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        </div>
      </div>
    </div>
  );
};

export default Assets;
