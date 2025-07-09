
-- Add DELETE policy for assets table to allow admins to permanently delete assets
CREATE POLICY "Admins can delete assets" 
  ON public.assets 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('ICT Admin', 'Facilitair Admin')
    )
  );
