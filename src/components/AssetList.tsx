
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Asset } from "@/types/asset";
import { AssetTableRow } from "./AssetTableRow";
import { AssetMobileCard } from "./AssetMobileCard";
import { getAssetIcon, getStatusColor, getCategoryDisplayName } from "@/utils/assetUtils";

interface AssetListProps {
  assets: Asset[];
  currentRole: string;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string, reason: string) => void;
  onReserve: (asset: Asset) => void;
}

export const AssetList = ({ assets, currentRole, onEdit, onDelete, onReserve }: AssetListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets ({assets.length})</CardTitle>
        <CardDescription>
          Overzicht van alle bedrijfsassets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="block lg:hidden space-y-4">
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

        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afbeelding</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Merk/Model</TableHead>
                <TableHead>Serienummer</TableHead>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Prijs</TableHead>
                <TableHead>Boete</TableHead>
                <TableHead>Toegewezen aan</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead>Specifieke locatie</TableHead>
                <TableHead>Acties</TableHead>
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

        {assets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Geen assets gevonden die voldoen aan uw zoekcriteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
