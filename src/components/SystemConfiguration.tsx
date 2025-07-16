
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface SystemConfig {
  companyName: string;
  defaultCategory: string;
  defaultStatus: string;
  autoGenerateAssetTags: boolean;
  assetTagPrefix: string;
  enableNotifications: boolean;
  maintenanceReminderDays: number;
  warrantyReminderDays: number;
  defaultDepreciationRate: number;
  emailNotifications: boolean;
  emailServer: string;
  backupInterval: string;
  maxFileSize: number;
  allowedFileTypes: string;
}

export const SystemConfiguration = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [config, setConfig] = useState<SystemConfig>({
    companyName: "MVDS Asset Management",
    defaultCategory: "ICT",
    defaultStatus: "In voorraad",
    autoGenerateAssetTags: true,
    assetTagPrefix: "MVDS-",
    enableNotifications: true,
    maintenanceReminderDays: 30,
    warrantyReminderDays: 60,
    defaultDepreciationRate: 20,
    emailNotifications: false,
    emailServer: "",
    backupInterval: "daily",
    maxFileSize: 10,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx"
  });

  const handleSave = () => {
    // Save configuration logic would go here
    toast({
      title: "Configuratie opgeslagen",
      description: "Systeem configuratie is succesvol bijgewerkt"
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Systeem Configuratie</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Beheer algemene systeeminstellingen en standaardwaarden</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2 text-sm"
            size={isMobile ? "sm" : "default"}
          >
            <Save className="h-4 w-4" />
            Opslaan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Algemene Instellingen</CardTitle>
            <CardDescription className="text-sm">Basis configuratie voor het systeem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName" className="text-sm">Bedrijfsnaam</Label>
              <Input
                id="companyName"
                value={config.companyName}
                onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="defaultCategory" className="text-sm">Standaard Categorie</Label>
              <Select value={config.defaultCategory} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultCategory: value }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICT">ICT</SelectItem>
                  <SelectItem value="Facilitair">Facilitair</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                  <SelectItem value="Logistiek">Logistiek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="defaultStatus" className="text-sm">Standaard Status</Label>
              <Select value={config.defaultStatus} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultStatus: value }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In voorraad">In voorraad</SelectItem>
                  <SelectItem value="In gebruik">In gebruik</SelectItem>
                  <SelectItem value="Onderhoud">Onderhoud</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Asset Tag Instellingen</CardTitle>
            <CardDescription className="text-sm">Configuratie voor automatische asset tag generatie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoGenerateAssetTags"
                checked={config.autoGenerateAssetTags}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoGenerateAssetTags: checked }))}
              />
              <Label htmlFor="autoGenerateAssetTags" className="text-sm">Automatisch Asset Tags Genereren</Label>
            </div>

            <div>
              <Label htmlFor="assetTagPrefix" className="text-sm">Asset Tag Prefix</Label>
              <Input
                id="assetTagPrefix"
                value={config.assetTagPrefix}
                onChange={(e) => setConfig(prev => ({ ...prev, assetTagPrefix: e.target.value }))}
                placeholder="MVDS-"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Notificatie Instellingen</CardTitle>
            <CardDescription className="text-sm">Configureer wanneer notificaties worden verzonden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableNotifications"
                checked={config.enableNotifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableNotifications: checked }))}
              />
              <Label htmlFor="enableNotifications" className="text-sm">Notificaties Inschakelen</Label>
            </div>

            <div>
              <Label htmlFor="maintenanceReminderDays" className="text-sm">Onderhoud Herinnering (dagen vooraf)</Label>
              <Input
                id="maintenanceReminderDays"
                type="number"
                value={config.maintenanceReminderDays}
                onChange={(e) => setConfig(prev => ({ ...prev, maintenanceReminderDays: parseInt(e.target.value) }))}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="warrantyReminderDays" className="text-sm">Garantie Herinnering (dagen vooraf)</Label>
              <Input
                id="warrantyReminderDays"
                type="number"
                value={config.warrantyReminderDays}
                onChange={(e) => setConfig(prev => ({ ...prev, warrantyReminderDays: parseInt(e.target.value) }))}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Financiële Instellingen</CardTitle>
            <CardDescription className="text-sm">Standaard waarden voor financiële berekeningen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultDepreciationRate" className="text-sm">Standaard Afschrijvingspercentage (%)</Label>
              <Input
                id="defaultDepreciationRate"
                type="number"
                value={config.defaultDepreciationRate}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultDepreciationRate: parseFloat(e.target.value) }))}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Email Instellingen</CardTitle>
            <CardDescription className="text-sm">Configuratie voor email notificaties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={config.emailNotifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, emailNotifications: checked }))}
              />
              <Label htmlFor="emailNotifications" className="text-sm">Email Notificaties</Label>
            </div>

            <div>
              <Label htmlFor="emailServer" className="text-sm">Email Server</Label>
              <Input
                id="emailServer"
                value={config.emailServer}
                onChange={(e) => setConfig(prev => ({ ...prev, emailServer: e.target.value }))}
                placeholder="smtp.company.com"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Bestand Instellingen</CardTitle>
            <CardDescription className="text-sm">Configuratie voor bestand uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxFileSize" className="text-sm">Maximum Bestandsgrootte (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={config.maxFileSize}
                onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="allowedFileTypes" className="text-sm">Toegestane Bestandstypen</Label>
              <Input
                id="allowedFileTypes"
                value={config.allowedFileTypes}
                onChange={(e) => setConfig(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                placeholder="jpg,jpeg,png,pdf,doc,docx"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
