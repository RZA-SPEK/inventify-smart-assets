
import { SettingsForm } from "@/components/SettingsForm";
import { SystemConfiguration } from "@/components/SystemConfiguration";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Settings = () => {
  const { canViewSettings, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (!roleLoading && !canViewSettings) {
      navigate("/dashboard");
    }
  }, [canViewSettings, roleLoading, navigate]);

  // Don't render if user doesn't have permission
  if (!roleLoading && !canViewSettings) {
    return null;
  }

  // Show loading state
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <SettingsHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingsForm />
          <SystemConfiguration />
        </div>
      </div>
    </div>
  );
};

export default Settings;
