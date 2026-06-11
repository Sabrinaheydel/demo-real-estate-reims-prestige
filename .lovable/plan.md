# Plan d'implémentation

C'est un gros chantier qui touche la base de données, l'admin, et toutes les pages publiques. Je le découpe en 4 étapes.

## 1. Activer Lovable Cloud + créer les tables

Activer Lovable Cloud (Supabase managé). Puis créer deux tables via migration :

**`properties`** (annonces)
- `id` uuid PK, `reference` text unique, `titre`, `type` (vente/location), `statut`, `prix` numeric, `surface`, `pieces`, `chambres`, `quartier`, `description`, `meuble` bool, `parking` bool, `cave` bool, `dpe`, `photo_principale` text, `photos_supplementaires` text[], `latitude/longitude`, `visible` bool, `is_rental` bool, `furnished` bool, `availability_tag` text, `meta` jsonb (pour champs annexes du modèle Listing), `created_at`, `updated_at`.
- RLS : lecture publique (`visible = true`), écriture réservée au rôle `admin`.
- GRANTS : `SELECT` à `anon`/`authenticated`, `ALL` à `service_role`.

**`form_submissions`**
- `id`, `created_at`, `form_type`, `prenom`, `nom`, `email`, `telephone`, `reference_annonce`, `donnees_completes` jsonb, `statut` text (`nouveau` défaut), `traite` bool défaut false.
- RLS : insertion publique (formulaires anonymes), lecture/maj réservée admin.

**Rôles** : table `user_roles` + enum `app_role` + fonction `has_role()` (pattern standard Lovable).

## 2. Seed des 16 annonces

Insérer les 16 annonces actuelles de `src/lib/listings.ts` dans `properties` via SQL `INSERT`, en conservant `reference` (DI-2024-XXX) et toutes les caractéristiques.

## 3. Migration du front

**Lecture publique** :
- Nouveau server fn `listProperties()` + `getPropertyById(id)` + `getSimilarProperties()`.
- `/annonces`, `/acheter`, `/louer` lisent depuis Supabase (loader + TanStack Query).
- Remplacer le hook `useListings` local par les requêtes Supabase.

**Page détail `/annonces/$id`** (déjà existe mais lit du statique) :
- Récupère l'annonce via server fn, 404 si introuvable.
- Garde la structure actuelle (fil d'ariane, galerie, 2 colonnes, formulaire contact, biens similaires) — elle correspond déjà à la spec.
- Le formulaire contact / candidature location écrit dans `form_submissions` (plus de Brevo direct).

**Admin** (`/admin`) :
- Mise en place d'une auth Supabase réelle (email/password + rôle admin) à la place du `sessionStorage` hardcodé.
- Le formulaire d'édition fait un `UPDATE` Supabase via server fn protégée par `has_role('admin')`.
- Après save : toast vert "✅ Annonce mise à jour !", invalidation du cache → la page détail reflète immédiatement.
- Section "Formulaires reçus" : liste les `form_submissions` triées par date, badges statut, boutons "Voir détail" / "Marquer traité", badge rouge "Admin ● N" dans le menu si nouvelles soumissions.

## 4. Suppression mailto + confirmations propres

- `grep -r mailto` → supprimer toutes les ouvertures de boîte mail dans les formulaires.
- Tous les formulaires (estimation, contact annonce, candidature location, contact général, rappel rapide) :
  1. POST vers server fn → insert dans `form_submissions`
  2. Affichent immédiatement le bloc confirmation visuelle (✓ vert, message contextuel, réf de suivi générée côté serveur, CTA retour).
- Refs de suivi : `EST-YYMMDD-XXXX`, `DI-XXX` (reprend la réf annonce), `DI-LOC-XXX`.

## Détails techniques

- Toutes les écritures admin passent par des `createServerFn` avec middleware `requireSupabaseAuth` + vérif `has_role('admin')`.
- Les server fn touchant `supabaseAdmin` chargent le client server-only via `await import('@/integrations/supabase/client.server')` à l'intérieur du `.handler()`.
- TanStack Query pour le cache côté UI (`useSuspenseQuery` sur les listes, `useMutation` + `queryClient.invalidateQueries` pour les updates admin).
- Le hook `useListings` (localStorage) et le fichier `admin-storage.ts` créés au tour précédent sont supprimés.
- L'authentification admin réelle remplace `admin@dupuis.fr / demo2026` ; je crée un compte admin de démo via migration (email + rôle `admin` dans `user_roles`) et te donne le mot de passe à changer ensuite.

## Risques / points d'attention

- **Auth admin** : passer d'un sessionStorage à une vraie auth casse l'accès actuel ; je te fournis les nouvelles credentials.
- **Champs absents du modèle Listing** : certains champs riches (slug, photos multiples, coordonnées GPS, slots de visite, etc.) seront stockés dans `meta jsonb` pour ne rien perdre.
- **Brevo** : on garde l'intégration côté serveur en commentaire/optionnel — l'insertion `form_submissions` est la source de vérité ; Brevo pourra être réactivé sans toucher au front.

Confirme-moi que je peux y aller, et notamment :
1. Tu valides l'activation de Lovable Cloud (création d'un backend Supabase managé).
2. Tu valides la migration de l'auth admin vers Supabase Auth (le mot de passe `demo2026` ne fonctionnera plus, je créerai un nouveau compte admin).
