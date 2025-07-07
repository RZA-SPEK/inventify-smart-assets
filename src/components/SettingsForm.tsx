import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings, SystemSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const SettingsForm = () => {
  const { toast } = useToast();
  const { settings: currentSettings, saveSettings, resetSettings, isLoading, loadSettings } = useSettings();
  const isMobile = useIsMobile();
  
  const [settings, setSettings] = useState<SystemSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const [newValues, setNewValues] = useState({
    category: "",
    status: "",
    assetType: "",
    location: "",
    brand: "",
    maintenanceType: "",
    specificLocation: ""
  });

  // Update local settings when current settings change
  useEffect(() => {
    setSettings(currentSettings);
    setHasChanges(false);
  }, [currentSettings]);

  const addItem = (field: keyof SystemSettings, newItem: string) => {
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

    setHasChanges(true);
  };

  const removeItem = (field: keyof SystemSettings, item: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const result = await saveSettings(settings);
      if (result.success) {
        setHasChanges(false);
        toast({
          title: "Instellingen opgeslagen",
          description: "Alle wijzigingen zijn succesvol opgeslagen"
        });
      } else {
        toast({
          title: "Fout bij opslaan",
          description: result.error || "Er is een fout opgetreden bij het opslaan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive"
      });
    }
  };

  const handleReset = async () => {
    try {
      const result = await resetSettings();
      if (result.success) {
        setHasChanges(false);
        toast({
          title: "Instellingen gereset",
          description: "Alle instellingen zijn teruggezet naar de standaardwaarden"
        });
        // Reload settings to ensure we have the latest data
        await loadSettings();
      } else {
        toast({
          title: "Fout bij resetten",
          description: result.error || "Er is een fout opgetreden bij het resetten",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Fout bij resetten",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive"
      });
    }
  };

  const renderSettingsSection = (
    title: string,
    field: keyof SystemSettings,
    newValueField: keyof typeof newValues,
    description: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {settings[field].map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
              <span className="break-words">{item}</span>
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive flex-shrink-0" 
                onClick={() => removeItem(field, item)}
              />
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Label htmlFor={`new-${newValueField}`} className="text-sm">Nieuwe {title.toLowerCase()}</Label>
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
              className="text-sm"
            />
          </div>
          <Button
            onClick={() => addItem(field, newValues[newValueField])}
            className="mt-6 sm:mt-6 self-end"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Systeem Instellingen</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Beheer alle configureerbare opties voor het asset management systeem</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="flex items-center gap-2 text-sm"
            disabled={isLoading}
            size={isMobile ? "sm" : "default"}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2 text-sm"
            disabled={!hasChanges || isLoading}
            size={isMobile ? "sm" : "default"}
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Bezig...' : 'Opslaan'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <p className="text-yellow-800 text-xs sm:text-sm">
            Je hebt niet-opgeslagen wijzigingen. Vergeet niet om op "Opslaan" te klikken.
          </p>
        </div>
      )}

      <Tabs defaultValue="categories" className="space-y-4" orientation={isMobile ? "horizontal" : "horizontal"}>
        <div className="overflow-x-auto">
          <TabsList className={`${isMobile ? 'flex w-max min-w-full' : 'grid w-full grid-cols-4 lg:grid-cols-7'} h-auto`}>
            <TabsTrigger value="categories" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Categorieën</TabsTrigger>
            <TabsTrigger value="statuses" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Statussen</TabsTrigger>
            <TabsTrigger value="types" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Asset Types</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Locaties</TabsTrigger>
            <TabsTrigger value="specific-locations" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Specifieke Locaties</TabsTrigger>
            <TabsTrigger value="brands" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Merken</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3">Onderhoud</TabsTrigger>
          </TabsList>
        </div>

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
            "Beheer de beschikbare hoofdlocaties"
          )}
        </TabsContent>

        <TabsContent value="specific-locations">
          {renderSettingsSection(
            "Specifieke Locaties",
            "specificLocations",
            "specificLocation",
            "Beheer de beschikbare specifieke locaties (werkplekken, vergaderruimtes, etc.)"
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
