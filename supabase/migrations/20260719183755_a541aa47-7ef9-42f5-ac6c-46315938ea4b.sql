
-- Restrict client updates: clients can only edit their own enquiry non-privileged fields; only admins/staff may change status or admin_notes.
CREATE OR REPLACE FUNCTION public.prevent_client_enquiry_privileged_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') THEN
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Only admins can change enquiry status';
  END IF;
  IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
    RAISE EXCEPTION 'Only admins can edit admin notes';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enquiries_prevent_client_privileged_updates ON public.enquiries;
CREATE TRIGGER enquiries_prevent_client_privileged_updates
BEFORE UPDATE ON public.enquiries
FOR EACH ROW EXECUTE FUNCTION public.prevent_client_enquiry_privileged_updates();
