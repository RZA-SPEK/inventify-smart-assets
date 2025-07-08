
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetForm } from "@/components/AssetForm";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const AssetNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canManageAssets, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (!roleLoading && !canManageAssets) {
      navigate("/assets");
      toast({
        title: "Geen toegang",
        description: "U heeft geen toegang om nieuwe assets toe te voegen.",
        variant: "destructive",
      });
      return;
    }
  }, [canManageAssets, roleLoading, navigate, toast]);

  const handleSave = async (assetData: Omit<Asset, "id">) => {
    try {
      console.log('Creating new asset:', assetData);
      
      const { data, error } = await supabase
        .from('assets')
        .insert({
          type: assetData.type,
          brand: assetData.brand || null,
          model: assetData.model || null,
          serial_number: assetData.serialNumber || null,
          asset_tag: assetData.assetTag || null,
          status: assetData.status,
          location: assetData.location,
          assigned_to: assetData.assignedTo || null,
          assigned_to_location: assetData.assignedToLocation || null,
          purchase_date: assetData.purchaseDate,
          warranty_expiry: assetData.warrantyExpiry || null,
          purchase_price: assetData.purchasePrice || null,
          penalty_amount: assetData.penaltyAmount || 0,
          category: assetData.category,
          image_url: assetData.image || null,
          comments: assetData.comments || null,
          reservable: assetData.reservable !== undefined ? assetData.reservable : true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating asset:', error);
        toast({
          title: "Fout bij toevoegen",
          description: "Er is een fout opgetreden bij het toevoegen van het asset.",
          variant: "destructive",
        });
        return;
      }

      console.log('Asset created successfully:', data);
      toast({
        title: "Asset toegevoegd",
        description: `${assetData.brand} ${assetData.model} is succesvol toegevoegd.`,
      });
      
      navigate("/assets");
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/assets");
  };

  // Don't render if user doesn't have permission or role is still loading
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
    return null; // Component will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/assets")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Assets
          </Button>
          <h1 className="text-2xl font-bold">Nieuw Asset Toevoegen</h1>
        </div>

        <AssetForm
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AssetNew;
