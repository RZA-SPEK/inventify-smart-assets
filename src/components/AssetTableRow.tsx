
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
      <TableCell className="w-20">
        <AssetImage
          image={asset.image}
          brand={asset.brand}
          model={asset.model}
          icon={getAssetIcon(asset.type)}
          size="sm"
        />
      </TableCell>
      <TableCell className="min-w-32">
        <div className="flex items-center space-x-2">
          {getAssetIcon(asset.type)}
          <span className="font-medium">{asset.type}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-32">{asset.brand} {asset.model}</TableCell>
      <TableCell className="min-w-32 font-mono text-sm">{asset.serialNumber}</TableCell>
      <TableCell className="w-24">
        {asset.assetTag ? (
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-blue-500" />
            <span className="font-mono text-sm">{asset.assetTag}</span>
          </div>
        ) : (
          <span className="text-gray-400">Geen tag</span>
        )}
      </TableCell>
      <TableCell className="w-32">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
          {asset.status}
        </span>
      </TableCell>
      <TableCell className="w-24">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getCategoryDisplayName(asset.category)}
        </span>
      </TableCell>
      <TableCell className="w-20">
        {asset.purchasePrice ? (
          <span className="text-sm font-medium">€{asset.purchasePrice.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="w-20">
        {asset.penaltyAmount ? (
          <span className="text-sm text-red-600">€{asset.penaltyAmount.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="min-w-32">
        {asset.assignedTo ? (
          <div className="flex items-center space-x-1">
            <span>{asset.assignedTo}</span>
          </div>
        ) : (
          <span className="text-gray-400">Niet toegewezen</span>
        )}
      </TableCell>
      <TableCell className="min-w-24">{asset.location}</TableCell>
      <TableCell className="min-w-32">
        {asset.assignedToLocation ? (
          <span className="text-sm">{asset.assignedToLocation}</span>
        ) : (
          <span className="text-gray-400">Geen specifieke locatie</span>
        )}
      </TableCell>
      <TableCell className="w-32">
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
