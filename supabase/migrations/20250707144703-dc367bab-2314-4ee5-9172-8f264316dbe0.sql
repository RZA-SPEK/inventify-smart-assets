
-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Create a security definer function to get the current user's role
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
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'Gebruiker');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Gebruiker';
END;
$$;

-- Now create the policies using the function to avoid recursion
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
    OR auth.uid() = id
  );

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
    OR auth.uid() = id
  );

CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
    OR auth.uid() = id
  );
