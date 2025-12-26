-- Seed Email Templates and Segments for Models & Designers
-- This script creates premium content for the creative industry

DO $$
DECLARE
    v_franchise_id UUID;
BEGIN
    -- Get the first franchise unit ID to associate the seeds
    SELECT id INTO v_franchise_id FROM public.franchise_units LIMIT 1;

    -- 1. Create Templates
    -- Template 1: Boas-vindas Portfolio
    INSERT INTO public.email_templates (nome_template, tipo, assunto, corpo_html, variaveis, franchise_unit_id)
    VALUES (
        'Boas-vindas Designer/Modelo',
        'comunicado',
        'Seja bem-vindo(a) à Elite Creative!',
        '<div style="font-family: ''Inter'', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 16px; overflow: hidden; color: #1a1a1a;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 40px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; letter-spacing: -1px;">Olá, {{nome}}!</h1>
                <p style="opacity: 0.8; font-size: 16px;">Sua jornada criativa começa aqui.</p>
            </div>
            <div style="padding: 40px; line-height: 1.6;">
                <p>Estamos entusiasmados em ter você em nossa base exclusiva. Nosso objetivo é conectar talentos como você às melhores oportunidades do mercado de <b>moda e design</b>.</p>
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #1a1a1a;">
                    <p style="margin: 0; font-size: 14px;">"A criatividade é a inteligência se divertindo."</p>
                </div>
                <p>Em breve, você receberá atualizações sobre novos castings, briefings e tendências do setor.</p>
                <a href="#" style="display: inline-block; background: #1a1a1a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Ver Meu Painel</a>
            </div>
        </div>',
        '["nome"]',
        v_franchise_id
    );

    -- Template 2: Novo Casting/Projeto
    INSERT INTO public.email_templates (nome_template, tipo, assunto, corpo_html, variaveis, franchise_unit_id)
    VALUES (
        'Oportunidade de Casting/Job',
        'leilao',
        'NOVA OPORTUNIDADE: Casting Aberto',
        '<div style="font-family: ''Inter'', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 16px; overflow: hidden;">
            <div style="padding: 40px;">
                <span style="background: #eef2ff; color: #4f46e5; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Urgente</span>
                <h2 style="margin: 15px 0; color: #111827;">Novo Casting: Campanha de Verão</h2>
                <p style="color: #4b5563;">Olá {{nome}}, identificamos que seu perfil combina perfeitamente com um novo projeto que acaba de entrar em nossa plataforma.</p>
                <ul style="color: #4b5563; padding-left: 20px;">
                    <li><b>Local:</b> São Paulo, SP</li>
                    <li><b>Cachet:</b> Sob consulta</li>
                    <li><b>Duração:</b> 2 dias de shooting</li>
                </ul>
                <a href="{{link_proposta}}" style="display: block; text-align: center; background: #3a7ad1; color: white; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 30px; box-shadow: 0 4px 6px -1px rgba(58, 122, 209, 0.2);">Candidatar-se Agora</a>
            </div>
        </div>',
        '["nome", "link_proposta"]',
        v_franchise_id
    );

    -- Template 3: Newsletter de Tendências
    INSERT INTO public.email_templates (nome_template, tipo, assunto, corpo_html, variaveis, franchise_unit_id)
    VALUES (
        'Newsletter Trends 2026',
        'blog',
        'Tendências de Design e Moda para 2026',
        '<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&h=300" style="width: 100%; border-radius: 16px;">
            <h1 style="margin-top: 24px;">O futuro é Minimalista.</h1>
            <p>Olá {{nome}}, confira as cores e formas que vão dominar as passarelas e os layouts no próximo ano.</p>
            <p>Nossa equipe de curadoria selecionou os 5 materiais essenciais que você precisa conhecer para se manter relevante no mercado criativo.</p>
            <a href="#" style="color: #3a7ad1; font-weight: bold; text-decoration: none;">Ler artigo completo →</a>
        </div>',
        '["nome"]',
        v_franchise_id
    );

    -- Template 4: Convite Feedback
    INSERT INTO public.email_templates (nome_template, tipo, assunto, corpo_html, variaveis, franchise_unit_id)
    VALUES (
        'Feedback Reunião Criativa',
        'outros',
        'Sua opinião conta muito para nós',
        '<div style="padding: 30px; text-align: center; font-family: sans-serif;">
            <h2>Olá {{nome}}, como foi sua experiência?</h2>
            <p>Recentemente trabalhamos juntos em um projeto e adoraríamos saber o que você achou do nosso processo de produção.</p>
            <div style="margin: 30px 0;">
                <span style="font-size: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 50%; cursor: pointer;">⭐</span>
                <span style="font-size: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 50%; cursor: pointer;">⭐</span>
                <span style="font-size: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 50%; cursor: pointer;">⭐</span>
                <span style="font-size: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 50%; cursor: pointer;">⭐</span>
                <span style="font-size: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 50%; cursor: pointer;">⭐</span>
            </div>
            <p style="color: #666; font-size: 14px;">Leva menos de 1 minuto!</p>
        </div>',
        '["nome"]',
        v_franchise_id
    );

    -- Template 5: Reativação
    INSERT INTO public.email_templates (nome_template, tipo, assunto, corpo_html, variaveis, franchise_unit_id)
    VALUES (
        'Reativação de Talentos',
        'comunicado',
        'Sentimos sua falta no set!',
        '<div style="background: #000; color: #fff; padding: 50px; text-align: center; border-radius: 20px; font-family: sans-serif;">
            <h1 style="color: #d4af37;">Golden Opportunity</h1>
            <p>Lembramos de você para uma nova linha de projetos premium que estamos iniciando com foco em <b>Design Autoral</b>.</p>
            <p>Seu portfólio ainda nos impressiona. Que tal uma breve reunião para atualizarmos seu cadastro?</p>
            <a href="#" style="display: inline-block; background: #d4af37; color: black; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">Estou interessado(a)</a>
        </div>',
        '["nome"]',
        v_franchise_id
    );

    -- 2. Create Segments
    INSERT INTO public.email_segments (nome_segmento, descricao, regras, franchise_unit_id)
    VALUES (
        'Designers de Elite',
        'Contatos interessados em design e artes gráficas.',
        '{"interests": ["investidor", "news"]}',
        v_franchise_id
    );

    INSERT INTO public.email_segments (nome_segmento, descricao, regras, franchise_unit_id)
    VALUES (
        'Modelos Ativos',
        'Leads que interagiram recentemente e possuem interesse em castings.',
        '{"interests": ["imovel", "leilao"], "status": "ativo"}',
        v_franchise_id
    );

END $$;
