
import { useState, useEffect } from "react";

export interface SystemSettings {
  categories: string[];
  statuses: string[];
  assetTypes: string[];
  locations: string[];
  brands: string[];
  maintenanceTypes: string[];
}

const DEFAULT_SETTINGS: SystemSettings = {
  categories: ["ICT", "Facilitair", "Catering", "Logistics"],
  statuses: ["In gebruik", "In voorraad", "Defect", "Onderhoud", "Deleted"],
  assetTypes: ["Laptop", "Telefoon", "Headset", "Bureau", "Monitor", "Printer", "Kabel", "Toetsenbord", "Muis"],
  locations: ["Kantoor Amsterdam", "Kantoor Utrecht", "ICT Magazijn", "Facilitair Magazijn", "Hoofdkantoor"],
  brands: ["Dell", "Apple", "HP", "Lenovo", "Samsung", "IKEA", "Jabra", "Logitech", "Microsoft"],
  maintenanceTypes: ["Preventief", "Correctief", "Noodonderhoud", "Kalibratie", "Schoonmaak", "Software Update"]
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage (in a real app, this would be from the backend)
    const savedSettings = localStorage.getItem("systemSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  const saveSettings = async (newSettings: SystemSettings) => {
    setIsLoading(true);
    try {
      // In a real app, this would be a backend API call
      localStorage.setItem("systemSettings", JSON.stringify(newSettings));
      setSettings(newSettings);
      return { success: true };
    } catch (error) {
      console.error("Failed to save settings:", error);
      return { success: false, error: "Failed to save settings" };
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("systemSettings");
  };

  return {
    settings,
    saveSettings,
    resetSettings,
    isLoading
  };
};
