
DROP POLICY IF EXISTS "Anyone can submit a form" ON public.form_submissions;

CREATE POLICY "Public can submit form with contact info"
  ON public.form_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    form_type IS NOT NULL
    AND length(form_type) > 0
    AND length(form_type) < 50
    AND (
      (email IS NOT NULL AND length(email) > 3 AND length(email) < 255)
      OR (telephone IS NOT NULL AND length(telephone) > 5 AND length(telephone) < 30)
    )
  );
