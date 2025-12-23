-- EMERGENCY UNLOCK SCRIPT
-- 1. Disable RLS on profiles to stop "Infinite Recursion" and "Permission Denied" immediately.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Update all users to 'manager' (as requested)
-- We keep 'admin' for the main account just in case, but everyone else becomes manager.
UPDATE public.profiles 
SET role = 'manager' 
WHERE role IS NULL OR role = 'collaborator';

-- 3. Ensure Matriz is Admin
UPDATE public.profiles
SET role = 'admin', permissions = '{}'::jsonb
WHERE email = 'matriz@elance.com';

-- 4. Reset Permissions for everyone else to "Allow All" (Empty object = Allow in our logic)
UPDATE public.profiles
SET permissions = '{}'::jsonb
WHERE email != 'matriz@elance.com';

-- 5. Grant access to everyone
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
