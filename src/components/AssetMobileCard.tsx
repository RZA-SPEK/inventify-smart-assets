
import { Card } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetImage } from "./AssetImage";

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
  const handleCardClick = () => {
    onEdit(asset);
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-muted/50" 
      onClick={handleCardClick}
    >
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
          <p className="text-sm text-gray-600 mb-2">{asset.brand}</p>
          
          <div className="flex items-center space-x-2 mb-2">
            {asset.assetTag ? (
              <div className="flex items-center space-x-1">
                <Tag className="h-3 w-3 text-blue-500" />
                <span className="font-mono text-sm">{asset.assetTag}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Geen tag</span>
            )}
          </div>

          <div className="mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
              {asset.status}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
