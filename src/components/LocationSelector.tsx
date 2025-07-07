
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";

interface LocationSelectorProps {
  mainLocation: string;
  specificLocation: string;
  onMainLocationChange: (value: string) => void;
  onSpecificLocationChange: (value: string) => void;
}

export const LocationSelector = ({ 
  mainLocation, 
  specificLocation, 
  onMainLocationChange, 
  onSpecificLocationChange 
}: LocationSelectorProps) => {
  const { settings } = useSettings();

  const specificLocations = [
    "Werkplek A-101", "Werkplek A-102", "Werkplek A-150", "Werkplek A-200",
    "Werkplek U-201", "Werkplek U-205", "Werkplek U-210", "Werkplek U-250",
    "Werkplek R-301", "Werkplek R-305", "Werkplek R-310", "Werkplek R-350",
    "Magazijn Rek A-1", "Magazijn Rek A-2", "Magazijn Rek B-1", "Magazijn Rek B-3",
    "Vergaderruimte Alpha", "Vergaderruimte Beta", "Vergaderruimte Gamma",
    "Reception", "Keuken", "Break Room", "Server Room", "Storage Room"
  ];

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="location">Hoofdlocatie</Label>
        <Select value={mainLocation} onValueChange={onMainLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer hoofdlocatie" />
          </SelectTrigger>
          <SelectContent>
            {settings.locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedToLocation">Specifieke Locatie</Label>
        <Select 
          value={specificLocation || "unassigned"} 
          onValueChange={(value) => onSpecificLocationChange(value === "unassigned" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Geen specifieke locatie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Geen specifieke locatie</SelectItem>
            {specificLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
