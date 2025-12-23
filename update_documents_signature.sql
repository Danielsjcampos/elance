-- Digital Signatures for Documents

-- 1. Add Signature Requirement fields to Company Documents
ALTER TABLE public.company_documents 
ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT false;

ALTER TABLE public.company_documents 
ADD COLUMN IF NOT EXISTS target_roles TEXT[] DEFAULT '{all}'; -- 'admin', 'manager', 'collaborator', or 'all'

-- 2. Create Signatures Table
CREATE TABLE IF NOT EXISTS public.document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.company_documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address TEXT,
    UNIQUE(document_id, user_id)
);

-- 3. RLS for Signatures
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Users can insert their own signature
CREATE POLICY "Users can sign documents" ON public.document_signatures
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own signatures
CREATE POLICY "Users view own signatures" ON public.document_signatures
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can view all signatures (to track who signed)
CREATE POLICY "Admins view all signatures" ON public.document_signatures
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. Grant Permissions (Critical based on previous errors)
GRANT ALL ON TABLE public.document_signatures TO authenticated;
GRANT ALL ON TABLE public.company_documents TO authenticated;
