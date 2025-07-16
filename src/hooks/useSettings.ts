
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

    // Load settings if they haven't been loaded yet
    if (globalSettings === DEFAULT_SETTINGS) {
      loadSettings();
    }

    return unsubscribe;
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('settings_data')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        // Fall back to localStorage if database fails
        const savedSettings = localStorage.getItem("systemSettings");
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            globalSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
            setSettings(globalSettings);
            notifySettingsChange();
          } catch (parseError) {
            console.error("Failed to parse saved settings:", parseError);
          }
        }
        return;
      }

      if (data?.settings_data) {
        // Cast the Json type to our SystemSettings interface safely
        const dbSettings = data.settings_data as unknown as SystemSettings;
        globalSettings = { ...DEFAULT_SETTINGS, ...dbSettings };
        setSettings(globalSettings);
        notifySettingsChange();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = async (newSettings: SystemSettings) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .single();

      let result;
      if (existingSettings) {
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
        // Insert new settings - cast SystemSettings to Json safely
        result = await supabase
          .from('system_settings')
          .insert({
            settings_data: newSettings as unknown as any,
            updated_by: user.id
          });
      }

      if (result.error) {
        throw result.error;
      }

      // Update global settings and notify all listeners
      globalSettings = newSettings;
      setSettings(newSettings);
      notifySettingsChange();
      
      // Also save to localStorage as backup
      localStorage.setItem("systemSettings", JSON.stringify(newSettings));
      
      return { success: true };
    } catch (error) {
      console.error("Failed to save settings:", error);
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
