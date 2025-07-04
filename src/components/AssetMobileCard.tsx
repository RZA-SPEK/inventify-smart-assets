
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetImage } from "./AssetImage";
import { AssetBadges } from "./AssetBadges";
import { AssetPriceInfo } from "./AssetPriceInfo";
import { AssetAssignmentInfo } from "./AssetAssignmentInfo";
import { AssetDeleteDialog } from "./AssetDeleteDialog";

interface AssetMobileCardProps {
  asset: Asset;
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
  getAssetIcon: (type: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getCategoryDisplayName: (category: string) => string;
}

export const AssetMobileCard = ({
  asset,
  currentRole,
  onEdit,
  onDelete,
  onReserve,
  getAssetIcon,
  getStatusColor,
  getCategoryDisplayName
}: AssetMobileCardProps) => {
  const canEdit = (currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && asset.status !== "Deleted";
  const canDelete = (currentRole === "ICT Admin" || currentRole === "Facilitair Admin") && asset.status !== "Deleted";
  const canReserve = asset.status === "In voorraad";

  return (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <AssetImage
          image={asset.image}
          brand={asset.brand}
          model={asset.model}
          icon={getAssetIcon(asset.type)}
          size="md"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getAssetIcon(asset.type)}
            <h3 className="font-medium text-lg truncate">{asset.type}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">{asset.brand} {asset.model}</p>
          <p className="text-xs text-gray-500 font-mono mb-2">{asset.serialNumber}</p>
          
          <AssetBadges
            status={asset.status}
            category={asset.category}
            getStatusColor={getStatusColor}
            getCategoryDisplayName={getCategoryDisplayName}
          />

          <AssetPriceInfo
            purchasePrice={asset.purchasePrice}
            penaltyAmount={asset.penaltyAmount}
          />

          <AssetAssignmentInfo
            assignedTo={asset.assignedTo}
            location={asset.location}
            assignedToLocation={asset.assignedToLocation}
          />
          
          <div className="flex flex-wrap gap-2">
            {canReserve && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReserve(asset)}
                className="flex items-center gap-1 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Reserveren
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(asset)}
                className="text-xs"
              >
                Bewerken
              </Button>
            )}
            <AssetDeleteDialog
              onDelete={(reason) => onDelete(asset.id, reason)}
              canDelete={canDelete}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
