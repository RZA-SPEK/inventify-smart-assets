
import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Calendar } from "lucide-react";
import { AssetImage } from "./AssetImage";
import { AssetDeleteDialog } from "./AssetDeleteDialog";
import { AssetPermanentDeleteDialog } from "./AssetPermanentDeleteDialog";

interface AssetMobileCardProps {
  asset: Asset;
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string, reason: string) => void;
  onPermanentDelete?: (id: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
  getAssetIcon: (type: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
}

export const AssetMobileCard = ({
  asset,
  currentRole,
  onEdit,
  onDelete,
  onPermanentDelete,
  onReserve,
  getAssetIcon,
  getStatusColor,
}: AssetMobileCardProps) => {
  const canManageAssets = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  const canDelete = asset.status !== "Deleted";
  const canPermanentDelete = canManageAssets && onPermanentDelete;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <AssetImage
              image={asset.image}
              brand={asset.brand}
              model={asset.model}
              icon={getAssetIcon(asset.type)}
              size="sm"
            />
            <div>
              <h3 className="font-medium text-sm">{asset.type}</h3>
              <p className="text-sm text-gray-600">{asset.brand} {asset.model}</p>
              <Badge className={`${getStatusColor(asset.status)} text-xs mt-1`}>
                {asset.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Asset Tag:</span>
              <p className="text-gray-600">{asset.assetTag || "Geen tag"}</p>
            </div>
            <div>
              <span className="font-medium">Locatie:</span>
              <p className="text-gray-600">{asset.location}</p>
            </div>
          </div>
          
          {asset.assignedTo && (
            <div>
              <span className="font-medium">Toegewezen aan:</span>
              <p className="text-gray-600">{asset.assignedTo}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <div className="flex space-x-2">
            {canManageAssets && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(asset)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Bewerken
                </Button>
                <AssetDeleteDialog
                  onDelete={(reason) => onDelete(asset.id, reason)}
                  canDelete={canDelete}
                />
                {canPermanentDelete && (
                  <AssetPermanentDeleteDialog
                    onPermanentDelete={(reason) => onPermanentDelete(asset.id, reason)}
                    canDelete={true}
                    assetName={`${asset.brand} ${asset.model}`}
                  />
                )}
              </>
            )}
          </div>
          
          {asset.status === "In voorraad" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReserve(asset)}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Reserveren
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
