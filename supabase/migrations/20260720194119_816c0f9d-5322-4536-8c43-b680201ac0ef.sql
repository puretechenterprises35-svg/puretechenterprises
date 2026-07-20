
-- Enforce that quotations must always reference an enquiry
ALTER TABLE public.quotations DROP CONSTRAINT IF EXISTS quotations_enquiry_id_fkey;
ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_enquiry_id_fkey
  FOREIGN KEY (enquiry_id) REFERENCES public.enquiries(id) ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION public.enforce_quotation_enquiry_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.enquiry_id IS NULL THEN
    RAISE EXCEPTION 'Quotations must be linked to an enquiry (enquiry_id required)';
  END IF;
  IF NEW.client_id IS NULL THEN
    RAISE EXCEPTION 'Quotations must have a client_id';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_quotation_enquiry_link() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_quotation_enquiry_link_trg ON public.quotations;
CREATE TRIGGER enforce_quotation_enquiry_link_trg
  BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_quotation_enquiry_link();
