-- FINAL PERMISSION FIX: Tasks
-- Run this in Supabase SQL Editor

-- 1. DROP ALL restrictive policies on tasks to start fresh
DROP POLICY IF EXISTS "Admin sees all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Franchise sees own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Franchise can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON public.tasks;

-- 2. CREATE A "SUPER ADMIN" POLICY (Reads/Writes Everything)
-- This checks the 'profiles' table directly for the 'admin' role.
CREATE POLICY "Admin Full Access" ON public.tasks
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. CREATE FRANCHISE POLICY (See Own Franchise Tasks)
CREATE POLICY "Franchise View Access" ON public.tasks
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    -- User sees task IF it belongs to their franchise
    franchise_id = (SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid())
    OR
    -- OR if it is assigned specifically to them
    assigned_to = auth.uid()
);

-- 4. CREATE FRANCHISE INSERT POLICY (Managers can create tasks for their franchise)
CREATE POLICY "Manager Create Access" ON public.tasks
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    -- Role must be manager
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager'
    AND
    -- Must create for their own franchise
    franchise_id = (SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid())
);

-- 5. UPDATE POLICY (Users can complete their tasks)
CREATE POLICY "User Update Access" ON public.tasks
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    -- Can update if assigned
    assigned_to = auth.uid()
    OR
    -- OR if Admin (covered by first policy? No, policies are OR, so we are good. extra safety:)
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. Verify Admin Role (Just in case)
-- Ensure your user is definitely an admin
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@elance.com'; -- Uncomment and edit if needed

NOTIFY pgrst, 'reload config';
