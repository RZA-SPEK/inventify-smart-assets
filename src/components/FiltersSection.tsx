
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { AssetFilters } from "@/components/AssetFilters";

interface FiltersSectionProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  typeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onShowBarcodeScanner: () => void;
}

export const FiltersSection = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTypeFilterChange,
  onShowBarcodeScanner
}: FiltersSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          <AssetFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            typeFilter={typeFilter}
            onSearchChange={onSearchChange}
            onStatusFilterChange={onStatusFilterChange}
            onCategoryFilterChange={onCategoryFilterChange}
            onTypeFilterChange={onTypeFilterChange}
          />
          <Button
            variant="outline"
            onClick={onShowBarcodeScanner}
          >
            <Search className="mr-2 h-4 w-4" />
            Scan Barcode
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
