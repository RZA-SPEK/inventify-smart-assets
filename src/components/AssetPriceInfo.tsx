
import { Euro } from "lucide-react";

interface AssetPriceInfoProps {
  purchasePrice?: number;
  penaltyAmount?: number;
}

export const AssetPriceInfo = ({ purchasePrice, penaltyAmount }: AssetPriceInfoProps) => {
  const formatPrice = (price?: number) => {
    if (!price) return "-";
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
      <div className="flex items-center space-x-1">
        <Euro className="h-3 w-3 text-green-600" />
        <span className="text-gray-600">Prijs:</span>
        <span className="font-medium text-green-700">
          {formatPrice(purchasePrice)}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Euro className="h-3 w-3 text-red-600" />
        <span className="text-gray-600">Boete:</span>
        <span className="font-medium text-red-700">
          {formatPrice(penaltyAmount)}
        </span>
      </div>
    </div>
  );
};
