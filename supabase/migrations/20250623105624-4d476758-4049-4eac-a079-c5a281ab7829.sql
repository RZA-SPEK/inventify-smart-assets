
-- Create profiles table to store user information and roles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'Gebruiker',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create assets table to replace localStorage storage
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('In gebruik', 'In voorraad', 'Defect', 'Onderhoud')),
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ICT', 'Facilitair')),
  assigned_to TEXT,
  assigned_to_location TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policies for assets table
CREATE POLICY "Users can view assets based on role" 
  ON public.assets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role = 'ICT Admin' 
        OR (profiles.role = 'Facilitair Medewerker' AND assets.category = 'Facilitair')
        OR (profiles.role = 'Gebruiker' AND assets.assigned_to = profiles.email)
      )
    )
  );

CREATE POLICY "ICT Admin and Facilitair can insert assets" 
  ON public.assets 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('ICT Admin', 'Facilitair Medewerker')
    )
  );

CREATE POLICY "ICT Admin and Facilitair can update assets" 
  ON public.assets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('ICT Admin', 'Facilitair Medewerker')
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@assetspek.nl' THEN 'ICT Admin'
      ELSE 'Gebruiker'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample assets
INSERT INTO public.assets (type, brand, model, serial_number, purchase_date, status, location, category, assigned_to, assigned_to_location) VALUES
('Laptop', 'Dell', 'Latitude 7420', 'DL7420001', '2023-01-15', 'In gebruik', 'Kantoor Amsterdam', 'ICT', 'jan.janssen@assetspek.nl', 'Werkplek A-101'),
('Telefoon', 'Apple', 'iPhone 14', 'IP14002', '2023-03-20', 'In voorraad', 'ICT Magazijn', 'ICT', NULL, 'Magazijn Rek B-3'),
('Headset', 'Jabra', 'Evolve2 65', 'JB65003', '2023-02-10', 'In gebruik', 'Kantoor Utrecht', 'ICT', 'marie.peeters@assetspek.nl', 'Werkplek U-205'),
('Bureau', 'IKEA', 'Bekant', 'IK-BK004', '2022-11-01', 'In gebruik', 'Kantoor Amsterdam', 'Facilitair', 'tom.devries@assetspek.nl', 'Werkplek A-150');
