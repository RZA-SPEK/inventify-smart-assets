import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { Asset } from "@/types/asset";
interface AssetFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  typeFilter: string;
  setSearchTerm: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setCategoryFilter: (value: string) => void;
  setTypeFilter: (value: string) => void;
  assets: Asset[];
}
export const AssetFilters = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  typeFilter,
  setSearchTerm,
  setStatusFilter,
  setCategoryFilter,
  setTypeFilter,
  assets
}: AssetFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all" || typeFilter !== "all" || searchTerm !== "";
  const onClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTypeFilter('all');
  };

  // Get unique asset types from the assets
  const assetTypes = Array.from(new Set(assets.map(asset => asset.type).filter(Boolean)));
  return (
    <div className="card-elevated responsive-padding">
      <div className="space-y-4">
        {/* Primary search bar - always visible */}
        <div className="flex flex-col sm:flex-row responsive-gap">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Zoek in alle velden (type, merk, model, serienummer, asset tag, locatie...)" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 w-full" 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="whitespace-nowrap hover:bg-accent"
            >
              {isExpanded ? "Minder filters" : "Meer filters"}
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters} 
                className="flex items-center gap-1 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Wis filters</span>
              </Button>
            )}
          </div>
        </div>

        {/* Advanced filters - collapsible */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 responsive-gap p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <label className="text-sm font-medium text-foreground">Categorie</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              <label className="text-sm font-medium text-foreground">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Alle types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle types</SelectItem>
                  {assetTypes.map(type => (
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
                className="w-full flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive"
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
            <span className="text-muted-foreground font-medium">Actieve filters:</span>
            {searchTerm && (
              <span className="status-badge bg-primary text-primary-foreground">
                Zoekterm: "{searchTerm}"
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="status-badge status-in-use">
                Status: {statusFilter}
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="status-badge bg-accent text-accent-foreground">
                Categorie: {categoryFilter}
              </span>
            )}
            {typeFilter !== "all" && (
              <span className="status-badge bg-secondary text-secondary-foreground">
                Type: {typeFilter}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};