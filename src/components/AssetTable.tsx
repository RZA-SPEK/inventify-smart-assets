
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Calendar, Laptop, Smartphone, Headphones, Cable, Monitor, Settings } from "lucide-react";
import { Asset } from "@/pages/Index";

interface AssetTableProps {
  assets: Asset[];
  currentRole: "ICT Admin" | "Facilitair Medewerker" | "Gebruiker";
  onEditAsset: (asset: Asset) => void;
  onReserveAsset: (asset: Asset) => void;
}

export const AssetTable = ({ assets, currentRole, onEditAsset, onReserveAsset }: AssetTableProps) => {
  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "laptop":
        return <Laptop className="h-4 w-4" />;
      case "telefoon":
        return <Smartphone className="h-4 w-4" />;
      case "headset":
        return <Headphones className="h-4 w-4" />;
      case "kabel":
        return <Cable className="h-4 w-4" />;
      case "monitor":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In gebruik":
        return "bg-green-100 text-green-800";
      case "In voorraad":
        return "bg-blue-100 text-blue-800";
      case "Defect":
        return "bg-red-100 text-red-800";
      case "Onderhoud":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Merk & Model</TableHead>
            <TableHead>Serienummer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Categorie</TableHead>
            <TableHead>Toegewezen aan</TableHead>
            <TableHead>Locatie</TableHead>
            <TableHead>Specifieke Locatie</TableHead>
            <TableHead>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
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
                  <span>{asset.type}</span>
                </div>
              </TableCell>
              <TableCell>{asset.brand} {asset.model}</TableCell>
              <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(asset.status)}>
                  {asset.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {asset.category}
                </Badge>
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
                <div className="flex space-x-2">
                  {asset.status === "In voorraad" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReserveAsset(asset)}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      Reserveren
                    </Button>
                  )}
                  {(currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditAsset(asset)}
                    >
                      Bewerken
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
