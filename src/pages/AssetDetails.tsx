
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Tag, User, MapPin } from "lucide-react";
import { Asset } from "@/types/asset";
import { mockAssets } from "@/data/mockAssets";
import { AssetImage } from "@/components/AssetImage";
import { ReservationDialog } from "@/components/ReservationDialog";
import { getAssetIcon, getStatusColor } from "@/utils/assetUtils";
import { useUserRole } from "@/hooks/useUserRole";

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole, canManageAssets } = useUserRole();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const foundAsset = mockAssets.find(a => a.id === id);
      setAsset(foundAsset || null);
    }
  }, [id]);

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
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Aankoopdatum:</span>
                    <span>{new Date(asset.purchaseDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                  
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
