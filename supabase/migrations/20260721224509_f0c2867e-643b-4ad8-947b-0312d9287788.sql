DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.system_settings;
CREATE POLICY "Admins and staff can view settings" ON public.system_settings
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));