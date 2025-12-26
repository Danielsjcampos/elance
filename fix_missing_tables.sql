
-- ATENÇÃO: Execute este script no 'SQL Editor' do seu Dashboard Supabase para corrigir o erro 'table not found'

CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchise_units(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    content TEXT, -- HTML or Markdown
    featured_image_url TEXT,
    published BOOLEAN DEFAULT false,
    sent_by_email BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar permissões (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (Site e Blog)
CREATE POLICY "Public news read" ON public.news FOR SELECT USING (true);

-- Política de escrita para Admins (Painel)
CREATE POLICY "Admin news all" ON public.news FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'manager', 'franchisee'))
);

-- Tabela de Campanhas de Email (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchise_units(id),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    recipient_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin campaigns all" ON public.email_campaigns FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'manager', 'franchisee'))
);
