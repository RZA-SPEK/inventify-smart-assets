
import { useState } from "react";
import { Asset } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";

export const useAssetManagement = (initialAssets: Asset[]) => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleAddAsset = (newAsset: Omit<Asset, "id">) => {
    const asset: Asset = {
      ...newAsset,
      id: Date.now().toString(),
    };
    setAssets([...assets, asset]);
    setShowForm(false);
    toast({
      title: "Asset toegevoegd",
      description: `${asset.brand} ${asset.model} is succesvol toegevoegd.`,
    });
  };

  const handleEditAsset = (updatedAsset: Asset) => {
    setAssets(assets.map(asset => 
      asset.id === updatedAsset.id ? updatedAsset : asset
    ));
    setEditingAsset(null);
    setShowForm(false);
    toast({
      title: "Asset bijgewerkt",
      description: `${updatedAsset.brand} ${updatedAsset.model} is succesvol bijgewerkt.`,
    });
  };

  const handleDeleteAsset = (id: string, reason: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(assets.map(a => 
      a.id === id ? { ...a, status: "Deleted" as const } : a
    ));
    toast({
      title: "Asset verwijderd",
      description: `${asset?.brand} ${asset?.model} is gemarkeerd als verwijderd. Reden: ${reason}`,
      variant: "destructive",
    });
  };

  const handleEditClick = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  return {
    assets,
    showForm,
    setShowForm,
    editingAsset,
    handleAddAsset,
    handleEditAsset,
    handleDeleteAsset,
    handleEditClick,
    handleFormCancel
  };
};
