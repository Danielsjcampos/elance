-- COMBINED SETUP SCRIPT (Schema + Data)
-- Run this entire script in your Supabase SQL Editor to verify the features.

-- ==============================================================================
-- 1. SCHEMA MIGRATION
-- ==============================================================================

-- Enable UUID extension just in case
create extension if not exists "uuid-ossp";

-- 1.1 TASK TEMPLATES & AUTOMATION
create table if not exists public.task_templates (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  trigger_event text check (trigger_event in ('auction_created', 'lead_created', 'none')) default 'none',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.task_template_steps (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.task_templates(id) on delete cascade,
  title text not null,
  description text,
  order_index integer default 0,
  due_offset_days integer default 0,
  priority text default 'medium' -- changed enum to text to avoid type issues if enum exists
);

-- Ensure Tasks table has new columns (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='template_id') THEN
        ALTER TABLE public.tasks ADD COLUMN template_id uuid references public.task_templates(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='parent_task_id') THEN
        ALTER TABLE public.tasks ADD COLUMN parent_task_id uuid references public.tasks(id);
    END IF;
END $$;

-- Task items/checklists
create table if not exists public.task_steps (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  order_index integer default 0
);

-- 1.2 TRAINING CENTER
DO $$ BEGIN
    CREATE TYPE training_category AS ENUM ('mandatory', 'recommended', 'webinar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists public.trainings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category training_category default 'recommended',
  thumbnail_url text,
  video_url text,
  points integer default 0,
  duration_minutes integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_training_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  training_id uuid references public.trainings(id) on delete cascade,
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started',
  completed_at timestamp with time zone,
  score integer default 0,
  unique(user_id, training_id)
);

-- 1.3 DOCUMENTS CENTER
create table if not exists public.company_documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text, -- 'contract', 'manual', 'policy', 'form'
  file_url text not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.document_permissions (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.company_documents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  unique(document_id, user_id)
);

create table if not exists public.user_document_actions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id),
    document_id uuid references public.company_documents(id),
    action_type text check (action_type in ('downloaded', 'signed')),
    action_date timestamp with time zone default now()
);

-- 1.4 MARKETING CENTER
create table if not exists public.marketing_materials (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text, -- 'logo', 'banner', 'folder', 'card'
  file_url text not null,
  thumbnail_url text,
  is_editable boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.5 AGENDA / EVENTS
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  type text check (type in ('meeting', 'lecture', 'course', 'reminder')),
  is_public boolean default false,
  creator_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.event_participants (
    event_id uuid references public.events(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    status text check (status in ('pending', 'confirmed', 'declined')) default 'pending',
    primary key (event_id, user_id)
);

-- 1.6 RLS POLICIES
alter table public.task_templates enable row level security;
alter table public.task_template_steps enable row level security;
alter table public.task_steps enable row level security;
alter table public.trainings enable row level security;
alter table public.user_training_progress enable row level security;
alter table public.company_documents enable row level security;
alter table public.marketing_materials enable row level security;
alter table public.events enable row level security;

-- Drop existing policies to avoid conflicts if re-running
drop policy if exists "Allow all authenticated" on public.task_templates;
drop policy if exists "Allow all authenticated" on public.task_template_steps;
drop policy if exists "Allow all authenticated" on public.task_steps;
drop policy if exists "Allow all authenticated" on public.trainings;
drop policy if exists "Allow all authenticated" on public.user_training_progress;
drop policy if exists "Allow all authenticated" on public.company_documents;
drop policy if exists "Allow all authenticated" on public.marketing_materials;
drop policy if exists "Allow all authenticated" on public.events;

create policy "Allow all authenticated" on public.task_templates for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.task_template_steps for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.task_steps for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.trainings for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.user_training_progress for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.company_documents for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.marketing_materials for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.events for all using (auth.role() = 'authenticated');


-- ==============================================================================
-- 2. SEED DATA
-- ==============================================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_lead_arrematante uuid;
  v_lead_advogado uuid;
  v_auction_1 uuid;
  v_auction_2 uuid;
  v_template_entrada uuid;
  v_template_pos uuid;
BEGIN
  -- 2.1 Get an admin/user ID for assignments (limit 1)
  -- If you are not logged in yet, this might be null, so check.
  SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
  
  -- If no profile exists, skip data creation effectively
  IF v_admin_id IS NULL THEN
     RAISE NOTICE 'No profile found. Skipping data insertion. Create a user first.';
     RETURN;
  END IF;

  --------------------------------------------------------------------------------
  -- CLIENTES / LEADS
  --------------------------------------------------------------------------------
  -- Arrematante
  INSERT INTO public.leads (name, type, status, email, phone, profession, notes, created_by)
  VALUES ('Dr. Roberto Investidor', 'arrematante', 'habilitado', 'roberto@invest.com', '11999887766', 'Médico', 'Busca oportunidades em SP e RJ. Capital disponível: R$ 5MM.', v_admin_id)
  RETURNING id INTO v_lead_arrematante;

  -- Advogado
  INSERT INTO public.leads (name, type, status, email, phone, profession, notes, created_by)
  VALUES ('Dra. Juliana Mendes', 'advogado', 'interessado', 'juliana.law@email.com', '11988776655', 'Advogada Imobiliária', 'Parceira para processos de desocupação.', v_admin_id)
  RETURNING id INTO v_lead_advogado;

  -- Outros
  INSERT INTO public.leads (name, type, status, email, phone, profession, created_by) VALUES
  ('Construtora Fortes', 'arrematante', 'novo', 'contato@fortes.com.br', '1133445566', 'Construtora', v_admin_id),
  ('Mário Silva (Comitente)', 'comitente', 'arquivado', 'mario@email.com', '11900001111', 'Empresário', v_admin_id),
  ('Fernanda Corretores Associados', 'parceiro', 'documentacao_pendente', 'fernanda@corretor.com', '21999999999', 'Corretora', v_admin_id);

  --------------------------------------------------------------------------------
  -- LEILÕES (AUCTIONS)
  --------------------------------------------------------------------------------
  INSERT INTO public.auctions (process_number, vara, description, valuation_value, minimum_bid, first_auction_date, second_auction_date, status, created_by, arrematante_id)
  VALUES 
  ('Proc. 102030-40.2024.8.26.0100', '25ª Vara Cível SP', 'Cobertura Duplex no Morumbi. 350m2. Vista Panorâmica. 4 Vagas.', 3500000.00, 1750000.00, now() + interval '15 days', now() + interval '30 days', 'publicado', v_admin_id, null)
  RETURNING id INTO v_auction_1;

  INSERT INTO public.auctions (process_number, vara, description, valuation_value, minimum_bid, first_auction_date, second_auction_date, status, created_by, arrematante_id)
  VALUES 
  ('Proc. 555666-77.2023.8.26.0001', '3ª Vara Família RJ', 'Imóvel Comercial no Centro. Antiga sede de banco. 800m2.', 8000000.00, 4800000.00, now() - interval '20 days', now() - interval '5 days', 'segunda_praca', v_admin_id, null)
  RETURNING id INTO v_auction_2;

  --------------------------------------------------------------------------------
  -- TASK TEMPLATES & AUTOMATION
  --------------------------------------------------------------------------------
  INSERT INTO public.task_templates (title, description, trigger_event)
  VALUES ('Protocolo de Entrada (Imóvel Urbano)', 'Checklist padrão para novos cadastros de imóveis urbanos.', 'auction_created')
  RETURNING id INTO v_template_entrada;

  INSERT INTO public.task_template_steps (template_id, title, order_index, due_offset_days, priority) VALUES 
  (v_template_entrada, 'Buscar Matrícula Atualizada (ONR)', 1, 1, 'high'),
  (v_template_entrada, 'Verificar Débitos de IPTU', 2, 2, 'medium'),
  (v_template_entrada, 'Verificar Débitos de Condomínio', 3, 2, 'medium'),
  (v_template_entrada, 'Solicitar Laudo de Avaliação', 4, 5, 'medium'),
  (v_template_entrada, 'Publicar no Site Oficial', 5, 7, 'urgent');

  INSERT INTO public.task_templates (title, description, trigger_event)
  VALUES ('Pós-Arrematação', 'Procedimentos após a venda do imóvel.', 'none')
  RETURNING id INTO v_template_pos;

  INSERT INTO public.task_template_steps (template_id, title, order_index, due_offset_days, priority) VALUES 
  (v_template_pos, 'Emitir Auto de Arrematação', 1, 0, 'urgent'),
  (v_template_pos, 'Confirmar Pagamento da Comissão', 2, 1, 'high'),
  (v_template_pos, 'Enviar Guia de ITBI ao cliente', 3, 5, 'medium');

  --------------------------------------------------------------------------------
  -- TASKS (TAREFAS)
  --------------------------------------------------------------------------------
  -- Tarefa avulsa
  INSERT INTO public.tasks (title, description, priority, status, due_date, assignee_id, creator_id)
  VALUES 
  ('Reunião de Alinhamento Semanal', 'Definir metas para o próximo trimestre.', 'medium', 'pending', now() + interval '2 days', v_admin_id, v_admin_id),
  ('Cobrar documentação do Dr. Roberto', 'Falta enviar o comprovante de residência.', 'high', 'in_progress', now(), v_admin_id, v_admin_id);

  -- Tarefa vinculada a leilão (Simulando automação)
  INSERT INTO public.tasks (title, description, priority, status, related_auction_id, assignee_id)
  VALUES ('Avaliação Proc. 102030', 'Realizar vistoria e fotos do imóvel.', 'medium', 'pending', v_auction_1, v_admin_id);

  --------------------------------------------------------------------------------
  -- CENTRO DE TREINAMENTO
  --------------------------------------------------------------------------------
  INSERT INTO public.trainings (title, description, category, points, duration_minutes, thumbnail_url, video_url) VALUES
  ('Introdução ao Mundo dos Leilões', 'Tudo o que você precisa saber para começar a operar com segurança.', 'mandatory', 500, 45, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop', 'https://www.youtube.com/watch?v=example1'),
  ('Análise de Matrícula Expert', 'Aprenda a identificar gravames ocultos e riscos na matrícula.', 'recommended', 300, 60, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop', 'https://www.youtube.com/watch?v=example2'),
  ('Marketing para Leiloeiros', 'Como atrair investidores qualificados nas redes sociais.', 'webinar', 150, 90, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop', 'https://www.youtube.com/watch?v=example3'),
  ('Regularização Fundiária', 'Webinar gravado com Dr. Especialista.', 'webinar', 200, 120, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop', 'https://www.youtube.com/watch?v=example4');

  --------------------------------------------------------------------------------
  -- CENTRO DE DOCUMENTAÇÃO
  --------------------------------------------------------------------------------
  INSERT INTO public.company_documents (title, description, category, file_url, is_public) VALUES
  ('Contrato de Franquia 2025', 'Versão atualizada do contrato padrão.', 'contract', 'https://example.com/contrato.pdf', false),
  ('Aditivo Contratual - LGPD', 'Termos de adequação à lei de proteção de dados.', 'contract', 'https://example.com/aditivo_lgpd.pdf', false),
  ('Manual Operacional do Franqueado (MOP)', 'Guia completo de operações diárias.', 'manual', 'https://example.com/manual_ops.pdf', true),
  ('Guia de Identidade Visual', 'Regras para uso da marca nos materiais.', 'manual', 'https://example.com/brand_book.pdf', true),
  ('Política de Compliance', 'Regras de conduta e ética.', 'policy', 'https://example.com/compliance.pdf', true),
  ('Formulário de Cadastramento de Imóvel', 'PDF editável para coleta de dados em campo.', 'form', 'https://example.com/fichacaptacao.pdf', true);

  --------------------------------------------------------------------------------
  -- CENTRO DE MARKETING
  --------------------------------------------------------------------------------
  INSERT INTO public.marketing_materials (title, description, type, file_url, thumbnail_url) VALUES
  ('Banner Feed Instagram - Oportunidade', 'Template editável (PSD) para destaque de imóvel.', 'banner', 'https://example.com/banner1.psd', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop'),
  ('Story Instagram - Leilão Amanhã', 'Arte vertical para contagem regressiva.', 'banner', 'https://example.com/story1.png', 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop'),
  ('Flyer Impresso A4', 'Modelo para distribuição em fóruns.', 'flyer', 'https://example.com/flyer.pdf', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop'),
  ('Vídeo Institucional 30s', 'Vídeo teaser para campanhas de Ads.', 'video', 'https://example.com/video_promo.mp4', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop'),
  ('Cartão de Visita Digital', 'Template Canva.', 'template', 'https://canva.com/link', 'https://images.unsplash.com/photo-1559067515-bf7d799b6d4d?w=800&auto=format&fit=crop');

  --------------------------------------------------------------------------------
  -- AGENDA / EVENTOS
  --------------------------------------------------------------------------------
  INSERT INTO public.events (title, description, start_time, end_time, type, is_public, creator_id) VALUES
  ('Reunião Geral de Franqueados', 'Alinhamento mensal de resultados.', now() + interval '1 day' + interval '14 hours', now() + interval '1 day' + interval '16 hours', 'meeting', true, v_admin_id),
  ('Workshop: Avaliação de Imóveis Rurais', 'Com Eng. Agrônomo convidado.', now() + interval '5 days' + interval '19 hours', now() + interval '5 days' + interval '21 hours', 'course', true, v_admin_id),
  ('Lembrete: Pagamento de Royalties', 'Vencimento dia 15.', now() + interval '3 days' + interval '09 hours', now() + interval '3 days' + interval '10 hours', 'reminder', false, v_admin_id),
  ('Congresso Nacional de Leiloaria', 'Evento presencial em SP.', now() + interval '20 days', now() + interval '22 days', 'lecture', true, v_admin_id);

END $$;
