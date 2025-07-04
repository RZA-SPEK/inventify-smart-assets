
import { Badge } from "@/components/ui/badge";
import { Shield, User, Wrench, Settings } from "lucide-react";
import { useUserRole, UserRole as UserRoleType } from "@/hooks/useUserRole";

interface UserRoleProps {
  currentRole?: UserRoleType;
}

export const UserRole = ({ currentRole: propCurrentRole }: UserRoleProps) => {
  const { currentRole: hookCurrentRole, loading } = useUserRole();
  
  // Use props if provided, otherwise use hook
  const currentRole = propCurrentRole || hookCurrentRole;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ICT Admin":
        return <Shield className="h-3 w-3" />;
      case "Facilitair Admin":
        return <Settings className="h-3 w-3" />;
      case "Facilitair Medewerker":
        return <Wrench className="h-3 w-3" />;
      case "Gebruiker":
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ICT Admin":
        return "bg-red-100 text-red-800";
      case "Facilitair Admin":
        return "bg-purple-100 text-purple-800";
      case "Facilitair Medewerker":
        return "bg-blue-100 text-blue-800";
      case "Gebruiker":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "ICT Admin":
        return "Volledige toegang tot alle functies";
      case "Facilitair Admin":
        return "Beheer van facilitaire assets en instellingen";
      case "Facilitair Medewerker":
        return "Beheer van facilitaire assets";
      case "Gebruiker":
        return "Basis toegang en eigen reserveringen";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Huidige rol:</span>
          <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Huidige rol:</span>
        <Badge className={`flex items-center space-x-1 ${getRoleColor(currentRole)}`}>
          {getRoleIcon(currentRole)}
          <span>{currentRole}</span>
        </Badge>
      </div>

      <div className="hidden md:block text-xs text-gray-500 max-w-xs">
        {getRolePermissions(currentRole)}
      </div>
    </div>
  );
};
