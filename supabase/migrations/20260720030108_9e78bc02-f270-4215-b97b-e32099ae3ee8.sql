
-- 1) Clients: tighten update policy to admins only
DROP POLICY IF EXISTS "Staff update clients" ON public.clients;
CREATE POLICY "Admins update clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Enquiries: enforce that client_id is a real auth user (via profiles.id = auth.users.id)
--    and document the design so future scans/readers understand the intent.
COMMENT ON COLUMN public.enquiries.client_id IS
  'Auth user id of the submitting client (equals profiles.id and auth.users.id). Enforced by INSERT policy client_id = auth.uid() and FK to profiles(id). This is intentionally NOT clients.id.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'enquiries_client_id_fkey_profiles'
  ) THEN
    ALTER TABLE public.enquiries
      ADD CONSTRAINT enquiries_client_id_fkey_profiles
      FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
