
import { SettingsForm } from "@/components/SettingsForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useSettings } from "@/hooks/useSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { UserRole } from "@/components/UserRole";

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
        <SettingsHeader currentRole={currentRole} />
        <SettingsForm onSave={handleSaveSettings} initialSettings={settings} />
      </div>
    </div>
  );
};

export default Settings;
