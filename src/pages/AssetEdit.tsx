
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Asset } from "@/types/asset";
import { mockAssets } from "@/data/mockAssets";
import { AssetForm } from "@/components/AssetForm";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const AssetEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canManageAssets } = useUserRole();
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (!canManageAssets) {
      navigate("/assets");
      return;
    }

    if (id) {
      const foundAsset = mockAssets.find(a => a.id === id);
      setAsset(foundAsset || null);
    }
  }, [id, canManageAssets, navigate]);

  const handleSave = (updatedAsset: Omit<Asset, "id">) => {
    // In a real app, this would update the asset in the database
    console.log("Updating asset:", { ...updatedAsset, id });
    
    toast({
      title: "Asset bijgewerkt",
      description: `${updatedAsset.brand} ${updatedAsset.model} is succesvol bijgewerkt.`,
    });
    
    navigate(`/assets/${id}`);
  };

  const handleCancel = () => {
    navigate(`/assets/${id}`);
  };

  if (!canManageAssets) {
    return null;
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Asset niet gevonden</h2>
          <p className="text-gray-600 mb-4">Het opgegeven asset kon niet worden gevonden.</p>
          <Button onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Assets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/assets/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Asset Details
          </Button>
          <h1 className="text-2xl font-bold">Asset Bewerken</h1>
        </div>

        <AssetForm
          asset={asset}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AssetEdit;
