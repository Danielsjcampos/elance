-- NUCLEAR RESET MIGRATION (Safe Mode - Status Column Fix)
-- Warning: This destroys all business data!

BEGIN;

-- 1. Truncate business/app tables safely
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
        'financial_records', 'financial_logs', 
        'leads', 
        'tasks', 'task_steps', 'task_template_steps', 'task_templates',
        'auction_bids', 'bids', 
        'auctions', 
        'company_documents', 'documents', 'document_permissions', 'user_document_actions',
        'marketing_materials', 
        'events', 'event_participants',
        'trainings', 'user_training_progress',
        'audit_logs', 
        'notifications',
        'franchise_units', 
        'profiles',
        'access_profiles' 
    )) LOOP
        RAISE NOTICE 'Truncating table: %', r.tablename;
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- 2. Organization Structure Re-Seed
-- 2.1 Ensure Access Profiles
INSERT INTO public.access_profiles (name, permissions) VALUES 
('Administrador Master', '{"all": true}'),
('Franqueado', '{"franchise_admin": true, "view_financial": true}'),
('Gerente', '{"manage_team": true}'),
('Vendedor', '{"leads": true}'),
('Marketing', '{"marketing": true}'),
('Advogado', '{"view_legal": true}')
ON CONFLICT (name) DO NOTHING;

-- 2.2 Create Default Unit (Matriz) & FIX STATUS COLUMN
-- The 'franchise_units' table has 'active' (bool) NOT 'status'.
INSERT INTO public.franchise_units (id, name, city, state, active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Matriz Elite', 'São Paulo', 'SP', true);

-- 3. RESTORE ONLY SUPER ADMIN
-- This logic finds the existing Auth User (admin@elance.com) and gives them a profile.
INSERT INTO public.profiles (id, email, full_name, role, access_profile_id, franchise_unit_id)
SELECT 
    id, 
    email, 
    'Super Administrador', 
    'admin', 
    (SELECT id FROM public.access_profiles WHERE name = 'Administrador Master' LIMIT 1),
    '00000000-0000-0000-0000-000000000001'
FROM auth.users
WHERE email = 'admin@elance.com';

COMMIT;
