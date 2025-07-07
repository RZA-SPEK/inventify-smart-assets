
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Calendar, AlertTriangle } from "lucide-react";
import { Asset } from "@/types/asset";

interface DashboardStatsProps {
  assets: Asset[];
}

export const DashboardStats = ({ assets }: DashboardStatsProps) => {
  const totalAssets = assets.length;
  const availableAssets = assets.filter(asset => asset.status === "In voorraad").length;
  const assignedAssets = assets.filter(asset => asset.status === "In gebruik").length;
  const maintenanceAssets = assets.filter(asset => asset.status === "Onderhoud").length;

  const stats = [
    {
      title: "Totaal Assets",
      value: totalAssets,
      description: "Alle geregistreerde assets",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Beschikbaar",
      value: availableAssets,
      description: "Klaar voor gebruik",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "In Gebruik",
      value: assignedAssets,
      description: "Momenteel toegewezen",
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: "Onderhoud",
      value: maintenanceAssets,
      description: "Vereist aandacht",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <CardDescription className="text-xs text-muted-foreground">
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
