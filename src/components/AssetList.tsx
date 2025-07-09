
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Asset } from "@/types/asset";
import { AssetTableRow } from "./AssetTableRow";
import { AssetMobileCard } from "./AssetMobileCard";
import { getAssetIcon, getStatusColor, getCategoryDisplayName } from "@/utils/assetUtils";

interface AssetListProps {
  assets: Asset[];
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string, reason: string) => void;
  onPermanentDelete?: (id: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
}

export const AssetList = ({ 
  assets, 
  currentRole, 
  onEdit, 
  onDelete, 
  onPermanentDelete,
  onReserve 
}: AssetListProps) => {
  const isAdmin = currentRole === "ICT Admin" || currentRole === "Facilitair Admin";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets ({assets.length})</CardTitle>
        <CardDescription>
          {isAdmin 
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
              currentRole={currentRole}
              onEdit={onEdit}
              onDelete={onDelete}
              onPermanentDelete={onPermanentDelete}
              onReserve={onReserve}
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
                  {isAdmin && <TableHead className="w-40">Acties</TableHead>}
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
                    onPermanentDelete={onPermanentDelete}
                    onReserve={onReserve}
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
