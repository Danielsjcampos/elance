-- SEED DATA FOR DASHBOARD
-- This script generates random data for Franchises, Financials, Leads, Auctions, and Gamification.

DO $$
DECLARE
    f_record RECORD;
    u_record RECORD;
    t_id UUID;
    i INT;
    random_amount NUMERIC;
    random_date DATE;
BEGIN
    -- 1. ENSURE SOME FRANCHISES EXIST (If none, create some)
    IF NOT EXISTS (SELECT 1 FROM public.franchise_units) THEN
        INSERT INTO public.franchise_units (name, cnpj, active, address) VALUES
        ('Franquia Matriz', '00000000000191', true, 'São Paulo, SP'),
        ('Franquia Sul', '00000000000292', true, 'Curitiba, PR'),
        ('Franquia Nordeste', '00000000000393', true, 'Recife, PE'),
        ('Franquia Centro', '00000000000494', true, 'Brasília, DF');
    END IF;

    -- 2. LOOP THROUGH FRANCHISES TO GENERATE FINANCIAL DATA
    FOR f_record IN SELECT id, name FROM public.franchise_units LOOP
        
        -- Generate 20 Income Transactions (Revenue) for last 6 months
        FOR i IN 1..20 LOOP
            random_amount := floor(random() * 50000 + 5000); -- 5k to 55k
            random_date := CURRENT_DATE - floor(random() * 180)::INT;
            
            INSERT INTO public.financial_logs (description, amount, type, category, status, date, franchise_id)
            VALUES (
                'Comissão Venda Imóvel #' || i,
                random_amount,
                'income',
                'Comissões',
                'paid',
                random_date,
                f_record.id
            );
        END LOOP;

        -- Generate 10 Expense Transactions
        FOR i IN 1..10 LOOP
            random_amount := floor(random() * 5000 + 500);
            random_date := CURRENT_DATE - floor(random() * 180)::INT;
            
            INSERT INTO public.financial_logs (description, amount, type, category, status, date, franchise_id)
            VALUES (
                'Despesa Operacional #' || i,
                random_amount,
                'expense',
                'Operacional',
                'paid',
                random_date,
                f_record.id
            );
        END LOOP;

    END LOOP;

    -- 3. GENERATE LEADS (Properties)
    -- Insert 15 random leads
    FOR i IN 1..15 LOOP
        INSERT INTO public.leads (name, email, phone, status, franchise_id)
        VALUES (
            'Lead Teste ' || i,
            'lead' || i || '@test.com',
            '11999999999',
            (ARRAY['Novo', 'Contato', 'Proposta', 'Venda'])[floor(random() * 4 + 1)],
            (SELECT id FROM public.franchise_units ORDER BY random() LIMIT 1)
        );
    END LOOP;

    -- 4. GENERATE AUCTIONS (Upcoming & Past)
    -- Insert 10 auctions
    FOR i IN 1..10 LOOP
        random_date := CURRENT_DATE + floor(random() * 60 - 15)::INT; -- 15 days ago to 45 days future
        INSERT INTO public.auctions (property_name, auction_date, city, state, status, initial_bid, second_bid_value)
        VALUES (
            'Imóvel de Leilão #' || i,
            random_date,
            (ARRAY['São Paulo', 'Rio de Janeiro', 'Beda Horizonte', 'Curitiba'])[floor(random() * 4 + 1)],
            (ARRAY['SP', 'RJ', 'MG', 'PR'])[floor(random() * 4 + 1)],
            CASE WHEN random_date >= CURRENT_DATE THEN 'active' ELSE 'closed' END,
            floor(random() * 500000 + 100000),
            floor(random() * 300000 + 50000)
        );
    END LOOP;

    -- 5. GENERATE GAMIFICATION (Leaderboard)
    -- Ensure some trainings exist
    IF NOT EXISTS (SELECT 1 FROM public.trainings) THEN
        INSERT INTO public.trainings (title, description, points, module) VALUES
        ('Treinamento Vendas 1', 'Básico de Vendas', 100, 'Vendas'),
        ('Treinamento Jurídico', 'Lei de Leilões', 150, 'Jurídico'),
        ('Treinamento Sistema', 'Como usar o CRM', 50, 'Operacional');
    END IF;

    -- Assign completions to random users
    FOR u_record IN SELECT id FROM public.profiles LOOP
        -- Give each user 1-5 random completions
        FOR i IN 1..floor(random() * 5 + 1) LOOP
            SELECT id INTO t_id FROM public.trainings ORDER BY random() LIMIT 1;
            
            -- Insert ignore dupes
            BEGIN
                INSERT INTO public.training_completions (user_id, training_id, completed_at)
                VALUES (u_record.id, t_id, CURRENT_TIMESTAMP);
            EXCEPTION WHEN unique_violation THEN
                -- Ignore duplicate completion
            END;
        END LOOP;
    END LOOP;

END $$;
