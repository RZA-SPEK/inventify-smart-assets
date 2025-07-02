
import { Button } from "@/components/ui/button";
import { Plus, Activity, Calendar } from "lucide-react";
import { UserRole } from "@/components/UserRole";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  currentRole: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  onRoleChange: (role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker") => void;
  onAddAsset: () => void;
}

export const PageHeader = ({ currentRole, onRoleChange, onAddAsset }: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  console.log("PageHeader - Current role:", currentRole);
  console.log("PageHeader - Should show admin buttons:", currentRole === "ICT Admin" || currentRole === "Facilitair Admin");
  console.log("PageHeader - Should show Facilitair buttons:", currentRole === "Facilitair Medewerker");

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
              onClick={() => handleNavigation("/activity-log")}
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Activity Log</span>
            </Button>
            
            {/* Only ICT Admin and Facilitair Admin should see these buttons */}
            {(currentRole === "ICT Admin" || currentRole === "Facilitair Admin") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/reservations")}
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

            {/* Facilitair Medewerker should only see reservations button, not add asset */}
            {currentRole === "Facilitair Medewerker" && (
              <Button
                variant="outline"
                onClick={() => handleNavigation("/reservations")}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserveringen</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
