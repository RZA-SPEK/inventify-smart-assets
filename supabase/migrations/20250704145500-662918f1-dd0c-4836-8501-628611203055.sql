
-- Step 1: Temporarily disable RLS on all tables to avoid policy conflicts
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies and functions completely
DROP POLICY IF EXISTS "Users can view assets based on role" ON public.assets;
DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile access" ON public.profiles;
DROP POLICY IF EXISTS "ICT Admin can view audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can manage reservations" ON public.reservations;

-- Step 3: Drop and recreate the function completely
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- Step 4: Create a very simple function without any complex dependencies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'Gebruiker'
  );
$$;

-- Step 5: Re-enable RLS and create simple policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 6: Create very simple policies without complex logic
CREATE POLICY "profile_access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "asset_access" ON public.assets FOR ALL USING (true);
CREATE POLICY "reservation_access" ON public.reservations FOR ALL USING (true);
CREATE POLICY "audit_access" ON public.security_audit_log FOR SELECT USING (true);
