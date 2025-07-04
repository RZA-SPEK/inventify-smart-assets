
-- Completely remove any references to PostgreSQL roles and fix all functions
-- First, let's drop and recreate the get_current_user_role function with a cleaner approach
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

-- Drop ALL existing policies on all tables and recreate them clean
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

-- Profiles policies  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Security audit log policies
DROP POLICY IF EXISTS "ICT Admin can view audit logs" ON public.security_audit_log;

CREATE POLICY "ICT Admin can view audit logs" ON public.security_audit_log FOR SELECT USING (
  public.get_current_user_role() = 'ICT Admin'
);

-- Reservations policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;

CREATE POLICY "Users can view their own reservations" ON public.reservations FOR SELECT USING (
  requester_id = auth.uid()
);

CREATE POLICY "Admins can view all reservations" ON public.reservations FOR SELECT USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

CREATE POLICY "Admins can manage reservations" ON public.reservations FOR ALL USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);
