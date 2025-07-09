
import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, Calendar } from "lucide-react";
import { AssetImage } from "./AssetImage";
import { AssetDeleteDialog } from "./AssetDeleteDialog";
import { AssetPermanentDeleteDialog } from "./AssetPermanentDeleteDialog";
import { Link } from "react-router-dom";

interface AssetTableRowProps {
  asset: Asset;
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string, reason: string) => void;
  onPermanentDelete?: (id: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
  getAssetIcon: (type: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
  getCategoryDisplayName: (category: string) => string;
}

export const AssetTableRow = ({
  asset,
  currentRole,
  onEdit,
  onDelete,
  onPermanentDelete,
  onReserve,
  getAssetIcon,
  getStatusColor,
  getCategoryDisplayName,
}: AssetTableRowProps) => {
  const canManageAssets = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  const canDelete = asset.status !== "Deleted";
  const canPermanentDelete = canManageAssets && onPermanentDelete;

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="py-4">
        <div className="flex items-center space-x-3">
          <AssetImage
            image={asset.image}
            brand={asset.brand}
            model={asset.model}
            icon={getAssetIcon(asset.type)}
            size="sm"
          />
          <div>
            <Link 
              to={`/assets/${asset.id}`}
              className="font-medium text-gray-900 hover:text-blue-600"
            >
              {asset.type}
            </Link>
            <p className="text-sm text-gray-500">{asset.brand} {asset.model}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <span className="font-mono text-sm">{asset.assetTag || "Geen tag"}</span>
      </TableCell>
      
      <TableCell>
        <Badge className={getStatusColor(asset.status)}>
          {asset.status}
        </Badge>
      </TableCell>
      
      <TableCell className="text-sm text-gray-600">
        {asset.location}
      </TableCell>
      
      <TableCell className="text-sm text-gray-600">
        {asset.assignedTo || "Niet toegewezen"}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2">
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
      </TableCell>
    </TableRow>
  );
};
