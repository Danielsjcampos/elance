-- FIX: Ensure Admin has a Franchise and Fix RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Ensure 'Franquia Matriz' exists and get its ID
DO $$
DECLARE
    matriz_id UUID;
    admin_id UUID;
BEGIN
    -- Get or Create Matriz Franchise
    SELECT id INTO matriz_id FROM public.franchise_units WHERE name ILIKE '%Matriz%' LIMIT 1;
    
    IF matriz_id IS NULL THEN
        INSERT INTO public.franchise_units (name, active, address) 
        VALUES ('Franquia Matriz', true, 'Sede Principal')
        RETURNING id INTO matriz_id;
    END IF;

    -- 2. Update Admin User(s) to have this Franchise ID
    -- This fixes the "null value" error when Admin tries to create tasks
    UPDATE public.profiles 
    SET franchise_unit_id = matriz_id 
    WHERE role = 'admin' AND franchise_unit_id IS NULL;

    -- Optional: Also set specific user if known (e.g. current user)
    -- UPDATE public.profiles SET franchise_unit_id = matriz_id WHERE email = 'admin@...';

END $$;

-- 3. Fix Task RLS Policies
-- Sometimes "public.get_my_role()" fails if the user context isn't perfect.
-- Let's make the viewing policy more robust or redundant.

DROP POLICY IF EXISTS "Admin sees all tasks" ON public.tasks;
CREATE POLICY "Admin sees all tasks" ON public.tasks
    FOR ALL USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Ensure Franchisees see their own tasks
DROP POLICY IF EXISTS "Franchise sees own tasks" ON public.tasks;
CREATE POLICY "Franchise sees own tasks" ON public.tasks
    FOR ALL USING (
        franchise_id = (SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid())
    );

-- Allow Admin to Insert (Explicitly needed sometimes if "ALL" doesn't cover it due to trigger quirks)
DROP POLICY IF EXISTS "Admin can insert tasks" ON public.tasks;
CREATE POLICY "Admin can insert tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 4. Reload Schema
NOTIFY pgrst, 'reload config';
