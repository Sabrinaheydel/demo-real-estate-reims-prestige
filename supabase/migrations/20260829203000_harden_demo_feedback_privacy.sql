-- Keep tester feedback private to the real admin.
-- Public demo users may read and update synthetic CRM rows, but never
-- feedback-demo rows because those can contain a tester email address.

DROP POLICY IF EXISTS "Demo role can read demo submissions" ON public.form_submissions;
CREATE POLICY "Demo role can read demo submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  is_demo = true
  AND form_type <> 'feedback-demo'
  AND has_role(auth.uid(), 'demo'::app_role)
);

DROP POLICY IF EXISTS "Demo role can update demo submissions" ON public.form_submissions;
CREATE POLICY "Demo role can update demo submissions"
ON public.form_submissions
FOR UPDATE
TO authenticated
USING (
  is_demo = true
  AND form_type <> 'feedback-demo'
  AND has_role(auth.uid(), 'demo'::app_role)
)
WITH CHECK (
  is_demo = true
  AND form_type <> 'feedback-demo'
  AND has_role(auth.uid(), 'demo'::app_role)
);
