
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Tag, ScanBarcode } from "lucide-react";

interface AssetFormIdentificationFieldsProps {
  formData: {
    serialNumber: string;
    assetTag: string;
  };
  onFormDataChange: (data: any) => void;
  onShowScanner: () => void;
  onShowAssetTagScanner: () => void;
  onGenerateAssetTag: () => void;
}

export const AssetFormIdentificationFields = ({ 
  formData, 
  onFormDataChange, 
  onShowScanner,
  onShowAssetTagScanner,
  onGenerateAssetTag 
}: AssetFormIdentificationFieldsProps) => {
  const handleAssetTagChange = (value: string) => {
    if (value && !value.startsWith("MVDS-") && value !== "MVDS-") {
      onFormDataChange({ ...formData, assetTag: "MVDS-" + value });
    } else {
      onFormDataChange({ ...formData, assetTag: value });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serienummer (optioneel)</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => onFormDataChange({ ...formData, serialNumber: e.target.value })}
            className="flex-1"
            placeholder="Voer serienummer in of scan"
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onShowAssetTagScanner}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ScanBarcode className="h-4 w-4" />
              <span>Scan</span>
            </Button>
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
        </div>
        <p className="text-xs text-gray-500">
          Voer een asset tag in met optioneel MVDS- prefix, scan de barcode, of klik op "Genereer" voor automatische tag
        </p>
      </div>
    </>
  );
};
