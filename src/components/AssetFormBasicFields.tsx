
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@/types/asset";
import { AssetTypeSelector } from "./AssetTypeSelector";

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
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AssetTypeSelector
          value={formData.type}
          onChange={(value) => onFormDataChange({ ...formData, type: value })}
        />

        <div className="space-y-2">
          <Label htmlFor="category">Categorie</Label>
          <Select value={formData.category} onValueChange={(value: Asset["category"]) => onFormDataChange({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ICT">ICT</SelectItem>
              <SelectItem value="Facilitair">Facilitair</SelectItem>
              <SelectItem value="Catering">Catering</SelectItem>
              <SelectItem value="Logistics">Logistiek</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Merk (optioneel)</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => onFormDataChange({ ...formData, brand: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model (optioneel)</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => onFormDataChange({ ...formData, model: e.target.value })}
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In voorraad">In voorraad</SelectItem>
              <SelectItem value="In gebruik">In gebruik</SelectItem>
              <SelectItem value="Defect">Defect</SelectItem>
              <SelectItem value="Onderhoud">Onderhoud</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
