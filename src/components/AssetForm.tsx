
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";
import { Asset } from "@/hooks/useAssets";
import { AssetTypeSelector } from "./AssetTypeSelector";
import { LocationSelector } from "./LocationSelector";
import { AssignmentSelector } from "./AssignmentSelector";
import { BarcodeScanner } from "./BarcodeScanner";
import { ImageUpload } from "./ImageUpload";

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (asset: Omit<Asset, "id" | "created_at" | "updated_at" | "created_by">) => void;
  onCancel: () => void;
}

export const AssetForm = ({ asset, onSave, onCancel }: AssetFormProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    status: "In voorraad" as Asset["status"],
    location: "",
    category: "ICT" as Asset["category"],
    assigned_to: "",
    assigned_to_location: "",
    image_url: ""
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type,
        brand: asset.brand || "",
        model: asset.model || "",
        serial_number: asset.serial_number,
        purchase_date: asset.purchase_date,
        status: asset.status,
        location: asset.location,
        category: asset.category,
        assigned_to: asset.assigned_to || "",
        assigned_to_location: asset.assigned_to_location || "",
        image_url: asset.image_url || ""
      });
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBarcodeScanned = (scannedData: string) => {
    console.log("Setting serial number from barcode:", scannedData);
    setFormData({ ...formData, serial_number: scannedData });
    setShowScanner(false);
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
              currentImage={formData.image_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl || "" })}
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
              <Label htmlFor="serial_number">Serienummer</Label>
              <div className="flex gap-2">
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Aankoopdatum</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
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
              specificLocation={formData.assigned_to_location}
              onMainLocationChange={(value) => setFormData({ ...formData, location: value })}
              onSpecificLocationChange={(value) => setFormData({ ...formData, assigned_to_location: value })}
            />

            <AssignmentSelector
              assignedTo={formData.assigned_to}
              onAssignedToChange={(value) => setFormData({ ...formData, assigned_to: value })}
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
