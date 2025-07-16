-- Create Superadmin role with full access
INSERT INTO public.roles (name, description) VALUES
  ('Superadmin', 'Volledige toegang tot alle systeemfuncties en beheer');

-- Get the Superadmin role ID and assign all permissions
DO $$
DECLARE
    superadmin_role_id UUID;
    permission_record RECORD;
BEGIN
    -- Get the Superadmin role ID
    SELECT id INTO superadmin_role_id FROM public.roles WHERE name = 'Superadmin';
    
    -- Assign all permissions to Superadmin
    FOR permission_record IN SELECT id FROM public.permissions LOOP
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (superadmin_role_id, permission_record.id)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Assign all categories to Superadmin
    INSERT INTO public.role_categories (role_id, category)
    VALUES 
        (superadmin_role_id, 'ICT'),
        (superadmin_role_id, 'Facilitair'),
        (superadmin_role_id, 'Catering'),
        (superadmin_role_id, 'Logistics')
    ON CONFLICT (role_id, category) DO NOTHING;
END $$;