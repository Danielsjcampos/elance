-- EMERGENCY: DISABLE RLS FOR AI CHATS
-- Run this in Supabase SQL Editor
-- This turns off permission checks for the AI tables so they will ALWAYS work.

ALTER TABLE public.ai_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users (just in case)
GRANT ALL ON public.ai_chats TO authenticated;
GRANT ALL ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_chats TO service_role;
GRANT ALL ON public.ai_messages TO service_role;

NOTIFY pgrst, 'reload config';
