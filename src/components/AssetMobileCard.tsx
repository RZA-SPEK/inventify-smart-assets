
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, User, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const isAdmin = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  const isAvailableForReservation = asset.status === "In voorraad";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/assets/${asset.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit button clicked for asset:', asset.id, 'User role:', currentRole);
    // Navigate directly to edit page instead of calling onEdit
    navigate(`/assets/${asset.id}/edit`);
  };

  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReserve(asset);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AssetImage
            image={asset.image}
            brand={asset.brand}
            model={asset.model}
            icon={getAssetIcon(asset.type)}
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {getAssetIcon(asset.type)}
              <h3 className="font-medium text-sm truncate">{asset.type}</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">{asset.brand}</p>
            
            {asset.assetTag && (
              <div className="flex items-center space-x-1 mb-2">
                <Tag className="h-3 w-3 text-blue-500" />
                <span className="font-mono text-xs">{asset.assetTag}</span>
              </div>
            )}
            
            {asset.assignedTo && (
              <div className="flex items-center space-x-1 mb-2">
                <User className="h-3 w-3 text-green-500" />
                <span className="text-xs">{asset.assignedTo}</span>
              </div>
            )}
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
              {asset.status}
            </span>
          </div>

          <div className="flex flex-col space-y-2">
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
                className="h-8 w-8 p-0"
                title="Asset bewerken"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Bewerken</span>
              </Button>
            )}
            
            {!isAdmin && isAvailableForReservation && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReserveClick}
                className="text-xs"
              >
                Reserveren
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
