
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Asset } from "@/types/asset";
import { AssetTableRow } from "./AssetTableRow";
import { AssetMobileCard } from "./AssetMobileCard";
import { getAssetIcon, getStatusColor, getCategoryDisplayName } from "@/utils/assetUtils";

interface AssetListProps {
  assets: Asset[];
  canManageAssets: boolean;
  onViewAsset: (id: string) => void;
  onEditAsset: (id: string) => void;
  onDeleteAsset: (id: string) => Promise<void>;
}

export const AssetList = ({ 
  assets, 
  canManageAssets, 
  onViewAsset, 
  onEditAsset, 
  onDeleteAsset 
}: AssetListProps) => {
  const handleEdit = (asset: Asset) => {
    onEditAsset(asset.id);
  };

  const handleDelete = async (id: string, reason: string) => {
    await onDeleteAsset(id);
  };

  const handleReserve = (asset: Asset) => {
    // TODO: Implement reservation logic
    console.log('Reserve asset:', asset);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets ({assets.length})</CardTitle>
        <CardDescription>
          {canManageAssets 
            ? "Overzicht van alle bedrijfsassets" 
            : "Beschikbare assets voor reservering"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="block lg:hidden space-y-4 p-6">
          {assets.map((asset) => (
            <AssetMobileCard
              key={asset.id}
              asset={asset}
              currentRole={canManageAssets ? "ICT Admin" : "Gebruiker"}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReserve={handleReserve}
              getAssetIcon={getAssetIcon}
              getStatusColor={getStatusColor}
              getCategoryDisplayName={getCategoryDisplayName}
            />
          ))}
        </div>

        <div className="hidden lg:block">
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead className="min-w-[200px]">Asset Info</TableHead>
                  <TableHead className="w-24">Tag</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="min-w-[120px]">Locatie</TableHead>
                  <TableHead className="min-w-[150px]">Toegewezen</TableHead>
                  {canManageAssets && <TableHead className="w-40">Acties</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <AssetTableRow
                    key={asset.id}
                    asset={asset}
                    currentRole={canManageAssets ? "ICT Admin" : "Gebruiker"}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReserve={handleReserve}
                    getAssetIcon={getAssetIcon}
                    getStatusColor={getStatusColor}
                    getCategoryDisplayName={getCategoryDisplayName}
                  />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {assets.length === 0 && (
          <div className="text-center py-8 text-gray-500 p-6">
            Geen assets gevonden die voldoen aan uw zoekcriteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
