
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface AssetFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  typeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
}

export const AssetFilters = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTypeFilterChange
}: AssetFiltersProps) => {
  const assetTypes = [
    "Laptop", "Desktop", "Monitor", "Telefoon", "Tablet", "Headset", "Muis", "Toetsenbord",
    "Kabel", "Printer", "Scanner", "Router", "Switch", "Beamer", "Camera", "Bureau", "Stoel",
    "Kast", "Koffiezetapparaat", "Magnetron", "Koelkast", "Vaatwasser", "Vorkheftruck",
    "Trolley", "Weegschaal", "Scanner"
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Zoek in alle velden..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Alle statussen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle statussen</SelectItem>
          <SelectItem value="In voorraad">In voorraad</SelectItem>
          <SelectItem value="In gebruik">In gebruik</SelectItem>
          <SelectItem value="Defect">Defect</SelectItem>
          <SelectItem value="Onderhoud">Onderhoud</SelectItem>
          <SelectItem value="Deleted">Verwijderd</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Alle categorieën" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle categorieën</SelectItem>
          <SelectItem value="ICT">ICT</SelectItem>
          <SelectItem value="Facilitair">Facilitair</SelectItem>
          <SelectItem value="Catering">Catering</SelectItem>
          <SelectItem value="Logistics">Logistiek</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Alle types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle types</SelectItem>
          {assetTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
