
-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'Gebruiker',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  assigned_to TEXT,
  assigned_to_location TEXT,
  image_url TEXT,
  warranty_expiry DATE,
  purchase_price NUMERIC,
  depreciation_rate NUMERIC DEFAULT 20.00,
  last_maintenance DATE,
  next_maintenance DATE,
  condition_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  requester_name TEXT NOT NULL,
  requested_date DATE NOT NULL,
  return_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  related_asset_id UUID,
  related_reservation_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create maintenance_history table
CREATE TABLE IF NOT EXISTS public.maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID,
  maintenance_type TEXT NOT NULL,
  performed_date DATE NOT NULL,
  performed_by TEXT,
  description TEXT,
  cost NUMERIC,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create asset_relationships table
CREATE TABLE IF NOT EXISTS public.asset_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_asset_id UUID,
  child_asset_id UUID,
  relationship_type TEXT NOT NULL DEFAULT 'component',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security_audit_log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.reservations 
  ADD CONSTRAINT fk_reservations_asset 
  FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
  ADD CONSTRAINT fk_notifications_asset 
  FOREIGN KEY (related_asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
  ADD CONSTRAINT fk_notifications_reservation 
  FOREIGN KEY (related_reservation_id) REFERENCES public.reservations(id) ON DELETE SET NULL;

ALTER TABLE public.maintenance_history 
  ADD CONSTRAINT fk_maintenance_history_asset 
  FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.asset_relationships 
  ADD CONSTRAINT fk_asset_relationships_parent 
  FOREIGN KEY (parent_asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.asset_relationships 
  ADD CONSTRAINT fk_asset_relationships_child 
  FOREIGN KEY (child_asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'Gebruiker'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for assets
CREATE POLICY "Users can view assets based on role" 
  ON public.assets FOR SELECT 
  USING (
    CASE
      WHEN get_current_user_role() = 'ICT Admin' THEN true
      WHEN get_current_user_role() = 'Facilitair Medewerker' AND category = 'Facilitair' THEN true
      WHEN get_current_user_role() = 'Gebruiker' AND assigned_to = (
        SELECT email FROM public.profiles WHERE id = auth.uid()
      ) THEN true
      ELSE false
    END
  );

CREATE POLICY "ICT Admin and Facilitair can insert assets" 
  ON public.assets FOR INSERT 
  WITH CHECK (get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

CREATE POLICY "ICT Admin and Facilitair can update assets" 
  ON public.assets FOR UPDATE 
  USING (get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

CREATE POLICY "ICT Admin and Facilitair can delete assets" 
  ON public.assets FOR DELETE 
  USING (get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- Create RLS policies for reservations
CREATE POLICY "Users can view own reservations, admins view all" 
  ON public.reservations FOR SELECT 
  USING (
    requester_id = auth.uid() OR 
    get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker')
  );

CREATE POLICY "Users can create reservations" 
  ON public.reservations FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Admins can update reservations" 
  ON public.reservations FOR UPDATE 
  USING (get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker'));

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" 
  ON public.notifications FOR INSERT 
  WITH CHECK (
    user_id IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('ICT Admin', 'Facilitair Medewerker')
      ) OR 
      current_setting('role', true) = 'service_role'
    )
  );

-- Create RLS policies for maintenance_history
CREATE POLICY "Users can view maintenance based on asset access" 
  ON public.maintenance_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assets a 
      WHERE a.id = maintenance_history.asset_id AND
      CASE
        WHEN get_current_user_role() = 'ICT Admin' THEN true
        WHEN get_current_user_role() = 'Facilitair Medewerker' AND a.category = 'Facilitair' THEN true
        WHEN get_current_user_role() = 'Gebruiker' AND a.assigned_to = (
          SELECT email FROM public.profiles WHERE id = auth.uid()
        ) THEN true
        ELSE false
      END
    )
  );

CREATE POLICY "Admins can manage maintenance history" 
  ON public.maintenance_history FOR ALL 
  USING (
    get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker') AND 
    auth.uid() IS NOT NULL
  );

-- Create RLS policies for asset_relationships
CREATE POLICY "Users can view asset relationships based on asset access" 
  ON public.asset_relationships FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assets a 
      WHERE (a.id = asset_relationships.parent_asset_id OR a.id = asset_relationships.child_asset_id) AND
      CASE
        WHEN get_current_user_role() = 'ICT Admin' THEN true
        WHEN get_current_user_role() = 'Facilitair Medewerker' AND a.category = 'Facilitair' THEN true
        WHEN get_current_user_role() = 'Gebruiker' AND a.assigned_to = (
          SELECT email FROM public.profiles WHERE id = auth.uid()
        ) THEN true
        ELSE false
      END
    )
  );

CREATE POLICY "Admins can manage asset relationships" 
  ON public.asset_relationships FOR ALL 
  USING (
    get_current_user_role() IN ('ICT Admin', 'Facilitair Medewerker') AND 
    auth.uid() IS NOT NULL
  );

-- Create RLS policies for saved_searches
CREATE POLICY "Users can manage their own saved searches" 
  ON public.saved_searches FOR ALL 
  USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Create RLS policies for security_audit_log
CREATE POLICY "ICT Admin can view audit logs" 
  ON public.security_audit_log FOR SELECT 
  USING (get_current_user_role() = 'ICT Admin');

-- Create maintenance and warranty check functions
CREATE OR REPLACE FUNCTION public.check_maintenance_due()
RETURNS VOID AS $$
BEGIN
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_asset_id ON public.maintenance_history(asset_id);
