
-- Update the handle_new_user function to automatically assign ICT Admin role 
-- to users from vanderspekuitvaart.nl domain
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
      WHEN NEW.email LIKE '%@vanderspekuitvaart.nl' THEN 'ICT Admin'
      ELSE 'Gebruiker'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
