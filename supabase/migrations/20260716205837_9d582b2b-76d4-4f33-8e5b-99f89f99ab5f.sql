ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS archived_at timestamptz;

DROP POLICY IF EXISTS "Clients view own projects" ON public.projects;
CREATE POLICY "Clients view own projects" ON public.projects FOR SELECT TO authenticated
USING (
  archived_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = projects.client_id AND c.auth_user_id = auth.uid()
  )
);