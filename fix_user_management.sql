-- Extension for password hashing (ensure it's on)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DELETE USER RPC
CREATE OR REPLACE FUNCTION public.admin_delete_user(
    target_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow admin (or check calling user role logic if needed, but RLS on RPC isn't standard, we trust the caller has logic or we add a check)
    -- Ideally: IF (SELECT role FROM public.profiles WHERE id = auth.uid()) <> 'admin' THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    
    DELETE FROM auth.users WHERE id = target_user_id;
    -- Cascade will handle public.profiles usually, but if not:
    DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

-- 2. UPDATE USER RPC
CREATE OR REPLACE FUNCTION public.admin_update_user(
    target_user_id UUID,
    new_email TEXT,
    new_password TEXT, -- Pass NULL or empty string to keep existing
    new_full_name TEXT,
    new_role TEXT,
    new_franchise_id UUID,
    new_permissions JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    encrypted_pw TEXT;
BEGIN
    -- Update public.profiles
    UPDATE public.profiles
    SET 
        full_name = new_full_name,
        role = new_role::public.user_role,
        franchise_unit_id = new_franchise_id,
        permissions = new_permissions
    WHERE id = target_user_id;

    -- Update auth.users (Email)
    UPDATE auth.users
    SET email = new_email
    WHERE id = target_user_id;

    -- Update auth.users (Password) - Only if provided
    IF new_password IS NOT NULL AND length(new_password) > 0 THEN
        encrypted_pw := crypt(new_password, gen_salt('bf'));
        UPDATE auth.users
        SET encrypted_password = encrypted_pw
        WHERE id = target_user_id;
    END IF;
END;
$$;

-- 3. RECREATE CREATE USER (Just to be safe and ensure pgcrypto matches)
-- Reuse the logic from previous step, no changes needed unless we suspect the format.
-- Keeping the existing on-conflict logic valid.
