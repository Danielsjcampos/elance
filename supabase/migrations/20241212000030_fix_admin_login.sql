-- FIX ADMIN LOGIN MIGRATION
-- Re-creates the admin user with a valid BCRPYT hash for 'password123'
-- Uses pgcrypto to generate the hash.

CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

DO $$
DECLARE
    v_user_id uuid;
    v_admin_role_id uuid;
    v_unit_id uuid;
BEGIN
    -- 1. DELETE OLD (Clean Slate)
    DELETE FROM auth.users WHERE email = 'admin@elance.com';
    DELETE FROM public.profiles WHERE email = 'admin@elance.com';

    -- 2. CREATE USER
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin
    )
    VALUES (
        v_user_id, 
        '00000000-0000-0000-0000-000000000000', 
        'authenticated', 
        'authenticated', 
        'admin@elance.com', 
        crypt('password123', gen_salt('bf')),
        now(), 
        '{"provider": "email", "providers": ["email"]}', 
        '{"full_name": "Super Admin"}', 
        now(), 
        now(), 
        false
    );

    -- 3. LINK PROFILE
    SELECT id INTO v_admin_role_id FROM public.access_profiles WHERE name = 'Administrador Master' LIMIT 1;
    SELECT id INTO v_unit_id FROM public.franchise_units WHERE name = 'Matriz Elite' LIMIT 1;
    
    -- Fallback for unit
    IF v_unit_id IS NULL THEN
        SELECT id INTO v_unit_id FROM public.franchise_units LIMIT 1;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, access_profile_id, franchise_unit_id)
    VALUES (
        v_user_id, 
        'admin@elance.com', 
        'Super Administrador', 
        'admin', 
        v_admin_role_id, 
        v_unit_id
    );
    
    RAISE NOTICE 'Admin user reset successfully.';
END $$;
