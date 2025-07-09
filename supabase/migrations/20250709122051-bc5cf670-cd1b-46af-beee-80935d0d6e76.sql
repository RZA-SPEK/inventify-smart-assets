
-- Add time fields to reservations table for better scheduling
ALTER TABLE public.reservations 
ADD COLUMN start_time time,
ADD COLUMN end_time time;

-- Create an index for better performance when querying reservations by date
CREATE INDEX idx_reservations_date_range ON public.reservations(requested_date, return_date);

-- Add a policy for admins to view all reservations
CREATE POLICY "Admins can view all reservations" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ICT Admin', 'Facilitair Admin')
    )
  );
