-- Enable RLS on profiles if not already (it usually is)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Drop existing policies to avoid conflicts or stale logic
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Members can view profiles in their franchise" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view profiles in their franchise" ON public.profiles; -- Legacy cleanup

-- 2. Policy: Users can see their own profile (Always allowed)
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 3. Policy: Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Policy: Managers/Collaborators can view profiles ONLY in their own Franchise
-- Note: This is crucial for 'fetchTeam' to work for managers too.
CREATE POLICY "Members can view profiles in their franchise"
    ON public.profiles
    FOR SELECT
    USING (
        franchise_unit_id = (
            SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 5. Grant usage just in case
GRANT SELECT ON public.profiles TO authenticated;
