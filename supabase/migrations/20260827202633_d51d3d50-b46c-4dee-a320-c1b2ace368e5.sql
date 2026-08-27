ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS crm_stage text NOT NULL DEFAULT 'nouveau',
  ADD COLUMN IF NOT EXISTS lead_score integer,
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS next_action text,
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz;

ALTER TABLE public.form_submissions
  ADD CONSTRAINT form_submissions_crm_stage_check
  CHECK (crm_stage IN ('nouveau','a_qualifier','en_cours','rdv','clos'));

ALTER TABLE public.form_submissions
  ADD CONSTRAINT form_submissions_lead_score_check
  CHECK (lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100));

CREATE TABLE public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_notes_lead_id_idx ON public.crm_notes(lead_id);
GRANT SELECT, INSERT, UPDATE ON public.crm_notes TO authenticated;
GRANT ALL ON public.crm_notes TO service_role;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notes" ON public.crm_notes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Demo reads demo notes" ON public.crm_notes FOR SELECT TO authenticated
  USING (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));
CREATE POLICY "Demo adds demo notes" ON public.crm_notes FOR INSERT TO authenticated
  WITH CHECK (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));

CREATE TABLE public.crm_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  appointment_type text NOT NULL DEFAULT 'visite',
  status text NOT NULL DEFAULT 'planned',
  notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_appointments_lead_id_idx ON public.crm_appointments(lead_id);
GRANT SELECT, INSERT, UPDATE ON public.crm_appointments TO authenticated;
GRANT ALL ON public.crm_appointments TO service_role;
ALTER TABLE public.crm_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage appointments" ON public.crm_appointments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Demo reads demo appointments" ON public.crm_appointments FOR SELECT TO authenticated
  USING (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));
CREATE POLICY "Demo adds demo appointments" ON public.crm_appointments FOR INSERT TO authenticated
  WITH CHECK (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));

CREATE TABLE public.crm_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  match_score integer,
  status text NOT NULL DEFAULT 'suggested',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, property_id)
);
CREATE INDEX crm_matches_lead_id_idx ON public.crm_matches(lead_id);
GRANT SELECT, INSERT, UPDATE ON public.crm_matches TO authenticated;
GRANT ALL ON public.crm_matches TO service_role;
ALTER TABLE public.crm_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage matches" ON public.crm_matches FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Demo reads demo matches" ON public.crm_matches FOR SELECT TO authenticated
  USING (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));
CREATE POLICY "Demo adds demo matches" ON public.crm_matches FOR INSERT TO authenticated
  WITH CHECK (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));