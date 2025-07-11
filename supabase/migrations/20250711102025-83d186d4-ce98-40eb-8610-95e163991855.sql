
-- Fix the log_audit_event function to use explicit search path for security
DROP FUNCTION IF EXISTS public.log_audit_event() CASCADE;

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- This is the important security fix
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id)
    VALUES ('INSERT', TG_TABLE_NAME, NEW.id::text, current_user_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id::text, current_user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id::text, current_user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Recreate the triggers that use this function
CREATE TRIGGER assets_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER reservations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
