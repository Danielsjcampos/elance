-- DANGER: This script wipes the public schema!
-- Run this in the Supabase SQL Editor.

-- 1. Reset Schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'collaborator');

-- 3. Tables

-- Franchise Units
CREATE TABLE public.franchise_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT,
    address TEXT,
    owner_id UUID REFERENCES auth.users(id), -- Optional link to owner user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    active BOOLEAN DEFAULT true
);

-- Profiles (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role user_role DEFAULT 'collaborator',
    franchise_unit_id UUID REFERENCES public.franchise_units(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Leads
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new',
    franchise_id UUID REFERENCES public.franchise_units(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Auctions (Leilões)
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    first_date TIMESTAMP WITH TIME ZONE,
    second_date TIMESTAMP WITH TIME ZONE,
    valuation_value NUMERIC,
    minimum_bid NUMERIC,
    status TEXT DEFAULT 'new', -- new, published, sold
    process_number TEXT,
    franchise_id UUID REFERENCES public.franchise_units(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    due_date TIMESTAMP WITH TIME ZONE,
    auction_id UUID REFERENCES public.auctions(id),
    assigned_to UUID REFERENCES public.profiles(id),
    franchise_id UUID REFERENCES public.franchise_units(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Training
CREATE TABLE public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Documents
CREATE TABLE public.company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketing Materials
CREATE TABLE public.marketing_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    type TEXT, -- image, video, psd
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events (Agenda)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    description TEXT,
    franchise_id UUID REFERENCES public.franchise_units(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial Logs
CREATE TABLE public.financial_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')),
    auction_id UUID REFERENCES public.auctions(id),
    franchise_id UUID REFERENCES public.franchise_units(id) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.franchise_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY; -- Shared
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY; -- Shared
ALTER TABLE public.marketing_materials ENABLE ROW LEVEL SECURITY; -- Shared
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_logs ENABLE ROW LEVEL SECURITY;

-- 5. Functions & Policies helper

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get current user's franchise_id
CREATE OR REPLACE FUNCTION public.get_my_franchise_id()
RETURNS UUID AS $$
  SELECT franchise_unit_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies

-- Franchise Units: Admin sees all, Managers see own
CREATE POLICY "Admin sees all franchises" ON public.franchise_units
    FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Managers see own franchise" ON public.franchise_units
    FOR SELECT USING (id = public.get_my_franchise_id());

-- Profiles: Admin sees all, Users see themselves and their franchise members
CREATE POLICY "Admin sees all profiles" ON public.profiles
    FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Users see franchise members" ON public.profiles
    FOR SELECT USING (franchise_unit_id = public.get_my_franchise_id());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Leads: Admin sees all, Franchisees see own
CREATE POLICY "Admin sees all leads" ON public.leads
    FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Franchise sees own leads" ON public.leads
    FOR ALL USING (franchise_id = public.get_my_franchise_id());

-- Auctions: Admin sees all, Franchisees see own
CREATE POLICY "Admin sees all auctions" ON public.auctions
    FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Franchise sees own auctions" ON public.auctions
    FOR ALL USING (franchise_id = public.get_my_franchise_id());

-- Tasks: Same pattern
CREATE POLICY "Admin sees all tasks" ON public.tasks
    FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Franchise sees own tasks" ON public.tasks
    FOR ALL USING (franchise_id = public.get_my_franchise_id());

-- Trainings, Documents, Marketing: Everyone can read
CREATE POLICY "Everyone reads training" ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages training" ON public.trainings FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Everyone reads docs" ON public.company_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages docs" ON public.company_documents FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Everyone reads marketing" ON public.marketing_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages marketing" ON public.marketing_materials FOR ALL USING (public.get_my_role() = 'admin');

-- Events & Financial: Franchise isolated
CREATE POLICY "Admin sees all events" ON public.events FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Franchise sees own events" ON public.events FOR ALL USING (franchise_id = public.get_my_franchise_id());

CREATE POLICY "Admin sees all finance" ON public.financial_logs FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Franchise sees own finance" ON public.financial_logs FOR ALL USING (franchise_id = public.get_my_franchise_id());

-- 6. Trigger to create profile on signup (Optional but good practice)
-- Note: This trigger needs to be created carefully as it interacts with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'manager'); -- Defaulting to manager for now for testing
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger separate from logic to be safe if auth schema isn't fully accessible via SQL editor sometimes
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

