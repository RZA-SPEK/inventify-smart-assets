
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
    }
  }, [id, canManageAssets, navigate, roleLoading]);

  const fetchAsset = async () => {
    try {
      console.log('AssetEdit: Fetching asset with ID:', id);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('AssetEdit: Error fetching asset:', error);
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
          type: data.type,
          brand: data.brand || '',
          model: data.model || '',
          serialNumber: data.serial_number || '',
          assetTag: data.asset_tag || '',
          status: data.status as Asset['status'],
          location: data.location || '',
          assignedTo: data.assigned_to || '',
          assignedToLocation: data.assigned_to_location || '',
          purchaseDate: data.purchase_date || '',
          warrantyExpiry: data.warranty_expiry || '',
          purchasePrice: data.purchase_price || 0,
          penaltyAmount: data.penalty_amount || 0,
          category: data.category as Asset['category'],
          image: data.image_url || '',
          comments: data.comments || '',
          reservable: data.reservable !== undefined ? data.reservable : true
        };

        console.log('AssetEdit: Transformed asset for form:', transformedAsset);
        setAsset(transformedAsset);
      }
    } catch (error) {
      console.error('AssetEdit: Error fetching asset:', error);
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
    try {
      console.log('AssetEdit: Updating asset with data:', updatedAsset);
      
      // Transform form data back to database format
      const dbData = {
        type: updatedAsset.type,
        brand: updatedAsset.brand || null,
        model: updatedAsset.model || null,
        serial_number: updatedAsset.serialNumber || null,
        asset_tag: updatedAsset.assetTag || null,
        status: updatedAsset.status,
        location: updatedAsset.location,
        assigned_to: updatedAsset.assignedTo || null,
        assigned_to_location: updatedAsset.assignedToLocation || null,
        purchase_date: updatedAsset.purchaseDate,
        warranty_expiry: updatedAsset.warrantyExpiry || null,
        purchase_price: updatedAsset.purchasePrice || null,
        penalty_amount: updatedAsset.penaltyAmount || 0,
        category: updatedAsset.category,
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
          description: "Er is een fout opgetreden bij het bijwerken van het asset.",
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
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
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
