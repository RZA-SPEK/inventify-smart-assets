
-- Fix get_current_user_role function to remove is_active reference
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
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'Gebruiker');
END;
$$;

-- Fix check_maintenance_due function to remove is_active reference
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
  JOIN public.profiles p ON p.email = a.assigned_to
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

-- Fix check_warranty_expiry function to remove is_active reference
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
  JOIN public.profiles p ON p.email = a.assigned_to
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

-- Fix notify_admins_new_reservation function to remove is_active reference
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
    AND a.id = NEW.asset_id;
  
  RETURN NEW;
END;
$$;
