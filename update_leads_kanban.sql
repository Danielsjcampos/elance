-- Update Leads for Kanban and Tags

-- 1. Add Assignment Column (if not exists)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id);

-- 2. Add Tags Column
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Add Updated At for tracking drag and drop changes order (optional, but good for sorting)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 4. Enable RLS for these columns? 
-- The table already has RLS. The new columns are covered by existing policies generally,
-- but "Franchise sees own leads" implies they can see the assigned_to and tags.

-- 5. Helper verification (Not strictly needed but good for debugging)
COMMENT ON COLUMN public.leads.tags IS 'Array of tags like {whatsapp, landing_page}';
