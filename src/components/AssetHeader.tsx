
import { Button } from "@/components/ui/button";
import { Calendar, History } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { Link } from "react-router-dom";

interface AssetHeaderProps {
  onShowUserReservations: () => void;
}

export const AssetHeader = ({ onShowUserReservations }: AssetHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asset Management</h1>
        <p className="text-gray-600 mt-1">Beheer alle bedrijfsassets op één plek</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <NotificationCenter />
        <Button
          onClick={onShowUserReservations}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Mijn Reserveringen</span>
        </Button>
        <Link to="/activity">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Activiteit</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
