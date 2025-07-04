
import { useState, useEffect } from "react";
import { AssetList } from "@/components/AssetList";
import { AssetFilters } from "@/components/AssetFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";

const Assets = () => {
  const { canManageAssets, loading: roleLoading } = useUserRole();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Only fetch if role is loaded and user has permission
    if (!roleLoading && canManageAssets) {
      fetchAssets();
    } else if (!roleLoading) {
      setLoading(false);
    }
  }, [canManageAssets, roleLoading]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        return;
      }

      // Transform database response to match Asset interface
      const transformedAssets: Asset[] = (data || []).map(dbAsset => ({
        id: dbAsset.id,
        type: dbAsset.type,
        brand: dbAsset.brand || '',
        model: dbAsset.model || '',
        serialNumber: dbAsset.serial_number || '',
        assetTag: dbAsset.asset_tag || '',
        status: dbAsset.status as Asset['status'],
        location: dbAsset.location,
        assignedTo: dbAsset.assigned_to || '',
        assignedToLocation: dbAsset.assigned_to_location || '',
        purchaseDate: dbAsset.purchase_date,
        warrantyExpiry: dbAsset.warranty_expiry || '',
        purchasePrice: dbAsset.purchase_price || 0,
        penaltyAmount: dbAsset.penalty_amount || 0,
        category: dbAsset.category as Asset['category'],
        image: dbAsset.image_url || ''
      }));

      setAssets(transformedAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    console.log('Edit asset:', asset);
  };

  const handleDeleteAsset = (id: string, reason: string) => {
    console.log('Delete asset:', id, reason);
  };

  const handleReserveAsset = (asset: Asset) => {
    console.log('Reserve asset:', asset);
  };

  // Don't render content until role is loaded
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Redirect if user doesn't have permission
  if (!canManageAssets) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">U heeft geen toegang tot deze pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assets</h1>
            <p className="text-gray-600 mt-1">Beheer en overzicht van alle assets</p>
          </div>
          
          {canManageAssets && (
            <Link to="/assets/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nieuwe Asset</span>
              </Button>
            </Link>
          )}
        </div>

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

        <AssetList 
          assets={filteredAssets}
          currentRole={canManageAssets ? 'ICT Admin' : 'Gebruiker'}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
          onReserve={handleReserveAsset}
        />
      </div>
    </div>
  );
};

export default Assets;
