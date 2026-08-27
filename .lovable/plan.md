# Audit — Démo portfolio "Dupuis Immobilier" (site public + /admin)

Aucune modification de code effectuée. Constats vérifiés dans le code.

## Ce qui fonctionne déjà bien (à ne PAS refaire)

- **Site public solide et cohérent** : 16 annonces, catalogue avec filtres + vue carte, pages détail complètes (`annonces.$id.tsx`, 758 lignes : galerie, lightbox, caractéristiques, DPE, bloc agent, formulaire), simulateurs prêt (`LoanSimulator`) et loyer (`RentSimulator`), pages vendre / louer / honoraires / dernières ventes / mentions / RGPD. Charte navy + gold + crème, typo display : pas d'aspect "template IA".
- **Barre de recherche mobile compacte** déjà traitée (44px, accordéon filtres, toggle liste/carte).
- **Backend réel** : tables `properties`, `form_submissions`, `user_roles` + `has_role()`, RLS en place côté base.
- **Chaîne lead fonctionnelle et démontrable** : formulaire → insert `form_submissions` → email Brevo au client + agent → `email_status` (pending/sent/failed/skipped) → bouton "Renvoyer" côté admin. C'est le vrai différenciateur du projet.
- **Admin déjà crédible sur 4 écrans** : Tableau de bord (24h / 7j / à traiter / taux de délivrabilité), Mes annonces, Ajouter/éditer annonce (upload photos), Candidatures & formulaires (tableau, badges statut, badge email, marquer traité, détail).
- **Notifications push navigateur** (permission, service worker, son, mode nuit, bouton test avec ligne éphémère "🧪 TEST") : très démonstratif en live.
- **GA4** branché globalement (`G-GE530MHKM6`) avec page_view SPA + events personnalisés.
- `/admin` en `noindex,nofollow`.

## P0 — Bloquants avant publication LinkedIn

1. **Fuite de données personnelles : les server functions de l'admin ne sont pas authentifiées.**
   `listSubmissionsFn`, `setSubmissionTraiteFn`, `resendConfirmationEmailFn` (`src/lib/submissions.functions.ts`) et `updatePropertyFn` (`src/lib/properties.functions.ts`) utilisent `supabaseAdmin` (bypass RLS) **sans `requireSupabaseAuth`**. N'importe qui peut appeler l'endpoint RPC et récupérer nom, email, téléphone de tous les prospects, marquer traité, déclencher des envois d'emails, ou modifier les annonces. La RLS ne protège pas puisque le client admin la contourne.
   → Ajouter `.middleware([requireSupabaseAuth])` + vérification `has_role(uid,'admin')` sur ces 4 fonctions.
2. **Auth admin factice.** `admin.tsx` compare en clair `admin@dupuis.fr` / `demo2026` côté client et pose `sessionStorage`. Le mot de passe est dans le bundle JS public. Aucun contrôle serveur.
   → Migrer vers Supabase Auth + rôle `admin` (le prérequis du point 1).
3. **Données réelles mélangées à la démo.** Toute soumission de visiteur LinkedIn (email, téléphone) est stockée en base et déclenche un vrai email Brevo, sans mention explicite côté formulaire.
   → Soit bandeau/checkbox de consentement explicite "données de démonstration, supprimées sous X jours", soit purge automatique + mode démo qui n'envoie pas d'email réel.
4. **Aucune mention "démonstration" sur le site public.** Aucun bandeau : l'agence, l'agent, les annonces et les prix sont fictifs, ce n'est indiqué nulle part hors admin.
   → Bandeau discret persistant + mention dans les mentions légales.

## P1 — Améliorations qui font la différence en portfolio

5. **Profondeur CRM manquante.** Le module Candidatures est une **boîte de réception**, pas un CRM. Absent aujourd'hui : pipeline/kanban (Nouveau → Contacté → Qualifié → Visite → Offre → Signé), score de qualification, notes internes, historique d'activité, attribution à un agent, rappels/relances, rendez-vous de visite, matching prospect↔bien, conversion et taux par étape, recherche/filtres/tri dans le tableau.
   → Pour être crédible comme "CRM immobilier", viser un socle minimum : statut pipeline + notes + assignation + score de qualification + RDV, avec métriques de conversion sur le dashboard.
6. **Persistance incohérente des annonces.** L'ajout et la suppression d'annonce ne touchent que `localStorage` (`admin-listings`) ; seule la mise à jour d'une annonce déjà en base est persistée. En démo, "Créer" puis rechargement depuis un autre navigateur = l'annonce a disparu. Incohérence visible.
7. **Retours d'état incomplets.** L'enregistrement d'annonce n'affiche pas de toast de succès (seulement une erreur), pas d'état "Enregistrement…" / bouton désactivé, pas de confirmation de suppression propre (`confirm()` natif), pas d'état de chargement ni d'état vide illustré sur les listes.
8. **Responsive de l'admin.** Le tableau des candidatures repose sur un scroll horizontal à 8 colonnes ; le bloc profil/notification du header est masqué en `sm`. Sur mobile, prévoir des cartes empilées plutôt qu'un tableau.
9. **Instrumentation analytics côté admin/parcours de démo.** GA4 suit le public, mais aucun event sur les actions de démonstration (ouverture /admin, test notification, changement de statut, simulateur utilisé) — ce sont pourtant les preuves d'engagement utiles pour un portfolio.
10. **Pas de boucle de feedback.** Aucun moyen pour un visiteur LinkedIn de dire ce qu'il pense (mini-widget "Votre avis sur cette démo").

## P2 — Confort / finition

11. Parcours de démo guidé : page `/demo` expliquant le scénario (déposer une demande → la voir arriver en temps réel dans l'admin), avec identifiants de démo affichés et bouton "Ouvrir l'admin".
12. Reset automatique du jeu de données de démo (cron quotidien) pour que la démo reste propre.
13. Accessibilité : contrastes sur texte `foreground/40-50`, focus visibles, labels ARIA sur les icônes-boutons.
14. SEO/OG : vérifier que chaque route a un `head()` unique et une image OG absolue.
15. README public : capture, stack, périmètre, "données fictives", lien démo — indispensable si le repo est publié sur GitHub.
16. Accès admin : la sécurité par obscurité (URL non listée) ne suffit pas ; prévoir un compte de démo en lecture seule distinct du compte admin.

## Réponse directe : peut-on présenter l'admin comme un CRM ?

**Pas encore.** Aujourd'hui c'est un **back-office de gestion d'annonces + inbox de leads avec suivi de délivrabilité email**, ce qui est déjà une bonne histoire — mais le mot "CRM" implique pipeline, qualification et relance, qui n'existent pas. Deux options honnêtes :

- **Option A (rapide, sans dette)** : repositionner le discours sur "back-office agence + capture et suivi de leads temps réel avec notifications push et emails automatiques". Ne corriger que les P0. Publiable rapidement.
- **Option B (recommandée pour le positionnement CRM)** : P0 + points 5, 6, 7 → pipeline, notes, assignation, RDV, persistance complète. Là, le terme "CRM / lead qualification workspace" devient défendable.

## Périmètre de lancement recommandé pour LinkedIn

1. Corriger les 4 P0 (sécurité + disclosure) — non négociable avant tout partage public.
2. Ajouter le socle CRM du point 5 dans une version resserrée : statut pipeline, notes internes, assignation, RDV, matching simple prospect↔bien.
3. Corriger la persistance annonces (6) et les retours d'état (7).
4. Ajouter la page `/demo` guidée (11) + events analytics de démo (9).
5. Publier avec le message : "Démo — CRM immobilier & qualification de leads en temps réel. Données fictives."

Dis-moi quelle option (A ou B) tu retiens et je transforme ça en plan d'implémentation chiffré.
