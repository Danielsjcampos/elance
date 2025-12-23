-- Add Specific User Assignment for Documents

ALTER TABLE public.company_documents 
ADD COLUMN IF NOT EXISTS target_user_ids UUID[] DEFAULT '{}';

COMMENT ON COLUMN public.company_documents.target_user_ids IS 'List of specific user IDs required to sign the document';
