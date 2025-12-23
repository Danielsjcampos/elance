-- Migration: support_task_notifications.sql

-- 1. Add created_by to tasks for logging
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    task_id UUID REFERENCES public.tasks(id), -- Optional link to source task
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Notifications

-- Users can see their own notifications
CREATE POLICY "Users see own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Admins (or system) can insert notifications (for everyone)
-- Allowing authenticated users to insert notifications if needed (e.g. one user notifying another)
-- But typically backend/system triggers. For now, let's allow authenticated to insert to themselves or others if logic demands.
-- Easier: "Admin sees all" (audit)
CREATE POLICY "Admin sees all notifications" ON public.notifications
    FOR ALL USING (public.get_my_role() = 'admin');

-- Allow creation:
CREATE POLICY "Everyone can create notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);
