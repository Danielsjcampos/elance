-- Function to update a user (auth.users and public.profiles)
CREATE OR REPLACE FUNCTION public.admin_update_user(
    target_user_id UUID,
    new_email TEXT DEFAULT NULL,
    new_password TEXT DEFAULT NULL,
    new_full_name TEXT DEFAULT NULL,
    new_role TEXT DEFAULT NULL,
    new_permissions JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres) to access auth schema
AS $$
DECLARE
    encrypted_pw TEXT;
    updates_auth JSONB;
BEGIN
    -- 1. Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- 2. Update auth.users (Email & Password)
    -- Requires careful handling. We update directly for typical admin overrides.
    
    IF new_email IS NOT NULL AND new_email != '' THEN
        -- Check uniqueness
        IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email AND id != target_user_id) THEN
            RAISE EXCEPTION 'Email % already in use by another user', new_email;
        END IF;
        
        UPDATE auth.users 
        SET email = new_email, updated_at = now()
        WHERE id = target_user_id;
    END IF;

    IF new_password IS NOT NULL AND new_password != '' THEN
        encrypted_pw := crypt(new_password, gen_salt('bf'));
        
        UPDATE auth.users 
        SET encrypted_password = encrypted_pw, updated_at = now()
        WHERE id = target_user_id;
    END IF;

    -- 3. Update public.profiles (Name, Role, Permissions)
    UPDATE public.profiles
    SET
        full_name = COALESCE(new_full_name, full_name),
        role = COALESCE(new_role::public.user_role, role),
        permissions = COALESCE(new_permissions, permissions),
        email = COALESCE(new_email, email) -- Keep sync
    WHERE id = target_user_id;
    
END;
$$;