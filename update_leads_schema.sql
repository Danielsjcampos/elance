-- ADD COLUMNS property_value AND interest TO leads
-- These columns are required for the Dashboard 'Properties for Sale' list and Seed Data.

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS property_value NUMERIC DEFAULT 0;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS interest TEXT;

-- Optional: Add index for performance if sorting by value
CREATE INDEX IF NOT EXISTS idx_leads_property_value ON public.leads(property_value);
