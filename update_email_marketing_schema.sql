
-- Create Email Campaigns table to track bulk emails
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchise_units(id),
    subject TEXT NOT NULL,
    body TEXT NOT NULL, -- HTML content
    status TEXT DEFAULT 'draft', -- draft, sending, sent, failed
    recipient_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Create News table for the "Channel" content
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchise_units(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    content TEXT, -- HTML or Markdown
    featured_image_url TEXT,
    published BOOLEAN DEFAULT false,
    sent_by_email BOOLEAN DEFAULT false, -- If it was already blasted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policies for News (Public read, Admin write)
CREATE POLICY "Public news read" ON public.news FOR SELECT USING (true);
CREATE POLICY "Admin news all" ON public.news FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'manager', 'franchisee'))
);

-- Policies for Campaigns (Admin only)
CREATE POLICY "Admin campaigns all" ON public.email_campaigns FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'manager', 'franchisee'))
);
