
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Asset } from "@/pages/Index";
import { LocationSelector } from "./LocationSelector";
import { AssignmentSelector } from "./AssignmentSelector";
import { BarcodeScanner } from "./BarcodeScanner";
import { ImageUpload } from "./ImageUpload";
import { PresetSelector } from "./PresetSelector";
import { AssetFormFields } from "./AssetFormFields";

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (asset: Omit<Asset, "id">) => void;
  onCancel: () => void;
}

export const AssetForm = ({ asset, onSave, onCancel }: AssetFormProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(!asset);
  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
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
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        status: asset.status,
        location: asset.location,
        category: asset.category,
        assignedTo: asset.assignedTo || "",
        assignedToLocation: asset.assignedToLocation || "",
        image: asset.image || ""
      });
      setShowPresetSelector(false);
    }
  }, [asset]);

  const handlePresetSelect = (preset: { type: string; category: "ICT" | "Facilitair"; prefix: string }) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    setFormData({
      ...formData,
      type: preset.type,
      category: preset.category,
      serialNumber: `${preset.prefix}${randomNumber}`,
      purchaseDate: currentDate
    });
    setShowPresetSelector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      assignedTo: formData.assignedTo === "unassigned" ? "" : formData.assignedTo,
      assignedToLocation: formData.assignedToLocation === "unassigned" ? "" : formData.assignedToLocation,
      image: formData.image || undefined
    };
    onSave(submitData);
  };

  const handleBarcodeScanned = (scannedData: string) => {
    console.log("Setting serial number from barcode:", scannedData);
    setFormData({ ...formData, serialNumber: scannedData });
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
              {showPresetSelector ? "Selecteer een preset of voer handmatig in." : "Vul de gegevens van het asset in."}
            </DialogDescription>
          </DialogHeader>

          {showPresetSelector ? (
            <PresetSelector
              onPresetSelect={handlePresetSelect}
              onSkip={() => setShowPresetSelector(false)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                currentImage={formData.image}
                onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl || "" })}
              />

              <AssetFormFields
                formData={formData}
                setFormData={setFormData}
                onScannerOpen={() => setShowScanner(true)}
              />

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
          )}
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
