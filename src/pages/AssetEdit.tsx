import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetForm } from "@/components/AssetForm";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const AssetEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canManageAssets, loading: roleLoading } = useUserRole();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AssetEdit: Component mounted, id:', id, 'canManageAssets:', canManageAssets, 'roleLoading:', roleLoading);
    
    // Wait for role to be loaded before making permission decisions
    if (roleLoading) {
      console.log('AssetEdit: Still loading user role, waiting...');
      return;
    }
    
    if (!canManageAssets) {
      console.log('AssetEdit: User cannot manage assets, redirecting to assets list');
      navigate("/assets");
      return;
    }

    if (id) {
      fetchAsset();
    } else {
      setError("No asset ID provided");
      setLoading(false);
    }
  }, [id, canManageAssets, navigate, roleLoading]);

  const fetchAsset = async () => {
    if (!id) {
      setError("No asset ID provided");
      setLoading(false);
      return;
    }
    
    try {
      console.log('AssetEdit: Fetching asset with ID:', id);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('AssetEdit: Error fetching asset:', error);
        setError("Failed to load asset");
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van het asset.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log('AssetEdit: Raw asset data from database:', data);
        
        // Transform database response to match Asset interface
        const transformedAsset: Asset = {
          id: data.id,
          type: data.type || '',
          brand: data.brand || '',
          model: data.model || '',
          serialNumber: data.serial_number || '',
          assetTag: data.asset_tag || '',
          status: data.status as Asset['status'] || 'In voorraad',
          location: data.location || '',
          assignedTo: data.assigned_to || '',
          assignedToLocation: data.assigned_to_location || '',
          purchaseDate: data.purchase_date || '',
          warrantyExpiry: data.warranty_expiry || '',
          purchasePrice: data.purchase_price || 0,
          penaltyAmount: data.penalty_amount || 0,
          category: data.category as Asset['category'] || 'ICT',
          image: data.image_url || '',
          comments: data.comments || '',
          reservable: data.reservable !== undefined ? data.reservable : true
        };

        console.log('AssetEdit: Transformed asset for form:', transformedAsset);
        setAsset(transformedAsset);
      } else {
        setError("Asset not found");
      }
    } catch (error) {
      console.error('AssetEdit: Error fetching asset:', error);
      setError("An unexpected error occurred");
      toast({
        title: "Fout bij laden",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedAsset: Omit<Asset, "id">) => {
    if (!id) {
      toast({
        title: "Fout",
        description: "Geen asset ID beschikbaar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('AssetEdit: Updating asset with data:', updatedAsset);
      
      // Validate required fields
      if (!updatedAsset.type || updatedAsset.type.trim() === '') {
        toast({
          title: "Validatiefout",
          description: "Asset type is verplicht.",
          variant: "destructive",
        });
        return;
      }
      
      // Transform form data back to database format with proper null handling
      const dbData = {
        type: updatedAsset.type,
        brand: updatedAsset.brand || null,
        model: updatedAsset.model || null,
        serial_number: updatedAsset.serialNumber || null,
        asset_tag: updatedAsset.assetTag || null,
        status: updatedAsset.status || 'In voorraad',
        location: updatedAsset.location || null,
        assigned_to: updatedAsset.assignedTo || null,
        assigned_to_location: updatedAsset.assignedToLocation || null,
        purchase_date: updatedAsset.purchaseDate || null,
        warranty_expiry: updatedAsset.warrantyExpiry || null,
        purchase_price: updatedAsset.purchasePrice || null,
        penalty_amount: updatedAsset.penaltyAmount || 0,
        category: updatedAsset.category || 'ICT',
        image_url: updatedAsset.image || null,
        comments: updatedAsset.comments || null,
        reservable: updatedAsset.reservable !== undefined ? updatedAsset.reservable : true
      };

      console.log('AssetEdit: Database update payload:', dbData);

      const { error } = await supabase
        .from('assets')
        .update(dbData)
        .eq('id', id);

      if (error) {
        console.error('AssetEdit: Error updating asset:', error);
        toast({
          title: "Fout bij bijwerken",
          description: `Er is een fout opgetreden bij het bijwerken: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('AssetEdit: Asset updated successfully');
      toast({
        title: "Asset bijgewerkt",
        description: `${updatedAsset.brand} ${updatedAsset.model} is succesvol bijgewerkt.`,
      });
      
      navigate(`/assets/${id}`);
    } catch (error) {
      console.error('AssetEdit: Error updating asset:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    console.log('AssetEdit: Cancel clicked, navigating back to asset details');
    navigate(`/assets/${id}`);
  };

  // Show loading while role is being determined
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

  if (!canManageAssets) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">U heeft geen toegang tot deze pagina.</p>
          <Button onClick={() => navigate("/assets")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Assets
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Asset laden...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === "Asset not found" ? "Asset niet gevonden" : "Fout bij laden"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Het opgegeven asset kon niet worden gevonden."}
          </p>
          <Button onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Assets
          </Button>
        </div>
      </div>
    );
  }

  console.log('AssetEdit: Rendering form with asset:', asset);

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
          <p className="text-gray-600 mt-1">
            {asset.brand} {asset.model} - {asset.assetTag || 'Geen asset tag'}
          </p>
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
