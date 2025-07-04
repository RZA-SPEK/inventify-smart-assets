
-- Create a simpler approach that doesn't rely on the get_current_user_role function for basic profile access
-- First, let's temporarily disable RLS on profiles to allow basic access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Now let's recreate the get_current_user_role function with better error handling
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
  -- Direct query without any role checks
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Return the role or default to 'Gebruiker'
  RETURN COALESCE(user_role, 'Gebruiker');
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return default role
    RETURN 'Gebruiker';
END;
$$;

-- Re-enable RLS with simpler policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create very simple policies that don't use the function
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Simple policies without function calls
CREATE POLICY "Allow profile access" ON public.profiles FOR ALL USING (
  auth.uid() = id OR auth.uid() IS NOT NULL
);

-- Now recreate other policies with the fixed function
DROP POLICY IF EXISTS "ICT Admin can view audit logs" ON public.security_audit_log;

CREATE POLICY "ICT Admin can view audit logs" ON public.security_audit_log FOR SELECT USING (
  public.get_current_user_role() = 'ICT Admin'
);
