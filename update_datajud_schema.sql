-- Table to store leads found via Datajud
CREATE TABLE IF NOT EXISTS public.legal_process_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_number TEXT NOT NULL UNIQUE,
    tribunal TEXT,
    court_name TEXT, -- orgaoJulgador
    parties_data JSONB, -- Store full parties/lawyers JSON
    assuntos_data JSONB, -- Store subjects
    status TEXT DEFAULT 'new', -- new, contacted, lost, converted
    notes TEXT,
    franchise_id UUID REFERENCES public.franchise_units(id), -- If a specific franchise claims it, or NULL for Matriz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_process_leads ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin/Matriz sees all
CREATE POLICY "Admin sees all leads" ON public.legal_process_leads
    FOR ALL USING (public.get_my_role() = 'admin');

-- Franchisees see their own (if assigned)
CREATE POLICY "Franchise sees own leads" ON public.legal_process_leads
    FOR ALL USING (franchise_id = public.get_my_franchise_id());
