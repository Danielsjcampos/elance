-- FIX INFINITE RECURSION IN RLS
-- The previous policies caused a loop because checking "Am I Admin?" required reading the table protected by "Only Admins".
-- Solution: Use SECURITY DEFINER functions to bypass RLS for the check itself.

-- 1. Helper: Check if user is Admin (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Runs as Creator (Superuser), ignoring RLS
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- 2. Helper: Get my Franchise ID (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_franchise_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Critical
AS $$
DECLARE
    f_id UUID;
BEGIN
    SELECT franchise_unit_id INTO f_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN f_id;
END;
$$;

-- 3. Grant verify permissions
GRANT EXECUTE ON FUNCTION public.check_is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_franchise_id TO authenticated;


-- 4. RESET POLICIES using the new safe functions
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Members can view profiles in their franchise" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view profiles in their franchise" ON public.profiles;

-- Policy A: Users can ALWAYS see their own profile (No recursion risk usually, but safe base)
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy B: Admins can view ALL (Uses helper to avoid recursion)
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.check_is_admin() = true);

-- Policy C: Members/Managers can view SAME Franchise (Uses helper)
CREATE POLICY "Members can view profiles in their franchise"
    ON public.profiles FOR SELECT
    USING (
        franchise_unit_id = public.get_my_franchise_id()
    );

-- 5. Force refresh schema cache just in case
NOTIFY pgrst, 'reload config';
