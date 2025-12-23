-- MASTER FIX SCRIPT
-- This script fixes Schema, RLS, and Admin Profile in one go.

BEGIN;

-- 1. SCHEMA FIX: Ensure 'email' column exists in profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. RLS REPAIR: Reset all policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Members can view profiles in their franchise" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view profiles in their franchise" ON public.profiles;

-- Policy: Users can see their own
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy: Admins can view ALL
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy: Members/Managers can view franchise
CREATE POLICY "Members can view profiles in their franchise"
    ON public.profiles FOR SELECT
    USING (
        franchise_unit_id = (SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid())
    );

GRANT SELECT ON public.profiles TO authenticated;

-- 3. ADMIN PROFILE RECOVERY
DO $$
DECLARE
    target_email TEXT := 'matriz@elance.com';
    target_user_id UUID;
BEGIN
    -- Find user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'WARNING: User % not found in auth.users. Cannot create profile.', target_email;
    ELSE
        -- Upsert Profile
        INSERT INTO public.profiles (id, full_name, email, role, permissions)
        VALUES (
            target_user_id,
            'Super Admin (Master Fix)',
            target_email,
            'admin',
            '{}'::jsonb
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'admin',
            permissions = '{}'::jsonb;
            
        RAISE NOTICE 'SUCCESS: Admin Profile Restored for %', target_email;
    END IF;
END $$;

COMMIT;