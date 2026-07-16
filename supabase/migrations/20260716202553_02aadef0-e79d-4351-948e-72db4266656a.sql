
-- =============== CLIENTS ===============
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Active','Suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own record" ON public.clients FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'staff')) WITH CHECK (public.has_role(auth.uid(),'staff'));

-- =============== PROJECTS ===============
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  service_category TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Waiting for Client','Completed','Cancelled')),
  progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Urgent')),
  start_date DATE,
  due_date DATE,
  completion_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own projects" ON public.projects FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')
  );
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff update projects" ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'staff')) WITH CHECK (public.has_role(auth.uid(),'staff'));
CREATE POLICY "Staff insert projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'staff'));

-- =============== PROJECT UPDATES ===============
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  update_title TEXT NOT NULL,
  update_message TEXT,
  progress_percentage INT CHECK (progress_percentage BETWEEN 0 AND 100),
  visible_to_client BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_updates_project_id_idx ON public.project_updates(project_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_updates TO authenticated;
GRANT ALL ON public.project_updates TO service_role;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own project updates" ON public.project_updates FOR SELECT TO authenticated
  USING (
    (visible_to_client = true AND project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.auth_user_id = auth.uid()
    ))
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')
  );
CREATE POLICY "Admins manage project updates" ON public.project_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff insert project updates" ON public.project_updates FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'staff'));

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create/sync a client record from profiles
CREATE OR REPLACE FUNCTION public.handle_new_client_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.clients (auth_user_id, company_name, contact_person, email, phone, status)
  VALUES (NEW.id, NEW.company_name, COALESCE(NEW.contact_person, NEW.full_name), NEW.email, NEW.phone_number,
    CASE WHEN NEW.approval_status = 'approved' THEN 'Active' ELSE 'Pending' END)
  ON CONFLICT (auth_user_id) DO UPDATE
    SET company_name = EXCLUDED.company_name,
        contact_person = EXCLUDED.contact_person,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        status = CASE WHEN NEW.approval_status = 'approved' THEN 'Active'
                      WHEN NEW.approval_status = 'rejected' THEN 'Suspended'
                      ELSE public.clients.status END;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_profiles_sync_client ON public.profiles;
CREATE TRIGGER trg_profiles_sync_client AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client_profile();

-- Backfill for existing profiles
INSERT INTO public.clients (auth_user_id, company_name, contact_person, email, phone, status)
SELECT p.id, p.company_name, COALESCE(p.contact_person, p.full_name), p.email, p.phone_number,
  CASE WHEN p.approval_status = 'approved' THEN 'Active' ELSE 'Pending' END
FROM public.profiles p
ON CONFLICT (auth_user_id) DO NOTHING;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_updates;
