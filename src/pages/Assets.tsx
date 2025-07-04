
import { useState, useEffect } from "react";
import { AssetList } from "@/components/AssetList";
import { AssetFilters } from "@/components/AssetFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAssetFilters } from "@/hooks/useAssetFilters";
import { useAssetManagement } from "@/hooks/useAssetManagement";
import { useUserRole } from "@/hooks/useUserRole";

const Assets = () => {
  const { canManageAssets, loading: roleLoading } = useUserRole();
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedLocation,
    setSelectedLocation,
    filteredAssets
  } = useAssetFilters();

  const { loading: assetsLoading } = useAssetManagement();

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
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        <AssetList 
          assets={filteredAssets} 
          loading={assetsLoading}
        />
      </div>
    </div>
  );
};

export default Assets;
