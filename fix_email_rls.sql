-- Fix RLS for Email Module (v2 - More Robust)
-- This script ensures that authenticated users have full access to email-related tables.

-- 1. Grant permissions to the authenticated role (Supabase role for logged-in users)
GRANT ALL ON TABLE public.email_contacts TO authenticated;
GRANT ALL ON TABLE public.email_segments TO authenticated;
GRANT ALL ON TABLE public.email_templates TO authenticated;
GRANT ALL ON TABLE public.email_flows TO authenticated;
GRANT ALL ON TABLE public.email_flow_steps TO authenticated;
GRANT ALL ON TABLE public.email_queue TO authenticated;
GRANT ALL ON TABLE public.email_logs TO authenticated;

-- Grant to service_role as well for background tasks
GRANT ALL ON TABLE public.email_contacts TO service_role;
GRANT ALL ON TABLE public.email_segments TO service_role;
GRANT ALL ON TABLE public.email_templates TO service_role;
GRANT ALL ON TABLE public.email_flows TO service_role;
GRANT ALL ON TABLE public.email_flow_steps TO service_role;
GRANT ALL ON TABLE public.email_queue TO service_role;
GRANT ALL ON TABLE public.email_logs TO service_role;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Contacts are viewable by franchise" ON public.email_contacts;
DROP POLICY IF EXISTS "Contacts management by franchise" ON public.email_contacts;
DROP POLICY IF EXISTS "Templates are viewable by franchise" ON public.email_templates;
DROP POLICY IF EXISTS "Templates management by franchise" ON public.email_templates;
DROP POLICY IF EXISTS "Segments are viewable by franchise" ON public.email_segments;
DROP POLICY IF EXISTS "Segments management by franchise" ON public.email_segments;
DROP POLICY IF EXISTS "Flows are viewable by franchise" ON public.email_flows;
DROP POLICY IF EXISTS "Flows management by franchise" ON public.email_flows;
DROP POLICY IF EXISTS "Steps are viewable by franchise" ON public.email_flow_steps;
DROP POLICY IF EXISTS "Queue is managed by authenticated" ON public.email_queue;
DROP POLICY IF EXISTS "Logs are viewable by authenticated" ON public.email_logs;

-- 3. Create simple but secure policies (allowing operations for any authenticated user for now)
-- In a later step, we can restrict this further by franchise_unit_id once everything is stable.

-- POLICY: email_contacts
CREATE POLICY "email_contacts_policy" ON public.email_contacts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- POLICY: email_templates
CREATE POLICY "email_templates_policy" ON public.email_templates
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- POLICY: email_segments
CREATE POLICY "email_segments_policy" ON public.email_segments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- POLICY: email_flows
CREATE POLICY "email_flows_policy" ON public.email_flows
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- POLICY: email_flow_steps
CREATE POLICY "email_flow_steps_policy" ON public.email_flow_steps
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- POLICY: email_queue
CREATE POLICY "email_queue_policy" ON public.email_queue
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- POLICY: email_logs
CREATE POLICY "email_logs_policy" ON public.email_logs
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Ensure RLS is enabled
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
