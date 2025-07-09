
-- Add RLS policy to allow admins to update any reservation status
CREATE POLICY "Admins can update reservation status" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ICT Admin', 'Facilitair Admin')
    )
  );
