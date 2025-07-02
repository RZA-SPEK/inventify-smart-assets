
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AssetTableRow } from "@/components/AssetTableRow";
import { AssetMobileCard } from "@/components/AssetMobileCard";
import { Asset } from "@/types/asset";
import { Laptop, Monitor, Smartphone, Headphones, Printer, HardDrive, Wifi, Camera, Coffee, Utensils, Truck, Package } from "lucide-react";

interface AssetListSectionProps {
  assets: Asset[] | undefined;
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
}

export const AssetListSection = ({ 
  assets, 
  currentRole, 
  onEdit, 
  onDelete, 
  onReserve 
}: AssetListSectionProps) => {
  const getAssetIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Laptop": <Laptop className="h-4 w-4" />,
      "Desktop": <Monitor className="h-4 w-4" />,
      "Monitor": <Monitor className="h-4 w-4" />,
      "Telefoon": <Smartphone className="h-4 w-4" />,
      "Tablet": <Smartphone className="h-4 w-4" />,
      "Headset": <Headphones className="h-4 w-4" />,
      "Printer": <Printer className="h-4 w-4" />,
      "Router": <Wifi className="h-4 w-4" />,
      "Switch": <Wifi className="h-4 w-4" />,
      "Camera": <Camera className="h-4 w-4" />,
      "Koffiezetapparaat": <Coffee className="h-4 w-4" />,
      "Magnetron": <Utensils className="h-4 w-4" />,
      "Koelkast": <Package className="h-4 w-4" />,
      "Vorkheftruck": <Truck className="h-4 w-4" />,
      "Trolley": <Truck className="h-4 w-4" />,
    };
    return iconMap[type] || <Package className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      "In voorraad": "bg-green-100 text-green-800",
      "In gebruik": "bg-blue-100 text-blue-800",
      "Defect": "bg-red-100 text-red-800",
      "Onderhoud": "bg-yellow-100 text-yellow-800",
      "Deleted": "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getCategoryDisplayName = (category: string) => {
    const displayMap: { [key: string]: string } = {
      "ICT": "ICT",
      "Facilitair": "Facilitair",
      "Catering": "Catering",
      "Logistics": "Logistiek",
    };
    return displayMap[category] || category;
  };

  // Show loading state
  if (assets === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Assets laden...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Geen assets gevonden.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset List ({assets.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Specific Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <AssetTableRow
                  key={asset.id}
                  asset={asset}
                  currentRole={currentRole}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReserve={onReserve}
                  getAssetIcon={getAssetIcon}
                  getStatusColor={getStatusColor}
                  getCategoryDisplayName={getCategoryDisplayName}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Tablet Table View */}
        <div className="hidden sm:block lg:hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <AssetTableRow
                  key={asset.id}
                  asset={asset}
                  currentRole={currentRole}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReserve={onReserve}
                  getAssetIcon={getAssetIcon}
                  getStatusColor={getStatusColor}
                  getCategoryDisplayName={getCategoryDisplayName}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden">
          <div className="divide-y">
            {assets.map((asset) => (
              <AssetMobileCard
                key={asset.id}
                asset={asset}
                currentRole={currentRole}
                onEdit={onEdit}
                onDelete={onDelete}
                onReserve={onReserve}
                getAssetIcon={getAssetIcon}
                getStatusColor={getStatusColor}
                getCategoryDisplayName={getCategoryDisplayName}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
