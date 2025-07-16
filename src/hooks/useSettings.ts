
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
  categories: string[];
  statuses: string[];
  assetTypes: string[];
  locations: string[];
  brands: string[];
  maintenanceTypes: string[];
  specificLocations: string[];
}

const DEFAULT_SETTINGS: SystemSettings = {
  categories: ["ICT", "Facilitair", "Catering", "Logistiek"],
  statuses: ["In gebruik", "In voorraad", "Defect", "Onderhoud", "Deleted"],
  assetTypes: ["Laptop", "Telefoon", "Headset", "Bureau", "Monitor", "Printer", "Kabel", "Toetsenbord", "Muis"],
  locations: ["Kantoor Amsterdam", "Kantoor Utrecht", "ICT Magazijn", "Facilitair Magazijn", "Hoofdkantoor"],
  brands: ["Dell", "Apple", "HP", "Lenovo", "Samsung", "IKEA", "Jabra", "Logitech", "Microsoft"],
  maintenanceTypes: ["Preventief", "Correctief", "Noodonderhoud", "Kalibratie", "Schoonmaak", "Software Update"],
  specificLocations: [
    "Werkplek A-101", "Werkplek A-102", "Werkplek A-150", "Werkplek A-200",
    "Werkplek U-201", "Werkplek U-205", "Werkplek U-210", "Werkplek U-250",
    "Werkplek R-301", "Werkplek R-305", "Werkplek R-310", "Werkplek R-350",
    "Magazijn Rek A-1", "Magazijn Rek A-2", "Magazijn Rek B-1", "Magazijn Rek B-3",
    "Vergaderruimte Alpha", "Vergaderruimte Beta", "Vergaderruimte Gamma",
    "Reception", "Keuken", "Break Room", "Server Room", "Storage Room"
  ]
};

// Global state management for settings
let globalSettings: SystemSettings = DEFAULT_SETTINGS;
let settingsListeners: (() => void)[] = [];
let settingsLoaded = false;
let loadingPromise: Promise<void> | null = null;

const notifySettingsChange = () => {
  settingsListeners.forEach(listener => listener());
};

const subscribeToSettings = (callback: () => void) => {
  settingsListeners.push(callback);
  return () => {
    settingsListeners = settingsListeners.filter(listener => listener !== callback);
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(globalSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = subscribeToSettings(() => {
      setSettings(globalSettings);
    });

    // Load settings if they haven't been loaded yet and no loading is in progress
    if (!settingsLoaded && !loadingPromise) {
      loadSettings();
    } else if (settingsLoaded) {
      // Settings already loaded, just update local state
      setSettings(globalSettings);
    }

    return unsubscribe;
  }, []);

  const loadSettings = useCallback(async () => {
    // If already loading, return the existing promise
    if (loadingPromise) {
      return loadingPromise;
    }
    
    // If already loaded, don't load again
    if (settingsLoaded) {
      return;
    }

    setIsLoading(true);
    
    loadingPromise = (async () => {
      try {
        console.log('useSettings: Loading settings from database...');
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('settings_data')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('useSettings: Error loading settings:', error);
          // Fall back to localStorage if database fails
          const savedSettings = localStorage.getItem("systemSettings");
          if (savedSettings) {
            try {
              const parsedSettings = JSON.parse(savedSettings);
              console.log('useSettings: Loaded settings from localStorage:', parsedSettings);
              globalSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
              settingsLoaded = true;
              notifySettingsChange();
            } catch (parseError) {
              console.error("useSettings: Failed to parse saved settings:", parseError);
            }
          }
          return;
        }

        if (data?.settings_data) {
          // Cast the Json type to our SystemSettings interface safely
          const dbSettings = data.settings_data as unknown as SystemSettings;
          console.log('useSettings: Loaded settings from database:', dbSettings);
          globalSettings = { ...DEFAULT_SETTINGS, ...dbSettings };
          settingsLoaded = true;
          notifySettingsChange();
        } else {
          console.log('useSettings: No settings found in database, using defaults');
          settingsLoaded = true;
        }
      } catch (error) {
        console.error('useSettings: Error loading settings:', error);
      } finally {
        loadingPromise = null;
        setIsLoading(false);
      }
    })();

    return loadingPromise;
  }, []);

  const saveSettings = async (newSettings: SystemSettings) => {
    setIsLoading(true);
    try {
      console.log('useSettings: Saving settings:', newSettings);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('useSettings: User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('useSettings: Current user:', user.id);

      // Check if settings already exist
      const { data: existingSettings, error: selectError } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .single();

      console.log('useSettings: Existing settings check:', { existingSettings, selectError });

      let result;
      if (existingSettings) {
        console.log('useSettings: Updating existing settings with ID:', existingSettings.id);
        // Update existing settings - cast SystemSettings to Json safely
        result = await supabase
          .from('system_settings')
          .update({
            settings_data: newSettings as unknown as any,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);
      } else {
        console.log('useSettings: Inserting new settings');
        // Insert new settings - cast SystemSettings to Json safely
        result = await supabase
          .from('system_settings')
          .insert({
            settings_data: newSettings as unknown as any,
            updated_by: user.id
          });
      }

      console.log('useSettings: Database operation result:', result);

      if (result.error) {
        console.error('useSettings: Database error:', result.error);
        throw result.error;
      }

      console.log('useSettings: Settings saved successfully, updating global state');
      
      // Update global settings and notify all listeners
      globalSettings = newSettings;
      setSettings(newSettings);
      notifySettingsChange();
      
      // Also save to localStorage as backup
      localStorage.setItem("systemSettings", JSON.stringify(newSettings));
      
      return { success: true };
    } catch (error) {
      console.error("useSettings: Failed to save settings:", error);
      return { success: false, error: "Failed to save settings" };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    saveSettings,
    isLoading,
    loadSettings
  };
};
