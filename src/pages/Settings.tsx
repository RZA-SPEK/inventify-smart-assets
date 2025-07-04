
import { useState } from "react";
import { UserRole } from "@/components/UserRole";
import { SettingsForm } from "@/components/SettingsForm";

interface SettingsData {
  categories: string[];
  statuses: string[];
  assetTypes: string[];
  locations: string[];
  brands: string[];
  maintenanceTypes: string[];
}

const Settings = () => {
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("ICT Admin");

  const handleSaveSettings = (settings: SettingsData) => {
    console.log("Settings saved:", settings);
    // Here you would typically save to your backend/database
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <UserRole currentRole={currentRole} onRoleChange={setCurrentRole} />
        </div>
        
        <SettingsForm onSave={handleSaveSettings} />
      </div>
    </div>
  );
};

export default Settings;
