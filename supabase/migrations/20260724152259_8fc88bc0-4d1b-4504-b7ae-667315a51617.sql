
-- Restrict overly-permissive 'public' role policies to 'authenticated'
DROP POLICY IF EXISTS "Clients can update own pending enquiries" ON public.enquiries;
CREATE POLICY "Clients can update own pending enquiries" ON public.enquiries
  FOR UPDATE TO authenticated
  USING (((client_id = auth.uid()) AND (status = 'Pending Review'::enquiry_status)) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (((client_id = auth.uid()) AND (status = 'Pending Review'::enquiry_status)) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

DROP POLICY IF EXISTS "Clients update own quotations" ON public.quotations;
CREATE POLICY "Clients update own quotations" ON public.quotations
  FOR UPDATE TO authenticated
  USING ((client_id IN (SELECT clients.id FROM public.clients WHERE clients.auth_user_id = auth.uid()))
         AND (status = ANY (ARRAY['Sent'::quotation_status, 'Viewed'::quotation_status])))
  WITH CHECK ((client_id IN (SELECT clients.id FROM public.clients WHERE clients.auth_user_id = auth.uid()))
              AND (status = ANY (ARRAY['Sent'::quotation_status, 'Viewed'::quotation_status, 'Accepted'::quotation_status, 'Rejected'::quotation_status])));

-- Lock down system_sequences writes explicitly (fail-closed already, but make intent explicit)
REVOKE INSERT, UPDATE, DELETE ON public.system_sequences FROM anon, authenticated;

-- Revoke public EXECUTE on generate_next_code; only authenticated users may request codes
REVOKE ALL ON FUNCTION public.generate_next_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_next_code(text) TO authenticated;
