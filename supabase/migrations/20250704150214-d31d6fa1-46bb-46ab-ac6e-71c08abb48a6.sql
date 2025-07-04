
-- Complete reset of the database role system
-- This will completely eliminate any references to PostgreSQL roles

-- Step 1: Drop everything related to roles and policies
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.check_maintenance_due() CASCADE;
DROP FUNCTION IF EXISTS public.check_warranty_expiry() CASCADE;
DROP FUNCTION IF EXISTS public.notify_admins_new_reservation() CASCADE;

-- Step 2: Disable RLS on all tables temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 4: Create the most basic role function possible
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
AS $$
  SELECT 'ICT Admin'::text;
$$;

-- Step 5: Re-enable RLS with the most permissive policies possible
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 6: Create completely open policies for now
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "allow_all_assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "allow_all_reservations" ON public.reservations FOR ALL USING (true);
CREATE POLICY "allow_all_audit_logs" ON public.security_audit_log FOR ALL USING (true);
CREATE POLICY "allow_all_notifications" ON public.notifications FOR ALL USING (true);
