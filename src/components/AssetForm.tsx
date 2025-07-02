
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Tag } from "lucide-react";
import { Asset } from "@/pages/Index";
import { AssetTypeSelector } from "./AssetTypeSelector";
import { LocationSelector } from "./LocationSelector";
import { AssignmentSelector } from "./AssignmentSelector";
import { BarcodeScanner } from "./BarcodeScanner";
import { ImageUpload } from "./ImageUpload";

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (asset: Omit<Asset, "id">) => void;
  onCancel: () => void;
}

export const AssetForm = ({ asset, onSave, onCancel }: AssetFormProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    assetTag: "",
    purchaseDate: "",
    status: "In voorraad" as Asset["status"],
    location: "",
    category: "ICT" as Asset["category"],
    assignedTo: "",
    assignedToLocation: "",
    image: ""
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type,
        brand: asset.brand || "",
        model: asset.model || "",
        serialNumber: asset.serialNumber,
        assetTag: asset.assetTag || "",
        purchaseDate: asset.purchaseDate,
        status: asset.status,
        location: asset.location,
        category: asset.category,
        assignedTo: asset.assignedTo || "",
        assignedToLocation: asset.assignedToLocation || "",
        image: asset.image || ""
      });
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert "unassigned" back to empty string for consistency with existing data structure
    const submitData = {
      ...formData,
      assignedTo: formData.assignedTo === "unassigned" ? "" : formData.assignedTo,
      assignedToLocation: formData.assignedToLocation === "unassigned" ? "" : formData.assignedToLocation,
      image: formData.image || undefined,
      assetTag: formData.assetTag || undefined
    };
    onSave(submitData);
  };

  const handleBarcodeScanned = (scannedData: string) => {
    console.log("Setting serial number from barcode:", scannedData);
    setFormData({ ...formData, serialNumber: scannedData });
    setShowScanner(false);
  };

  const handleAssetTagChange = (value: string) => {
    // If user starts typing without prefix and it's not empty, add MVDS- prefix
    if (value && !value.startsWith("MVDS-") && value !== "MVDS-") {
      setFormData({ ...formData, assetTag: "MVDS-" + value });
    } else {
      setFormData({ ...formData, assetTag: value });
    }
  };

  const generateAssetTag = () => {
    // Generate a simple asset tag based on category and current timestamp
    const prefix = "MVDS-";
    const categoryCode = formData.category === "ICT" ? "ICT" : "FAC";
    const timestamp = Date.now().toString().slice(-4);
    const generatedTag = `${prefix}${categoryCode}${timestamp}`;
    setFormData({ ...formData, assetTag: generatedTag });
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {asset ? "Asset Bewerken" : "Nieuw Asset Toevoegen"}
            </DialogTitle>
            <DialogDescription>
              Vul de gegevens van het asset in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={formData.image}
              onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl || "" })}
            />

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
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Scan
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag (optioneel)</Label>
              <div className="flex gap-2">
                <Input
                  id="assetTag"
                  value={formData.assetTag}
                  onChange={(e) => handleAssetTagChange(e.target.value)}
                  placeholder="MVDS-XXX123 of laat leeg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAssetTag}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Genereer
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Voer een asset tag in met optioneel MVDS- prefix, of klik op "Genereer" voor automatische tag
              </p>
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

            <LocationSelector
              mainLocation={formData.location}
              specificLocation={formData.assignedToLocation}
              onMainLocationChange={(value) => setFormData({ ...formData, location: value })}
              onSpecificLocationChange={(value) => setFormData({ ...formData, assignedToLocation: value })}
            />

            <AssignmentSelector
              assignedTo={formData.assignedTo}
              onAssignedToChange={(value) => setFormData({ ...formData, assignedTo: value })}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuleren
              </Button>
              <Button type="submit">
                {asset ? "Bijwerken" : "Toevoegen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};
