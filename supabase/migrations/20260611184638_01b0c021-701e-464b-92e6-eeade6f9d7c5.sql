
-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Properties table
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  reference text UNIQUE NOT NULL,
  titre text NOT NULL,
  type text NOT NULL DEFAULT 'vente',
  statut text NOT NULL DEFAULT 'disponible',
  prix numeric NOT NULL DEFAULT 0,
  surface numeric,
  pieces integer,
  chambres integer,
  quartier text,
  description text DEFAULT '',
  meuble boolean DEFAULT false,
  parking boolean DEFAULT false,
  cave boolean DEFAULT false,
  dpe text,
  photo_principale text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are publicly visible"
  ON public.properties FOR SELECT
  USING (visible = true);

CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Form submissions table
CREATE TABLE public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  form_type text NOT NULL,
  prenom text,
  nom text,
  email text,
  telephone text,
  reference_annonce text,
  donnees_completes jsonb NOT NULL DEFAULT '{}'::jsonb,
  statut text NOT NULL DEFAULT 'nouveau',
  traite boolean NOT NULL DEFAULT false
);

GRANT INSERT ON public.form_submissions TO anon;
GRANT INSERT ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a form"
  ON public.form_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX idx_form_submissions_created_at ON public.form_submissions (created_at DESC);
CREATE INDEX idx_form_submissions_statut ON public.form_submissions (statut);
