-- INSERT TEST NOTIFICATIONS
-- Creates a notification for EVERY user in the system to verify visibility.

INSERT INTO public.notifications (user_id, title, message, type, link, read)
SELECT 
    id as user_id,
    'Teste de Notificação' as title,
    'Esta é uma notificação de teste criada manualmente para verificar o sistema.' as message,
    'info' as type,
    '/admin/dashboard' as link,
    false as read
FROM public.profiles;

-- Ensure RLS allows reading own notifications
DROP POLICY IF EXISTS "Users can see own notifications" ON public.notifications;
CREATE POLICY "Users can see own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Ensure RLS allows inserting (for system/triggers) - though we are running this as admin/postgres usually
-- But for future triggers:
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Ideally restrict to triggers or specific roles, but OK for now.

NOTIFY pgrst, 'reload config';
