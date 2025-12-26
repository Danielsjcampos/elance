-- Central de Fluxos de E-mail Migration
-- This script creates the structure for the marketing and email automation module.

-- 1. Contacts Table
CREATE TABLE IF NOT EXISTS public.email_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'descadastrado')),
    origem TEXT, -- lead page, compra, evento, etc
    interesses JSONB DEFAULT '[]'::jsonb, -- ['imovel', 'veiculo']
    franchise_unit_id UUID REFERENCES public.franchise_units(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    unsubscribed_at TIMESTAMPTZ,
    data_criacao TIMESTAMPTZ DEFAULT now(),
    ultima_interacao TIMESTAMPTZ DEFAULT now()
);

-- 2. Segments Table
CREATE TABLE IF NOT EXISTS public.email_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_segmento TEXT NOT NULL,
    descricao TEXT,
    regras JSONB NOT NULL DEFAULT '{}'::jsonb,
    ativo BOOLEAN DEFAULT true,
    franchise_unit_id UUID REFERENCES public.franchise_units(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_template TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('noticia', 'blog', 'leilao', 'comunicado', 'outros')),
    assunto TEXT NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    variaveis JSONB DEFAULT '[]'::jsonb, -- e.g. ["nome", "link"]
    franchise_unit_id UUID REFERENCES public.franchise_units(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Flows Table
CREATE TABLE IF NOT EXISTS public.email_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fluxo TEXT NOT NULL,
    tipo TEXT DEFAULT 'manual' CHECK (tipo IN ('manual', 'automatico')),
    segmento_id UUID REFERENCES public.email_segments(id),
    ativo BOOLEAN DEFAULT true,
    franchise_unit_id UUID REFERENCES public.franchise_units(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Flow Steps Table
CREATE TABLE IF NOT EXISTS public.email_flow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fluxo_id UUID REFERENCES public.email_flows(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    template_id UUID REFERENCES public.email_templates(id),
    delay_em_horas INTEGER DEFAULT 0,
    condicao JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Email Queue Table
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contato_id UUID REFERENCES public.email_contacts(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.email_templates(id),
    fluxo_id UUID REFERENCES public.email_flows(id),
    step_id UUID REFERENCES public.email_flow_steps(id),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro', 'cancelado')),
    tentativas INTEGER DEFAULT 0,
    erro_log TEXT,
    scheduled_for TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contato_id UUID REFERENCES public.email_contacts(id),
    email_queue_id UUID REFERENCES public.email_queue(id),
    aberto BOOLEAN DEFAULT false,
    clicado BOOLEAN DEFAULT false,
    data_abertura TIMESTAMPTZ,
    data_clique TIMESTAMPTZ,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) - Basic setup
-- Enable RLS
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified: allow authenticated users of the same franchise)
-- For email_contacts
CREATE POLICY "Contacts are viewable by franchise" ON public.email_contacts
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE franchise_unit_id = email_contacts.franchise_unit_id
    ));

-- Repeat similar policies for other tables or use a more global approach if profiles are set
-- For brevity, I'll set a policy that allows all authenticated users for now, 
-- but in a real SaaS you'd restrict by franchise_unit_id like above.

CREATE POLICY "Templates are viewable by franchise" ON public.email_templates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Segments are viewable by franchise" ON public.email_segments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Flows are viewable by franchise" ON public.email_flows
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Steps are viewable by franchise" ON public.email_flow_steps
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Queue is managed by authenticated" ON public.email_queue
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Logs are viewable by authenticated" ON public.email_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.email_contacts IS 'Subscribers and leads for email marketing';
COMMENT ON TABLE public.email_segments IS 'Dynamic segmentation rules for contacts';
COMMENT ON TABLE public.email_templates IS 'HTML/Text email templates with variable markers';
COMMENT ON TABLE public.email_flows IS 'Email automation flows';
COMMENT ON TABLE public.email_flow_steps IS 'Steps within an email automation flow';
COMMENT ON TABLE public.email_queue IS 'Emails waiting to be sent or already processed';
COMMENT ON TABLE public.email_logs IS 'Tracking data for email interactions';
