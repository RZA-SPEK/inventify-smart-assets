
-- Create a table for storing system settings
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settings_data JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to view settings
CREATE POLICY "Authenticated users can view settings" 
  ON public.system_settings 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to insert settings
CREATE POLICY "Authenticated users can insert settings" 
  ON public.system_settings 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = updated_by);

-- Create policy that allows authenticated users to update settings
CREATE POLICY "Authenticated users can update settings" 
  ON public.system_settings 
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = updated_by);

-- Insert default settings
INSERT INTO public.system_settings (settings_data, updated_by) 
VALUES (
  '{
    "categories": ["ICT", "Facilitair", "Catering", "Logistics"],
    "statuses": ["In gebruik", "In voorraad", "Defect", "Onderhoud", "Deleted"],
    "assetTypes": ["Laptop", "Telefoon", "Headset", "Bureau", "Monitor", "Printer", "Kabel", "Toetsenbord", "Muis"],
    "locations": ["Kantoor Amsterdam", "Kantoor Utrecht", "ICT Magazijn", "Facilitair Magazijn", "Hoofdkantoor"],
    "brands": ["Dell", "Apple", "HP", "Lenovo", "Samsung", "IKEA", "Jabra", "Logitech", "Microsoft"],
    "maintenanceTypes": ["Preventief", "Correctief", "Noodonderhoud", "Kalibratie", "Schoonmaak", "Software Update"]
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
);
