
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
  return (
    <>
      <ImageUpload
        currentImage={formData.image}
        onImageChange={(imageUrl) => onFormDataChange({ ...formData, image: imageUrl || "" })}
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
