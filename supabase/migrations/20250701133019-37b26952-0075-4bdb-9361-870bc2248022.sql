
-- Create the get_current_user_role function first
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 1: Critical Security Fixes

-- 1. Add missing INSERT policy for notifications table
CREATE POLICY "System can create notifications for users" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    -- Only allow system/admin roles to create notifications
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('ICT Admin', 'Facilitair Medewerker')
    )
  );

-- 2. Replace overly permissive RLS policies with role-based ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can insert assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON public.assets;

DROP POLICY IF EXISTS "Authenticated users can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can update reservations" ON public.reservations;

DROP POLICY IF EXISTS "Authenticated users can manage maintenance history" ON public.maintenance_history;
DROP POLICY IF EXISTS "Authenticated users can manage asset relationships" ON public.asset_relationships;

-- Create proper role-based policies for assets
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

CREATE POLICY "ICT Admin and Facilitair can delete assets" 
  ON public.assets 
  FOR DELETE 
  USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- Create proper role-based policies for reservations
CREATE POLICY "Users can view own reservations, admins view all" 
  ON public.reservations 
  FOR SELECT 
  USING (
    requester_id = auth.uid() OR 
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker')
  );

CREATE POLICY "Admins can update reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- Create proper role-based policies for maintenance history
CREATE POLICY "Users can view maintenance based on asset access" 
  ON public.maintenance_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assets a 
      WHERE a.id = asset_id 
      AND (
        CASE 
          WHEN public.get_current_user_role() = 'ICT Admin' THEN true
          WHEN public.get_current_user_role() = 'Facilitair Medewerker' AND a.category = 'Facilitair' THEN true
          WHEN public.get_current_user_role() = 'Gebruiker' AND a.assigned_to = (SELECT email FROM public.profiles WHERE id = auth.uid()) THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Admins can manage maintenance history" 
  ON public.maintenance_history 
  FOR ALL 
  USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- Create proper role-based policies for asset relationships
CREATE POLICY "Users can view asset relationships based on asset access" 
  ON public.asset_relationships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assets a 
      WHERE (a.id = parent_asset_id OR a.id = child_asset_id)
      AND (
        CASE 
          WHEN public.get_current_user_role() = 'ICT Admin' THEN true
          WHEN public.get_current_user_role() = 'Facilitair Medewerker' AND a.category = 'Facilitair' THEN true
          WHEN public.get_current_user_role() = 'Gebruiker' AND a.assigned_to = (SELECT email FROM public.profiles WHERE id = auth.uid()) THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Admins can manage asset relationships" 
  ON public.asset_relationships 
  FOR ALL 
  USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- 3. Add enhanced input validation constraints
ALTER TABLE public.assets 
  ADD CONSTRAINT valid_serial_number_format 
  CHECK (serial_number ~ '^[A-Za-z0-9\-_]+$' AND length(serial_number) >= 3 AND length(serial_number) <= 50);

ALTER TABLE public.assets 
  ADD CONSTRAINT valid_purchase_date 
  CHECK (purchase_date >= '1990-01-01' AND purchase_date <= CURRENT_DATE);

ALTER TABLE public.assets 
  ADD CONSTRAINT valid_warranty_expiry 
  CHECK (warranty_expiry IS NULL OR warranty_expiry >= purchase_date);

ALTER TABLE public.reservations 
  ADD CONSTRAINT valid_reservation_dates 
  CHECK (return_date > requested_date);

-- 4. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
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

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
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

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_assets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

CREATE TRIGGER audit_reservations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();
