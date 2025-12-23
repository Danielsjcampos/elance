
-- Enable RLS (if not already enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users (public) to INSERT leads
CREATE POLICY "Allow public insert to leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (true);

-- Ensure public cannot ready leads (optional, keeps data safe)
-- If there was a policy blocking, Supabase default is deny all.
-- We just need to ensure INSERT is allowed.
