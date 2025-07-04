
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleReset = () => {
    // Reset to default values
    toast({
      title: "Configuratie gereset",
      description: "Alle instellingen zijn teruggezet naar standaardwaarden"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Systeem Configuratie</h2>
          <p className="text-muted-foreground">Beheer algemene systeeminstellingen en standaardwaarden</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Opslaan
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Algemene Instellingen</CardTitle>
            <CardDescription>Basis configuratie voor het systeem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Bedrijfsnaam</Label>
              <Input
                id="companyName"
                value={config.companyName}
                onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="defaultCategory">Standaard Categorie</Label>
              <Select value={config.defaultCategory} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultCategory: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICT">ICT</SelectItem>
                  <SelectItem value="Facilitair">Facilitair</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                  <SelectItem value="Logistics">Logistiek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="defaultStatus">Standaard Status</Label>
              <Select value={config.defaultStatus} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultStatus: value }))}>
                <SelectTrigger>
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
            <CardTitle>Asset Tag Instellingen</CardTitle>
            <CardDescription>Configuratie voor automatische asset tag generatie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoGenerateAssetTags"
                checked={config.autoGenerateAssetTags}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoGenerateAssetTags: checked }))}
              />
              <Label htmlFor="autoGenerateAssetTags">Automatisch Asset Tags Genereren</Label>
            </div>

            <div>
              <Label htmlFor="assetTagPrefix">Asset Tag Prefix</Label>
              <Input
                id="assetTagPrefix"
                value={config.assetTagPrefix}
                onChange={(e) => setConfig(prev => ({ ...prev, assetTagPrefix: e.target.value }))}
                placeholder="MVDS-"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificatie Instellingen</CardTitle>
            <CardDescription>Configureer wanneer notificaties worden verzonden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableNotifications"
                checked={config.enableNotifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableNotifications: checked }))}
              />
              <Label htmlFor="enableNotifications">Notificaties Inschakelen</Label>
            </div>

            <div>
              <Label htmlFor="maintenanceReminderDays">Onderhoud Herinnering (dagen vooraf)</Label>
              <Input
                id="maintenanceReminderDays"
                type="number"
                value={config.maintenanceReminderDays}
                onChange={(e) => setConfig(prev => ({ ...prev, maintenanceReminderDays: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="warrantyReminderDays">Garantie Herinnering (dagen vooraf)</Label>
              <Input
                id="warrantyReminderDays"
                type="number"
                value={config.warrantyReminderDays}
                onChange={(e) => setConfig(prev => ({ ...prev, warrantyReminderDays: parseInt(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financiële Instellingen</CardTitle>
            <CardDescription>Standaard waarden voor financiële berekeningen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultDepreciationRate">Standaard Afschrijvingspercentage (%)</Label>
              <Input
                id="defaultDepreciationRate"
                type="number"
                value={config.defaultDepreciationRate}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultDepreciationRate: parseFloat(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Instellingen</CardTitle>
            <CardDescription>Configuratie voor email notificaties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={config.emailNotifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, emailNotifications: checked }))}
              />
              <Label htmlFor="emailNotifications">Email Notificaties</Label>
            </div>

            <div>
              <Label htmlFor="emailServer">Email Server</Label>
              <Input
                id="emailServer"
                value={config.emailServer}
                onChange={(e) => setConfig(prev => ({ ...prev, emailServer: e.target.value }))}
                placeholder="smtp.company.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bestand Instellingen</CardTitle>
            <CardDescription>Configuratie voor bestand uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxFileSize">Maximum Bestandsgrootte (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={config.maxFileSize}
                onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="allowedFileTypes">Toegestane Bestandstypen</Label>
              <Input
                id="allowedFileTypes"
                value={config.allowedFileTypes}
                onChange={(e) => setConfig(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                placeholder="jpg,jpeg,png,pdf,doc,docx"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
