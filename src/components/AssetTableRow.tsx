
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, User, MapPin, Calendar, Trash2, Euro } from "lucide-react";
import { Asset } from "@/pages/Index";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    if (deleteReason.trim()) {
      onDelete(asset.id, deleteReason);
      setDeleteReason("");
      setIsDeleteDialogOpen(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "-";
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <TableRow>
      <TableCell>
        {asset.image ? (
          <img
            src={asset.image}
            alt={`${asset.brand} ${asset.model}`}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {getAssetIcon(asset.type)}
          </div>
        )}
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
        <Badge className={getStatusColor(asset.status)}>
          {asset.status === "Deleted" ? "Verwijderd" : asset.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {getCategoryDisplayName(asset.category)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Euro className="h-3 w-3 text-green-600" />
          <span className="font-medium text-green-700">
            {formatPrice(asset.purchasePrice)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Euro className="h-3 w-3 text-red-600" />
          <span className="font-medium text-red-700">
            {formatPrice(asset.penaltyAmount)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {asset.assignedTo ? (
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{asset.assignedTo}</span>
          </div>
        ) : (
          <span className="text-gray-400">Niet toegewezen</span>
        )}
      </TableCell>
      <TableCell>{asset.location}</TableCell>
      <TableCell>
        {asset.assignedToLocation ? (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-blue-500" />
            <span className="text-sm">{asset.assignedToLocation}</span>
          </div>
        ) : (
          <span className="text-gray-400">Geen specifieke locatie</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          {asset.status === "In voorraad" && (
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
          {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && asset.status !== "Deleted" && (
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
          {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin") && asset.status !== "Deleted" && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Asset verwijderen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je dit asset wilt verwijderen? Het asset wordt gemarkeerd als "Deleted" en kan later worden hersteld.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <label htmlFor="delete-reason" className="text-sm font-medium">
                    Reden voor verwijdering *
                  </label>
                  <Textarea
                    id="delete-reason"
                    placeholder="Geef een reden op voor het verwijderen van dit asset..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteReason("")}>
                    Annuleren
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={!deleteReason.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    Verwijderen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
