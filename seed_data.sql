-- SCRIPT DE DADOS DE TESTE (SEED)
-- Copie e cole este conteúdo no Editor SQL do Supabase e execute.

DO $$
DECLARE
    matriz_id UUID;
    rj_id UUID;
    auction_id UUID;
BEGIN
    -- 1. Criar Franquias
    INSERT INTO public.franchise_units (name, cnpj, address, active)
    VALUES ('Franquia Matriz (SP)', '00.000.000/0001-00', 'Av. Paulista, 1000 - São Paulo, SP', true)
    RETURNING id INTO matriz_id;

    INSERT INTO public.franchise_units (name, cnpj, address, active)
    VALUES ('Franquia Rio de Janeiro', '11.111.111/0001-11', 'Av. Atlântica, 500 - Rio de Janeiro, RJ', true)
    RETURNING id INTO rj_id;

    -- 2. Criar Leads
    INSERT INTO public.leads (name, email, phone, status, franchise_id) VALUES
    ('Roberto Silva', 'roberto@email.com', '11999998888', 'contacted', matriz_id),
    ('Ana Souza', 'ana@email.com', '11988887777', 'new', matriz_id),
    ('Carlos Eduardo', 'carlos@email.com', '11977776666', 'qualified', matriz_id),
    ('Mariana Lima', 'mariana@email.com', '21999995555', 'new', rj_id);

    -- 3. Criar Leilões
    INSERT INTO public.auctions (title, description, first_date, second_date, valuation_value, minimum_bid, status, process_number, franchise_id)
    VALUES 
    ('Apartamento no Jardins', 'Excelente apartamento de 3 dormitórios em área nobre.', NOW() + INTERVAL '10 days', NOW() + INTERVAL '25 days', 1500000, 900000, 'published', 'proc-001/2024', matriz_id)
    RETURNING id INTO auction_id;

    INSERT INTO public.auctions (title, description, first_date, second_date, valuation_value, minimum_bid, status, process_number, franchise_id)
    VALUES 
    ('Casa em Condomínio Fechado', 'Casa de alto padrão com piscina.', NOW() + INTERVAL '15 days', NOW() + INTERVAL '30 days', 2500000, 1500000, 'new', 'proc-002/2024', matriz_id);

    INSERT INTO public.auctions (title, description, first_date, second_date, valuation_value, minimum_bid, status, process_number, franchise_id)
    VALUES 
    ('Terreno Comercial no RJ', 'Terreno de esquina com 500m2.', NOW() + INTERVAL '5 days', NOW() + INTERVAL '20 days', 800000, 400000, 'published', 'proc-RJ-001', rj_id);

    -- 4. Criar Tarefas
    INSERT INTO public.tasks (title, description, status, due_date, franchise_id, auction_id) VALUES
    ('Ligar para interessados do Apt Jardins', 'Contatar leads quentes.', 'todo', NOW() + INTERVAL '2 days', matriz_id, auction_id),
    ('Preparar edital do leilão 002', 'Revisar termos jurídicos.', 'in_progress', NOW() + INTERVAL '5 days', matriz_id, NULL),
    ('Visita técnica ao terreno', 'Tirar fotos e avaliar estado.', 'done', NOW() - INTERVAL '1 day', rj_id, NULL);

    -- 5. Criar Treinamentos (Geral)
    INSERT INTO public.trainings (title, description, video_url, points) VALUES
    ('Introdução ao Sistema E-Lance', 'Aprenda as funcionalidades básicas do portal.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 10),
    ('Captando Novos Leilões', 'Estratégias para abordar juízes e varas.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 25),
    ('Marketing Digital para Leiloeiros', 'Como usar as redes sociais a seu favor.', NULL, 15);

    -- 6. Criar Documentos (Geral)
    INSERT INTO public.company_documents (title, file_url, category) VALUES
    ('Manual do Franqueado v1.0', '#', 'Manuais'),
    ('Modelo de Contrato de Prestação de Serviços', '#', 'Jurídico'),
    ('Guideline da Marca', '#', 'Marketing');

    -- 7. Criar Materiais de Marketing (Geral)
    INSERT INTO public.marketing_materials (title, file_url, type) VALUES
    ('Post Instagram - Leilão de Imóveis', '#', 'image'),
    ('Vídeo Institucional 30s', '#', 'video'),
    ('Template de E-mail Marketing', '#', 'psd');

    -- 8. Criar Eventos (Agenda - Matriz)
    INSERT INTO public.events (title, description, start_time, end_time, franchise_id) VALUES
    ('Reunião Geral de Franqueados', 'Alinhamento semestral.', NOW() + INTERVAL '1 month', NOW() + INTERVAL '1 month 2 hours', matriz_id),
    ('Treinamento Presencial SP', 'Workshop de vendas.', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week 4 hours', matriz_id);

    -- 9. Logs Financeiros
    INSERT INTO public.financial_logs (description, amount, type, franchise_id, date) VALUES
    ('Comissão Leilão Jardins', 45000, 'income', matriz_id, NOW() - INTERVAL '2 days'),
    ('Pagamento Google Ads', 1500, 'expense', matriz_id, NOW() - INTERVAL '5 days'),
    ('Consultoria Jurídica', 2000, 'expense', matriz_id, NOW() - INTERVAL '10 days');

END $$;

-- IMPORTANTE:
-- Para definir seu usuário como ADMIN, você precisa primeiro criar a conta (Sign Up) com o email 'admin@elance.com'.
-- DEPOIS de criar a conta, rode o comando abaixo substituindo SEU_EMAIL_AQUI (mas mantenha as aspas simples):

-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@elance.com';
