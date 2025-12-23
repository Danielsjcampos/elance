-- Comprehensive Financial Module Upgrade

-- 1. Upgrade financial_logs table
ALTER TABLE public.financial_logs
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Outros', -- 'Taxas', 'Comissões', 'Marketing', 'Aluguel', etc.
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid', -- 'paid', 'pending', 'overdue'
ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS payment_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS related_franchise_id UUID REFERENCES public.franchise_units(id), -- For cross-franchise commissions
ADD COLUMN IF NOT EXISTS commission_source TEXT; -- 'leilao_proprio', 'indicacao', etc.

-- 2. Helper comments
COMMENT ON COLUMN public.financial_logs.status IS 'Payment status: paid, pending, overdue';
COMMENT ON COLUMN public.financial_logs.related_franchise_id IS 'If this transaction is related to another franchise (e.g. commission paid/received)';

-- 3. Indexes for performance on reports
CREATE INDEX IF NOT EXISTS idx_financial_logs_date ON public.financial_logs(date);
CREATE INDEX IF NOT EXISTS idx_financial_logs_status ON public.financial_logs(status);
CREATE INDEX IF NOT EXISTS idx_financial_logs_franchise_id ON public.financial_logs(franchise_id);
