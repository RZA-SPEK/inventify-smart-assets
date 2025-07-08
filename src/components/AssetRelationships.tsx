
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Asset } from "@/types/asset";

interface AssetRelationship {
  id: string;
  parent_asset_id: string;
  child_asset_id: string;
  relationship_type: string;
  description?: string;
  created_at: string;
  child_asset?: Asset;
  parent_asset?: Asset;
}

interface AssetRelationshipsProps {
  assetId: string;
  canEdit?: boolean;
}

const relationshipTypes = [
  { value: "component", label: "Onderdeel", description: "Dit asset is een onderdeel van het andere" },
  { value: "accessory", label: "Accessoire", description: "Dit asset is een accessoire van het andere" },
  { value: "set", label: "Set", description: "Deze assets vormen samen een set" },
  { value: "related", label: "Gerelateerd", description: "Deze assets zijn aan elkaar gerelateerd" }
];

export const AssetRelationships = ({ assetId, canEdit = false }: AssetRelationshipsProps) => {
  const [relationships, setRelationships] = useState<AssetRelationship[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [relationshipType, setRelationshipType] = useState("related");
  const [relationshipDescription, setRelationshipDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchRelationships(), fetchAvailableAssets()]);
  }, [assetId]);

  const fetchRelationships = async () => {
    try {
      // Fetch relationships where current asset is parent
      const { data: parentData, error: parentError } = await supabase
        .from('asset_relationships')
        .select(`
          *,
          child_asset:assets!asset_relationships_child_asset_id_fkey(*)
        `)
        .eq('parent_asset_id', assetId);

      // Fetch relationships where current asset is child
      const { data: childData, error: childError } = await supabase
        .from('asset_relationships')
        .select(`
          *,
          parent_asset:assets!asset_relationships_parent_asset_id_fkey(*)
        `)
        .eq('child_asset_id', assetId);

      if (parentError || childError) {
        console.error('Error fetching relationships:', parentError || childError);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van de koppelingen.",
          variant: "destructive",
        });
        return;
      }

      const allRelationships = [
        ...(parentData || []).map(rel => ({ ...rel, direction: 'parent' as const })),
        ...(childData || []).map(rel => ({ ...rel, direction: 'child' as const }))
      ];

      setRelationships(allRelationships);
    } catch (error) {
      console.error('Error fetching relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .neq('id', assetId)
        .neq('status', 'Deleted');

      if (error) {
        console.error('Error fetching available assets:', error);
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
        location: dbAsset.location || '',
        assignedTo: dbAsset.assigned_to || '',
        assignedToLocation: dbAsset.assigned_to_location || '',
        purchaseDate: dbAsset.purchase_date || '',
        warrantyExpiry: dbAsset.warranty_expiry || '',
        purchasePrice: dbAsset.purchase_price || 0,
        penaltyAmount: dbAsset.penalty_amount || 0,
        category: dbAsset.category as Asset['category'],
        image: dbAsset.image_url || '',
        comments: dbAsset.comments || '',
        reservable: dbAsset.reservable || false
      }));

      setAvailableAssets(transformedAssets);
    } catch (error) {
      console.error('Error fetching available assets:', error);
    }
  };

  const handleAddRelationship = async () => {
    if (!selectedAssetId) {
      toast({
        title: "Validatiefout",
        description: "Selecteer eerst een asset om te koppelen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('asset_relationships')
        .insert({
          parent_asset_id: assetId,
          child_asset_id: selectedAssetId,
          relationship_type: relationshipType,
          description: relationshipDescription || null
        });

      if (error) {
        console.error('Error adding relationship:', error);
        toast({
          title: "Fout bij toevoegen",
          description: "Er is een fout opgetreden bij het toevoegen van de koppeling.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Koppeling toegevoegd",
        description: "De asset koppeling is succesvol toegevoegd.",
      });

      setSelectedAssetId("");
      setRelationshipType("related");
      setRelationshipDescription("");
      setShowAddDialog(false);
      fetchRelationships();
    } catch (error) {
      console.error('Error adding relationship:', error);
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from('asset_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) {
        console.error('Error deleting relationship:', error);
        toast({
          title: "Fout bij verwijderen",
          description: "Er is een fout opgetreden bij het verwijderen van de koppeling.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Koppeling verwijderd",
        description: "De asset koppeling is succesvol verwijderd.",
      });

      fetchRelationships();
    } catch (error) {
      console.error('Error deleting relationship:', error);
    }
  };

  const getRelationshipTypeLabel = (type: string) => {
    return relationshipTypes.find(rt => rt.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Gekoppelde Assets ({relationships.length})
        </h3>
        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Asset koppelen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asset koppeling toevoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset selecteren</Label>
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een asset om te koppelen" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.type} - {asset.brand} {asset.model} 
                          {asset.assetTag && ` (${asset.assetTag})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type koppeling</Label>
                  <Select value={relationshipType} onValueChange={setRelationshipType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer type koppeling" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship-description">Beschrijving (optioneel)</Label>
                  <Input
                    id="relationship-description"
                    value={relationshipDescription}
                    onChange={(e) => setRelationshipDescription(e.target.value)}
                    placeholder="Beschrijf de koppeling..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleAddRelationship}>
                    Koppelen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {relationships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Link2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Geen gekoppelde assets</p>
            {canEdit && (
              <p className="text-sm text-gray-400 mt-2">
                Klik op "Asset koppelen" om assets aan elkaar te koppelen
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {relationships.map((relationship) => {
            const relatedAsset = relationship.direction === 'parent' 
              ? relationship.child_asset 
              : relationship.parent_asset;
            
            if (!relatedAsset) return null;

            return (
              <Card key={relationship.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getRelationshipTypeLabel(relationship.relationship_type)}
                      </Badge>
                      {relationship.direction === 'child' && <ArrowRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {relatedAsset.type} - {relatedAsset.brand} {relatedAsset.model}
                      </p>
                      {relatedAsset.assetTag && (
                        <p className="text-sm text-gray-500">Tag: {relatedAsset.assetTag}</p>
                      )}
                      {relationship.description && (
                        <p className="text-sm text-gray-600 mt-1">{relationship.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/assets/${relatedAsset.id}`, '_blank')}
                    >
                      Bekijken
                    </Button>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRelationship(relationship.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
