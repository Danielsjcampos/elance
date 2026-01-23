-- MULTI-TENANT ISOLATION MIGRATION

-- 1. Ensure 'franchise_id' exists on all core tables
-- Leads
alter table public.leads 
add column if not exists franchise_id uuid references public.franchise_units(id);

-- Auctions (Leiloes)
alter table public.auctions 
add column if not exists franchise_id uuid references public.franchise_units(id);

-- Tasks
alter table public.tasks 
add column if not exists franchise_id uuid references public.franchise_units(id);

-- Financial (assuming table name 'financial_transactions' or similar, creating if not exists for now based on context)
create table if not exists public.financial_records (
    id uuid default uuid_generate_v4() primary key,
    description text not null,
    amount numeric not null,
    type text check (type in ('income', 'expense')),
    franchise_id uuid references public.franchise_units(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 2. HELPER FUNCTION TO GET CURRENT USER'S FRANCHISE
-- This helps clean up RLS policies
create or replace function public.get_my_franchise_id()
returns uuid as $$
  select franchise_unit_id from public.profiles where id = auth.uid();
$$ language sql security definer;

create or replace function public.is_admin_master()
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    join public.access_profiles ap on p.access_profile_id = ap.id
    where p.id = auth.uid() and ap.name = 'Administrador Master'
  );
$$ language sql security definer;


-- 3. RLS POLICIES FOR ISOLATION

-- LEADS POLICY
alter table public.leads enable row level security;
drop policy if exists "Leads Isolation" on public.leads;
create policy "Leads Isolation" on public.leads
for all using (
    public.is_admin_master() 
    or 
    franchise_id = public.get_my_franchise_id()
);

-- AUCTIONS POLICY
alter table public.auctions enable row level security;
drop policy if exists "Auctions Isolation" on public.auctions;
create policy "Auctions Isolation" on public.auctions
for all using (
    public.is_admin_master() 
    or 
    franchise_id = public.get_my_franchise_id()
);

-- TASKS POLICY
alter table public.tasks enable row level security;
drop policy if exists "Tasks Isolation" on public.tasks;
create policy "Tasks Isolation" on public.tasks
for all using (
    public.is_admin_master() 
    or 
    franchise_id = public.get_my_franchise_id()
);

-- FINANCIAL POLICY
alter table public.financial_records enable row level security;
drop policy if exists "Finance Isolation" on public.financial_records;
create policy "Finance Isolation" on public.financial_records
for all using (
    public.is_admin_master() 
    or 
    franchise_id = public.get_my_franchise_id()
);

-- 4. TRIGGER TO AUTO-ASSIGN FRANCHISE ON INSERT
-- If a normal user (Franchisee) inserts a record, force their franchise_id.
-- If Admin inserts, they can specify it (nullable check), or defaults to NULL (HQ).

create or replace function public.handle_franchise_assignment()
returns trigger as $$
begin
  if (new.franchise_id is null) then
      -- Try to assign from user profile
      new.franchise_id := public.get_my_franchise_id();
      
      -- If still null (e.g. Master Admin without a specific unit), let it remain null (Global/HQ)
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Apply Triggers
drop trigger if exists set_franchise_leads on public.leads;
create trigger set_franchise_leads before insert on public.leads
for each row execute function public.handle_franchise_assignment();

drop trigger if exists set_franchise_auctions on public.auctions;
create trigger set_franchise_auctions before insert on public.auctions
for each row execute function public.handle_franchise_assignment();

drop trigger if exists set_franchise_tasks on public.tasks;
create trigger set_franchise_tasks before insert on public.tasks
for each row execute function public.handle_franchise_assignment();

drop trigger if exists set_franchise_finance on public.financial_records;
create trigger set_franchise_finance before insert on public.financial_records
for each row execute function public.handle_franchise_assignment();
