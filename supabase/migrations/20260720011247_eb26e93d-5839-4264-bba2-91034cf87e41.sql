
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS source TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS projects_enquiry_id_unique
  ON public.projects(enquiry_id) WHERE enquiry_id IS NOT NULL;
