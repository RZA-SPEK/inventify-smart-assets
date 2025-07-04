
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, Calendar } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetImage } from "./AssetImage";
import { AssetBadges } from "./AssetBadges";
import { AssetPriceInfo } from "./AssetPriceInfo";
import { AssetDeleteDialog } from "./AssetDeleteDialog";

interface AssetTableRowProps {
  asset: Asset;
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
  getAssetIcon: (type: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getCategoryDisplayName: (category: string) => string;
}

export const AssetTableRow = ({
  asset,
  currentRole,
  onEdit,
  onDelete,
  onReserve,
  getAssetIcon,
  getStatusColor,
  getCategoryDisplayName
}: AssetTableRowProps) => {
  const canEdit = (currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && asset.status !== "Deleted";
  const canDelete = (currentRole === "ICT Admin" || currentRole === "Facilitair Admin") && asset.status !== "Deleted";
  const canReserve = asset.status === "In voorraad";

  return (
    <TableRow>
      <TableCell>
        <AssetImage
          image={asset.image}
          brand={asset.brand}
          model={asset.model}
          icon={getAssetIcon(asset.type)}
          size="sm"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getAssetIcon(asset.type)}
          <span className="font-medium">{asset.type}</span>
        </div>
      </TableCell>
      <TableCell>{asset.brand} {asset.model}</TableCell>
      <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
      <TableCell>
        {asset.assetTag ? (
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-blue-500" />
            <span className="font-mono text-sm">{asset.assetTag}</span>
          </div>
        ) : (
          <span className="text-gray-400">Geen tag</span>
        )}
      </TableCell>
      <TableCell>
        <AssetBadges
          status={asset.status}
          category={asset.category}
          getStatusColor={getStatusColor}
          getCategoryDisplayName={getCategoryDisplayName}
        />
      </TableCell>
      <TableCell>
        <AssetPriceInfo
          purchasePrice={asset.purchasePrice}
          penaltyAmount={asset.penaltyAmount}
        />
      </TableCell>
      <TableCell>
        {asset.assignedTo ? (
          <div className="flex items-center space-x-1">
            <span>{asset.assignedTo}</span>
          </div>
        ) : (
          <span className="text-gray-400">Niet toegewezen</span>
        )}
      </TableCell>
      <TableCell>{asset.location}</TableCell>
      <TableCell>
        {asset.assignedToLocation ? (
          <span className="text-sm">{asset.assignedToLocation}</span>
        ) : (
          <span className="text-gray-400">Geen specifieke locatie</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          {canReserve && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReserve(asset)}
              className="flex items-center gap-1 text-xs"
            >
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Reserveren</span>
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(asset)}
              className="text-xs"
            >
              <span className="hidden sm:inline">Bewerken</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          )}
          <AssetDeleteDialog
            onDelete={(reason) => onDelete(asset.id, reason)}
            canDelete={canDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
