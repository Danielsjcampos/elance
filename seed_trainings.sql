-- Force RLS Off for Seeding (To prevent permission errors during manual insert in some contexts)
ALTER TABLE public.trainings DISABLE ROW LEVEL SECURITY;

-- Delete check to avoid duplicates if re-running
DELETE FROM public.trainings WHERE title IN (
    'Estratégias Vencedoras em Leilões',
    'Como Analisar um Edital de Leilão',
    'Wiki: Glossário Essencial do Leilão',
    'Checklist de Arrematação Segura',
    'Certificação: Fundamentos do Leilão',
    'Desafio: Legislação e Riscos'
);

-- 1. Video: Estratégias de Leilão
INSERT INTO public.trainings (title, description, type, content_url, points, thumbnail_url)
VALUES (
    'Estratégias Vencedoras em Leilões',
    'Aprenda as melhores táticas para arrematar imóveis com alta lucratividade. Um guia completo para iniciantes e avançados.',
    'video',
    'https://www.youtube.com/watch?v=LXb3EKWsInQ', 
    50,
    NULL
);

-- 2. Video: Análise de Edital na Prática
INSERT INTO public.trainings (title, description, type, content_url, points, thumbnail_url)
VALUES (
    'Como Analisar um Edital de Leilão',
    'O edital é a lei do leilão. Descubra os pontos cegos que a maioria ignora e evite prejuízos.',
    'video',
    'https://www.youtube.com/watch?v=b1uE8K-J4_Y', 
    60,
    NULL
);

-- 3. Ebook (Wiki): Glossário do Leilão
INSERT INTO public.trainings (title, description, type, content_url, points, thumbnail_url)
VALUES (
    'Wiki: Glossário Essencial do Leilão',
    'Entenda termos como "Hasta Pública", "Lanço Vil", "Remição" e outros conceitos jurídicos fundamentais.',
    'ebook',
    'https://pt.wikipedia.org/wiki/Leilão',
    20,
    NULL
);

-- 4. Ebook: Checklist de Arrematação
INSERT INTO public.trainings (title, description, type, content_url, points, thumbnail_url)
VALUES (
    'Checklist de Arrematação Segura',
    'Um guia passo a passo em PDF para você imprimir e usar antes de cada lance.',
    'ebook',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
    30,
    NULL
);

-- 5. Quiz: Certificação Básica
INSERT INTO public.trainings (title, description, type, points, quiz_data)
VALUES (
    'Certificação: Fundamentos do Leilão',
    'Teste seus conhecimentos básicos e libere seu acesso para operações reais.',
    'quiz',
    100,
    '[
        {
            "question": "Qual a principal vantagem de comprar em leilão?",
            "options": ["Preço abaixo do mercado", "Facilidade de financiamento", "Imóvel sempre vazio", "Sem custos de cartório"],
            "correct": 0
        },
        {
            "question": "O que caracteriza um leilão extrajudicial?",
            "options": ["É realizado pelo Juiz", "Ocorre por dívida de financiamento bancário", "Não tem edital", "É sempre presencial"],
            "correct": 1
        },
        {
            "question": "O que é Arrematação?",
            "options": ["O ato de cancelar o leilão", "A desistência da compra", "O ato de comprar o bem pelo lance vencedor", "A avaliação do imóvel"],
            "correct": 2
        }
    ]'::jsonb
);

-- 6. Quiz: Legislação Avançada
INSERT INTO public.trainings (title, description, type, points, quiz_data)
VALUES (
    'Desafio: Legislação e Riscos',
    'Você sabe identificar nulidades processuais? Teste seu conhecimento jurídico avançado.',
    'quiz',
    150,
    '[
        {
            "question": "Qual o prazo para impugnação da arrematação?",
            "options": ["5 dias", "10 dias", "30 dias", "48 horas"],
            "correct": 1
        },
        {
            "question": "O arrematante responde por dívidas de IPTU anteriores?",
            "options": ["Sim, sempre", "Não, se constar no edital que é livre de ônus", "Depende do valor", "Apenas 50%"],
            "correct": 1
        }
    ]'::jsonb
);

-- Re-enable RLS
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
