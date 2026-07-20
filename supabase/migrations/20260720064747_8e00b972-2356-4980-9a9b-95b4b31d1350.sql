
-- Module 3A: Professional Quotation Management enhancements

ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS discount_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS acceptance_method text,
  ADD COLUMN IF NOT EXISTS acceptance_notes text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_timeline text,
  ADD COLUMN IF NOT EXISTS payment_terms text,
  ADD COLUMN IF NOT EXISTS clarification_note text,
  ADD COLUMN IF NOT EXISTS clarification_requested_at timestamptz;

-- Switch quote number prefix to PTQ- and 4-digit padding
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := 'PTQ-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.quotation_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END; $$;

-- Extend client update trigger to allow clarification requests + block new privileged fields
CREATE OR REPLACE FUNCTION public.prevent_client_quotation_privileged_updates()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') THEN
    RETURN NEW;
  END IF;

  IF OLD.status <> 'Sent' THEN
    RAISE EXCEPTION 'Only admins can modify this quotation';
  END IF;

  -- Clarification request: status stays 'Sent', only clarification fields change
  IF NEW.status = 'Sent' THEN
    IF NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.subtotal IS DISTINCT FROM OLD.subtotal
       OR NEW.tax_rate IS DISTINCT FROM OLD.tax_rate
       OR NEW.tax_amount IS DISTINCT FROM OLD.tax_amount
       OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
       OR NEW.discount_total IS DISTINCT FROM OLD.discount_total
       OR NEW.vat_enabled IS DISTINCT FROM OLD.vat_enabled
       OR NEW.currency IS DISTINCT FROM OLD.currency
       OR NEW.valid_until IS DISTINCT FROM OLD.valid_until
       OR NEW.notes IS DISTINCT FROM OLD.notes
       OR NEW.terms IS DISTINCT FROM OLD.terms
       OR NEW.delivery_timeline IS DISTINCT FROM OLD.delivery_timeline
       OR NEW.payment_terms IS DISTINCT FROM OLD.payment_terms
       OR NEW.pdf_path IS DISTINCT FROM OLD.pdf_path
       OR NEW.enquiry_id IS DISTINCT FROM OLD.enquiry_id
       OR NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.quote_number IS DISTINCT FROM OLD.quote_number
       OR NEW.revision IS DISTINCT FROM OLD.revision
       OR NEW.acceptance_method IS DISTINCT FROM OLD.acceptance_method
       OR NEW.acceptance_notes IS DISTINCT FROM OLD.acceptance_notes
       OR NEW.updated_by IS DISTINCT FROM OLD.updated_by
       OR NEW.sent_at IS DISTINCT FROM OLD.sent_at
    THEN
      RAISE EXCEPTION 'Clients cannot modify quotation details';
    END IF;
    RETURN NEW;
  END IF;

  -- Accept / reject path
  IF NEW.status NOT IN ('Accepted','Rejected') THEN
    RAISE EXCEPTION 'Clients can only accept, reject, or request clarification';
  END IF;
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.subtotal IS DISTINCT FROM OLD.subtotal
     OR NEW.tax_rate IS DISTINCT FROM OLD.tax_rate
     OR NEW.tax_amount IS DISTINCT FROM OLD.tax_amount
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.discount_total IS DISTINCT FROM OLD.discount_total
     OR NEW.vat_enabled IS DISTINCT FROM OLD.vat_enabled
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.valid_until IS DISTINCT FROM OLD.valid_until
     OR NEW.notes IS DISTINCT FROM OLD.notes
     OR NEW.terms IS DISTINCT FROM OLD.terms
     OR NEW.delivery_timeline IS DISTINCT FROM OLD.delivery_timeline
     OR NEW.payment_terms IS DISTINCT FROM OLD.payment_terms
     OR NEW.pdf_path IS DISTINCT FROM OLD.pdf_path
     OR NEW.enquiry_id IS DISTINCT FROM OLD.enquiry_id
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.quote_number IS DISTINCT FROM OLD.quote_number
     OR NEW.revision IS DISTINCT FROM OLD.revision
     OR NEW.acceptance_method IS DISTINCT FROM OLD.acceptance_method
     OR NEW.acceptance_notes IS DISTINCT FROM OLD.acceptance_notes
     OR NEW.updated_by IS DISTINCT FROM OLD.updated_by
  THEN
    RAISE EXCEPTION 'Clients cannot modify quotation details';
  END IF;
  RETURN NEW;
END; $$;
