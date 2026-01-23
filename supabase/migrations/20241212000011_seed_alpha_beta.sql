-- TWO TEST FRANCHISES SEEDING

-- 1. Create 2 Distinct Franchises
-- We use fixed UUIDs so we can easily key data to them.
insert into public.franchise_units (id, name, document_id, city, state, active, contract_start_date, contract_end_date, royalty_percentage, owner_name)
values 
    ('11111111-1111-1111-1111-111111111111', 'Franquia Teste Alpha', '12.345.678/0001-01', 'Curitiba', 'PR', true, now(), now() + interval '5 years', 7.5, 'Carlos Teste'),
    ('22222222-2222-2222-2222-222222222222', 'Franquia Teste Beta', '98.765.432/0001-02', 'Salvador', 'BA', true, now(), now() + interval '5 years', 8.0, 'Ana Teste')
on conflict (id) do nothing; -- Prevents errors if re-run

-- 2. Create Users for these Franchises (if they don't exist in Auth, we just mock the Profile part)
-- Ideally you use the "Quick Login" buttons which will auto-create 'franquia@sp.com' etc.
-- But since you asked to put them in "YOUR LOGIN", I assume you want your Quick Login buttons (SP/RJ) to map to these new Alpha/Beta units?

-- Let's Remap the Quick Login Emails to these new Franchises to "refresh" the test experience.
-- SP User -> Alpha
update public.profiles 
set franchise_unit_id = '11111111-1111-1111-1111-111111111111',
    access_profile_id = (select id from public.access_profiles where name = 'Franqueado' limit 1)
where email = 'franquia@sp.com';

-- RJ User -> Beta
update public.profiles 
set franchise_unit_id = '22222222-2222-2222-2222-222222222222',
    access_profile_id = (select id from public.access_profiles where name = 'Franqueado' limit 1)
where email = 'franquia@rj.com';


-- 3. SEED ISOLATED DATA FOR ALPHA (ID: 111...111)

-- Leads
insert into public.leads (name, type, status, franchise_id, email) values
('Alpha: Dr. Roberto', 'advogado', 'interessado', '11111111-1111-1111-1111-111111111111', 'roberto@alpha.com'),
('Alpha: Construtora X', 'parceiro', 'novo', '11111111-1111-1111-1111-111111111111', 'contato@construtorax.com');

-- Auctions
insert into public.auctions (process_number, status, valuation_value, minimum_bid, franchise_id, description) values
('PR-001/2025', 'publicado', 850000, 500000, '11111111-1111-1111-1111-111111111111', 'Terreno Comercial em Curitiba');

-- Tasks
insert into public.tasks (title, status, priority, franchise_id) values
('Ligar para Construtora X', 'pending', 'high', '11111111-1111-1111-1111-111111111111');

-- Events
insert into public.events (title, type, start_time, end_time, franchise_id, is_public) values
('Reunião Semanal Alpha', 'meeting', now() + interval '2 hours', now() + interval '3 hours', '11111111-1111-1111-1111-111111111111', false);


-- 4. SEED ISOLATED DATA FOR BETA (ID: 222...222)

-- Leads
insert into public.leads (name, type, status, franchise_id, email) values
('Beta: Investidor João', 'arrematante', 'habilitado', '22222222-2222-2222-2222-222222222222', 'joao@beta.com');

-- Auctions
insert into public.auctions (process_number, status, valuation_value, minimum_bid, franchise_id, description) values
('BA-202/2025', 'preparacao', 2500000, 1500000, '22222222-2222-2222-2222-222222222222', 'Hotel na Orla de Salvador');

-- Tasks
insert into public.tasks (title, status, priority, franchise_id) values
('Verificar Documentos Hotel', 'in_progress', 'urgent', '22222222-2222-2222-2222-222222222222');

-- Events
insert into public.events (title, type, start_time, end_time, franchise_id, is_public) values
('Treinamento Novos Franqueados', 'course', now() + interval '1 day', now() + interval '1 day 4 hours', '22222222-2222-2222-2222-222222222222', false);
