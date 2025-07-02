
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Asset } from "@/pages/Index";
import { AssetFormFields } from "./AssetFormFields";
import { BarcodeScanner } from "./BarcodeScanner";

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
    image: "",
    purchasePrice: "",
    penaltyAmount: ""
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
        image: asset.image || "",
        purchasePrice: asset.purchasePrice?.toString() || "",
        penaltyAmount: asset.penaltyAmount?.toString() || ""
      });
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      assignedTo: formData.assignedTo === "unassigned" ? "" : formData.assignedTo,
      assignedToLocation: formData.assignedToLocation === "unassigned" ? "" : formData.assignedToLocation,
      image: formData.image || undefined,
      assetTag: formData.assetTag || undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      penaltyAmount: formData.penaltyAmount ? parseFloat(formData.penaltyAmount) : undefined
    };
    onSave(submitData);
  };

  const handleBarcodeScanned = (scannedData: string) => {
    console.log("Setting serial number from barcode:", scannedData);
    setFormData({ ...formData, serialNumber: scannedData });
    setShowScanner(false);
  };

  const generateAssetTag = () => {
    const prefix = "MVDS-";
    let baseNumber: number;
    
    if (formData.category === "ICT") {
      baseNumber = 50001;
    } else if (formData.category === "Facilitair") {
      baseNumber = 1;
    } else if (formData.category === "Catering") {
      baseNumber = 60001;
    } else if (formData.category === "Logistics") {
      baseNumber = 70001;
    } else {
      baseNumber = 1;
    }
    
    const randomOffset = Math.floor(Math.random() * 100);
    const finalNumber = baseNumber + randomOffset;
    
    let formattedNumber: string;
    if (formData.category === "ICT") {
      formattedNumber = finalNumber.toString();
    } else {
      formattedNumber = finalNumber.toString().padStart(5, '0');
    }
    
    const generatedTag = `${prefix}${formattedNumber}`;
    setFormData({ ...formData, assetTag: generatedTag });
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {asset ? "Asset Bewerken" : "Nieuw Asset Toevoegen"}
            </DialogTitle>
            <DialogDescription>
              Vul de gegevens van het asset in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AssetFormFields
              formData={formData}
              onFormDataChange={setFormData}
              onShowScanner={() => setShowScanner(true)}
              onGenerateAssetTag={generateAssetTag}
            />

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Annuleren
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
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
