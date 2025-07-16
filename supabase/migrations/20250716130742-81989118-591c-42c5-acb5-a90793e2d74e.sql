-- Create role_categories table to assign categories to roles
CREATE TABLE public.role_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, category)
);

-- Enable RLS
ALTER TABLE public.role_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for role_categories table
CREATE POLICY "Everyone can view role categories" 
  ON public.role_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage role categories" 
  ON public.role_categories 
  FOR ALL 
  USING (get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'))
  WITH CHECK (get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

-- Insert default category assignments for existing roles
INSERT INTO public.role_categories (role_id, category)
SELECT r.id, 'ICT' FROM public.roles r WHERE r.name = 'ICT Admin';

INSERT INTO public.role_categories (role_id, category)
SELECT r.id, 'Facilitair' FROM public.roles r WHERE r.name = 'Facilitair Admin';

INSERT INTO public.role_categories (role_id, category)
SELECT r.id, category FROM public.roles r, (VALUES ('ICT'), ('Facilitair'), ('Catering'), ('Logistics')) AS categories(category) 
WHERE r.name = 'Gebruiker';