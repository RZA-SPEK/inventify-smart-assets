
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Wrench } from "lucide-react";

interface UserRoleProps {
  currentRole: "ICT Admin" | "Facilitair Medewerker" | "Gebruiker";
  onRoleChange: (role: "ICT Admin" | "Facilitair Medewerker" | "Gebruiker") => void;
}

export const UserRole = ({ currentRole, onRoleChange }: UserRoleProps) => {
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
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Rol:</span>
        <Badge className={`flex items-center space-x-1 ${getRoleColor(currentRole)}`}>
          {getRoleIcon(currentRole)}
          <span>{currentRole}</span>
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Simulatie:</span>
        <Select value={currentRole} onValueChange={onRoleChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ICT Admin">
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3" />
                <span>ICT Admin</span>
              </div>
            </SelectItem>
            <SelectItem value="Facilitair Medewerker">
              <div className="flex items-center space-x-2">
                <Wrench className="h-3 w-3" />
                <span>Facilitair Medewerker</span>
              </div>
            </SelectItem>
            <SelectItem value="Gebruiker">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span>Gebruiker</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
