-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to create a user (inserting into auth.users and public.profiles)
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
SECURITY DEFINER -- Runs with privileges of the creator (postgres) to access auth schema
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- 1. Check if user exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
        RAISE EXCEPTION 'User with email % already exists', new_email;
    END IF;

    -- 2. Generate ID
    new_user_id := gen_random_uuid();
    
    -- 3. Hash password
    encrypted_pw := crypt(new_password, gen_salt('bf'));

    -- 4. Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        new_email,
        encrypted_pw,
        now(), -- Auto confirmed
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', new_full_name),
        false,
        now(),
        now()
    );

    -- 5. Insert into public.profiles
    -- We use ON CONFLICT DO NOTHING just in case a trigger already handled it
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
