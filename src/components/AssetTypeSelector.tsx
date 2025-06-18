
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AssetTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const AssetTypeSelector = ({ value, onChange }: AssetTypeSelectorProps) => {
  const [customAssetTypes, setCustomAssetTypes] = useState<string[]>([]);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [newCustomType, setNewCustomType] = useState("");

  const defaultAssetTypes = [
    "Laptop", "Desktop", "Monitor", "Telefoon", "Tablet", "Headset", 
    "Kabel", "Lader", "Muis", "Toetsenbord", "Webcam", "Printer",
    "Bureau", "Stoel", "Lamp", "Kast", "Whiteboard"
  ];

  const allAssetTypes = [...defaultAssetTypes, ...customAssetTypes];

  const handleAddCustomType = () => {
    if (newCustomType.trim() && !allAssetTypes.includes(newCustomType.trim())) {
      const newType = newCustomType.trim();
      setCustomAssetTypes([...customAssetTypes, newType]);
      onChange(newType);
      setNewCustomType("");
      setShowCustomTypeInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="type">Asset Type</Label>
      <div className="space-y-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer type" />
          </SelectTrigger>
          <SelectContent>
            {allAssetTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {showCustomTypeInput ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nieuw asset type"
              value={newCustomType}
              onChange={(e) => setNewCustomType(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomType();
                }
              }}
            />
            <Button type="button" size="sm" onClick={handleAddCustomType}>
              Toevoegen
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => {
              setShowCustomTypeInput(false);
              setNewCustomType("");
            }}>
              Annuleren
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => setShowCustomTypeInput(true)}
          >
            <Plus className="h-4 w-4" />
            Aangepast type toevoegen
          </Button>
        )}
      </div>
    </div>
  );
};
