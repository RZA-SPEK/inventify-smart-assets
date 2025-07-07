import { SettingsForm } from "@/components/SettingsForm";
import { SystemConfiguration } from "@/components/SystemConfiguration";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SystemSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { canViewSettings, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<string>('');

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (!roleLoading && !canViewSettings) {
      navigate("/dashboard");
      return;
    }

    // Fetch current user role
    if (!roleLoading && canViewSettings) {
      fetchCurrentRole();
    }
  }, [canViewSettings, roleLoading, navigate]);

  const fetchCurrentRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        return;
      }

      setCurrentRole(data?.role || 'Gebruiker');
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  const handleSaveSettings = async (settings: SystemSettings) => {
    console.log('Saving settings:', settings);
    // This will now be handled by the SettingsForm component itself
  };

  // Don't render if user doesn't have permission
  if (!roleLoading && !canViewSettings) {
    return null;
  }

  // Show loading state
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto mobile-spacing py-4 sm:py-6 max-w-7xl">
        <SettingsHeader currentRole={currentRole} />
        
        <div className="w-full space-y-8">
          <SettingsForm />
          <SystemConfiguration />
        </div>
      </div>
    </div>
  );
};

export default Settings;
