
-- System settings: single-row configuration table
CREATE TABLE public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  -- Company
  company_name TEXT NOT NULL DEFAULT 'Puretech Enterprises',
  trading_name TEXT,
  registration_number TEXT,
  tpin TEXT,
  company_email TEXT,
  company_phone TEXT,
  alternative_phone TEXT,
  website TEXT,
  physical_address TEXT,
  postal_address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Zambia',
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  stamp_url TEXT,
  -- Regional
  default_currency TEXT NOT NULL DEFAULT 'ZMW',
  timezone TEXT NOT NULL DEFAULT 'Africa/Lusaka',
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  number_format TEXT NOT NULL DEFAULT '1,234.56',
  -- Business
  default_vat_rate NUMERIC NOT NULL DEFAULT 16,
  default_quotation_validity_days INTEGER NOT NULL DEFAULT 30,
  default_invoice_due_days INTEGER NOT NULL DEFAULT 14,
  default_project_status TEXT NOT NULL DEFAULT 'Planning',
  default_payment_terms TEXT DEFAULT '50% deposit, 50% on completion',
  -- Document prefixes
  quotation_prefix TEXT NOT NULL DEFAULT 'PTQ',
  invoice_prefix TEXT NOT NULL DEFAULT 'INV',
  project_prefix TEXT NOT NULL DEFAULT 'PRJ',
  -- Contact
  support_email TEXT,
  sales_email TEXT,
  accounts_email TEXT,
  support_phone TEXT,
  whatsapp_number TEXT,
  -- Social
  facebook_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  CONSTRAINT system_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.system_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Public/authenticated can read settings (used for branding, currency, contact on public site)
CREATE POLICY "Anyone can view settings"
  ON public.system_settings FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert settings"
  ON public.system_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
  ON public.system_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the singleton row
INSERT INTO public.system_settings (id, company_name, company_email, company_phone, whatsapp_number, city, country)
VALUES (1, 'Puretech Enterprises', 'puretechenterprises35@gmail.com', '+260 962190263', '260962190263', 'Kapiri Mposhi', 'Zambia')
ON CONFLICT (id) DO NOTHING;
