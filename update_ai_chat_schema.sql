-- AI CHAT SCHEMA
-- Save this as update_ai_chat_schema.sql and Run in Supabase

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL DEFAULT 'Nova Conversa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'model')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Users can only see/edit their own chats
CREATE POLICY "Users own chats" ON public.ai_chats
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can see messages of their own chats
CREATE POLICY "Users own messages" ON public.ai_messages
    FOR ALL
    USING (
        chat_id IN (SELECT id FROM public.ai_chats WHERE user_id = auth.uid())
    )
    WITH CHECK (
        chat_id IN (SELECT id FROM public.ai_chats WHERE user_id = auth.uid())
    );

-- 4. Reload
NOTIFY pgrst, 'reload config';
