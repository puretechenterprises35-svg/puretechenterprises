CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can submit quote requests" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT INSERT ON public.quote_requests TO anon, authenticated;