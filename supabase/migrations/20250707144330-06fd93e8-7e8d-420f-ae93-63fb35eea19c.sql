
-- Allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ICT Admin', 'Facilitair Admin')
    )
  );

-- Allow admins to insert new profiles when creating users
CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ICT Admin', 'Facilitair Admin')
    )
  );

-- Allow admins to update user profiles
CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ICT Admin', 'Facilitair Admin')
    )
  );
