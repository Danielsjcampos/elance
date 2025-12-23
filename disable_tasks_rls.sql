-- EMERGENCY: DISABLE RLS FOR TASKS
-- Run this in Supabase SQL Editor
-- This turns off permission checks for the TASKS table.

ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

NOTIFY pgrst, 'reload config';
