
-- Add notification for new reservation requests
CREATE OR REPLACE FUNCTION public.notify_admins_new_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify ICT Admin and Facilitair Medewerker about new reservation requests
  INSERT INTO public.notifications (user_id, title, message, type, related_reservation_id)
  SELECT 
    p.id,
    'Nieuwe reserveringsaanvraag',
    'Een nieuwe reserveringsaanvraag is ingediend door ' || NEW.requester_name || ' voor asset ID: ' || NEW.asset_id,
    'warning',
    NEW.id
  FROM public.profiles p
  WHERE p.role IN ('ICT Admin', 'Facilitair Medewerker');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new reservation notifications
CREATE TRIGGER trigger_notify_admins_new_reservation
  AFTER INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_reservation();

-- Add notification for reservation status changes
CREATE OR REPLACE FUNCTION public.notify_user_reservation_status()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger for reservation status change notifications
CREATE TRIGGER trigger_notify_user_reservation_status
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_reservation_status();
