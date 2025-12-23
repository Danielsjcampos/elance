-- FIX ADMIN PROFILE BY EMAIL
-- 1. Substitua 'seu_email_aqui' pelo seu email de login.
-- 2. Rode o script.

DO $$
DECLARE
    -- !!! COLOQUE SEU EMAIL ABAIXO !!!
    target_email TEXT := 'matriz@elance.com'; -- <--- ATUALIZADO PELO SISTEMA
    -------------------------------------------------------------------------
    target_user_id UUID;
BEGIN
    -- Find user ID by Email
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado com o email: %. Verifique se digitou corretamento.', target_email;
    END IF;

    -- Upsert into profiles
    INSERT INTO public.profiles (id, full_name, email, role, permissions)
    VALUES (
        target_user_id,
        'Super Admin (Restored)',
        target_email,
        'admin',
        '{}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = 'admin',
        permissions = '{}'::jsonb;

    RAISE NOTICE 'SUCESSO! Perfil de Admin restaurado para: %', target_email;
END $$;
