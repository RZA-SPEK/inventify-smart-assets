
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Wrench } from "lucide-react";

interface UserRoleProps {
  role: string;
}

export const UserRole = ({ role }: UserRoleProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ICT Admin":
        return <Shield className="h-3 w-3" />;
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
      case "Facilitair Medewerker":
        return "bg-blue-100 text-blue-800";
      case "Gebruiker":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-600">Rol:</span>
      <Badge className={`flex items-center space-x-1 ${getRoleColor(role)}`}>
        {getRoleIcon(role)}
        <span>{role}</span>
      </Badge>
    </div>
  );
};
