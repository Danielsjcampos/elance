-- SEED DUMMY FRANCHISES & DATA (FINAL CORRECTED)
-- Run in Supabase SQL Editor to populate Dashboard

-- 1. Insert Franchises
INSERT INTO public.franchise_units (name, active, address, cnpj)
VALUES 
    ('Franquia São Paulo Sul', true, 'Av. Paulista, 1000 - SP', '12.345.678/0001-90'),
    ('Franquia Rio de Janeiro', true, 'Av. Atlântica, 500 - RJ', '98.765.432/0001-10'),
    ('Franquia Belo Horizonte', true, 'Praça da Liberdade, 10 - MG', '11.222.333/0001-20'),
    ('Franquia Curitiba', true, 'Rua XV de Novembro, 200 - PR', '44.555.666/0001-30'),
    ('Franquia Porto Alegre', true, 'Av. Ipiranga, 300 - RS', '77.888.999/0001-40');

-- 2. Insert Dummy Financial Transactions (Using 'financial_logs' table)
-- Note: 'financial_logs' has columns: description, amount, type, franchise_id, date, created_at, category, status
INSERT INTO public.financial_logs (description, amount, type, status, category, date, franchise_id)
SELECT 
    'Comissão Venda Imóvel #' || floor(random() * 1000)::text,
    (random() * 5000 + 1000)::numeric(10,2), 
    'income',
    'paid',
    'Royalties',
    NOW() - (random() * 30 || ' days')::interval, 
    f.id
FROM public.franchise_units f
CROSS JOIN generate_series(1, 5)
WHERE f.name LIKE 'Franquia %'
AND f.created_at > NOW() - INTERVAL '5 minutes';

INSERT INTO public.financial_logs (description, amount, type, status, category, date, franchise_id)
SELECT 
    'Despesa Operacional #' || floor(random() * 100)::text,
    (random() * 500 + 100)::numeric(10,2), 
    'expense',
    'paid',
    'Marketing',
    NOW() - (random() * 30 || ' days')::interval,
    f.id
FROM public.franchise_units f
CROSS JOIN generate_series(1, 3)
WHERE f.name LIKE 'Franquia %'
AND f.created_at > NOW() - INTERVAL '5 minutes';

-- 3. Insert Dummy Leads
INSERT INTO public.leads (name, email, phone, status, franchise_id, created_at)
SELECT
    'Lead Interessado #' || floor(random() * 100)::text,
    'lead' || floor(random() * 10000)::text || '@gmail.com',
    '(11) 9' || floor(random() * 100000000)::text,
    CASE WHEN random() > 0.5 THEN 'new' ELSE 'contacted' END,
    f.id,
    NOW() - (random() * 10 || ' days')::interval
FROM public.franchise_units f
CROSS JOIN generate_series(1, 4)
WHERE f.name LIKE 'Franquia %'
AND f.created_at > NOW() - INTERVAL '5 minutes';

NOTIFY pgrst, 'reload config';
