-- Update RLS policies to include Superadmin role

-- Update roles table policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" 
  ON public.roles 
  FOR ALL 
  USING (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'))
  WITH CHECK (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'));

-- Update role_permissions table policies
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions" 
  ON public.role_permissions 
  FOR ALL 
  USING (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'))
  WITH CHECK (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'));

-- Update role_categories table policies
DROP POLICY IF EXISTS "Admins can manage role categories" ON public.role_categories;
CREATE POLICY "Admins can manage role categories" 
  ON public.role_categories 
  FOR ALL 
  USING (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'))
  WITH CHECK (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'));

-- Update assets table policies
DROP POLICY IF EXISTS "Assets delete policy" ON public.assets;
CREATE POLICY "Assets delete policy" 
  ON public.assets 
  FOR DELETE 
  USING (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'));

-- Update profiles table policies
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
CREATE POLICY "Profiles access policy" 
  ON public.profiles 
  FOR SELECT 
  USING ((auth.uid() = id) OR (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin')));

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK ((auth.uid() = id) OR (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin')));

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" 
  ON public.profiles 
  FOR UPDATE 
  USING ((auth.uid() = id) OR (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin')));

-- Update reservations table policies
DROP POLICY IF EXISTS "Reservations delete policy" ON public.reservations;
CREATE POLICY "Reservations delete policy" 
  ON public.reservations 
  FOR DELETE 
  USING (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin'));

DROP POLICY IF EXISTS "Reservations select policy" ON public.reservations;
CREATE POLICY "Reservations select policy" 
  ON public.reservations 
  FOR SELECT 
  USING ((auth.uid() = requester_id) OR (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')));

DROP POLICY IF EXISTS "Reservations update policy" ON public.reservations;
CREATE POLICY "Reservations update policy" 
  ON public.reservations 
  FOR UPDATE 
  USING ((auth.uid() = requester_id) OR (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')));

-- Update asset assignment documents policies
DROP POLICY IF EXISTS "Users can create assignment documents" ON public.asset_assignment_documents;
CREATE POLICY "Users can create assignment documents" 
  ON public.asset_assignment_documents 
  FOR INSERT 
  WITH CHECK ((auth.uid() = user_id) OR (get_current_user_role() IN ('Superadmin', 'ICT Admin', 'Facilitair Admin')));