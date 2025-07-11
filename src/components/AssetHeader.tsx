
import { Button } from "@/components/ui/button";
import { Calendar, History, Plus } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asset Management</h1>
        <p className="text-gray-600 mt-1">
          {filteredAssets} van {totalAssets} assets weergegeven
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <NotificationCenter />
        {canManageAssets && (
          <Button
            onClick={onCreateAsset}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nieuw Asset</span>
          </Button>
        )}
        <Link to="/activity-log">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Activiteit</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
