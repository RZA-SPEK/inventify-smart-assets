import { useState, useEffect } from "react";
import { AssetList } from "@/components/AssetList";
import { AssetFilters } from "@/components/AssetFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { ReservationDialog } from "@/components/ReservationDialog";

const Assets = () => {
  const { canManageAssets, currentRole, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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
    fetchAssets();
  }, [canManageAssets]);

  const fetchAssets = async () => {
    try {
      console.log('Fetching assets from database...');
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van de assets.",
          variant: "destructive",
        });
        return;
      }

      console.log('Raw assets from database:', data?.length || 0, 'items');
      console.log('Raw asset data:', data);

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
        image: dbAsset.image_url || '',
        comments: dbAsset.comments || '',
        reservable: dbAsset.reservable || false
      }));

      console.log('Transformed assets:', transformedAssets.length, 'items');
      console.log('Current role check - canManageAssets:', canManageAssets, 'currentRole:', currentRole, 'roleLoading:', roleLoading);

      // Only filter for role if we're certain about the role (not loading)
      let filteredForRole = transformedAssets;
      
      // Wait for role to be loaded before applying role-based filtering
      if (!roleLoading) {
        if (!canManageAssets) {
          console.log('Filtering assets for non-admin user');
          // For regular users, show only reservable assets or assets assigned to them
          filteredForRole = transformedAssets.filter(asset => 
            asset.reservable || asset.status === "In gebruik"
          );
          console.log('Filtered assets for non-admin:', filteredForRole.length, 'items');
        } else {
          console.log('Admin user - showing ALL assets including non-reservable ones');
          console.log('All assets details:', transformedAssets.map(a => ({ 
            id: a.id, 
            type: a.type, 
            reservable: a.reservable, 
            status: a.status 
          })));
        }
      } else {
        console.log('Role still loading, showing all assets temporarily');
      }

      console.log('Final assets to display:', filteredForRole.length, 'items');
      setAssets(filteredForRole);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Fout bij laden",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    if (!canManageAssets) {
      toast({
        title: "Geen toegang",
        description: "U heeft geen toegang om assets te bewerken.",
        variant: "destructive",
      });
      return;
    }
    console.log('Edit asset:', asset);
    navigate(`/assets/${asset.id}/edit`);
  };

  const handleDeleteAsset = async (id: string, reason: string) => {
    if (!canManageAssets) {
      toast({
        title: "Geen toegang",
        description: "U heeft geen toegang om assets te verwijderen.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Deleting asset:', id, reason);
      
      const { error } = await supabase
        .from('assets')
        .update({ status: 'Deleted' })
        .eq('id', id);

      if (error) {
        console.error('Error deleting asset:', error);
        toast({
          title: "Fout bij verwijderen",
          description: "Er is een fout opgetreden bij het verwijderen van het asset.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setAssets(assets.map(asset => 
        asset.id === id ? { ...asset, status: "Deleted" as const } : asset
      ));

      const asset = assets.find(a => a.id === id);
      toast({
        title: "Asset verwijderd",
        description: `${asset?.brand} ${asset?.model} is gemarkeerd als verwijderd. Reden: ${reason}`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  };

  const handleReserveAsset = (asset: Asset) => {
    console.log('Reserve asset:', asset);
    // Check if asset is available for reservation
    if (asset.status !== "In voorraad") {
      toast({
        title: "Niet beschikbaar",
        description: "Dit asset is momenteel niet beschikbaar voor reservering.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedAsset(asset);
    setShowReservationDialog(true);
  };

  const handleCloseReservationDialog = () => {
    setShowReservationDialog(false);
    setSelectedAsset(null);
  };

  // Show loading only if both role and assets are loading
  if ((roleLoading || loading) && assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering Assets page with:', {
    totalAssets: assets.length,
    filteredAssets: filteredAssets.length,
    canManageAssets,
    currentRole,
    roleLoading,
    searchTerm,
    statusFilter,
    categoryFilter,
    typeFilter
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto mobile-spacing py-4 sm:py-6 max-w-7xl">
        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Assets</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {canManageAssets 
                  ? "Beheer en overzicht van alle assets" 
                  : "Overzicht van beschikbare assets voor reservering"
                }
              </p>
            </div>
            
            {canManageAssets && (
              <Link to="/assets/new" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto flex items-center justify-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nieuwe Asset</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
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
        </div>

        <AssetList 
          assets={filteredAssets}
          currentRole={currentRole}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
          onReserve={handleReserveAsset}
        />

        {showReservationDialog && selectedAsset && (
          <ReservationDialog
            asset={selectedAsset}
            onClose={handleCloseReservationDialog}
          />
        )}
      </div>
    </div>
  );
};

export default Assets;
