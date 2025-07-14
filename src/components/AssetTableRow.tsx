import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  canSelect?: boolean;
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
  isSelected = false,
  onSelect,
  canSelect = false
}: AssetTableRowProps) => {
  const canManageAssets = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  const canDelete = asset.status !== "Deleted";
  const canPermanentDelete = canManageAssets && onPermanentDelete;

  return (
    <TableRow className={`transition-colors hover:bg-muted/50 ${isSelected ? 'bg-accent/50' : ''}`}>
      {canSelect && onSelect && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(asset.id)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </TableCell>
      )}
      
      <TableCell className="py-4 w-16">
        <AssetImage
          image={asset.image}
          brand={asset.brand}
          model={asset.model}
          icon={getAssetIcon(asset.type)}
          size="sm"
        />
      </TableCell>
      
      <TableCell className="py-4 min-w-[200px]">
        <div className="space-y-1">
          <Link 
            to={`/assets/${asset.id}`}
            className="font-medium text-foreground hover:text-primary block truncate transition-colors"
          >
            {asset.type}
          </Link>
          <p className="text-sm text-muted-foreground truncate">{asset.brand} {asset.model}</p>
        </div>
      </TableCell>
      
      <TableCell className="py-4 w-24">
        <span className="font-mono text-sm truncate block">{asset.assetTag || "Geen"}</span>
      </TableCell>
      
      <TableCell className="py-4 w-32">
        <Badge className={getStatusColor(asset.status)}>
          {asset.status}
        </Badge>
      </TableCell>
      
      <TableCell className="py-4 min-w-[120px]">
        <span className="text-sm text-muted-foreground truncate block">{asset.location}</span>
      </TableCell>
      
      <TableCell className="py-4 min-w-[150px]">
        <span className="text-sm text-muted-foreground truncate block">{asset.assignedTo || "Niet toegewezen"}</span>
      </TableCell>
      
      {canManageAssets && (
        <TableCell className="py-4 w-40">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(asset)}
              className="h-8 px-2 hover:bg-accent"
            >
              <Edit className="h-3 w-3" />
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
            
            {asset.status === "In voorraad" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReserve(asset)}
                className="h-8 px-2 hover:bg-accent"
              >
                <Calendar className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
      
      {!canManageAssets && asset.status === "In voorraad" && (
        <TableCell className="py-4 w-32">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReserve(asset)}
            className="h-8 px-2 hover:bg-accent"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Reserveren
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};