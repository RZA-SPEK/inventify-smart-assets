
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Smartphone, Monitor, Headphones, Cable, Printer } from "lucide-react";

interface PresetOption {
  id: string;
  name: string;
  type: string;
  category: "ICT" | "Facilitair";
  icon: React.ComponentType<{ className?: string }>;
  prefix: string;
}

const presetOptions: PresetOption[] = [
  {
    id: "laptop",
    name: "Laptop",
    type: "Laptop",
    category: "ICT",
    icon: Laptop,
    prefix: "MVDS-LP-"
  },
  {
    id: "smartphone",
    name: "Smartphone",
    type: "Telefoon",
    category: "ICT",
    icon: Smartphone,
    prefix: "MVDS-SP-"
  },
  {
    id: "monitor",
    name: "Monitor",
    type: "Monitor",
    category: "ICT",
    icon: Monitor,
    prefix: "MVDS-MN-"
  },
  {
    id: "headset",
    name: "Headset",
    type: "Headset",
    category: "ICT",
    icon: Headphones,
    prefix: "MVDS-HS-"
  },
  {
    id: "cable",
    name: "Kabel",
    type: "Kabel",
    category: "ICT",
    icon: Cable,
    prefix: "MVDS-CB-"
  },
  {
    id: "printer",
    name: "Printer",
    type: "Printer",
    category: "ICT",
    icon: Printer,
    prefix: "MVDS-PR-"
  }
];

interface PresetSelectorProps {
  onPresetSelect: (preset: PresetOption) => void;
  onSkip: () => void;
}

export const PresetSelector = ({ onPresetSelect, onSkip }: PresetSelectorProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Asset Preset Selecteren</CardTitle>
        <CardDescription>
          Kies een preset om snel een asset toe te voegen met vooraf ingestelde waarden en MVDS- prefix
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presetOptions.map((preset) => {
            const IconComponent = preset.icon;
            return (
              <Button
                key={preset.id}
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-blue-50"
                onClick={() => onPresetSelect(preset)}
              >
                <IconComponent className="h-6 w-6" />
                <span className="text-sm">{preset.name}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="flex justify-center pt-4 border-t">
          <Button variant="ghost" onClick={onSkip}>
            Overslaan - Handmatig invoeren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
