
-- Fix search path vulnerability and auth.users access issue in check_maintenance_due function
CREATE OR REPLACE FUNCTION public.check_maintenance_due()
RETURNS VOID AS $$
BEGIN
  -- Set search_path to empty to prevent search path injection
  SET search_path = '';
  
  INSERT INTO public.notifications (user_id, title, message, type, related_asset_id)
  SELECT 
    p.id,
    'Onderhoud vereist',
    'Asset ' || a.type || ' (' || a.serial_number || ') heeft onderhoud nodig.',
    'warning',
    a.id
  FROM public.assets a
  JOIN public.profiles p ON p.email = a.assigned_to
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

-- Fix search path vulnerability in check_warranty_expiry function as well
CREATE OR REPLACE FUNCTION public.check_warranty_expiry()
RETURNS VOID AS $$
BEGIN
  -- Set search_path to empty to prevent search path injection
  SET search_path = '';
  
  INSERT INTO public.notifications (user_id, title, message, type, related_asset_id)
  SELECT 
    p.id,
    'Garantie verloopt binnenkort',
    'De garantie van ' || a.type || ' (' || a.serial_number || ') verloopt op ' || a.warranty_expiry || '.',
    'info',
    a.id
  FROM public.assets a
  JOIN public.profiles p ON p.email = a.assigned_to
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
