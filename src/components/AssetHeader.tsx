
import { Button } from "@/components/ui/button";
import { Calendar, History, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface AssetHeaderProps {
  canManageAssets: boolean;
  onCreateAsset: () => void;
  totalAssets: number;
  filteredAssets: number;
}

export const AssetHeader = ({ 
  canManageAssets, 
  onCreateAsset, 
  totalAssets, 
  filteredAssets 
}: AssetHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center responsive-gap-lg mb-8">
      <div className="space-y-2">
        <h1 className="page-header">Asset Management</h1>
        <div className="flex items-center gap-2">
          <span className="status-badge status-available">
            {filteredAssets} van {totalAssets} assets
          </span>
          {filteredAssets !== totalAssets && (
            <span className="text-sm text-muted-foreground">
              (gefilterd)
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center responsive-gap">
        {canManageAssets && (
          <Button
            onClick={onCreateAsset}
            size="lg"
            className="gradient-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nieuw Asset</span>
          </Button>
        )}
        <Link to="/activity-log">
          <Button variant="outline" size="lg" className="flex items-center gap-2 hover:bg-accent">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Activiteit</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
