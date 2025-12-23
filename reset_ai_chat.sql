-- NUCLEAR FIX for AI CHAT
-- This deletes existing AI chats to fix permissions permanently.

-- 1. Drop Tables (Clean Slate)
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chats CASCADE;

-- 2. Create Tables Again
CREATE TABLE public.ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT DEFAULT 'Nova Conversa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. OPEN Permissions (Simplest Robust RLS)
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Allow Authenticated Users to do ANYTHING with their own data
CREATE POLICY "AI Chats Full Access" ON public.ai_chats
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "AI Messages Full Access" ON public.ai_messages
    FOR ALL
    TO authenticated
    USING (
        chat_id IN (SELECT id FROM public.ai_chats WHERE user_id = auth.uid())
    )
    WITH CHECK (
        chat_id IN (SELECT id FROM public.ai_chats WHERE user_id = auth.uid())
    );

-- 4. Reload
NOTIFY pgrst, 'reload config';
