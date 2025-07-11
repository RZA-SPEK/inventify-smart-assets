
-- Fix auth RLS initialization plan issues by wrapping auth.uid() in SELECT subqueries
-- and consolidate multiple permissive policies for better performance

-- Drop existing policies to recreate them optimized
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Create consolidated and optimized profiles policies
CREATE POLICY "Profiles access policy" ON public.profiles
FOR SELECT USING (
  (SELECT auth.uid()) = id OR 
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
);

CREATE POLICY "Profiles insert policy" ON public.profiles
FOR INSERT WITH CHECK (
  (SELECT auth.uid()) = id OR 
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
);

CREATE POLICY "Profiles update policy" ON public.profiles  
FOR UPDATE USING (
  (SELECT auth.uid()) = id OR 
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
);

-- Drop existing reservation policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update reservation status" ON public.reservations;

-- Create consolidated and optimized reservation policies
CREATE POLICY "Reservations select policy" ON public.reservations
FOR SELECT USING (
  (SELECT auth.uid()) = requester_id OR
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

CREATE POLICY "Reservations insert policy" ON public.reservations
FOR INSERT WITH CHECK ((SELECT auth.uid()) = requester_id);

CREATE POLICY "Reservations update policy" ON public.reservations
FOR UPDATE USING (
  (SELECT auth.uid()) = requester_id OR
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

CREATE POLICY "Reservations delete policy" ON public.reservations
FOR DELETE USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
);

-- Drop existing notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Create optimized notification policies
CREATE POLICY "Notifications select policy" ON public.notifications
FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Notifications update policy" ON public.notifications
FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Drop existing system_settings policies
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.system_settings;

-- Create optimized system_settings policies
CREATE POLICY "System settings access policy" ON public.system_settings
FOR ALL USING ((SELECT auth.uid()) = updated_by OR updated_by IS NULL);

-- Drop existing assets policy
DROP POLICY IF EXISTS "Admins can delete assets" ON public.assets;

-- Recreate optimized assets delete policy
CREATE POLICY "Assets delete policy" ON public.assets
FOR DELETE USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin')
);
