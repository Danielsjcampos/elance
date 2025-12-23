-- FIX AI CHAT PERMISSIONS
-- Run this in Supabase SQL Editor

-- 1. Reset Policies for ai_chats
DROP POLICY IF EXISTS "Users own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can insert own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can select own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.ai_chats;

CREATE POLICY "Users can insert own chats" ON public.ai_chats
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can select own chats" ON public.ai_chats
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own chats" ON public.ai_chats
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own chats" ON public.ai_chats
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 2. Reset Policies for ai_messages
DROP POLICY IF EXISTS "Users own messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can select own messages" ON public.ai_messages;

CREATE POLICY "Users can insert own messages" ON public.ai_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        chat_id IN (SELECT id FROM public.ai_chats WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can select own messages" ON public.ai_messages
    FOR SELECT
    TO authenticated
    USING (
        chat_id IN (SELECT id FROM public.ai_chats WHERE user_id = auth.uid())
    );

-- 3. Force RLS Enable (Just in case)
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- 4. Reload
NOTIFY pgrst, 'reload config';
