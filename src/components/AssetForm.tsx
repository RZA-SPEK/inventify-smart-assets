
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types/asset";
import { AssetFormFields } from "./AssetFormFields";
import { BarcodeScanner } from "./BarcodeScanner";

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (asset: Omit<Asset, "id">) => void;
  onCancel: () => void;
}

export const AssetForm = ({ asset, onSave, onCancel }: AssetFormProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showAssetTagScanner, setShowAssetTagScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'serial' | 'assetTag'>('serial');
  
  // Initialize form data with default values
  const getInitialFormData = useCallback(() => {
    if (asset) {
      return {
        type: asset.type || "",
        brand: asset.brand || "",
        model: asset.model || "",
        serialNumber: asset.serialNumber || "",
        assetTag: asset.assetTag || "",
        purchaseDate: asset.purchaseDate || "",
        status: asset.status || "In voorraad" as Asset["status"],
        location: asset.location || "",
        category: asset.category || "ICT" as Asset["category"],
        assignedTo: asset.assignedTo || "",
        assignedToLocation: asset.assignedToLocation || "",
        image: asset.image || "",
        purchasePrice: asset.purchasePrice?.toString() || "",
        penaltyAmount: asset.penaltyAmount?.toString() || "",
        comments: asset.comments || "",
        reservable: asset.reservable !== undefined ? asset.reservable : true
      };
    }
    
    return {
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
      penaltyAmount: "",
      comments: "",
      reservable: true
    };
  }, [asset]);

  const [formData, setFormData] = useState(getInitialFormData);

  // Update form data when asset changes
  useEffect(() => {
    console.log('AssetForm: Asset changed, updating form data. Asset:', asset);
    const newFormData = getInitialFormData();
    console.log('AssetForm: New form data:', newFormData);
    setFormData(newFormData);
  }, [asset, getInitialFormData]);

  // Use useCallback to prevent unnecessary re-renders
  const updateFormData = useCallback((newData: any) => {
    console.log('AssetForm: updateFormData called with:', newData);
    setFormData(prevData => {
      const updatedData = { ...prevData, ...newData };
      console.log('AssetForm: Form data updated from:', prevData, 'to:', updatedData);
      return updatedData;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AssetForm: Submitting form data:", formData);
    
    // Ensure type is included and not empty
    if (!formData.type || formData.type.trim() === "") {
      console.error("AssetForm: Asset type is required but missing:", formData.type);
      return;
    }
    
    const submitData = {
      type: formData.type,
      brand: formData.brand || "",
      model: formData.model || "",
      serialNumber: formData.serialNumber || undefined,
      assetTag: formData.assetTag || undefined,
      status: formData.status,
      location: formData.location || "",
      category: formData.category,
      assignedTo: formData.assignedTo === "unassigned" ? "" : formData.assignedTo,
      assignedToLocation: formData.assignedToLocation === "unassigned" ? "" : formData.assignedToLocation,
      purchaseDate: formData.purchaseDate || "",
      image: formData.image || undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      penaltyAmount: formData.penaltyAmount ? parseFloat(formData.penaltyAmount) : 0,
      comments: formData.comments || undefined,
      reservable: formData.reservable
    };
    
    console.log("AssetForm: Final submit data:", submitData);
    onSave(submitData);
  };

  const handleBarcodeScanned = (scannedData: string) => {
    console.log("AssetForm: Barcode scanned:", scannedData, "Mode:", scannerMode);
    if (scannerMode === 'serial') {
      updateFormData({ serialNumber: scannedData });
    } else if (scannerMode === 'assetTag') {
      // Handle asset tag scanning - add MVDS prefix if not present
      const processedTag = scannedData.startsWith("MVDS-") ? scannedData : `MVDS-${scannedData}`;
      updateFormData({ assetTag: processedTag });
    }
    setShowScanner(false);
    setShowAssetTagScanner(false);
  };

  const handleShowSerialScanner = () => {
    setScannerMode('serial');
    setShowScanner(true);
  };

  const handleShowAssetTagScanner = () => {
    setScannerMode('assetTag');
    setShowAssetTagScanner(true);
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
    updateFormData({ assetTag: generatedTag });
  };

  console.log('AssetForm: Rendering with form data:', formData);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AssetFormFields
            formData={formData}
            onFormDataChange={updateFormData}
            onShowScanner={handleShowSerialScanner}
            onShowAssetTagScanner={handleShowAssetTagScanner}
            onGenerateAssetTag={generateAssetTag}
          />

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Annuleren
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {asset ? "Bijwerken" : "Toevoegen"}
            </Button>
          </div>
        </form>
      </div>

      {(showScanner || showAssetTagScanner) && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => {
            setShowScanner(false);
            setShowAssetTagScanner(false);
          }}
        />
      )}
    </>
  );
};
