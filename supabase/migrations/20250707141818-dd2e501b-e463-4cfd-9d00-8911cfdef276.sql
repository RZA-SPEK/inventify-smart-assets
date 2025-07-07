
-- Create a function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id)
    VALUES ('INSERT', TG_TABLE_NAME, NEW.id::text);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id::text);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id::text);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for assets table
CREATE TRIGGER assets_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for reservations table
CREATE TRIGGER reservations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for profiles table
CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Insert some sample audit log entries for existing data
INSERT INTO public.security_audit_log (action, table_name, record_id)
SELECT 'INSERT', 'assets', id::text FROM public.assets;

INSERT INTO public.security_audit_log (action, table_name, record_id)
SELECT 'INSERT', 'reservations', id::text FROM public.reservations;
