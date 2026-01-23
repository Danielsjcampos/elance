-- NUCLEAR CLEAN & ISOLATE (SAFE VERSION)

-- 1. CLEANUP
-- Ensure profiles has email
alter table public.profiles add column if not exists email text;
-- Ensure events has franchise_id if it was missing 
alter table public.events add column if not exists franchise_id uuid references public.franchise_units(id);
-- Ensure events has user_id (required for some logic/types)
alter table public.events add column if not exists user_id uuid references auth.users(id);

truncate table public.tasks cascade;
truncate table public.leads cascade;
truncate table public.auctions cascade;
truncate table public.events cascade;
truncate table public.financial_records cascade;

-- 3. RESET FRANCHISE UNITS
delete from public.franchise_units;

-- 4. RECREATE UNITS (Hardcoded IDs)
insert into public.franchise_units (id, name, document_id, city, state, active)
values 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Matriz São Paulo', '11.111.111/0001-11', 'São Paulo', 'SP', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Unidade Rio de Janeiro', '22.222.222/0001-22', 'Rio de Janeiro', 'RJ', true);

-- 5. ATTEMPT TO LINK PROFILES (Safe Update via Auth)
do $$
begin
    -- Try to update SP User if exists in auth.users
    -- We assume the 'auth' schema is accessible. If not, this block handles exception or just 0 rows.
    update public.profiles p
    set franchise_unit_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    from auth.users u
    where p.id = u.id and u.email = 'franquia@sp.com';

    -- Try to update RJ User
    update public.profiles p
    set franchise_unit_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22'
    from auth.users u
    where p.id = u.id and u.email = 'franquia@rj.com';
    
    -- Admin (Set to NULL/Global)
    update public.profiles p
    set franchise_unit_id = null
    from auth.users u
    where p.id = u.id and u.email = 'admin@elance.com';
    
exception when others then
    raise notice 'Could not update profiles via auth.users join. Skipping profile check.';
end $$;


-- 6. SEED DATA (For the hardcoded Units)

-- SP DATA
insert into public.leads (name, type, status, franchise_id, email, phone) values
('Cliente SP - João Silva', 'arrematante', 'novo', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'joao.sp@email.com', '11999999999'),
('Comitente SP - Banco Alpha', 'comitente', 'habilitado', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'banco.sp@email.com', '11888888888');

insert into public.auctions (process_number, status, valuation_value, minimum_bid, franchise_id, description) values
('SP-001/2024', 'publicado', 500000, 300000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apartamento SP Centro - Leilão Exclusivo SP');

insert into public.tasks (title, status, priority, franchise_id) values
('Vistoria Imóvel SP', 'pending', 'high', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- REMOVED BAD INSERT HERE -- 
-- Note: auth.uid() might be null in script, so we might set user_id to a placeholder or null if nullable.
-- Checking schema: user_id is usually NOT NULL in Events? 
-- Let's check typical schema. If user_id is required, we can't seed easily without a known profile ID.
-- I will attempt to select the ID from profiles if exists, or use a fallback if constrained.
-- For now, allow seed without user_id if column allows, OR use a subquery.

-- Update Events to use a safer subquery for user_id (e.g. any admin or self)
-- Actually, let's just make user_id nullable in Events for this seed or pick the first profile.
-- Since I can't guarantee a profile, I will SKIP inserting events user_id dependent if strictly not null.
-- But Events usually needs a creator. 
-- Let's try to grab the first profile ID available as a placeholder creator.

do $$
declare
    v_placeholder_user uuid;
begin
    select id into v_placeholder_user from public.profiles limit 1;
    
    if v_placeholder_user is not null then
        -- Update the inserted events if we inserted any, or insert now
        insert into public.events (title, type, start_time, end_time, franchise_id, is_public, user_id) values
        ('Reunião Geral SP', 'meeting', now(), now() + interval '1 hour', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, v_placeholder_user);
        
        insert into public.events (title, type, start_time, end_time, franchise_id, is_public, user_id) values
        ('Treinamento Equipe RJ', 'course', now() + interval '1 day', now() + interval '1 day 2 hours', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', false, v_placeholder_user);
    end if;
end $$;


-- RJ DATA
insert into public.leads (name, type, status, franchise_id, email, phone) values
('Cliente RJ - Maria Souza', 'arrematante', 'interessado', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'maria.rj@email.com', '21999999999');

insert into public.auctions (process_number, status, valuation_value, minimum_bid, franchise_id, description) values
('RJ-555/2025', 'preparacao', 1200000, 800000, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Cobertura Barra da Tijuca');

insert into public.tasks (title, status, priority, franchise_id) values
('Assinar Contrato RJ', 'pending', 'urgent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22');
