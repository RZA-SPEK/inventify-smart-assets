
-- =============================================
-- COMPLETE DATABASE REBUILD
-- =============================================

-- Phase 1: Drop existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.asset_relationships CASCADE;
DROP TABLE IF EXISTS public.maintenance_history CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.saved_searches CASCADE;
DROP TABLE IF EXISTS public.security_audit_log CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.check_maintenance_due() CASCADE;
DROP FUNCTION IF EXISTS public.check_warranty_expiry() CASCADE;
DROP FUNCTION IF EXISTS public.notify_admins_new_reservation() CASCADE;
DROP FUNCTION IF EXISTS public.notify_user_reservation_status() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS trigger_notify_admins_new_reservation ON public.reservations;
DROP TRIGGER IF EXISTS trigger_notify_user_reservation_status ON public.reservations;

-- =============================================
-- Phase 2: Create Enhanced Core Schema
-- =============================================

-- Create profiles table with enhanced user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'Gebruiker' CHECK (role IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker', 'Gebruiker')),
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag TEXT UNIQUE,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  warranty_period_months INTEGER DEFAULT 12,
  warranty_expiry DATE GENERATED ALWAYS AS (purchase_date + (warranty_period_months || ' months')::INTERVAL) STORED,
  status TEXT NOT NULL DEFAULT 'In voorraad' CHECK (status IN ('In voorraad', 'In gebruik', 'Defect', 'Onderhoud', 'Deleted')),
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ICT', 'Facilitair', 'Catering', 'Logistics')),
  assigned_to TEXT,
  assigned_to_location TEXT,
  assigned_date DATE,
  image_url TEXT,
  purchase_price NUMERIC(10,2),
  penalty_amount NUMERIC(10,2) DEFAULT 0.00,
  depreciation_rate NUMERIC(5,2) DEFAULT 20.00,
  current_value NUMERIC(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN purchase_price IS NULL THEN NULL
      ELSE GREATEST(
        purchase_price * POWER(1 - (depreciation_rate/100), EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date))),
        purchase_price * 0.1
      )
    END
  ) STORED,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_interval_months INTEGER DEFAULT 12,
  condition_notes TEXT,
  qr_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  is_critical BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requested_date DATE NOT NULL,
  return_date DATE NOT NULL,
  actual_return_date DATE,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'overdue')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (return_date >= requested_date)
);

-- Create enhanced notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'maintenance', 'warranty', 'reservation', 'security')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  related_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  related_reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced maintenance history table
CREATE TABLE public.maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('Preventief', 'Correctief', 'Noodonderhoud', 'Kalibratie', 'Schoonmaak', 'Software Update', 'Vervanging')),
  performed_date DATE NOT NULL,
  performed_by TEXT NOT NULL,
  technician_id UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  cost NUMERIC(10,2),
  parts_replaced TEXT[],
  next_due_date DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  warranty_work BOOLEAN DEFAULT false,
  external_service BOOLEAN DEFAULT false,
  service_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create asset relationships table
CREATE TABLE public.asset_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  child_asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'component' CHECK (relationship_type IN ('component', 'accessory', 'bundle', 'replacement')),
  quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_asset_id, child_asset_id, relationship_type)
);

-- Create saved searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced security audit log
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Phase 3: Create Secure Functions
-- =============================================

-- Enhanced user role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid() AND is_active = true;
  
  RETURN COALESCE(user_role, 'Gebruiker');
END;
$$;

-- Enhanced maintenance check function
CREATE OR REPLACE FUNCTION public.check_maintenance_due()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, category, priority, related_asset_id)
  SELECT 
    p.id,
    'Onderhoud vereist',
    'Asset ' || a.type || ' (' || a.serial_number || ') heeft onderhoud nodig op ' || a.next_maintenance || '.',
    'warning',
    'maintenance',
    CASE WHEN a.is_critical THEN 'high' ELSE 'normal' END,
    a.id
  FROM public.assets a
  JOIN public.profiles p ON p.email = a.assigned_to AND p.is_active = true
  WHERE a.next_maintenance IS NOT NULL 
    AND a.next_maintenance <= CURRENT_DATE + INTERVAL '7 days'
    AND a.assigned_to IS NOT NULL
    AND a.status IN ('In gebruik', 'In voorraad')
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.related_asset_id = a.id 
        AND n.category = 'maintenance'
        AND n.created_at > CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$;

-- Enhanced warranty check function
CREATE OR REPLACE FUNCTION public.check_warranty_expiry()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, category, priority, related_asset_id)
  SELECT 
    p.id,
    'Garantie verloopt binnenkort',
    'De garantie van ' || a.type || ' (' || a.serial_number || ') verloopt op ' || a.warranty_expiry || '.',
    'info',
    'warranty',
    'normal',
    a.id
  FROM public.assets a
  JOIN public.profiles p ON p.email = a.assigned_to AND p.is_active = true
  WHERE a.warranty_expiry IS NOT NULL 
    AND a.warranty_expiry <= CURRENT_DATE + INTERVAL '30 days'
    AND a.warranty_expiry > CURRENT_DATE
    AND a.assigned_to IS NOT NULL
    AND a.status IN ('In gebruik', 'In voorraad')
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.related_asset_id = a.id 
        AND n.category = 'warranty'
        AND n.created_at > CURRENT_DATE - INTERVAL '30 days'
    );
END;
$$;

-- Enhanced reservation notification functions
CREATE OR REPLACE FUNCTION public.notify_admins_new_reservation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, category, priority, related_reservation_id)
  SELECT 
    p.id,
    'Nieuwe reserveringsaanvraag',
    'Een nieuwe reserveringsaanvraag is ingediend door ' || NEW.requester_name || ' voor asset: ' || a.type || ' (' || a.serial_number || ')',
    'info',
    'reservation',
    CASE WHEN NEW.priority = 'urgent' THEN 'high' ELSE 'normal' END,
    NEW.id
  FROM public.profiles p
  CROSS JOIN public.assets a
  WHERE p.role IN ('ICT Admin', 'Facilitair Medewerker') 
    AND p.is_active = true
    AND a.id = NEW.asset_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_user_reservation_status()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND OLD.status IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, category, related_reservation_id)
    VALUES (
      NEW.requester_id,
      'Reserveringsstatus bijgewerkt',
      'Uw reserveringsaanvraag is ' || 
      CASE 
        WHEN NEW.status = 'approved' THEN 'goedgekeurd'
        WHEN NEW.status = 'rejected' THEN 'afgewezen'
        WHEN NEW.status = 'active' THEN 'geactiveerd'
        WHEN NEW.status = 'completed' THEN 'voltooid'
        WHEN NEW.status = 'overdue' THEN 'te laat ingeleverd'
        ELSE NEW.status
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
        WHEN NEW.status = 'overdue' THEN 'warning'
        ELSE 'info'
      END,
      'reservation',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to update asset status based on reservations
CREATE OR REPLACE FUNCTION public.update_asset_status_from_reservation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status = 'approved' THEN
    UPDATE public.assets 
    SET status = 'In gebruik', 
        assigned_date = NEW.requested_date,
        updated_at = now()
    WHERE id = NEW.asset_id;
  ELSIF NEW.status = 'completed' AND OLD.status = 'active' THEN
    UPDATE public.assets 
    SET status = 'In voorraad',
        assigned_date = NULL,
        updated_at = now()
    WHERE id = NEW.asset_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =============================================
-- Phase 4: Enable Row Level Security
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Phase 5: Create RLS Policies
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Assets policies
CREATE POLICY "Users can view assets based on role" ON public.assets FOR SELECT USING (
  CASE
    WHEN public.get_current_user_role() = 'ICT Admin' THEN true
    WHEN public.get_current_user_role() IN ('Facilitair Admin', 'Facilitair Medewerker') AND category = 'Facilitair' THEN true
    WHEN public.get_current_user_role() = 'Gebruiker' AND assigned_to = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    ) THEN true
    ELSE false
  END
);

CREATE POLICY "Admins can manage assets" ON public.assets FOR ALL USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

-- Reservations policies
CREATE POLICY "Users can view own reservations, admins view all" ON public.reservations FOR SELECT USING (
  requester_id = auth.uid() OR 
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

CREATE POLICY "Users can create reservations" ON public.reservations FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Admins can update reservations" ON public.reservations FOR UPDATE USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (
  user_id IS NOT NULL AND (
    public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker') OR 
    current_setting('role', true) = 'service_role'
  )
);

-- Maintenance history policies
CREATE POLICY "Users can view maintenance based on asset access" ON public.maintenance_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assets a 
    WHERE a.id = maintenance_history.asset_id AND
    CASE
      WHEN public.get_current_user_role() = 'ICT Admin' THEN true
      WHEN public.get_current_user_role() IN ('Facilitair Admin', 'Facilitair Medewerker') AND a.category = 'Facilitair' THEN true
      WHEN public.get_current_user_role() = 'Gebruiker' AND a.assigned_to = (
        SELECT email FROM public.profiles WHERE id = auth.uid()
      ) THEN true
      ELSE false
    END
  )
);

CREATE POLICY "Admins can manage maintenance history" ON public.maintenance_history FOR ALL USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

-- Asset relationships policies
CREATE POLICY "Users can view asset relationships based on asset access" ON public.asset_relationships FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assets a 
    WHERE (a.id = asset_relationships.parent_asset_id OR a.id = asset_relationships.child_asset_id) AND
    CASE
      WHEN public.get_current_user_role() = 'ICT Admin' THEN true
      WHEN public.get_current_user_role() IN ('Facilitair Admin', 'Facilitair Medewerker') AND a.category = 'Facilitair' THEN true
      WHEN public.get_current_user_role() = 'Gebruiker' AND a.assigned_to = (
        SELECT email FROM public.profiles WHERE id = auth.uid()
      ) THEN true
      ELSE false
    END
  )
);

CREATE POLICY "Admins can manage asset relationships" ON public.asset_relationships FOR ALL USING (
  public.get_current_user_role() IN ('ICT Admin', 'Facilitair Admin', 'Facilitair Medewerker')
);

-- Saved searches policies
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view public saved searches" ON public.saved_searches FOR SELECT USING (is_public = true);

-- Security audit log policies
CREATE POLICY "ICT Admin can view audit logs" ON public.security_audit_log FOR SELECT USING (
  public.get_current_user_role() = 'ICT Admin'
);

-- =============================================
-- Phase 6: Create Triggers
-- =============================================

CREATE TRIGGER trigger_notify_admins_new_reservation
  AFTER INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_reservation();

CREATE TRIGGER trigger_notify_user_reservation_status
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_reservation_status();

CREATE TRIGGER trigger_update_asset_status_from_reservation
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_asset_status_from_reservation();

-- =============================================
-- Phase 7: Create Indexes for Performance
-- =============================================

-- Assets indexes
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_assets_assigned_to ON public.assets(assigned_to);
CREATE INDEX idx_assets_warranty_expiry ON public.assets(warranty_expiry);
CREATE INDEX idx_assets_next_maintenance ON public.assets(next_maintenance);
CREATE INDEX idx_assets_qr_code ON public.assets(qr_code);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX idx_notifications_category ON public.notifications(category);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Reservations indexes
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_requester_id ON public.reservations(requester_id);
CREATE INDEX idx_reservations_asset_id ON public.reservations(asset_id);
CREATE INDEX idx_reservations_dates ON public.reservations(requested_date, return_date);

-- Maintenance history indexes
CREATE INDEX idx_maintenance_history_asset_id ON public.maintenance_history(asset_id);
CREATE INDEX idx_maintenance_history_performed_date ON public.maintenance_history(performed_date);
CREATE INDEX idx_maintenance_history_next_due_date ON public.maintenance_history(next_due_date);

-- Profiles indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Security audit log indexes
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX idx_security_audit_log_table_action ON public.security_audit_log(table_name, action);

-- Asset relationships indexes
CREATE INDEX idx_asset_relationships_parent ON public.asset_relationships(parent_asset_id);
CREATE INDEX idx_asset_relationships_child ON public.asset_relationships(child_asset_id);
