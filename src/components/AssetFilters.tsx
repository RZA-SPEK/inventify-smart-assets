
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface AssetFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  currentRole: "ICT Admin" | "Facilitair Medewerker" | "Gebruiker";
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onAddAsset: () => void;
}

export const AssetFilters = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  currentRole,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onAddAsset
}: AssetFiltersProps) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <Input
          placeholder="Zoek assets..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="md:w-64"
        />
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            <SelectItem value="In gebruik">In gebruik</SelectItem>
            <SelectItem value="In voorraad">In voorraad</SelectItem>
            <SelectItem value="Defect">Defect</SelectItem>
            <SelectItem value="Onderhoud">Onderhoud</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            <SelectItem value="ICT">ICT</SelectItem>
            <SelectItem value="Facilitair">Facilitair</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker") && (
        <Button onClick={onAddAsset} className="flex items-center space-x-2">
          <PlusCircle className="h-4 w-4" />
          <span>Asset Toevoegen</span>
        </Button>
      )}
    </div>
  );
};
