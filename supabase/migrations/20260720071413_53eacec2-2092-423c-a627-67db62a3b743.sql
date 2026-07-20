
ALTER TYPE public.quotation_status ADD VALUE IF NOT EXISTS 'Viewed' AFTER 'Sent';

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS viewed_by uuid;

CREATE OR REPLACE FUNCTION public.prevent_client_quotation_privileged_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') THEN
    RETURN NEW;
  END IF;

  -- Clients may only act on their own Sent or Viewed quotations
  IF OLD.status NOT IN ('Sent','Viewed') THEN
    RAISE EXCEPTION 'Only admins can modify this quotation';
  END IF;

  -- Allowed target statuses for clients
  IF NEW.status NOT IN ('Sent','Viewed','Accepted','Rejected') THEN
    RAISE EXCEPTION 'Clients cannot set this status';
  END IF;

  -- Ensure no privileged/content fields change
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
     OR NEW.updated_by IS DISTINCT FROM OLD.updated_by
     OR NEW.sent_at IS DISTINCT FROM OLD.sent_at
  THEN
    RAISE EXCEPTION 'Clients cannot modify quotation details';
  END IF;

  RETURN NEW;
END; $function$;
