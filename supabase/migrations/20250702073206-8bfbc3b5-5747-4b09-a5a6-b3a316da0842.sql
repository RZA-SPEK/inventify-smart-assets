
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'Gebruiker'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
