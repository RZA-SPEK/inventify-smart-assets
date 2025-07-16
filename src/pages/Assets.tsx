import { useAssetManagement } from "@/hooks/useAssetManagement";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { AssetHeader } from "@/components/AssetHeader";
import { AssetFilters } from "@/components/AssetFilters";
import { AssetList } from "@/components/AssetList";
import { AssetQuickActions } from "@/components/AssetQuickActions";
import { AssetStatsCards } from "@/components/AssetStatsCards";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

type SortField = 'asset_tag' | 'type' | 'brand' | 'model' | 'status' | 'location' | 'assigned_to';
type SortOrder = 'asc' | 'desc';

const Assets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('asset_tag');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
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

  const sortedAssets = useMemo(() => {
    const sorted = [...filteredAssets].sort((a, b) => {
      let aValue = a[sortField as keyof typeof a] || '';
      let bValue = b[sortField as keyof typeof b] || '';
      
      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    return sorted;
  }, [filteredAssets, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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
      toast({
        title: "Asset verwijderd",
        description: "Het asset is succesvol verwijderd.",
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van het asset.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAsset = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) 
        ? prev.filter(assetId => assetId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedAssets(selected ? sortedAssets.map(asset => asset.id) : []);
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteAsset(id);
      }
      refetch();
      setSelectedAssets([]);
      toast({
        title: "Assets verwijderd",
        description: `${ids.length} assets zijn succesvol verwijderd.`,
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van assets.",
        variant: "destructive",
      });
    }
  };

  const handleBulkArchive = async (ids: string[]) => {
    // Implementation for bulk archive
    toast({
      title: "Assets gearchiveerd",
      description: `${ids.length} assets zijn gearchiveerd.`,
    });
    setSelectedAssets([]);
  };

  const handleExportSelected = (ids: string[]) => {
    const selectedData = sortedAssets.filter(asset => ids.includes(asset.id));
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Type,Brand,Model,Serial Number,Asset Tag,Status,Location\n" +
      selectedData.map(asset => 
        `${asset.type},${asset.brand || ''},${asset.model || ''},${asset.serialNumber || ''},${asset.assetTag || ''},${asset.status || ''},${asset.location || ''}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_assets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          filteredAssets={sortedAssets.length}
        />
        
        <AssetStatsCards assets={assets} />
        
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
          
          <div className="card-elevated">
            <AssetQuickActions
              selectedAssets={selectedAssets}
              onSelectAsset={handleSelectAsset}
              onSelectAll={handleSelectAll}
              allSelected={selectedAssets.length === sortedAssets.length && sortedAssets.length > 0}
              assets={sortedAssets}
              canManageAssets={canManageAssets}
              onBulkDelete={handleBulkDelete}
              onBulkArchive={handleBulkArchive}
              onExportSelected={handleExportSelected}
            />
            
            <AssetList
              assets={sortedAssets}
              canManageAssets={canManageAssets}
              onViewAsset={handleViewAsset}
              onEditAsset={handleEditAsset}
              onDeleteAsset={handleDeleteAsset}
              selectedAssets={selectedAssets}
              onSelectAsset={handleSelectAsset}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
