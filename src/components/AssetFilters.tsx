
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssetFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
}

export const AssetFilters = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange
}: AssetFiltersProps) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
      <Input
        placeholder="Zoek assets..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-64"
      />
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            <SelectItem value="In gebruik">In gebruik</SelectItem>
            <SelectItem value="In voorraad">In voorraad</SelectItem>
            <SelectItem value="Defect">Defect</SelectItem>
            <SelectItem value="Onderhoud">Onderhoud</SelectItem>
            <SelectItem value="Deleted">Verwijderd</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            <SelectItem value="ICT">ICT</SelectItem>
            <SelectItem value="Facilitair">Facilitair</SelectItem>
            <SelectItem value="Catering">Catering</SelectItem>
            <SelectItem value="Logistics">Logistiek</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
