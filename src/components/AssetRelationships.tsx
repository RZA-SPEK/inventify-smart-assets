
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Plus, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { useNavigate } from "react-router-dom";

interface AssetRelationship {
  id: string;
  parent_asset_id: string;
  child_asset_id: string;
  relationship_type: string;
  description?: string;
  direction?: 'parent' | 'child';
  related_asset?: Asset;
}

interface AssetRelationshipsProps {
  assetId: string;
  canEdit?: boolean;
}

const relationshipTypes = [
  { value: 'component', label: 'Component', description: 'Dit asset is onderdeel van het andere asset' },
  { value: 'accessory', label: 'Accessoire', description: 'Dit asset is een accessoire van het andere asset' },
  { value: 'set', label: 'Set', description: 'Deze assets vormen samen een set' },
  { value: 'related', label: 'Gerelateerd', description: 'Deze assets zijn aan elkaar gerelateerd' }
];

const transformDatabaseAssetToAsset = (dbAsset: any): Asset => {
  return {
    id: dbAsset.id,
    type: dbAsset.type || '',
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
    reservable: dbAsset.reservable !== undefined ? dbAsset.reservable : true
  };
};

export const AssetRelationships = ({ assetId, canEdit = false }: AssetRelationshipsProps) => {
  const [relationships, setRelationships] = useState<AssetRelationship[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    assetId: '',
    relationshipType: '',
    description: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelationships();
    fetchAvailableAssets();
  }, [assetId]);

  const fetchRelationships = async () => {
    try {
      // Fetch relationships where current asset is parent
      const { data: parentData, error: parentError } = await supabase
        .from('asset_relationships')
        .select(`
          id,
          parent_asset_id,
          child_asset_id,
          relationship_type,
          description,
          child_asset:assets!asset_relationships_child_asset_id_fkey(*)
        `)
        .eq('parent_asset_id', assetId);

      // Fetch relationships where current asset is child
      const { data: childData, error: childError } = await supabase
        .from('asset_relationships')
        .select(`
          id,
          parent_asset_id,
          child_asset_id,
          relationship_type,
          description,
          parent_asset:assets!asset_relationships_parent_asset_id_fkey(*)
        `)
        .eq('child_asset_id', assetId);

      if (parentError || childError) {
        console.error('Error fetching relationships:', parentError || childError);
        return;
      }

      const allRelationships: AssetRelationship[] = [];

      // Add parent relationships (current asset is parent)
      parentData?.forEach(rel => {
        if (rel.child_asset) {
          allRelationships.push({
            ...rel,
            direction: 'parent',
            related_asset: transformDatabaseAssetToAsset(rel.child_asset)
          });
        }
      });

      // Add child relationships (current asset is child)
      childData?.forEach(rel => {
        if (rel.parent_asset) {
          allRelationships.push({
            ...rel,
            direction: 'child',
            related_asset: transformDatabaseAssetToAsset(rel.parent_asset)
          });
        }
      });

      setRelationships(allRelationships);
    } catch (error) {
      console.error('Error fetching relationships:', error);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      // First get all existing relationships to exclude linked assets
      const { data: existingRelationships } = await supabase
        .from('asset_relationships')
        .select('parent_asset_id, child_asset_id');

      const linkedAssetIds = new Set<string>();
      existingRelationships?.forEach(rel => {
        linkedAssetIds.add(rel.parent_asset_id);
        linkedAssetIds.add(rel.child_asset_id);
      });

      // Fetch all assets except current asset and already linked assets
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .neq('id', assetId)
        .not('id', 'in', `(${Array.from(linkedAssetIds).join(',')})`);

      if (error) {
        console.error('Error fetching available assets:', error);
        return;
      }

      const transformedAssets = (data || []).map(transformDatabaseAssetToAsset);
      setAvailableAssets(transformedAssets);
    } catch (error) {
      console.error('Error fetching available assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = async () => {
    if (!newRelationship.assetId || !newRelationship.relationshipType) {
      toast({
        title: "Validatiefout",
        description: "Selecteer een asset en relatietype.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('asset_relationships')
        .insert({
          parent_asset_id: assetId,
          child_asset_id: newRelationship.assetId,
          relationship_type: newRelationship.relationshipType,
          description: newRelationship.description || null
        });

      if (error) {
        console.error('Error adding relationship:', error);
        toast({
          title: "Fout bij toevoegen",
          description: "Er is een fout opgetreden bij het toevoegen van de relatie.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Relatie toegevoegd",
        description: "De asset relatie is succesvol toegevoegd.",
      });

      setNewRelationship({ assetId: '', relationshipType: '', description: '' });
      setShowAddForm(false);
      fetchRelationships();
      fetchAvailableAssets(); // Refresh available assets
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
          description: "Er is een fout opgetreden bij het verwijderen van de relatie.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Relatie verwijderd",
        description: "De asset relatie is verwijderd.",
      });

      fetchRelationships();
      fetchAvailableAssets(); // Refresh available assets
    } catch (error) {
      console.error('Error deleting relationship:', error);
    }
  };

  const getRelationshipDisplayText = (relationship: AssetRelationship) => {
    const type = relationshipTypes.find(t => t.value === relationship.relationship_type);
    if (relationship.direction === 'child') {
      // Current asset is child, so show inverse relationship
      switch (relationship.relationship_type) {
        case 'component':
          return 'Onderdeel van';
        case 'accessory':
          return 'Accessoire van';
        case 'set':
          return 'Set met';
        default:
          return 'Gerelateerd aan';
      }
    }
    return type?.label || relationship.relationship_type;
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
        {canEdit && availableAssets.length > 0 && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Koppelen
          </Button>
        )}
      </div>

      {showAddForm && canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nieuwe koppeling toevoegen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Selecteer Asset</Label>
              <Select
                value={newRelationship.assetId}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, assetId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.brand} {asset.model} ({asset.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Relatietype</Label>
              <Select
                value={newRelationship.relationshipType}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, relationshipType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies relatietype..." />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map(type => (
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
              <Label>Beschrijving (optioneel)</Label>
              <Input
                value={newRelationship.description}
                onChange={(e) => setNewRelationship({ ...newRelationship, description: e.target.value })}
                placeholder="Extra informatie over de relatie..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddRelationship} disabled={!newRelationship.assetId || !newRelationship.relationshipType}>
                Toevoegen
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {relationships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Link2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Geen gekoppelde assets</p>
            {canEdit && availableAssets.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Geen assets beschikbaar voor koppeling
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <Card key={relationship.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {getRelationshipDisplayText(relationship)}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {relationship.related_asset?.brand} {relationship.related_asset?.model}
                      </p>
                      <p className="text-sm text-gray-500">
                        {relationship.related_asset?.type}
                        {relationship.related_asset?.assetTag && ` • ${relationship.related_asset.assetTag}`}
                      </p>
                      {relationship.description && (
                        <p className="text-sm text-gray-600 mt-1">{relationship.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/assets/${relationship.related_asset?.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
