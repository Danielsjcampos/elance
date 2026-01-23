-- SEED DATA FOR FULL PLATFORM TEST
-- Executes inside a transaction block to ensure data integrity
-- Uses existing profile if available, or proceeds with nulls where allowed.

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
  -- 1. Get an admin/user ID for assignments (limit 1)
  SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
  
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
