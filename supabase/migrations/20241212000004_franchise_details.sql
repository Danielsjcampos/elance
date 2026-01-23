-- FRANCHISE DETAILS MIGRATION

-- 1. ADD COLUMNS to franchise_units
alter table public.franchise_units
add column if not exists contract_start_date date,
add column if not exists contract_end_date date,
add column if not exists contract_value numeric(12,2),
add column if not exists royalty_percentage numeric(5,2),
add column if not exists owner_name text,
add column if not exists owner_email text,
add column if not exists owner_phone text;

-- 2. CREATE FINANCIAL TRACKING (PAYMENTS/FEES)
-- This table tracks what the franchisee owes or has paid to the HQ.
create table if not exists public.franchise_financial_movements (
    id uuid default uuid_generate_v4() primary key,
    franchise_id uuid references public.franchise_units(id) on delete cascade not null,
    description text not null, -- e.g. "Royalties Janeiro", "Taxa de Adesão"
    amount numeric(12,2) not null,
    type text check (type in ('payable', 'paid')) default 'payable', -- 'payable' = owed to HQ, 'paid' = settled
    due_date date,
    paid_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS FOR FINANCIAL MOVEMENTS
alter table public.franchise_financial_movements enable row level security;

create policy "Admins see all movements" on public.franchise_financial_movements
for all using (
    public.is_admin_master()
);

create policy "Franchise sees own movements" on public.franchise_financial_movements
for select using (
    franchise_id = public.get_my_franchise_id()
);

-- 4. VIEW FOR FINANCIAL SUMMARY
-- Useful for the admin dashboard or summary
create or replace view public.view_franchise_financial_summary as
select 
    f.id as franchise_id,
    f.name as franchise_name,
    coalesce(sum(case when fm.type = 'payable' then fm.amount else 0 end), 0) as total_owed,
    coalesce(sum(case when fm.type = 'paid' then fm.amount else 0 end), 0) as total_paid
from public.franchise_units f
left join public.franchise_financial_movements fm on f.id = fm.franchise_id
group by f.id, f.name;

-- 5. UPDATE EXISTING FRANCHISE DATA (OPTIONAL SEED)
update public.franchise_units 
set contract_start_date = now()::date, 
    contract_end_date = (now() + interval '5 years')::date,
    owner_name = 'Admin Exemplo',
    royalty_percentage = 5.0
where name = 'Matriz São Paulo';
