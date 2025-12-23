-- SCRIPT DE CORREÇÃO (FIX DATABASE) - V2
-- Execute isso no Supabase SQL Editor.

-- 1. Limpeza de Triggers e Funções antigas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recriar funções de segurança (Security Definer)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_franchise_id()
RETURNS UUID AS $$
  SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. Resetar e Simplificar RLS de Profiles (Garantir idempotência)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Dropar TODAS as políticas possíveis (antigas e novas)
DROP POLICY IF EXISTS "Admin sees all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users see franchise members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles; -- Nova policy que causou erro

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recriar Políticas
CREATE POLICY "Read own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin sees all profiles" ON public.profiles
    FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Users see franchise members" ON public.profiles
    FOR SELECT USING (franchise_unit_id = public.get_my_franchise_id());

-- 4. Garantir permissões
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 5. CORREÇÃO FINAL: Inserir o Perfil do Admin (Se não existir)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES 
  ('65314125-c9ee-46c1-9c56-109eecb28ce7', 'admin@elance.com', 'Super Admin', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Super Admin';
