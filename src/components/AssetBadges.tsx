
import { Badge } from "@/components/ui/badge";

interface AssetBadgesProps {
  status: string;
  category: string;
  getStatusColor: (status: string) => string;
  getCategoryDisplayName: (category: string) => string;
}

export const AssetBadges = ({ status, category, getStatusColor, getCategoryDisplayName }: AssetBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <Badge className={getStatusColor(status)}>
        {status === "Deleted" ? "Verwijderd" : status}
      </Badge>
      <Badge variant="outline">
        {getCategoryDisplayName(category)}
      </Badge>
    </div>
  );
};
