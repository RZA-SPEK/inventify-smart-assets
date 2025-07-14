import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  getCategoryDisplayName: (category: string) => string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  canSelect?: boolean;
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
  getCategoryDisplayName,
  isSelected = false,
  onSelect,
  canSelect = false
}: AssetMobileCardProps) => {
  const canManageAssets = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  const canDelete = asset.status !== "Deleted";
  const canPermanentDelete = canManageAssets && onPermanentDelete;

  return (
    <Card className={`mb-4 transition-all duration-200 ${isSelected ? 'ring-2 ring-primary bg-accent/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {canSelect && onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(asset.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            )}
            <AssetImage
              image={asset.image}
              brand={asset.brand}
              model={asset.model}
              icon={getAssetIcon(asset.type)}
              size="sm"
            />
            <div>
              <h3 className="font-medium text-sm text-foreground">{asset.type}</h3>
              <p className="text-sm text-muted-foreground">{asset.brand} {asset.model}</p>
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
              <span className="font-medium text-foreground">Asset Tag:</span>
              <p className="text-muted-foreground">{asset.assetTag || "Geen tag"}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Locatie:</span>
              <p className="text-muted-foreground">{asset.location}</p>
            </div>
          </div>
          
          {asset.assignedTo && (
            <div>
              <span className="font-medium text-foreground">Toegewezen aan:</span>
              <p className="text-muted-foreground">{asset.assignedTo}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
          <div className="flex space-x-2">
            {canManageAssets && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(asset)}
                  className="hover:bg-accent"
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
              className="hover:bg-accent"
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