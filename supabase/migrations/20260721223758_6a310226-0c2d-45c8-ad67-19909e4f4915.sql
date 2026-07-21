
-- 1. Sequence + column defaults for project numbering
CREATE SEQUENCE IF NOT EXISTS public.project_number_seq START 1;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_number TEXT,
  ADD COLUMN IF NOT EXISTS contract_value NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS grand_total NUMERIC(14,2);

-- Unique constraint for the project number
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_project_number_key'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_project_number_key UNIQUE (project_number);
  END IF;
END $$;

-- 2. Auto-generate project number trigger
CREATE OR REPLACE FUNCTION public.generate_project_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.project_number IS NULL OR NEW.project_number = '' THEN
    NEW.project_number := 'PRJ-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.project_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_project_number ON public.projects;
CREATE TRIGGER trg_generate_project_number
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.generate_project_number();

-- 3. Reverse links from quotations & enquiries to the project they spawned
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS quotations_project_id_idx ON public.quotations(project_id);
CREATE INDEX IF NOT EXISTS enquiries_project_id_idx ON public.enquiries(project_id);

-- 4. Admin-only conversion RPC
CREATE OR REPLACE FUNCTION public.create_project_from_quotation(_quotation_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q RECORD;
  e RECORD;
  new_project_id UUID;
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL OR NOT public.has_role(caller, 'admin') THEN
    RAISE EXCEPTION 'Only administrators can create projects from quotations';
  END IF;

  SELECT * INTO q FROM public.quotations WHERE id = _quotation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found', _quotation_id;
  END IF;
  IF q.status <> 'Accepted' THEN
    RAISE EXCEPTION 'Only Accepted quotations can be converted (status: %)', q.status;
  END IF;
  IF q.project_id IS NOT NULL THEN
    RETURN q.project_id;
  END IF;
  IF q.enquiry_id IS NULL THEN
    RAISE EXCEPTION 'Quotation is not linked to an enquiry';
  END IF;

  SELECT * INTO e FROM public.enquiries WHERE id = q.enquiry_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked enquiry not found';
  END IF;

  INSERT INTO public.projects (
    client_id, enquiry_id, quotation_id, created_by,
    project_name, description, service_category,
    priority, status, progress_percentage,
    start_date, source,
    contract_value, currency, vat_amount, grand_total
  ) VALUES (
    q.client_id, q.enquiry_id, q.id, caller,
    COALESCE(NULLIF(e.title, ''), q.title),
    COALESCE(e.description, q.description),
    COALESCE(e.service_category, 'General'),
    COALESCE(e.priority, 'Medium'),
    'In Progress',
    0,
    CURRENT_DATE,
    'quotation',
    q.subtotal,
    q.currency,
    q.tax_amount,
    q.total_amount
  ) RETURNING id INTO new_project_id;

  UPDATE public.quotations SET project_id = new_project_id WHERE id = q.id;
  UPDATE public.enquiries  SET project_id = new_project_id WHERE id = e.id;

  RETURN new_project_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_project_from_quotation(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_project_from_quotation(UUID) TO authenticated;
