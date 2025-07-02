
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, Users, AlertTriangle } from "lucide-react";
import { Asset } from "@/pages/Index";

interface DashboardStatsProps {
  assets: Asset[];
}

export const DashboardStats = ({ assets }: DashboardStatsProps) => {
  const totalAssets = assets.length;
  const assignedAssets = assets.filter(asset => asset.assignedTo).length;
  const availableAssets = assets.filter(asset => asset.status === "In voorraad").length;
  const defectiveAssets = assets.filter(asset => asset.status === "Defect").length;
  
  const ictAssets = assets.filter(asset => asset.category === "ICT").length;
  const facilitairAssets = assets.filter(asset => asset.category === "Facilitair").length;

  const assetTypes = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAssetTypes = Object.entries(assetTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totaal Assets</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssets}</div>
          <div className="flex space-x-2 mt-2">
            <Badge variant="outline">{ictAssets} ICT</Badge>
            <Badge variant="outline">{facilitairAssets} Facilitair</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toegewezen</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{assignedAssets}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((assignedAssets / totalAssets) * 100)}% van totaal
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Beschikbaar</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{availableAssets}</div>
          <p className="text-xs text-muted-foreground">
            Klaar voor toewijzing
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Defect</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{defectiveAssets}</div>
          <p className="text-xs text-muted-foreground">
            Vereist aandacht
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Asset Verdeling</CardTitle>
          <CardDescription>Top 5 asset types in gebruik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topAssetTypes.map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600">{type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
