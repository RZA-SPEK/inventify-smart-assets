
import { Asset } from "@/types/asset";
import { ImageUpload } from "./ImageUpload";
import { LocationSelector } from "./LocationSelector";
import { AssignmentSelector } from "./AssignmentSelector";
import { AssetFormBasicFields } from "./AssetFormBasicFields";
import { AssetFormIdentificationFields } from "./AssetFormIdentificationFields";
import { AssetFormPriceFields } from "./AssetFormPriceFields";

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
  onShowAssetTagScanner: () => void;
  onGenerateAssetTag: () => void;
}

export const AssetFormFields = ({ 
  formData, 
  onFormDataChange, 
  onShowScanner,
  onShowAssetTagScanner,
  onGenerateAssetTag 
}: AssetFormFieldsProps) => {
  // Helper function to update individual fields while preserving other data
  const handleFieldChange = (field: string, value: any) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <>
      <ImageUpload
        currentImage={formData.image}
        onImageChange={(imageUrl) => handleFieldChange('image', imageUrl || "")}
      />

      <AssetFormBasicFields
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      <AssetFormIdentificationFields
        formData={formData}
        onFormDataChange={onFormDataChange}
        onShowScanner={onShowScanner}
        onShowAssetTagScanner={onShowAssetTagScanner}
        onGenerateAssetTag={onGenerateAssetTag}
      />

      <AssetFormPriceFields
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      <LocationSelector
        mainLocation={formData.location}
        specificLocation={formData.assignedToLocation}
        onMainLocationChange={(value) => handleFieldChange('location', value)}
        onSpecificLocationChange={(value) => handleFieldChange('assignedToLocation', value)}
      />

      <AssignmentSelector
        assignedTo={formData.assignedTo}
        onAssignedToChange={(value) => handleFieldChange('assignedTo', value)}
      />
    </>
  );
};
