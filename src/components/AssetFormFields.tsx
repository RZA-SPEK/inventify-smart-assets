
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Camera, Tag } from "lucide-react";
import { Asset } from "@/pages/Index";
import { AssetTypeSelector } from "./AssetTypeSelector";
import { LocationSelector } from "./LocationSelector";
import { AssignmentSelector } from "./AssignmentSelector";
import { ImageUpload } from "./ImageUpload";

interface AssetFormFieldsProps {
  formData: {
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    assetTag: string;
    purchaseDate: string;
    status: Asset["status"];
    location: string;
    category: Asset["category"];
    assignedTo: string;
    assignedToLocation: string;
    image: string;
    purchasePrice: string;
    penaltyAmount: string;
  };
  onFormDataChange: (data: any) => void;
  onShowScanner: () => void;
  onGenerateAssetTag: () => void;
}

export const AssetFormFields = ({ 
  formData, 
  onFormDataChange, 
  onShowScanner, 
  onGenerateAssetTag 
}: AssetFormFieldsProps) => {
  const handleAssetTagChange = (value: string) => {
    if (value && !value.startsWith("MVDS-") && value !== "MVDS-") {
      onFormDataChange({ ...formData, assetTag: "MVDS-" + value });
    } else {
      onFormDataChange({ ...formData, assetTag: value });
    }
  };

  const handlePriceChange = (field: 'purchasePrice' | 'penaltyAmount', value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    onFormDataChange({ ...formData, [field]: numericValue });
  };

  return (
    <>
      <ImageUpload
        currentImage={formData.image}
        onImageChange={(imageUrl) => onFormDataChange({ ...formData, image: imageUrl || "" })}
      />

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

      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serienummer</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => onFormDataChange({ ...formData, serialNumber: e.target.value })}
            required
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShowScanner}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Camera className="h-4 w-4" />
            <span>Scan</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assetTag">Asset Tag (optioneel)</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="assetTag"
            value={formData.assetTag}
            onChange={(e) => handleAssetTagChange(e.target.value)}
            placeholder="MVDS-XXX123 of laat leeg"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateAssetTag}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Tag className="h-4 w-4" />
            <span>Genereer</span>
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Voer een asset tag in met optioneel MVDS- prefix, of klik op "Genereer" voor automatische tag
        </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Aankoopprijs (€)</Label>
          <Input
            id="purchasePrice"
            type="text"
            value={formData.purchasePrice}
            onChange={(e) => handlePriceChange('purchasePrice', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="penaltyAmount">Boete bij verlies/schade (€)</Label>
          <Input
            id="penaltyAmount"
            type="text"
            value={formData.penaltyAmount}
            onChange={(e) => handlePriceChange('penaltyAmount', e.target.value)}
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500">
            Bedrag dat gebruiker moet betalen bij verlies of schade
          </p>
        </div>
      </div>

      <LocationSelector
        mainLocation={formData.location}
        specificLocation={formData.assignedToLocation}
        onMainLocationChange={(value) => onFormDataChange({ ...formData, location: value })}
        onSpecificLocationChange={(value) => onFormDataChange({ ...formData, assignedToLocation: value })}
      />

      <AssignmentSelector
        assignedTo={formData.assignedTo}
        onAssignedToChange={(value) => onFormDataChange({ ...formData, assignedTo: value })}
      />
    </>
  );
};
