
-- Quote number sequence
CREATE SEQUENCE IF NOT EXISTS public.quotation_number_seq START 1;

-- Status enum
DO $$ BEGIN
  CREATE TYPE public.quotation_status AS ENUM (
    'Draft','Sent','Accepted','Rejected','Expired','Revised'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quotations
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE NOT NULL,
  enquiry_id uuid REFERENCES public.enquiries(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  status public.quotation_status NOT NULL DEFAULT 'Draft',
  valid_until date,
  notes text,
  terms text,
  pdf_path text,
  revision integer NOT NULL DEFAULT 1,
  accepted_at timestamptz,
  accepted_by uuid,
  rejected_at timestamptz,
  rejection_reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
GRANT USAGE ON SEQUENCE public.quotation_number_seq TO authenticated, service_role;

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Admin/staff full access
CREATE POLICY "Admins manage quotations" ON public.quotations
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Clients can view their own quotations
CREATE POLICY "Clients view own quotations" ON public.quotations
FOR SELECT TO authenticated
USING (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
);

-- Clients can update own quotations (trigger enforces which fields)
CREATE POLICY "Clients update own quotations" ON public.quotations
FOR UPDATE TO authenticated
USING (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
)
WITH CHECK (
  client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
);

-- Auto quote number
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := 'Q-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.quotation_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.generate_quotation_number() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_quotations_number BEFORE INSERT ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.generate_quotation_number();

CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent clients from changing anything other than accept/reject fields
CREATE OR REPLACE FUNCTION public.prevent_client_quotation_privileged_updates()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') THEN
    RETURN NEW;
  END IF;

  -- Client path: only allow accept/reject transitions from Sent
  IF OLD.status <> 'Sent' THEN
    RAISE EXCEPTION 'Only admins can modify this quotation';
  END IF;
  IF NEW.status NOT IN ('Accepted','Rejected') THEN
    RAISE EXCEPTION 'Clients can only accept or reject a quotation';
  END IF;
  -- Block edits to non-decision fields
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.subtotal IS DISTINCT FROM OLD.subtotal
     OR NEW.tax_rate IS DISTINCT FROM OLD.tax_rate
     OR NEW.tax_amount IS DISTINCT FROM OLD.tax_amount
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.valid_until IS DISTINCT FROM OLD.valid_until
     OR NEW.notes IS DISTINCT FROM OLD.notes
     OR NEW.terms IS DISTINCT FROM OLD.terms
     OR NEW.pdf_path IS DISTINCT FROM OLD.pdf_path
     OR NEW.enquiry_id IS DISTINCT FROM OLD.enquiry_id
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.quote_number IS DISTINCT FROM OLD.quote_number
     OR NEW.revision IS DISTINCT FROM OLD.revision
  THEN
    RAISE EXCEPTION 'Clients cannot modify quotation details';
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.prevent_client_quotation_privileged_updates() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_quotations_client_guard BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.prevent_client_quotation_privileged_updates();

-- quotation_items
CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(14,2) NOT NULL DEFAULT 1,
  unit_price numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_items TO authenticated;
GRANT ALL ON public.quotation_items TO service_role;

ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quotation items" ON public.quotation_items
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Clients view own quotation items" ON public.quotation_items
FOR SELECT TO authenticated
USING (
  quotation_id IN (
    SELECT q.id FROM public.quotations q
    JOIN public.clients c ON c.id = q.client_id
    WHERE c.auth_user_id = auth.uid()
  )
);

CREATE INDEX idx_quotation_items_quotation ON public.quotation_items(quotation_id);
CREATE INDEX idx_quotations_enquiry ON public.quotations(enquiry_id);
CREATE INDEX idx_quotations_client ON public.quotations(client_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);

-- Link project back to originating quotation
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL;
