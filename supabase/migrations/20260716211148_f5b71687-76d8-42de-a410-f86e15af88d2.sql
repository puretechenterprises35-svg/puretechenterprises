
-- documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Other',
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  visible_to_client boolean NOT NULL DEFAULT true,
  download_count integer NOT NULL DEFAULT 0,
  replaces_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients view own visible documents" ON public.documents;
CREATE POLICY "Clients view own visible documents" ON public.documents
  FOR SELECT TO authenticated
  USING (
    visible_to_client = true
    AND EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = documents.client_id AND c.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage all documents" ON public.documents;
CREATE POLICY "Admins manage all documents" ON public.documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff read all documents" ON public.documents;
CREATE POLICY "Staff read all documents" ON public.documents
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff'));

CREATE INDEX IF NOT EXISTS documents_project_id_idx ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS documents_client_id_idx ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_at_idx ON public.documents(uploaded_at DESC);

CREATE TRIGGER documents_set_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- document_activity table
CREATE TABLE IF NOT EXISTS public.document_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.document_activity TO authenticated;
GRANT ALL ON public.document_activity TO service_role;

ALTER TABLE public.document_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage document activity" ON public.document_activity;
CREATE POLICY "Admins manage document activity" ON public.document_activity
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff read document activity" ON public.document_activity;
CREATE POLICY "Staff read document activity" ON public.document_activity
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Clients read own document activity" ON public.document_activity;
CREATE POLICY "Clients read own document activity" ON public.document_activity
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.clients c ON c.id = d.client_id
      WHERE d.id = document_activity.document_id
        AND c.auth_user_id = auth.uid()
        AND d.visible_to_client = true
    )
  );

DROP POLICY IF EXISTS "Clients log own document downloads" ON public.document_activity;
CREATE POLICY "Clients log own document downloads" ON public.document_activity
  FOR INSERT TO authenticated
  WITH CHECK (
    action = 'Downloaded'
    AND performed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.clients c ON c.id = d.client_id
      WHERE d.id = document_activity.document_id
        AND c.auth_user_id = auth.uid()
        AND d.visible_to_client = true
    )
  );

CREATE INDEX IF NOT EXISTS document_activity_document_id_idx ON public.document_activity(document_id);

-- Storage policies for project-documents bucket
DROP POLICY IF EXISTS "Admins manage project-documents" ON storage.objects;
CREATE POLICY "Admins manage project-documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'project-documents' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'project-documents' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff read project-documents" ON storage.objects;
CREATE POLICY "Staff read project-documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'project-documents' AND public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Clients read own project-documents" ON storage.objects;
CREATE POLICY "Clients read own project-documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.clients c ON c.id = d.client_id
      WHERE d.file_path = storage.objects.name
        AND c.auth_user_id = auth.uid()
        AND d.visible_to_client = true
    )
  );

-- Realtime for documents
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
