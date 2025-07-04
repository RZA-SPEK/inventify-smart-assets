
import { TableCell, TableRow } from "@/components/ui/table";
import { Tag } from "lucide-react";
import { Asset } from "@/types/asset";
import { AssetImage } from "./AssetImage";

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
  const handleRowClick = () => {
    onEdit(asset);
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50" 
      onClick={handleRowClick}
    >
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
      <TableCell className="min-w-32">{asset.brand}</TableCell>
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
    </TableRow>
  );
};
