import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Download, 
  Upload, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Archive,
  Copy
} from "lucide-react";
import { Asset } from "@/types/asset";
import { useState } from "react";

interface AssetQuickActionsProps {
  selectedAssets: string[];
  onSelectAsset: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  allSelected: boolean;
  assets: Asset[];
  canManageAssets: boolean;
  onBulkDelete: (ids: string[]) => void;
  onBulkArchive: (ids: string[]) => void;
  onExportSelected: (ids: string[]) => void;
}

export const AssetQuickActions = ({
  selectedAssets,
  onSelectAsset,
  onSelectAll,
  allSelected,
  assets,
  canManageAssets,
  onBulkDelete,
  onBulkArchive,
  onExportSelected
}: AssetQuickActionsProps) => {
  const hasSelection = selectedAssets.length > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
      <div className="flex items-center gap-4">
        {canManageAssets && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={onSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Selecteer alle ({assets.length})
            </label>
          </div>
        )}
        
        {hasSelection && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedAssets.length} geselecteerd
            </span>
            <div className="h-4 w-px bg-border"></div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasSelection && canManageAssets && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportSelected(selectedAssets)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporteer ({selectedAssets.length})
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Bulk acties
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onBulkArchive(selectedAssets)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archiveer geselecteerde
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onBulkDelete(selectedAssets)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Verwijder geselecteerde
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        
        {!hasSelection && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporteer alle
            </Button>
            
            {canManageAssets && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importeer
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};