-- Add SMTP config column to franchise_units
ALTER TABLE public.franchise_units 
ADD COLUMN IF NOT EXISTS smtp_config JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.franchise_units.smtp_config IS 'Stores SMTP settings: host, port, user, pass, secure, sender_name, sender_email';
