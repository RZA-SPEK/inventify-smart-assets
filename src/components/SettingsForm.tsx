
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  categories: string[];
  statuses: string[];
  assetTypes: string[];
  locations: string[];
  brands: string[];
  maintenanceTypes: string[];
}

interface SettingsFormProps {
  onSave: (settings: SettingsData) => void;
}

export const SettingsForm = ({ onSave }: SettingsFormProps) => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsData>({
    categories: ["ICT", "Facilitair", "Catering", "Logistics"],
    statuses: ["In gebruik", "In voorraad", "Defect", "Onderhoud", "Deleted"],
    assetTypes: ["Laptop", "Telefoon", "Headset", "Bureau", "Monitor", "Printer", "Kabel", "Toetsenbord", "Muis"],
    locations: ["Kantoor Amsterdam", "Kantoor Utrecht", "ICT Magazijn", "Facilitair Magazijn", "Hoofdkantoor"],
    brands: ["Dell", "Apple", "HP", "Lenovo", "Samsung", "IKEA", "Jabra", "Logitech", "Microsoft"],
    maintenanceTypes: ["Preventief", "Correctief", "Noodonderhoud", "Kalibratie", "Schoonmaak", "Software Update"]
  });

  const [newValues, setNewValues] = useState({
    category: "",
    status: "",
    assetType: "",
    location: "",
    brand: "",
    maintenanceType: ""
  });

  const addItem = (field: keyof SettingsData, newItem: string) => {
    if (!newItem.trim()) return;
    
    if (settings[field].includes(newItem.trim())) {
      toast({
        title: "Fout",
        description: "Dit item bestaat al",
        variant: "destructive"
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      [field]: [...prev[field], newItem.trim()]
    }));
    
    setNewValues(prev => ({
      ...prev,
      [field.replace(/s$/, '') as keyof typeof newValues]: ""
    }));
  };

  const removeItem = (field: keyof SettingsData, item: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const handleSave = () => {
    onSave(settings);
    toast({
      title: "Instellingen opgeslagen",
      description: "Alle wijzigingen zijn succesvol opgeslagen"
    });
  };

  const renderSettingsSection = (
    title: string,
    field: keyof SettingsData,
    newValueField: keyof typeof newValues,
    description: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {settings[field].map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeItem(field, item)}
              />
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor={`new-${newValueField}`}>Nieuwe {title.toLowerCase()}</Label>
            <Input
              id={`new-${newValueField}`}
              value={newValues[newValueField]}
              onChange={(e) => setNewValues(prev => ({
                ...prev,
                [newValueField]: e.target.value
              }))}
              placeholder={`Voer nieuwe ${title.toLowerCase()} in`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem(field, newValues[newValueField]);
                }
              }}
            />
          </div>
          <Button
            onClick={() => addItem(field, newValues[newValueField])}
            className="mt-6"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Systeem Instellingen</h2>
          <p className="text-muted-foreground">Beheer alle configureerbare opties voor het asset management systeem</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Opslaan
        </Button>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="categories">Categorieën</TabsTrigger>
          <TabsTrigger value="statuses">Statussen</TabsTrigger>
          <TabsTrigger value="types">Asset Types</TabsTrigger>
          <TabsTrigger value="locations">Locaties</TabsTrigger>
          <TabsTrigger value="brands">Merken</TabsTrigger>
          <TabsTrigger value="maintenance">Onderhoud</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          {renderSettingsSection(
            "Categorieën",
            "categories",
            "category",
            "Beheer de beschikbare asset categorieën"
          )}
        </TabsContent>

        <TabsContent value="statuses">
          {renderSettingsSection(
            "Statussen",
            "statuses",
            "status",
            "Beheer de beschikbare asset statussen"
          )}
        </TabsContent>

        <TabsContent value="types">
          {renderSettingsSection(
            "Asset Types",
            "assetTypes",
            "assetType",
            "Beheer de beschikbare asset types"
          )}
        </TabsContent>

        <TabsContent value="locations">
          {renderSettingsSection(
            "Locaties",
            "locations",
            "location",
            "Beheer de beschikbare locaties"
          )}
        </TabsContent>

        <TabsContent value="brands">
          {renderSettingsSection(
            "Merken",
            "brands",
            "brand",
            "Beheer de beschikbare merken"
          )}
        </TabsContent>

        <TabsContent value="maintenance">
          {renderSettingsSection(
            "Onderhoud Types",
            "maintenanceTypes",
            "maintenanceType",
            "Beheer de beschikbare onderhoud types"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
