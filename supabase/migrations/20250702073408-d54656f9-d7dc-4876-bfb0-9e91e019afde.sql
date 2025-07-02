
-- Fix missing RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Fix missing RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Add missing foreign key constraints
ALTER TABLE public.asset_relationships 
  ADD CONSTRAINT fk_asset_relationships_parent 
  FOREIGN KEY (parent_asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.asset_relationships 
  ADD CONSTRAINT fk_asset_relationships_child 
  FOREIGN KEY (child_asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.maintenance_history 
  ADD CONSTRAINT fk_maintenance_history_asset 
  FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
  ADD CONSTRAINT fk_notifications_asset 
  FOREIGN KEY (related_asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
  ADD CONSTRAINT fk_notifications_reservation 
  FOREIGN KEY (related_reservation_id) REFERENCES public.reservations(id) ON DELETE SET NULL;

ALTER TABLE public.reservations 
  ADD CONSTRAINT fk_reservations_asset 
  FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Create missing database functions that hooks expect
CREATE OR REPLACE FUNCTION public.check_maintenance_due()
RETURNS VOID AS $$
BEGIN
  -- Insert notifications for assets that need maintenance
  INSERT INTO public.notifications (user_id, title, message, type, related_asset_id)
  SELECT 
    (SELECT id FROM auth.users WHERE email = a.assigned_to LIMIT 1),
    'Onderhoud vereist',
    'Asset ' || a.type || ' (' || a.serial_number || ') heeft onderhoud nodig.',
    'warning',
    a.id
  FROM public.assets a
  WHERE a.next_maintenance IS NOT NULL 
    AND a.next_maintenance <= CURRENT_DATE
    AND a.assigned_to IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.related_asset_id = a.id 
        AND n.type = 'warning' 
        AND n.title = 'Onderhoud vereist'
        AND n.created_at > CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_warranty_expiry()
RETURNS VOID AS $$
BEGIN
  -- Insert notifications for assets with expiring warranties
  INSERT INTO public.notifications (user_id, title, message, type, related_asset_id)
  SELECT 
    (SELECT id FROM auth.users WHERE email = a.assigned_to LIMIT 1),
    'Garantie verloopt binnenkort',
    'De garantie van ' || a.type || ' (' || a.serial_number || ') verloopt op ' || a.warranty_expiry || '.',
    'info',
    a.id
  FROM public.assets a
  WHERE a.warranty_expiry IS NOT NULL 
    AND a.warranty_expiry <= CURRENT_DATE + INTERVAL '30 days'
    AND a.warranty_expiry > CURRENT_DATE
    AND a.assigned_to IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.related_asset_id = a.id 
        AND n.type = 'info' 
        AND n.title = 'Garantie verloopt binnenkort'
        AND n.created_at > CURRENT_DATE - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the system notification policy to allow these functions to create notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications for users" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    -- Allow system functions and admins to create notifications
    user_id IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('ICT Admin', 'Facilitair Medewerker')
      ) OR 
      current_setting('role', true) = 'service_role'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_assets_next_maintenance ON public.assets(next_maintenance);
CREATE INDEX IF NOT EXISTS idx_assets_warranty_expiry ON public.assets(warranty_expiry);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
