
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Asset } from "@/pages/Index";
import { AssetTypeSelector } from "./AssetTypeSelector";

interface AssetFormFieldsProps {
  formData: {
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    status: Asset["status"];
    category: Asset["category"];
  };
  setFormData: (data: any) => void;
  onScannerOpen: () => void;
}

export const AssetFormFields = ({ formData, setFormData, onScannerOpen }: AssetFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <AssetTypeSelector
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value })}
        />

        <div className="space-y-2">
          <Label htmlFor="category">Categorie</Label>
          <Select value={formData.category} onValueChange={(value: "ICT" | "Facilitair") => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ICT">ICT</SelectItem>
              <SelectItem value="Facilitair">Facilitair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Merk (optioneel)</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model (optioneel)</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serienummer</Label>
        <div className="flex gap-2">
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onScannerOpen}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Scan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Aankoopdatum</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: Asset["status"]) => setFormData({ ...formData, status: value })}>
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
