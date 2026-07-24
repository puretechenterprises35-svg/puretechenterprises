
-- Restrict client updates on enquiries to Pending Review only
DROP POLICY IF EXISTS "Clients can update own pending enquiries" ON public.enquiries;
CREATE POLICY "Clients can update own pending enquiries"
ON public.enquiries
FOR UPDATE
USING (
  ((client_id = auth.uid()) AND (status = 'Pending Review'))
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  ((client_id = auth.uid()) AND (status = 'Pending Review'))
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

-- Tighten client quotation updates: only when currently Sent/Viewed and
-- only transitioning to Sent/Viewed/Accepted/Rejected. The existing
-- prevent_client_quotation_privileged_updates trigger enforces field-level
-- immutability of pricing/content.
DROP POLICY IF EXISTS "Clients update own quotations" ON public.quotations;
CREATE POLICY "Clients update own quotations"
ON public.quotations
FOR UPDATE
USING (
  client_id IN (SELECT clients.id FROM clients WHERE clients.auth_user_id = auth.uid())
  AND status IN ('Sent','Viewed')
)
WITH CHECK (
  client_id IN (SELECT clients.id FROM clients WHERE clients.auth_user_id = auth.uid())
  AND status IN ('Sent','Viewed','Accepted','Rejected')
);
