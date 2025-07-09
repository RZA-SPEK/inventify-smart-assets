
-- Drop existing audit function and recreate with user tracking
DROP FUNCTION IF EXISTS public.log_audit_event() CASCADE;

-- Create enhanced function to log audit events with user information
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user_id column to security_audit_log table
ALTER TABLE public.security_audit_log ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Recreate triggers for all tables
DROP TRIGGER IF EXISTS assets_audit_trigger ON public.assets;
CREATE TRIGGER assets_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS reservations_audit_trigger ON public.reservations;
CREATE TRIGGER reservations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS profiles_audit_trigger ON public.profiles;
CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
