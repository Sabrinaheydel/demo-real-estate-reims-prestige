ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.form_submissions
  DROP CONSTRAINT IF EXISTS form_submissions_email_status_check;

ALTER TABLE public.form_submissions
  ADD CONSTRAINT form_submissions_email_status_check
  CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped'));

CREATE INDEX IF NOT EXISTS form_submissions_email_status_idx
  ON public.form_submissions (email_status);