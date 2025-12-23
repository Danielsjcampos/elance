-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CLEANUP (Optional: Remove the broken test user if exists)
DELETE FROM auth.users WHERE email = 'teste@a.com';

-- 2. DISABLE CONFLICTING TRIGGERS (If any exist from bad setups)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. ROBUST CREATE USER FUNCTION
-- Drop previous signatures to avoid "function not unique" errors
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, text, text, uuid, jsonb);

CREATE OR REPLACE FUNCTION public.admin_create_user(
    new_email TEXT,
    new_password TEXT,
    new_full_name TEXT,
    new_role TEXT,
    new_franchise_id UUID,
    new_permissions JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions -- Ensure access to all schemas
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- A. Check if user exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
        RAISE EXCEPTION 'User with email % already exists', new_email;
    END IF;

    -- B. Generate ID
    new_user_id := gen_random_uuid();
    
    -- C. Hash password (bcrypt)
    -- Supabase GoTrue expects bcrypt. pgcrypto's crypt(pw, gen_salt('bf')) produces compatible hash.
    encrypted_pw := crypt(new_password, gen_salt('bf'));

    -- D. Insert into auth.users (Standard Schema)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Default Instance ID
        new_user_id,
        'authenticated',
        'authenticated',
        new_email,
        encrypted_pw,
        now(), -- Confirmed
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', new_full_name),
        false,
        now(),
        now(),
        '',
        '',
        '',
        ''
    );

    -- E. Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        franchise_unit_id,
        permissions
    ) VALUES (
        new_user_id,
        new_email,
        new_full_name,
        new_role::public.user_role,
        new_franchise_id,
        new_permissions
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        franchise_unit_id = EXCLUDED.franchise_unit_id,
        permissions = EXCLUDED.permissions;

    RETURN new_user_id;
END;
$$;

-- 4. GRANT PERMISSIONS (Ensure authenticated role can execute it? No, usually Admin only via Dashboard or App call)
-- If calling from App as 'authenticated' user (Admin role), we need:
GRANT EXECUTE ON FUNCTION public.admin_create_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_user TO service_role;
