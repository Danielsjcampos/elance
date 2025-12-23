-- Allow public read access to franchise_units so the frontend can load the Logo/Icon
ALTER TABLE public.franchise_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view franchise settings"
ON public.franchise_units
FOR SELECT
TO public
USING (true);

-- If you only want to expose specific units, you could restrict the USING clause, e.g.
-- USING (type = 'matrix' OR is_active = true);
