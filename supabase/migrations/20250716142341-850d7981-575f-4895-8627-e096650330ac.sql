-- Add a setting_type column to system_settings table to identify different types of settings
ALTER TABLE public.system_settings 
ADD COLUMN setting_type TEXT;