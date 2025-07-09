import { useAssetManagement } from "@/hooks/useAssetManagement";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { AssetHeader } from "@/components/AssetHeader";
import { AssetFilters } from "@/components/AssetFilters";
import { AssetList } from "@/components/AssetList";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Er is een fout opgetreden bij het laden van de assets.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto mobile-spacing py-4 sm:py-6 max-w-7xl">
        <AssetHeader 
          canManageAssets={canManageAssets}
          onCreateAsset={handleCreateAsset}
          totalAssets={assets.length}
          filteredAssets={filteredAssets.length}
        />
        
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
  );
};

export default Assets;
