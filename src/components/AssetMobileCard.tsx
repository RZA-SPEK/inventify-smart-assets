
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Calendar, Trash2, Euro } from "lucide-react";
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
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {asset.image ? (
            <img
              src={asset.image}
              alt={`${asset.brand} ${asset.model}`}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {getAssetIcon(asset.type)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getAssetIcon(asset.type)}
            <h3 className="font-medium text-lg truncate">{asset.type}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">{asset.brand} {asset.model}</p>
          <p className="text-xs text-gray-500 font-mono mb-2">{asset.serialNumber}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getStatusColor(asset.status)}>
              {asset.status === "Deleted" ? "Verwijderd" : asset.status}
            </Badge>
            <Badge variant="outline">
              {getCategoryDisplayName(asset.category)}
            </Badge>
          </div>

          {/* Price and Penalty Information */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div className="flex items-center space-x-1">
              <Euro className="h-3 w-3 text-green-600" />
              <span className="text-gray-600">Prijs:</span>
              <span className="font-medium text-green-700">
                {formatPrice(asset.purchasePrice)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Euro className="h-3 w-3 text-red-600" />
              <span className="text-gray-600">Boete:</span>
              <span className="font-medium text-red-700">
                {formatPrice(asset.penaltyAmount)}
              </span>
            </div>
          </div>

          {asset.assignedTo && (
            <div className="flex items-center space-x-1 mb-2">
              <User className="h-3 w-3" />
              <span className="text-sm">{asset.assignedTo}</span>
            </div>
          )}
          
          <div className="flex flex-col space-y-1 text-sm text-gray-600 mb-3">
            <span>{asset.location}</span>
            {asset.assignedToLocation && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span className="text-xs">{asset.assignedToLocation}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {asset.status === "In voorraad" && (
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
            {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin" || currentRole === "Facilitair Medewerker") && asset.status !== "Deleted" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(asset)}
                className="text-xs"
              >
                Bewerken
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
        </div>
      </div>
    </Card>
  );
};
