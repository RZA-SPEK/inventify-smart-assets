
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface AssetFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  typeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onClearFilters: () => void;
  assetTypes: string[];
}

export const AssetFilters = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTypeFilterChange,
  onClearFilters,
  assetTypes
}: AssetFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all" || typeFilter !== "all" || searchTerm !== "";

  return (
    <div className="space-y-4">
      {/* Primary search bar - always visible */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Zoek in alle velden (type, merk, model, serienummer, asset tag, locatie, toegewezen aan...)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="whitespace-nowrap"
          >
            {isExpanded ? "Minder filters" : "Meer filters"}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">Wis filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters - collapsible */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alle statussen" />
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categorie</label>
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-full">
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full">
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

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Alle filters wissen
            </Button>
          </div>
        </div>
      )}

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-600">Actieve filters:</span>
          {searchTerm && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Zoekterm: "{searchTerm}"
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Status: {statusFilter}
            </span>
          )}
          {categoryFilter !== "all" && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Categorie: {categoryFilter}
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
              Type: {typeFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
