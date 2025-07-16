-- Fix the create_asset_assignment_notification function to work correctly with the assets table
-- The function was incorrectly referencing NEW.asset_id when it should reference NEW.id

CREATE OR REPLACE FUNCTION public.create_asset_assignment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  asset_info RECORD;
BEGIN
  -- Since this trigger runs on the assets table, NEW already contains asset information
  -- No need to query the assets table again
  
  -- Only create notification if asset is being assigned (not unassigned)
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR NEW.assigned_to != OLD.assigned_to) THEN
    INSERT INTO public.notifications (
      title,
      message,
      type,
      user_id,
      related_asset_id
    ) VALUES (
      'Asset Toegewezen',
      'Asset ' || COALESCE(NEW.asset_tag, 'Unknown') || ' (' || NEW.type || ') is aan jou toegewezen.',
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
      'Asset ' || COALESCE(NEW.asset_tag, 'Unknown') || ' (' || NEW.type || ') is toegewezen aan ' || NEW.assigned_to || '.',
      'admin',
      p.id,
      NEW.id
    FROM public.profiles p
    WHERE p.role IN ('ICT Admin', 'Facilitair Admin');
  END IF;
  
  RETURN NEW;
END;
$function$;