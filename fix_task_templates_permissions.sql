-- CORREÇÃO DE PERMISSÕES PARA MODELOS DE TAREFAS (TASK TEMPLATES)
-- Execute este script no SQL Editor do Supabase para corrigir o erro "permission denied for table task_templates"

-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- 2. Remover política restritiva antiga (que exigia role = 'admin')
DROP POLICY IF EXISTS "Admin manages templates" ON public.task_templates;

-- 3. Criar nova política permitindo que qualquer usuário autenticado gerencie os modelos
-- Isso permite inserir, editar e excluir modelos de automação
CREATE POLICY "Authenticated manage templates" ON public.task_templates 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 4. Garantir permissões de sequência (caso o ID seja serial, embora aqui seja UUID gen_random_uuid, mal não faz)
GRANT ALL ON public.task_templates TO authenticated;
GRANT ALL ON public.task_templates TO service_role;

-- 5. Recarregar permissões do PostgREST
NOTIFY pgrst, 'reload config';
