
import { TableCell, TableRow } from "@/components/ui/table";
import { Tag, User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Asset } from "@/types/asset";
import { AssetImage } from "./AssetImage";

interface AssetTableRowProps {
  asset: Asset;
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string, reason: string) => void;
  onPermanentDelete?: (assetId: string, reason: string) => void;
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
  onPermanentDelete,
  onReserve,
  getAssetIcon,
  getStatusColor,
  getCategoryDisplayName
}: AssetTableRowProps) => {
  const navigate = useNavigate();
  const isAdmin = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  const isAvailableForReservation = asset.status === "In voorraad";

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/assets/${asset.id}`);
  };

  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReserve(asset);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit button clicked for asset:', asset.id, 'User role:', currentRole);
    // Navigate directly to edit page instead of calling onEdit
    navigate(`/assets/${asset.id}/edit`);
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
      <TableCell className="min-w-40">
        {asset.assignedTo ? (
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3 text-green-500" />
            <span className="text-sm">{asset.assignedTo}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Niet toegewezen</span>
        )}
      </TableCell>
      <TableCell className="w-32">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
          {asset.status}
        </span>
      </TableCell>
      {isAdmin && (
        <TableCell className="w-32">
          <div className="flex space-x-1">
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
          </div>
        </TableCell>
      )}
      {!isAdmin && isAvailableForReservation && (
        <TableCell className="w-32">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReserveClick}
            className="flex items-center space-x-1"
          >
            <span>Reserveren</span>
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};
