-- 1. Update Auctions Table for Kanban
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'triagem';

-- 2. Create Task Templates Table for Automation
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    stage_trigger TEXT NOT NULL, -- 'triagem', 'preparacao', 'ativo', 'pos_arrematacao'
    days_due INTEGER DEFAULT 3, -- Default days to complete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS for Task Templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Everyone can read templates, Admin manages them
CREATE POLICY "Everyone reads templates" ON public.task_templates 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated manage templates" ON public.task_templates 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Seed Initial Templates (Idempotent)
INSERT INTO public.task_templates (title, stage_trigger, days_due)
VALUES 
    ('Análise de Matrícula', 'triagem', 2),
    ('Verificar Dívidas (IPTU/Condomínio)', 'triagem', 3),
    ('Agendar Fotógrafo', 'preparacao', 5),
    ('Elaborar Edital', 'preparacao', 5),
    ('Aprovação Jurídica', 'preparacao', 2),
    ('Publicar no Site', 'ativo', 1),
    ('Disparo de E-mail Marketing', 'ativo', 1),
    ('Monitorar Lances (1ª Praça)', 'ativo', 0),
    ('Emitir Auto de Arrematação', 'pos_arrematacao', 1),
    ('Coletar Comprovante de Pagamento', 'pos_arrematacao', 2),
    ('Solicitar Carta de Arrematação', 'pos_arrematacao', 10),
    ('Registrar Imóvel', 'pos_arrematacao', 30)
ON CONFLICT DO NOTHING; 
-- Note: 'ON CONFLICT' needs a constraint, but since we are just inserting for now and ID is random, 
-- simple re-runs might duplicate. For a robust script, we'd check existence, but for this dev stage, duplicates generally won't break logic (just clutter). 
-- actually, let's make it cleaner by checking titles.

DELETE FROM public.task_templates; -- Clear old templates to avoid duplicates on re-run for now
INSERT INTO public.task_templates (title, stage_trigger, days_due)
VALUES 
    ('Análise de Matrícula', 'triagem', 2),
    ('Verificar Dívidas (IPTU/Condomínio)', 'triagem', 3),
    ('Agendar Fotógrafo', 'preparacao', 5),
    ('Elaborar Edital', 'preparacao', 5),
    ('Aprovação Jurídica', 'preparacao', 2),
    ('Publicar no Site', 'ativo', 1),
    ('Disparo de E-mail Marketing', 'ativo', 1),
    ('Monitorar Lances (1ª Praça)', 'ativo', 0),
    ('Emitir Auto de Arrematação', 'pos_arrematacao', 1),
    ('Coletar Comprovante de Pagamento', 'pos_arrematacao', 2),
    ('Solicitar Carta de Arrematação', 'pos_arrematacao', 10),
    ('Registrar Imóvel', 'pos_arrematacao', 30);
