-- Tasks table
create type task_status as enum ('pending', 'in_progress', 'completed', 'blocked');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');

create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id),
  creator_id uuid references public.profiles(id),
  status task_status default 'pending',
  priority task_priority default 'medium',
  due_date timestamp with time zone,
  dependency_id uuid references public.tasks(id), -- A tarefa anterior que precisa ser concluída
  related_auction_id uuid references public.auctions(id), -- Vinculo com processo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.tasks enable row level security;

-- Admin vê tudo, Usuário vê as suas ou as que criou
create policy "Tasks viewable by assignee or creator or admin"
  on tasks for select
  using ( 
    auth.uid() = assignee_id or 
    auth.uid() = creator_id or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Tasks insertable by admin or manager"
  on tasks for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'manager'))
  );

create policy "Tasks updatable by assignee or admin"
  on tasks for update
  using (
    auth.uid() = assignee_id or 
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
