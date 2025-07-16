-- Create roles and permissions system
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
  ('view_assets', 'Bekijk assets', 'assets'),
  ('create_assets', 'Maak nieuwe assets aan', 'assets'),
  ('edit_assets', 'Bewerk assets', 'assets'),
  ('delete_assets', 'Verwijder assets', 'assets'),
  ('assign_assets', 'Wijs assets toe aan gebruikers', 'assets'),
  ('view_users', 'Bekijk gebruikers', 'users'),
  ('create_users', 'Maak nieuwe gebruikers aan', 'users'),
  ('edit_users', 'Bewerk gebruikers', 'users'),
  ('delete_users', 'Verwijder gebruikers', 'users'),
  ('view_reservations', 'Bekijk reserveringen', 'reservations'),
  ('create_reservations', 'Maak nieuwe reserveringen', 'reservations'),
  ('approve_reservations', 'Keur reserveringen goed', 'reservations'),
  ('view_settings', 'Bekijk instellingen', 'settings'),
  ('edit_settings', 'Bewerk systeeminstellingen', 'settings'),
  ('manage_roles', 'Beheer rollen en rechten', 'settings'),
  ('view_reports', 'Bekijk rapporten', 'reports'),
  ('view_audit_log', 'Bekijk audit log', 'security');

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('ICT Admin', 'Volledige toegang tot alle ICT gerelateerde functies'),
  ('Facilitair Admin', 'Volledige toegang tot facilitaire asset management'),
  ('Gebruiker', 'Standaard gebruiker met basis rechten');

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for roles table
CREATE POLICY "Everyone can view roles" 
  ON public.roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage roles" 
  ON public.roles 
  FOR ALL 
  USING (get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'))
  WITH CHECK (get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

-- Create policies for permissions table
CREATE POLICY "Everyone can view permissions" 
  ON public.permissions 
  FOR SELECT 
  USING (true);

-- Create policies for role_permissions table
CREATE POLICY "Everyone can view role permissions" 
  ON public.role_permissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage role permissions" 
  ON public.role_permissions 
  FOR ALL 
  USING (get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'))
  WITH CHECK (get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();