import { Card } from "@/components/ui/card";
import { Asset } from "@/types/asset";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  TrendingUp,
  DollarSign
} from "lucide-react";

interface AssetStatsCardsProps {
  assets: Asset[];
}

export const AssetStatsCards = ({ assets }: AssetStatsCardsProps) => {
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'In voorraad').length;
  const inUseAssets = assets.filter(a => a.status === 'In gebruik').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Onderhoud' || a.status === 'Defect').length;
  const reservableAssets = assets.filter(a => a.reservable).length;
  
  const totalValue = assets.reduce((sum, asset) => {
    return sum + (asset.purchasePrice || 0);
  }, 0);

  const stats = [
    {
      title: "Totaal Assets",
      value: totalAssets.toString(),
      icon: Package,
      change: "+2.1%",
      changeType: "positive" as const,
      color: "bg-blue-500"
    },
    {
      title: "Beschikbaar",
      value: availableAssets.toString(),
      icon: CheckCircle,
      change: `${Math.round((availableAssets / totalAssets) * 100)}%`,
      changeType: "neutral" as const,
      color: "bg-green-500"
    },
    {
      title: "In Gebruik",
      value: inUseAssets.toString(),
      icon: Users,
      change: `${Math.round((inUseAssets / totalAssets) * 100)}%`,
      changeType: "neutral" as const,
      color: "bg-orange-500"
    },
    {
      title: "Onderhoud",
      value: maintenanceAssets.toString(),
      icon: AlertTriangle,
      change: maintenanceAssets > 5 ? "Hoog" : "Normaal",
      changeType: maintenanceAssets > 5 ? "negative" : "positive" as const,
      color: "bg-red-500"
    },
    {
      title: "Reserveerbaar",
      value: reservableAssets.toString(),
      icon: TrendingUp,
      change: `${Math.round((reservableAssets / totalAssets) * 100)}%`,
      changeType: "positive" as const,
      color: "bg-purple-500"
    },
    {
      title: "Totale Waarde",
      value: `€${totalValue.toLocaleString()}`,
      icon: DollarSign,
      change: "+5.4%",
      changeType: "positive" as const,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 responsive-gap mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="card-elevated hover:shadow-lg transition-all duration-200 cursor-pointer">
          <div className="responsive-padding">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};