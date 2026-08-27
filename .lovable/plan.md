# Option B — CRM immobilier démo, sécurisé et publiable

Architecture volontairement simple : 3 nouvelles tables, 1 flag `is_demo`, 2 rôles (`admin`, `demo`), pas de nouvelle dépendance.

---

## Étape 1 — P0 sécurité (bloquant, à faire en premier)

**Migration**
- Créer le compte admin réel + ligne `user_roles(role='admin')`, et un compte visiteur `demo@dupuis-demo.fr` avec `role='demo'`.
- Ajouter `app_role` valeur `demo` (ALTER TYPE).
- `form_submissions` : colonne `is_demo boolean not null default false`.
- Policies : lecture/écriture leads réservées à `has_role(admin)` OU `has_role(demo)` **restreint à `is_demo = true`**.
- `properties` : `is_demo boolean default false` + policies écriture admin uniquement.

**Code**
- `src/lib/submissions.functions.ts` + `src/lib/properties.functions.ts` : ajouter `.middleware([requireSupabaseAuth])` sur `listSubmissionsFn`, `setSubmissionTraiteFn`, `resendConfirmationEmailFn`, `updatePropertyFn`, puis vérifier le rôle via `context.supabase.rpc('has_role', ...)` avant tout accès `supabaseAdmin`. Un helper partagé `requireStaff()` dans `src/lib/auth.server.ts` renvoie `{ role: 'admin' | 'demo' }`.
- `src/start.ts` : enregistrer `attachSupabaseAuth` dans `functionMiddleware` (indispensable, sinon plus aucun appel admin ne passe).
- `src/routes/admin.tsx` : supprimer `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `sessionStorage`, remplacer par `supabase.auth.signInWithPassword` + lecture du rôle.
- Déplacer `/admin` sous `src/routes/_authenticated/admin.tsx` (layout géré, `ssr:false`) et créer `src/routes/auth.tsx` (page de connexion publique, avec bouton « Entrer en mode démo » pré-rempli).

**Risques** : perte d'accès si l'ordre est inversé → appliquer la migration (comptes créés) avant de couper l'auth factice. **Test** : appel direct du RPC `listSubmissionsFn` sans token ⇒ 401 ; connexion admin ⇒ 200.

---

## Étape 2 — Sandbox visiteur (rôle `demo`)

- Toute donnée créée par un visiteur ou par le seed de démo porte `is_demo = true`.
- Rôle `demo` : lecture **uniquement** des lignes `is_demo = true`, écriture autorisée **uniquement** sur ces lignes, aucune suppression d'annonce, aucun envoi d'email réel.
- Garde-fou email : dans `src/lib/brevo.functions.ts`, si `is_demo` ou si le rôle appelant est `demo` → `email_status = 'skipped'` et log seulement (pas d'appel Brevo). `resendConfirmationEmailFn` renvoie un succès simulé pour le rôle démo.
- Bandeau permanent dans l'admin en mode démo : « Mode démonstration — données fictives, aucune action réelle ».
- Boutons interdits (supprimer annonce, renvoyer email réel) : visibles mais désactivés avec tooltip explicite. La vraie barrière reste serveur.

**Test** : connecté en `demo`, tenter `updatePropertyFn` sur une annonce non-démo ⇒ erreur `Forbidden` ; aucune requête sortante vers Brevo.

---

## Étape 3 — Socle CRM (3 tables)

**`leads`** (enrichit `form_submissions` sans la casser) — colonnes ajoutées directement à `form_submissions` pour rester simple :
`pipeline_status` (nouveau / contacte / qualifie / visite / offre / conclu / perdu), `score` int 0-100, `assigned_to` uuid, `budget_min`, `budget_max`, `matched_property_id` uuid, `is_demo`.

**`lead_notes`** : `id`, `lead_id`, `author_id`, `body`, `is_demo`, `created_at`.

**`appointments`** : `id`, `lead_id`, `property_id`, `scheduled_at`, `type` (visite / appel / signature), `status` (planifie / honore / annule), `notes`, `is_demo`, `created_at`.

GRANT + RLS sur chaque table (`authenticated` staff, `service_role` all, pas d'`anon`).

**Code**
- `src/lib/crm.functions.ts` (nouveau) : `updateLeadStageFn`, `setLeadScoreFn`, `assignLeadFn`, `addNoteFn`, `listNotesFn`, `createAppointmentFn`, `listAppointmentsFn`, `matchPropertiesFn` (scoring simple : type + budget ±15 % + quartier + surface).
- `src/components/admin/PipelineBoard.tsx` : kanban 6 colonnes, drag-and-drop natif HTML5 (pas de lib), fallback select sur mobile.
- `src/components/admin/LeadDrawer.tsx` : panneau latéral — coordonnées, score (slider), assignation, notes chronologiques, RDV, biens suggérés avec % de match et bouton « Associer ».
- `src/routes/_authenticated/admin.tsx` : onglets `Tableau de bord | Pipeline | Candidatures | Annonces | Agenda`.
- Dashboard enrichi : leads par étape, taux de conversion étape→étape, délai moyen de première réponse, RDV à venir 7 j, délivrabilité email (déjà en place).

**Dépendances** : étape 1 obligatoire (auth), étape 2 pour le flag `is_demo`.
**Risques** : la migration `form_submissions` doit avoir des DEFAULT non-null pour ne pas casser les insertions publiques existantes.
**Test** : déplacer un lead de colonne ⇒ persisté après rechargement ; ajouter note ⇒ visible ; créer RDV ⇒ apparaît dans l'agenda et le dashboard.

---

## Étape 4 — Démo guidée (type TalentFlow)

- Nouvelle route publique `src/routes/demo.tsx` : scénario en 7 étapes numérotées, chacune avec un bouton d'action qui emmène au bon endroit.
  1. Voir une annonce → 2. Déposer une candidature → 3. Notification temps réel dans l'admin → 4. Qualifier le lead (score) → 5. Le déplacer dans le pipeline → 6. Planifier une visite → 7. Voir la conversion sur le dashboard.
- Barre de progression persistée en `localStorage`, reprise possible.
- Bouton « Ouvrir l'espace CRM (compte démo) » : connexion automatique au compte `demo` via server fn dédiée (identifiants côté serveur, jamais dans le bundle).
- Lien vers `/demo` depuis le footer + un bandeau discret site public.

**Test** : parcours complet en navigation privée, sans jamais saisir d'identifiants.

---

## Étape 5 — Jeu de données démo + reset

- Migration de seed : ~12 leads fictifs répartis sur toutes les étapes du pipeline, avec notes, RDV et scores (`is_demo = true`), noms clairement fictifs.
- `src/routes/api/public/reset-demo.ts` : route serveur protégée par un secret bearer (`DEMO_RESET_SECRET`) qui supprime toutes les lignes `is_demo = true` créées depuis le seed et réinsère le jeu de référence.
- Planification quotidienne via cron Supabase appelant cette route.
- Bouton « Réinitialiser la démo » dans l'admin, visible pour `admin` uniquement.

**Risque** : un `DELETE` mal filtré effacerait les vraies données → la suppression filtre strictement `is_demo = true` et est testée d'abord en SELECT.

---

## Étape 6 — Finitions produit

- **Persistance annonces** : `createPropertyFn` / `deletePropertyFn` (admin uniquement) pour supprimer le fallback `localStorage` de `admin-storage.ts`.
- **Retours d'état** : toasts succès/erreur, boutons en état `loading`, états vides illustrés, confirmation de suppression en modale.
- **Responsive admin** : tableau candidatures → cartes empilées < 768 px ; kanban → sélecteur d'étape ; header admin compacté avec menu.
- **Disclosure** : bandeau « Démonstration — agence, annonces et données fictives » sur le site public (fermable, mémorisé), mention dans `/mentions-legales` et `/politique-rgpd`, case de consentement sur chaque formulaire.
- **Analytics** : events GA4 `demo_step_completed`, `demo_login`, `lead_stage_changed`, `appointment_created`, `simulator_used`, `demo_reset`.
- **Feedback** : widget « Votre avis sur cette démo » en fin de `/demo` → insert `form_submissions` type `feedback-demo`.
- **README.md** : capture, stack, périmètre fonctionnel, mention données fictives, lien démo, identifiants du compte visiteur, instructions de reset.

---

## Ordre d'exécution

1. Migration sécurité + rôles + comptes (étape 1)
2. Server fns protégées + auth réelle + route `_authenticated/admin` (étape 1)
3. Sandbox `is_demo` + blocage emails (étape 2)
4. Migration CRM (3 tables / colonnes) (étape 3)
5. Server fns CRM + UI pipeline / drawer / agenda / dashboard (étape 3)
6. Seed démo + reset (étape 5)
7. Page `/demo` guidée (étape 4)
8. Finitions : responsive, états, disclosure, analytics, feedback, README (étape 6)

Chaque étape est livrable indépendamment ; le site public reste fonctionnel tout du long.

## Tests de validation finaux

- Aucun endpoint RPC accessible sans token (vérification via appel brut).
- Compte `demo` : impossible de lire un lead non-démo, impossible d'envoyer un email réel, impossible de supprimer une annonce.
- Parcours guidé complet réalisable en < 5 minutes par un visiteur inconnu.
- Reset quotidien : la démo revient à son état de référence.
- Responsive vérifié 375 / 768 / 1440 px sur site public et admin.
- Events GA4 visibles en temps réel.
