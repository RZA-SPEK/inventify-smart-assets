
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export const UserFilters = ({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange
}: UserFiltersProps) => {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Zoek gebruikers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="w-full sm:w-48">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter op rol" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">Alle rollen</SelectItem>
            <SelectItem value="ICT Admin">ICT Admin</SelectItem>
            <SelectItem value="Facilitair Admin">Facilitair Admin</SelectItem>
            <SelectItem value="Gebruiker">Gebruiker</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-48">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter op status" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">Alle statussen</SelectItem>
            <SelectItem value="active">Actief</SelectItem>
            <SelectItem value="inactive">Inactief</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
