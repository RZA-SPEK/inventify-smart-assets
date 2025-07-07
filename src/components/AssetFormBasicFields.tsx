
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@/types/asset";
import { AssetTypeSelector } from "./AssetTypeSelector";
import { useSettings } from "@/hooks/useSettings";

interface AssetFormBasicFieldsProps {
  formData: {
    type: string;
    brand: string;
    model: string;
    category: Asset["category"];
    purchaseDate: string;
    status: Asset["status"];
  };
  onFormDataChange: (data: any) => void;
}

export const AssetFormBasicFields = ({ formData, onFormDataChange }: AssetFormBasicFieldsProps) => {
  const { settings } = useSettings();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Asset Type</Label>
          <Select value={formData.type} onValueChange={(value) => onFormDataChange({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer asset type" />
            </SelectTrigger>
            <SelectContent>
              {settings.assetTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categorie</Label>
          <Select value={formData.category} onValueChange={(value: Asset["category"]) => onFormDataChange({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer categorie" />
            </SelectTrigger>
            <SelectContent>
              {settings.categories.map((category) => (
                <SelectItem key={category} value={category as Asset["category"]}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Merk</Label>
          <Select value={formData.brand} onValueChange={(value) => onFormDataChange({ ...formData, brand: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer merk" />
            </SelectTrigger>
            <SelectContent>
              {settings.brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model (optioneel)</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => onFormDataChange({ ...formData, model: e.target.value })}
            placeholder="Voer model in"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Aankoopdatum</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => onFormDataChange({ ...formData, purchaseDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: Asset["status"]) => onFormDataChange({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer status" />
            </SelectTrigger>
            <SelectContent>
              {settings.statuses.map((status) => (
                <SelectItem key={status} value={status as Asset["status"]}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
