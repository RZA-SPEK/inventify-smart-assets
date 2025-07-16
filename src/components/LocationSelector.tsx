
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";

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
  const { settings, saveSettings } = useSettings();
  const [newSpecificLocation, setNewSpecificLocation] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  console.log('LocationSelector: Received props:', { mainLocation, specificLocation });
  console.log('LocationSelector: Current settings:', settings);
  console.log('LocationSelector: Available locations:', settings.locations);
  console.log('LocationSelector: Available specific locations:', settings.specificLocations);

  // Get specific locations from settings, with fallback to default list
  const specificLocations = settings.specificLocations || [
    "Werkplek A-101", "Werkplek A-102", "Werkplek A-150", "Werkplek A-200",
    "Werkplek U-201", "Werkplek U-205", "Werkplek U-210", "Werkplek U-250",
    "Werkplek R-301", "Werkplek R-305", "Werkplek R-310", "Werkplek R-350",
    "Magazijn Rek A-1", "Magazijn Rek A-2", "Magazijn Rek B-1", "Magazijn Rek B-3",
    "Vergaderruimte Alpha", "Vergaderruimte Beta", "Vergaderruimte Gamma",
    "Reception", "Keuken", "Break Room", "Server Room", "Storage Room"
  ];

  const handleAddSpecificLocation = async () => {
    if (!newSpecificLocation.trim()) return;
    
    const updatedSettings = {
      ...settings,
      specificLocations: [...specificLocations, newSpecificLocation.trim()]
    };
    
    await saveSettings(updatedSettings);
    setNewSpecificLocation("");
    setIsAddingLocation(false);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="location">Hoofdlocatie</Label>
        <Select value={mainLocation || ""} onValueChange={onMainLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer hoofdlocatie" />
          </SelectTrigger>
          <SelectContent>
            {settings.locations?.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="assignedToLocation">Specifieke Locatie</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingLocation(!isAddingLocation)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Toevoegen
          </Button>
        </div>
        
        {isAddingLocation && (
          <div className="flex gap-2 mb-2">
            <Input
              value={newSpecificLocation}
              onChange={(e) => setNewSpecificLocation(e.target.value)}
              placeholder="Nieuwe specifieke locatie"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSpecificLocation();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddSpecificLocation}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        
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
