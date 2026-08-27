ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS form_submissions_is_demo_idx ON public.form_submissions (is_demo);
CREATE INDEX IF NOT EXISTS properties_is_demo_idx ON public.properties (is_demo);

-- Public site never shows demo listings
DROP POLICY IF EXISTS "Properties are publicly visible" ON public.properties;
CREATE POLICY "Properties are publicly visible"
  ON public.properties FOR SELECT
  USING (visible = true AND is_demo = false);

-- Demo role: read-only access limited to demo listings
CREATE POLICY "Demo role can read demo properties"
  ON public.properties FOR SELECT TO authenticated
  USING (is_demo = true AND (has_role(auth.uid(), 'demo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Demo role can update demo properties"
  ON public.properties FOR UPDATE TO authenticated
  USING (is_demo = true AND has_role(auth.uid(), 'demo'::app_role))
  WITH CHECK (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));

-- Demo role on submissions: demo rows only
CREATE POLICY "Demo role can read demo submissions"
  ON public.form_submissions FOR SELECT TO authenticated
  USING (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));

CREATE POLICY "Demo role can update demo submissions"
  ON public.form_submissions FOR UPDATE TO authenticated
  USING (is_demo = true AND has_role(auth.uid(), 'demo'::app_role))
  WITH CHECK (is_demo = true AND has_role(auth.uid(), 'demo'::app_role));

-- Fictional demo submissions (6)
INSERT INTO public.form_submissions (form_type, prenom, nom, email, telephone, reference_annonce, donnees_completes, statut, traite, email_status, is_demo)
VALUES
 ('candidature-location','Alice','Démo','alice.demo@exemple-demo.test','+33600000001','DEMO-L1','{"typeDemande":"Candidature location","titreAnnonce":"[DÉMO] T2 lumineux centre-ville","loyer":720,"revenus":2400,"tauxEffort":30,"situationPro":"CDI"}','nouveau',false,'skipped',true),
 ('candidature-location','Bruno','Fictif','bruno.fictif@exemple-demo.test','+33600000002','DEMO-L2','{"typeDemande":"Candidature location","titreAnnonce":"[DÉMO] Studio meublé proche gare","loyer":540,"revenus":1500,"tauxEffort":36,"situationPro":"CDD"}','nouveau',false,'skipped',true),
 ('recherche-achat','Chloé','Exemple','chloe.exemple@exemple-demo.test','+33600000003',NULL,'{"typeDemande":"Recherche achat","budget":"250 000 €","quartier":"Centre","typeBien":"Appartement"}','nouveau',false,'skipped',true),
 ('estimation-vendre','David','Testeur','david.testeur@exemple-demo.test','+33600000004',NULL,'{"typeDemande":"Demande estimation","typeBien":"Maison","surface":"110","quartier":"Quartier fictif"}','nouveau',true,'skipped',true),
 ('contact-annonce-vente','Emma','Sandbox','emma.sandbox@exemple-demo.test','+33600000005','DEMO-V1','{"typeDemande":"Contact annonce vente","titreAnnonce":"[DÉMO] Maison familiale avec jardin"}','nouveau',false,'skipped',true),
 ('contact-general','Farid','Demoville','farid.demoville@exemple-demo.test','+33600000006',NULL,'{"typeDemande":"Contact général","message":"Message de démonstration, aucune donnée réelle."}','nouveau',false,'skipped',true);

-- Fictional demo properties (4) — hidden from the public site
INSERT INTO public.properties (legacy_id, reference, titre, type, statut, prix, surface, pieces, chambres, quartier, description, meuble, parking, cave, dpe, photo_principale, meta, visible, is_demo)
VALUES
 ('demo-v1','DEMO-V1','[DÉMO] Maison familiale avec jardin','vente','vente',329000,118,5,3,'Quartier fictif','Bien fictif utilisé pour la démonstration du CRM. Aucune donnée réelle.',false,true,true,'C',NULL,'{"propertyType":"maison","status":["vente"],"features":["Jardin","Garage"]}',false,true),
 ('demo-v2','DEMO-V2','[DÉMO] Appartement T3 rénové','vente','vente',215000,68,3,2,'Quartier fictif','Bien fictif utilisé pour la démonstration du CRM. Aucune donnée réelle.',false,false,true,'D',NULL,'{"propertyType":"appartement","status":["vente"],"features":["Balcon"]}',false,true),
 ('demo-l1','DEMO-L1','[DÉMO] T2 lumineux centre-ville','location','location',720,44,2,1,'Quartier fictif','Bien fictif utilisé pour la démonstration du CRM. Aucune donnée réelle.',false,false,false,'C',NULL,'{"propertyType":"appartement","status":["location"],"features":["Lumineux"]}',false,true),
 ('demo-l2','DEMO-L2','[DÉMO] Studio meublé proche gare','location','location',540,26,1,0,'Quartier fictif','Bien fictif utilisé pour la démonstration du CRM. Aucune donnée réelle.',true,false,false,'D',NULL,'{"propertyType":"studio","status":["location"],"features":["Meublé"]}',false,true);