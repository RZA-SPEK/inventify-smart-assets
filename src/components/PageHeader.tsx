
import { Button } from "@/components/ui/button";
import { Plus, Activity } from "lucide-react";
import { UserRole } from "@/components/UserRole";

interface PageHeaderProps {
  currentRole: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  onRoleChange: (role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker") => void;
  onAddAsset: () => void;
}

export const PageHeader = ({ currentRole, onRoleChange, onAddAsset }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Beheer en volg al je bedrijfsmiddelen op één plek
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <UserRole currentRole={currentRole} onRoleChange={onRoleChange} />
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/activity-log")}
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Activity Log</span>
            </Button>
            
            {(currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/reservations")}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserveringen</span>
                </Button>
                
                <Button
                  onClick={onAddAsset}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Asset Toevoegen</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
