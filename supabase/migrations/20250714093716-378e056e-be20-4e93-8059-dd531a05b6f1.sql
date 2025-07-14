-- Fix search path security issues for notification functions
-- Set explicit search_path to prevent security vulnerabilities

CREATE OR REPLACE FUNCTION public.create_asset_assignment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  asset_info RECORD;
BEGIN
  -- Get asset information
  SELECT asset_tag, type, assigned_to INTO asset_info
  FROM public.assets 
  WHERE id = NEW.asset_id;
  
  -- Only create notification if asset is being assigned (not unassigned)
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != OLD.assigned_to THEN
    INSERT INTO public.notifications (
      title,
      message,
      type,
      user_id,
      related_asset_id
    ) VALUES (
      'Asset Toegewezen',
      'Asset ' || NEW.asset_tag || ' (' || NEW.type || ') is aan jou toegewezen.',
      'assignment',
      (SELECT id FROM auth.users WHERE email = NEW.assigned_to LIMIT 1),
      NEW.id
    );
    
    -- Notify admins about the assignment
    INSERT INTO public.notifications (
      title,
      message,
      type,
      user_id,
      related_asset_id
    )
    SELECT 
      'Asset Toegewezen',
      'Asset ' || NEW.asset_tag || ' (' || NEW.type || ') is toegewezen aan ' || NEW.assigned_to || '.',
      'admin',
      p.id,
      NEW.id
    FROM public.profiles p
    WHERE p.role IN ('ICT Admin', 'Facilitair Admin');
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_reservation_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  asset_info RECORD;
BEGIN
  -- Get asset information
  SELECT asset_tag, type INTO asset_info
  FROM public.assets 
  WHERE id = NEW.asset_id;
  
  -- Notify admins about new reservation
  INSERT INTO public.notifications (
    title,
    message,
    type,
    user_id,
    related_reservation_id,
    related_asset_id
  )
  SELECT 
    'Nieuwe Reservering',
    'Nieuwe reservering voor asset ' || COALESCE(asset_info.asset_tag, 'Unknown') || ' door ' || NEW.requester_name || '.',
    'reservation',
    p.id,
    NEW.id,
    NEW.asset_id
  FROM public.profiles p
  WHERE p.role IN ('ICT Admin', 'Facilitair Admin');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_document_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  asset_info RECORD;
BEGIN
  -- Get asset information
  SELECT asset_tag, type, assigned_to INTO asset_info
  FROM public.assets 
  WHERE id = NEW.asset_id;
  
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Notify the assigned user about document to sign
    INSERT INTO public.notifications (
      title,
      message,
      type,
      user_id,
      related_asset_id
    ) VALUES (
      'Document te Ondertekenen',
      'Er is een document klaar voor ondertekening voor asset ' || COALESCE(asset_info.asset_tag, 'Unknown') || '.',
      'document',
      NEW.user_id,
      NEW.asset_id
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'signed' THEN
    -- Notify admins about signed document
    INSERT INTO public.notifications (
      title,
      message,
      type,
      user_id,
      related_asset_id
    )
    SELECT 
      'Document Ondertekend',
      'Asset toewijzingsdocument voor ' || COALESCE(asset_info.asset_tag, 'Unknown') || ' is ondertekend door ' || NEW.assigned_to_name || '.',
      'admin',
      p.id,
      NEW.asset_id
    FROM public.profiles p
    WHERE p.role IN ('ICT Admin', 'Facilitair Admin');
  END IF;
  
  RETURN NEW;
END;
$function$;