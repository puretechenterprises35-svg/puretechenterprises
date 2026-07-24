
-- 1. system_sequences
CREATE TABLE public.system_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  current_number INTEGER NOT NULL DEFAULT 0,
  number_length INTEGER NOT NULL DEFAULT 4,
  yearly_reset BOOLEAN NOT NULL DEFAULT FALSE,
  last_reset_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.system_sequences TO authenticated;
GRANT ALL ON public.system_sequences TO service_role;
ALTER TABLE public.system_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and staff can view sequences" ON public.system_sequences
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE TRIGGER trg_system_sequences_updated
  BEFORE UPDATE ON public.system_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed
INSERT INTO public.system_sequences (sequence_name, prefix, current_number, number_length, yearly_reset) VALUES
  ('DIVISION','DIV',0,4,false),
  ('CATEGORY','CAT',0,4,false),
  ('SERVICE','SER',0,4,false),
  ('PACKAGE','PKG',0,4,false),
  ('CLIENT','CLI',0,4,false),
  ('QUOTATION','QUO',0,4,true),
  ('PROJECT','PRJ',0,4,true),
  ('INVOICE','INV',0,4,true),
  ('PAYMENT','PAY',0,4,true),
  ('RECEIPT','REC',0,4,true),
  ('SERVICE_REQUEST','REQ',0,4,true);

-- 2. Code generator
CREATE OR REPLACE FUNCTION public.generate_next_code(_sequence_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq RECORD;
  yr INTEGER := EXTRACT(YEAR FROM now())::int;
  next_num INTEGER;
  formatted TEXT;
BEGIN
  SELECT * INTO seq FROM public.system_sequences
    WHERE sequence_name = _sequence_name FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sequence % not found', _sequence_name;
  END IF;

  IF seq.yearly_reset AND (seq.last_reset_year IS NULL OR seq.last_reset_year <> yr) THEN
    next_num := 1;
    UPDATE public.system_sequences
      SET current_number = 1, last_reset_year = yr, updated_at = now()
      WHERE id = seq.id;
  ELSE
    next_num := seq.current_number + 1;
    UPDATE public.system_sequences
      SET current_number = next_num, updated_at = now()
      WHERE id = seq.id;
  END IF;

  IF seq.yearly_reset THEN
    formatted := seq.prefix || '-' || yr::text || '-' || lpad(next_num::text, seq.number_length, '0');
  ELSE
    formatted := seq.prefix || '-' || lpad(next_num::text, seq.number_length, '0');
  END IF;

  RETURN formatted;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_next_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_next_code(TEXT) TO authenticated;

-- 3. divisions
CREATE TABLE public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_code TEXT NOT NULL UNIQUE,
  division_name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.divisions TO authenticated;
GRANT ALL ON public.divisions TO service_role;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and staff can view divisions" ON public.divisions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Admins and staff can insert divisions" ON public.divisions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Admins and staff can update divisions" ON public.divisions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Admins can delete divisions" ON public.divisions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_divisions_updated
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent editing division_code manually
CREATE OR REPLACE FUNCTION public.prevent_division_code_change()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.division_code IS DISTINCT FROM OLD.division_code THEN
    RAISE EXCEPTION 'division_code cannot be modified';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_divisions_lock_code
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_division_code_change();

-- Auto-assign division_code on insert if missing
CREATE OR REPLACE FUNCTION public.assign_division_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.division_code IS NULL OR NEW.division_code = '' THEN
    NEW.division_code := public.generate_next_code('DIVISION');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_divisions_assign_code
  BEFORE INSERT ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.assign_division_code();
