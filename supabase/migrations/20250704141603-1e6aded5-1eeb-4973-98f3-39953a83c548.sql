
-- Clean up any remaining references to the "admin" role
-- First, let's recreate the get_current_user_role function to ensure it's completely clean
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Simple query to get role from profiles table
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Return the role or default to 'Gebruiker'
  RETURN COALESCE(user_role, 'Gebruiker');
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return default role
    RETURN 'Gebruiker';
END;
$$;

-- Drop and recreate all RLS policies to ensure they're clean
-- Assets policies
DROP POLICY IF EXISTS "Users can view assets based on role" ON public.assets;
DROP POLICY IF EXISTS "ICT Admin and Facilitair can insert assets" ON public.assets;
DROP POLICY IF EXISTS "ICT Admin and Facilitair can update assets" ON public.assets;
DROP POLICY IF EXISTS "ICT Admin and Facilitair can delete assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;

CREATE POLICY "Users can view assets based on role" ON public.assets FOR SELECT USING (
  CASE
    WHEN public.get_current_user_role() = 'ICT Admin' THEN true
    WHEN public.get_current_user_role() IN ('Facilitair Admin', 'Facilitair Medewerker') AND category = 'Facilitair' THEN true
    WHEN public.get_current_user_role() = 'Gebruiker' AND assigned_to = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    ) THEN true
    ELSE false
  END
);

CREATE POLICY "Admins can manage assets" ON public.assets FOR ALL USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

-- Security audit log policies
DROP POLICY IF EXISTS "ICT Admin can view audit logs" ON public.security_audit_log;

CREATE POLICY "ICT Admin can view audit logs" ON public.security_audit_log FOR SELECT USING (
  public.get_current_user_role() = 'ICT Admin'
);

-- Also ensure any triggers are clean
DROP FUNCTION IF EXISTS public.notify_admins_new_reservation() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_admins_new_reservation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, category, priority, related_reservation_id)
  SELECT 
    p.id,
    'Nieuwe reserveringsaanvraag',
    'Een nieuwe reserveringsaanvraag is ingediend door ' || NEW.requester_name || ' voor asset: ' || a.type || ' (' || a.serial_number || ')',
    'info',
    'reservation',
    CASE WHEN NEW.priority = 'urgent' THEN 'high' ELSE 'normal' END,
    NEW.id
  FROM public.profiles p
  CROSS JOIN public.assets a
  WHERE p.role IN ('ICT Admin', 'Facilitair Medewerker')
    AND a.id = NEW.asset_id;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS notify_admins_new_reservation_trigger ON public.reservations;
CREATE TRIGGER notify_admins_new_reservation_trigger
  AFTER INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_reservation();
