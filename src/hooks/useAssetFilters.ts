
import { useState, useMemo } from "react";
import { Asset } from "@/types/asset";

export const useAssetFilters = (assets: Asset[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const assetTypes = useMemo(() => {
    return Array.from(new Set(assets.map(asset => asset.type))).sort();
  }, [assets]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
  };

  const filteredAssets = useMemo(() => {
    console.log('useAssetFilters: Filtering assets', {
      totalAssets: assets.length,
      searchTerm,
      statusFilter,
      categoryFilter,
      typeFilter
    });

    const filtered = assets.filter(asset => {
      const matchesSearch = searchTerm === "" || 
        asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.assetTag && asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      const matchesType = typeFilter === "all" || asset.type === typeFilter;

      const matches = matchesSearch && matchesStatus && matchesCategory && matchesType;
      
      if (!matches) {
        console.log('Asset filtered out:', asset.id, {
          matchesSearch,
          matchesStatus,
          matchesCategory,
          matchesType,
          assetType: asset.type,
          assetStatus: asset.status,
          assetCategory: asset.category
        });
      }

      return matches;
    });

    console.log('useAssetFilters: Filtered result:', filtered.length, 'assets');
    return filtered;
  }, [assets, searchTerm, statusFilter, categoryFilter, typeFilter]);

  return {
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
  };
};
