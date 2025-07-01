
-- Add asset lifecycle and maintenance tracking
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS warranty_expiry DATE;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS depreciation_rate DECIMAL(5,2) DEFAULT 20.00;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS condition_notes TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS last_maintenance DATE;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS next_maintenance DATE;

-- Create maintenance history table
CREATE TABLE IF NOT EXISTS public.maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  performed_by TEXT,
  performed_date DATE NOT NULL,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, error, success
  read_at TIMESTAMP WITH TIME ZONE,
  related_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  related_reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create asset relationships table
CREATE TABLE IF NOT EXISTS public.asset_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  child_asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'component', -- component, accessory, dependency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_asset_id, child_asset_id)
);

-- Create saved searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for maintenance_history
CREATE POLICY "Users can view maintenance based on asset access" 
  ON public.maintenance_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assets a 
      WHERE a.id = asset_id 
      AND (
        CASE 
          WHEN public.get_current_user_role() = 'ICT Admin' THEN true
          WHEN public.get_current_user_role() = 'Facilitair Medewerker' AND a.category = 'Facilitair' THEN true
          WHEN public.get_current_user_role() = 'Gebruiker' AND a.assigned_to = (SELECT email FROM public.profiles WHERE id = auth.uid()) THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Admins can manage maintenance history" 
  ON public.maintenance_history 
  FOR ALL 
  USING (
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker')
    AND auth.uid() IS NOT NULL
  );

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- RLS policies for asset_relationships
CREATE POLICY "Users can view asset relationships based on asset access" 
  ON public.asset_relationships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assets a 
      WHERE (a.id = parent_asset_id OR a.id = child_asset_id)
      AND (
        CASE 
          WHEN public.get_current_user_role() = 'ICT Admin' THEN true
          WHEN public.get_current_user_role() = 'Facilitair Medewerker' AND a.category = 'Facilitair' THEN true
          WHEN public.get_current_user_role() = 'Gebruiker' AND a.assigned_to = (SELECT email FROM public.profiles WHERE id = auth.uid()) THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Admins can manage asset relationships" 
  ON public.asset_relationships 
  FOR ALL 
  USING (
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker')
    AND auth.uid() IS NOT NULL
  );

-- RLS policies for saved_searches
CREATE POLICY "Users can manage their own saved searches" 
  ON public.saved_searches 
  FOR ALL 
  USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Create function to check warranty expiry and send notifications
CREATE OR REPLACE FUNCTION public.check_warranty_expiry()
RETURNS void AS $$
DECLARE
  asset_record RECORD;
BEGIN
  -- Find assets with warranties expiring in the next 30 days
  FOR asset_record IN 
    SELECT id, type, serial_number, warranty_expiry, assigned_to
    FROM public.assets 
    WHERE warranty_expiry IS NOT NULL 
    AND warranty_expiry <= CURRENT_DATE + INTERVAL '30 days'
    AND warranty_expiry > CURRENT_DATE
  LOOP
    -- Insert notification for ICT Admins
    INSERT INTO public.notifications (user_id, title, message, type, related_asset_id)
    SELECT 
      p.id,
      'Warranty Expiring Soon',
      'Asset ' || asset_record.type || ' (' || asset_record.serial_number || ') warranty expires on ' || asset_record.warranty_expiry,
      'warning',
      asset_record.id
    FROM public.profiles p
    WHERE p.role = 'ICT Admin';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check maintenance due dates
CREATE OR REPLACE FUNCTION public.check_maintenance_due()
RETURNS void AS $$
DECLARE
  asset_record RECORD;
BEGIN
  -- Find assets with maintenance due in the next 7 days
  FOR asset_record IN 
    SELECT id, type, serial_number, next_maintenance, assigned_to
    FROM public.assets 
    WHERE next_maintenance IS NOT NULL 
    AND next_maintenance <= CURRENT_DATE + INTERVAL '7 days'
    AND next_maintenance > CURRENT_DATE
  LOOP
    -- Insert notification for ICT Admins and Facilitair Medewerkers
    INSERT INTO public.notifications (user_id, title, message, type, related_asset_id)
    SELECT 
      p.id,
      'Maintenance Due Soon',
      'Asset ' || asset_record.type || ' (' || asset_record.serial_number || ') maintenance due on ' || asset_record.next_maintenance,
      'info',
      asset_record.id
    FROM public.profiles p
    WHERE p.role IN ('ICT Admin', 'Facilitair Medewerker');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
