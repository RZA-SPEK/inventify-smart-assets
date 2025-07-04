
import { SettingsForm } from "@/components/SettingsForm";
import { UserRole } from "@/components/UserRole";
import { useUserRole } from "@/hooks/useUserRole";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

const Settings = () => {
  const { currentRole, canViewSettings } = useUserRole();
  const { settings, saveSettings } = useSettings();

  if (!canViewSettings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <UserRole />
          </div>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              U heeft geen toegang tot de instellingen pagina. Alleen ICT Admin en Facilitair Admin kunnen instellingen beheren.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async (newSettings: typeof settings) => {
    const result = await saveSettings(newSettings);
    if (!result.success) {
      console.error("Failed to save settings:", result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <UserRole />
        </div>

        {currentRole === "ICT Admin" && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Als ICT Admin heeft u volledige toegang tot alle systeeminstellingen en configuraties.
            </AlertDescription>
          </Alert>
        )}

        {currentRole === "Facilitair Admin" && (
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <Shield className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              Als Facilitair Admin kunt u instellingen beheren die gerelateerd zijn aan facilitaire assets.
            </AlertDescription>
          </Alert>
        )}
        
        <SettingsForm onSave={handleSaveSettings} initialSettings={settings} />
      </div>
    </div>
  );
};

export default Settings;
