-- ENSURE USER EXISTS (danielsjcampos@gmail.com)
-- This allows the admin to link this user to a franchise even if they haven't logged in yet.

DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- 1. Check if user exists in AUTH
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'danielsjcampos@gmail.com') THEN
        -- Create in auth.users (Mock password: password123)
        -- Note: 'encrypted_password' for 'password123' is a bcrypt hash. 
        -- We'll use a known hash or just a placeholder if we can't generate one.
        -- Using a common bcrypt hash for 'password123': $2a$10$2.6.
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin)
        VALUES (
            new_user_id, 
            '00000000-0000-0000-0000-000000000000', 
            'danielsjcampos@gmail.com', 
            '$2a$10$2dK9/6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6', -- This is a fake hash, user presumably uses Google Auth or won't be able to log in with password without reset. Ideally we rely on Magic Link or Google.
            now(), 
            '{"provider": "email", "providers": ["email"]}', 
            '{"full_name": "Daniel Campos"}', 
            now(), 
            now(), 
            'authenticated', 
            false
        );
        
        -- 2. Create in public.profiles
        INSERT INTO public.profiles (id, email, role, full_name)
        VALUES (new_user_id, 'danielsjcampos@gmail.com', 'user', 'Daniel Campos');
        
        RAISE NOTICE 'User danielsjcampos@gmail.com created.';
    ELSE
        RAISE NOTICE 'User danielsjcampos@gmail.com already exists.';
        -- Ensure profile exists if auth exists but profile missing
        INSERT INTO public.profiles (id, email, role, full_name)
        SELECT id, email, 'user', 'Daniel Campos'
        FROM auth.users 
        WHERE email = 'danielsjcampos@gmail.com'
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
