-- NEW FEATURES SCHEMA

-- 1. TASK TEMPLATES & AUTOMATION
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
  due_offset_days integer default 0, -- Days after task creation
  priority task_priority default 'medium'
);

-- Enhance Tasks table with tracking of where it came from
alter table public.tasks add column if not exists template_id uuid references public.task_templates(id);
alter table public.tasks add column if not exists parent_task_id uuid references public.tasks(id); -- Subtasks

-- Task items/checklists (Etapas dentro da tarefa main)
create table if not exists public.task_steps (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  order_index integer default 0
);

-- 2. TRAINING CENTER
create type training_category as enum ('mandatory', 'recommended', 'webinar');

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

-- 3. DOCUMENTS CENTER
create table if not exists public.documents (
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
  document_id uuid references public.documents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  unique(document_id, user_id)
);

create table if not exists public.user_document_actions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id),
    document_id uuid references public.documents(id),
    action_type text check (action_type in ('downloaded', 'signed')),
    action_date timestamp with time zone default now()
);

-- 4. MARKETING CENTER
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

-- 5. AGENDA / EVENTS
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  type text check (type in ('meeting', 'lecture', 'course', 'reminder')),
  is_public boolean default false, -- If true, visible to all
  creator_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.event_participants (
    event_id uuid references public.events(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    status text check (status in ('pending', 'confirmed', 'declined')) default 'pending',
    primary key (event_id, user_id)
);

-- RLS POLICIES (Simplified for dev)
alter table public.task_templates enable row level security;
alter table public.task_template_steps enable row level security;
alter table public.task_steps enable row level security;
alter table public.trainings enable row level security;
alter table public.user_training_progress enable row level security;
alter table public.documents enable row level security;
alter table public.marketing_materials enable row level security;
alter table public.events enable row level security;

-- Allow all for authenticated users for now
create policy "Allow all authenticated" on public.task_templates for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.task_template_steps for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.task_steps for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.trainings for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.user_training_progress for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.documents for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.marketing_materials for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.events for all using (auth.role() = 'authenticated');

-- FUNCTIONS & TRIGGERS

-- Trigger to auto-create tasks for Auctions
create or replace function public.handle_new_auction_tasks()
returns trigger
language plpgsql
security definer
as $$
declare
  template_record record;
  step_record record;
  new_task_id uuid;
begin
  -- Find templates triggered by 'auction_created'
  for template_record in select * from public.task_templates where trigger_event = 'auction_created' loop
    
    -- Create main task (or multiple tasks based on steps, but let's assume one main task per template for simplicity, 
    -- OR create individual tasks for each step. The user prompt says "Etapa 1 - Cadastrar... Etapa 2 ...".
    -- A better model might be: Create 1 Task "Processamento Imovel X" and add sub-steps.
    
    insert into public.tasks (title, description, priority, status, due_date, related_auction_id, template_id)
    values (
        template_record.title || ' - ' || NEW.process_number,
        template_record.description,
        'medium',
        'pending',
        now() + interval '1 day', -- Default due date
        NEW.id,
        template_record.id
    ) returning id into new_task_id;

    -- Insert steps for this task
    for step_record in select * from public.task_template_steps where template_id = template_record.id order by order_index loop
        insert into public.task_steps (task_id, title, order_index)
        values (new_task_id, step_record.title, step_record.order_index);
    end loop;

  end loop;
  return new;
end;
$$;

create trigger on_auction_created
  after insert on public.auctions
  for each row execute procedure public.handle_new_auction_tasks();

-- SEED DATA FOR TEMPLATES
insert into public.task_templates (title, description, trigger_event) values 
('Entrada de Imóvel de Leilão', 'Processo padrão para novos imóveis cadastrados.', 'auction_created');

insert into public.task_template_steps (template_id, title, order_index) 
select id, 'Cadastrar nos portais', 1 from public.task_templates where title = 'Entrada de Imóvel de Leilão';

insert into public.task_template_steps (template_id, title, order_index) 
select id, 'Fazer busca nos cartórios', 2 from public.task_templates where title = 'Entrada de Imóvel de Leilão';

insert into public.task_template_steps (template_id, title, order_index) 
select id, 'Verificar débitos de IPTU', 3 from public.task_templates where title = 'Entrada de Imóvel de Leilão';

insert into public.task_template_steps (template_id, title, order_index) 
select id, 'Agendar vistoria se possível', 4 from public.task_templates where title = 'Entrada de Imóvel de Leilão';
