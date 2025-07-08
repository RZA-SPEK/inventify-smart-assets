
-- Add RLS policy to allow admins to delete reservations
CREATE POLICY "Admins can delete reservations" 
  ON public.reservations 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ICT Admin', 'Facilitair Admin')
    )
  );
