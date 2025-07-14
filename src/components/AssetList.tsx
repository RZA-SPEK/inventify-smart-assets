
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
    <div className="card-elevated">
      <div className="responsive-padding border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-header">Assets</h2>
            <p className="text-muted-foreground mt-1">
              {canManageAssets 
                ? "Overzicht van alle bedrijfsassets" 
                : "Beschikbare assets voor reservering"
              }
            </p>
          </div>
          <div className="status-badge bg-primary text-primary-foreground">
            {assets.length} items
          </div>
        </div>
      </div>
      <div className="p-0">
        <div className="block lg:hidden responsive-spacing responsive-padding">
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
          <ScrollArea className="h-[700px] w-full">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16 font-semibold">Foto</TableHead>
                  <TableHead className="min-w-[200px] font-semibold">Asset Info</TableHead>
                  <TableHead className="w-24 font-semibold">Tag</TableHead>
                  <TableHead className="w-32 font-semibold">Status</TableHead>
                  <TableHead className="min-w-[120px] font-semibold">Locatie</TableHead>
                  <TableHead className="min-w-[150px] font-semibold">Toegewezen</TableHead>
                  {canManageAssets && <TableHead className="w-40 font-semibold">Acties</TableHead>}
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
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl text-muted-foreground">📦</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Geen assets gevonden</h3>
              <p className="text-muted-foreground">
                Er zijn geen assets die voldoen aan uw zoekcriteria. Probeer uw filters aan te passen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
