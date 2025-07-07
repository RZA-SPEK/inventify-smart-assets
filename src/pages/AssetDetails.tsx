
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Tag, User, MapPin } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetImage } from "@/components/AssetImage";
import { ReservationDialog } from "@/components/ReservationDialog";
import { getAssetIcon, getStatusColor } from "@/utils/assetUtils";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole, canManageAssets } = useUserRole();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      console.log('Fetching asset details with ID:', id);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching asset details:', error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van het asset.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log('Asset details fetched successfully:', data);
        
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
          image: data.image_url || ''
        };

        setAsset(transformedAsset);
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
      toast({
        title: "Fout bij laden",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/assets")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Assets
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <AssetImage
                  image={asset.image}
                  brand={asset.brand}
                  model={asset.model}
                  icon={getAssetIcon(asset.type)}
                  size="lg"
                />
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getAssetIcon(asset.type)}
                    <span>{asset.type}</span>
                  </CardTitle>
                  <p className="text-lg text-gray-600">{asset.brand} {asset.model}</p>
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                {canManageAssets && (
                  <Button onClick={() => navigate(`/assets/${asset.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerken
                  </Button>
                )}
                {asset.status === "In voorraad" && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReservationDialog(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Reserveren
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Algemene informatie</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Asset Tag:</span>
                    <span>{asset.assetTag || "Geen tag"}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Serienummer:</span>
                    <span className="font-mono">{asset.serialNumber}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Categorie:</span>
                    <span>{asset.category}</span>
                  </div>
                  
                  {asset.purchaseDate && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Aankoopdatum:</span>
                      <span>{new Date(asset.purchaseDate).toLocaleDateString('nl-NL')}</span>
                    </div>
                  )}
                  
                  {asset.purchasePrice && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Aankoopprijs:</span>
                      <span>€{asset.purchasePrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Locatie & Toewijzing</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Locatie:</span>
                    <span>{asset.location}</span>
                  </div>
                  
                  {asset.assignedToLocation && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Specifieke locatie:</span>
                      <span>{asset.assignedToLocation}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Toegewezen aan:</span>
                    <span>{asset.assignedTo || "Niet toegewezen"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showReservationDialog && (
          <ReservationDialog
            asset={asset}
            onClose={() => setShowReservationDialog(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AssetDetails;
