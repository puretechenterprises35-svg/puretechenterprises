
-- Enum types
DO $$ BEGIN
  CREATE TYPE public.enquiry_priority AS ENUM ('Low','Medium','High');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.enquiry_status AS ENUM (
    'Pending Review','Needs More Information','Approved','Rejected','Converted to Project'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_completion_date DATE,
  estimated_budget NUMERIC(12,2),
  priority public.enquiry_priority NOT NULL DEFAULT 'Medium',
  status public.enquiry_status NOT NULL DEFAULT 'Pending Review',
  admin_notes TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own enquiries" ON public.enquiries
  FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Clients can insert own enquiries" ON public.enquiries
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own pending enquiries" ON public.enquiries
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (client_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Admins can delete enquiries" ON public.enquiries
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_enquiries_client_id ON public.enquiries(client_id);
CREATE INDEX idx_enquiries_status ON public.enquiries(status);

-- Storage policies for enquiry attachments (uses existing project-documents bucket, path prefix enquiries/{user_id}/...)
CREATE POLICY "Clients can upload own enquiry attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = 'enquiries'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Clients can view own enquiry attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = 'enquiries'
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'staff')
    )
  );

CREATE POLICY "Clients can delete own enquiry attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = 'enquiries'
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
    )
  );
