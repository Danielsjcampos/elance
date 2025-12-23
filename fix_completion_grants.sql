-- Fix Permission Denied Error for Training Completions

-- 1. Grant explicit permissions to the 'authenticated' role
-- This is often required even with RLS enabled if the base privileges were not granted.
GRANT ALL ON TABLE public.training_completions TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.training_completions TO authenticated;

-- 2. Ensure the ID sequence (if any) is accessible, though UUIDs don't need this. 
-- Just in case there are other serial columns or future changes.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Just to be absolutely sure, re-run the policy creation (safe to run multiple times if dropped first)
-- (We assume the policies from previous files are correct, but let's just create a "fallback" permissive one if others fail? 
-- No, let's trust the GRANTS first. The policies I read earlier looked correct: "auth.uid() = user_id")

-- 4. Verify RLS is actually on
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;
