
-- Fix critical RLS policy gaps and add proper security

-- 1. Add missing DELETE policy for assets table
CREATE POLICY "ICT Admin and Facilitair can delete assets" 
  ON public.assets 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('ICT Admin', 'Facilitair Medewerker')
    )
  );

-- 2. Add INSERT policy for profiles table to prevent unauthorized profile creation
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. Create security definer functions to prevent RLS infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. Update existing policies to use security definer function
DROP POLICY IF EXISTS "Users can view assets based on role" ON public.assets;
DROP POLICY IF EXISTS "ICT Admin and Facilitair can insert assets" ON public.assets;
DROP POLICY IF EXISTS "ICT Admin and Facilitair can update assets" ON public.assets;

CREATE POLICY "Users can view assets based on role" 
  ON public.assets 
  FOR SELECT 
  USING (
    CASE 
      WHEN public.get_current_user_role() = 'ICT Admin' THEN true
      WHEN public.get_current_user_role() = 'Facilitair Medewerker' AND category = 'Facilitair' THEN true
      WHEN public.get_current_user_role() = 'Gebruiker' AND assigned_to = (SELECT email FROM public.profiles WHERE id = auth.uid()) THEN true
      ELSE false
    END
  );

CREATE POLICY "ICT Admin and Facilitair can insert assets" 
  ON public.assets 
  FOR INSERT 
  WITH CHECK (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

CREATE POLICY "ICT Admin and Facilitair can update assets" 
  ON public.assets 
  FOR UPDATE 
  USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- 5. Add audit logging table for security events
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "ICT Admin can view audit logs" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (public.get_current_user_role() = 'ICT Admin');

-- 6. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_assets_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, 
    action, 
    table_name, 
    record_id, 
    old_values, 
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to assets table
CREATE TRIGGER audit_assets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.audit_assets_changes();

-- 7. Add reservations table for proper reservation management
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requester_name TEXT NOT NULL,
  requested_date DATE NOT NULL,
  return_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Users can view their own reservations, admins can view all
CREATE POLICY "Users can view own reservations, admins view all" 
  ON public.reservations 
  FOR SELECT 
  USING (
    requester_id = auth.uid() OR 
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker')
  );

-- Users can create their own reservations
CREATE POLICY "Users can create reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

-- Admins can update reservations
CREATE POLICY "Admins can update reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));
