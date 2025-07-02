
import { Button } from "@/components/ui/button";
import { Plus, Activity } from "lucide-react";
import { UserRole } from "@/components/UserRole";

interface PageHeaderProps {
  currentRole: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  onRoleChange: (role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker") => void;
  onAddAsset: () => void;
}

export const PageHeader = ({ currentRole, onRoleChange, onAddAsset }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
        <p className="text-gray-600 mt-2">Manage and track your organization's assets</p>
      </div>
      <div className="flex gap-2">
        <UserRole 
          currentRole={currentRole}
          onRoleChange={onRoleChange}
        />
        {currentRole === 'ICT Admin' && (
          <Button 
            onClick={() => window.location.href = '/activity-log'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Activity Log
          </Button>
        )}
        <Button 
          onClick={onAddAsset}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>
    </div>
  );
};
