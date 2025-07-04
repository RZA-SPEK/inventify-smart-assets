
-- Update the notify_user_reservation_status function with proper search_path setting
CREATE OR REPLACE FUNCTION public.notify_user_reservation_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search_path to empty to prevent search path injection
  SET search_path = '';
  
  -- Only notify if status changed and it's not a new reservation
  IF OLD.status IS DISTINCT FROM NEW.status AND OLD.status IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_reservation_id)
    VALUES (
      NEW.requester_id,
      'Reserveringsstatus bijgewerkt',
      'Uw reserveringsaanvraag is ' || 
      CASE 
        WHEN NEW.status = 'approved' THEN 'goedgekeurd'
        WHEN NEW.status = 'rejected' THEN 'afgewezen'
        ELSE NEW.status
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'info'
        WHEN NEW.status = 'rejected' THEN 'destructive'
        ELSE 'info'
      END,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
