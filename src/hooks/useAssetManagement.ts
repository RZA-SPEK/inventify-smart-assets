
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@/types/asset";

export const useAssetManagement = (
  searchTerm: string,
  categoryFilter: string,
  statusFilter: string,
  typeFilter: string,
  scannedBarcode: string | null
) => {
  const { toast } = useToast();

  const { data: assets, refetch } = useQuery({
    queryKey: [
      "assets",
      searchTerm,
      categoryFilter,
      statusFilter,
      typeFilter,
      scannedBarcode,
    ],
    queryFn: async () => {
      let query = supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      // Enhanced search across all fields
      if (searchTerm) {
        query = query.or(`type.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,asset_tag.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,assigned_to.ilike.%${searchTerm}%,assigned_to_location.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      if (scannedBarcode) {
        query = query.eq("asset_tag", scannedBarcode);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error!",
          description: "Failed to fetch assets",
          variant: "destructive",
        });
        return [];
      }

      // Transform the data to match our Asset interface
      return data?.map((item: any) => ({
        id: item.id,
        type: item.type,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serial_number,
        assetTag: item.asset_tag,
        purchaseDate: item.purchase_date,
        status: item.status,
        location: item.location,
        category: item.category,
        assignedTo: item.assigned_to,
        assignedToLocation: item.assigned_to_location,
        image: item.image_url,
        purchasePrice: item.purchase_price,
        penaltyAmount: item.penalty_amount,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
      })) || [];
    },
  });

  const handleAssetSave = async (assetData: Omit<Asset, "id">, editingAsset: Asset | null) => {
    try {
      const dbData = {
        type: assetData.type,
        brand: assetData.brand,
        model: assetData.model,
        serial_number: assetData.serialNumber,
        asset_tag: assetData.assetTag,
        purchase_date: assetData.purchaseDate,
        status: assetData.status,
        location: assetData.location,
        category: assetData.category,
        assigned_to: assetData.assignedTo,
        assigned_to_location: assetData.assignedToLocation,
        image_url: assetData.image,
        purchase_price: assetData.purchasePrice,
        penalty_amount: assetData.penaltyAmount,
      };

      let result;
      if (editingAsset) {
        result = await supabase
          .from("assets")
          .update(dbData)
          .eq("id", editingAsset.id);
      } else {
        result = await supabase
          .from("assets")
          .insert([dbData]);
      }

      if (result.error) {
        toast({
          title: "Error!",
          description: `Failed to ${editingAsset ? 'update' : 'create'} asset`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Asset ${editingAsset ? 'updated' : 'created'} successfully.`,
        });
        refetch();
      }
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (assetId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("assets")
        .update({ status: "Deleted" })
        .eq("id", assetId);

      if (error) {
        toast({
          title: "Error!",
          description: "Failed to delete asset",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Asset marked as deleted successfully.",
        });
        refetch();
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    assets,
    refetch,
    handleAssetSave,
    handleDelete,
  };
};
