
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AssetFormPriceFieldsProps {
  formData: {
    purchasePrice: string;
    penaltyAmount: string;
  };
  onFormDataChange: (data: any) => void;
}

export const AssetFormPriceFields = ({ formData, onFormDataChange }: AssetFormPriceFieldsProps) => {
  const handlePriceChange = (field: 'purchasePrice' | 'penaltyAmount', value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    console.log(`Updating ${field} with value:`, numericValue);
    onFormDataChange({ [field]: numericValue });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="purchasePrice">Aankoopprijs (€)</Label>
        <Input
          id="purchasePrice"
          type="text"
          value={formData.purchasePrice || ""}
          onChange={(e) => handlePriceChange('purchasePrice', e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="penaltyAmount">Boete bij verlies/schade (€)</Label>
        <Input
          id="penaltyAmount"
          type="text"
          value={formData.penaltyAmount || ""}
          onChange={(e) => handlePriceChange('penaltyAmount', e.target.value)}
          placeholder="0.00"
        />
        <p className="text-xs text-gray-500">
          Bedrag dat gebruiker moet betalen bij verlies of schade
        </p>
      </div>
    </div>
  );
};
