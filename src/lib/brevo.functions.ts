import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createOrUpdateBrevoContact,
  sendBrevoTemplateEmail,
  sendBrevoHtmlEmail,
  buildRentalConfirmationHtml,
  normalizePhoneFR,
  type BrevoAttributes,
} from "./brevo.server";

export const BREVO_FORM_TYPES = [
  "estimation-vendre",
  "mise-en-gestion-locative",
  "recherche-achat",
  "contact-annonce-vente",
  "candidature-location",
  "contact-general",
  "rappel-rapide-homepage",
] as const;

export type BrevoFormType = (typeof BREVO_FORM_TYPES)[number];

type FormConfig = {
  listIds: number[];
  agentTemplate: number;
  prospectTemplate: number;
  sourceForm: string;
  defaultTypeDemande: string;
};

const CONFIG: Record<BrevoFormType, FormConfig> = {
  "estimation-vendre":        { listIds: [4], agentTemplate: 3, prospectTemplate: 6, sourceForm: "estimation-vendre",        defaultTypeDemande: "Demande estimation" },
  "mise-en-gestion-locative": { listIds: [5], agentTemplate: 3, prospectTemplate: 7, sourceForm: "mise-en-gestion-locative", defaultTypeDemande: "Mise en gestion locative" },
  "recherche-achat":          { listIds: [6], agentTemplate: 2, prospectTemplate: 7, sourceForm: "recherche-achat",          defaultTypeDemande: "Recherche achat" },
  "contact-annonce-vente":    { listIds: [7], agentTemplate: 2, prospectTemplate: 5, sourceForm: "contact-annonce-vente",    defaultTypeDemande: "Contact annonce vente" },
  "candidature-location":     { listIds: [8], agentTemplate: 1, prospectTemplate: 4, sourceForm: "candidature-location",     defaultTypeDemande: "Candidature location" },
  "contact-general":          { listIds: [9], agentTemplate: 2, prospectTemplate: 7, sourceForm: "contact-general",          defaultTypeDemande: "Contact général" },
  "rappel-rapide-homepage":   { listIds: [9], agentTemplate: 2, prospectTemplate: 7, sourceForm: "rappel-rapide-homepage",   defaultTypeDemande: "Rappel rapide" },
};

const TEST_LIST_ID = 11;
const ALERT_LIST_ID = 10;

const SENDER = {
  name: "Julien Dupuis — Dupuis Immobilier",
  email: "sabrina@agence360cabinets.fr",
};
const AGENT_EMAIL = "sabrina@agence360cabinets.fr";

const payloadSchema = z.object({
  formType: z.enum(BREVO_FORM_TYPES),
  prenom: z.string().trim().min(1).max(100),
  nom: z.string().trim().max(100).optional().default(""),
  email: z.string().trim().email().max(255),
  telephone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),

  typeBien: z.string().trim().max(120).optional(),
  surface: z.string().trim().max(120).optional(),
  quartier: z.string().trim().max(250).optional(),
  budget: z.string().trim().max(120).optional(),
  loyer: z.union([z.string(), z.number()]).optional(),

  referenceAnnonce: z.string().trim().max(60).optional(),
  titreAnnonce: z.string().trim().max(250).optional(),
  urlAnnonce: z.string().trim().max(600).optional(),
  typeDemande: z.string().trim().max(120).optional(),
  disponibilites: z.string().trim().max(400).optional(),
  alerteBien: z.boolean().optional(),

  situationPro: z.string().trim().max(150).optional(),
  typeContrat: z.string().trim().max(150).optional(),
  revenus: z.number().nonnegative().max(10_000_000).optional(),
  revenusFoyer: z.number().nonnegative().max(10_000_000).optional(),
  garant: z.string().trim().max(250).optional(),
  documents: z.array(z.string().trim().max(120)).max(30).optional(),
});

export type BrevoSubmitPayload = z.infer<typeof payloadSchema>;

export const submitBrevoForm = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => payloadSchema.parse(data))
  .handler(async ({ data: p }) => {
    const cfg = CONFIG[p.formType];
    const listIds = [...cfg.listIds, TEST_LIST_ID];

    const phone = normalizePhoneFR(p.telephone);
    const typeDemande = (p.typeDemande && p.typeDemande.trim()) || cfg.defaultTypeDemande;

    const attrs: BrevoAttributes = {
      PRENOM: p.prenom,
      NOM: p.nom,
      EMAIL: p.email,
      IMMO_SOURCE_FORM: cfg.sourceForm,
      IMMO_TYPE_DEMANDE: typeDemande,
    };
    if (phone) attrs.SMS = phone;
    if (p.typeBien) attrs.IMMO_TYPE_BIEN = p.typeBien;
    if (p.surface) attrs.IMMO_SURFACE = p.surface;
    if (p.quartier) attrs.IMMO_QUARTIER = p.quartier;
    if (p.budget) attrs.IMMO_BUDGET = p.budget;
    if (p.loyer !== undefined && p.loyer !== "") {
      attrs.IMMO_LOYER = typeof p.loyer === "number" ? String(p.loyer) : p.loyer;
    }
    if (p.referenceAnnonce) attrs.IMMO_REFERENCE_ANNONCE = p.referenceAnnonce;
    if (p.titreAnnonce) attrs.IMMO_TITRE_ANNONCE = p.titreAnnonce;
    if (p.urlAnnonce) attrs.IMMO_URL_ANNONCE = p.urlAnnonce;
    if (p.disponibilites) attrs.IMMO_DISPONIBILITES = p.disponibilites;
    if (p.message) attrs.IMMO_MESSAGE = p.message;
    if (p.situationPro) attrs.IMMO_SITUATION_PRO = p.situationPro;
    if (p.typeContrat) attrs.IMMO_TYPE_CONTRAT = p.typeContrat;
    if (p.revenus !== undefined) attrs.IMMO_REVENUS = String(p.revenus);
    if (p.revenusFoyer !== undefined) attrs.IMMO_REVENUS_FOYER = String(p.revenusFoyer);
    if (p.garant) attrs.IMMO_GARANT = p.garant;
    if (p.documents && p.documents.length) attrs.IMMO_DOCUMENTS = p.documents.join(", ");

    let tauxEffort: number | undefined;
    if (p.formType === "recherche-achat" && p.alerteBien) {
      attrs.IMMO_ALERTE_BIEN = true;
      attrs.IMMO_STATUT = "alerte-active";
      if (!listIds.includes(ALERT_LIST_ID)) listIds.push(ALERT_LIST_ID);
    }
    if (p.formType === "contact-annonce-vente" && typeDemande.toLowerCase().includes("offre")) {
      attrs.IMMO_STATUT = "offre-en-cours";
    }
    if (p.formType === "candidature-location") {
      const loyerNum = typeof p.loyer === "number" ? p.loyer : Number(p.loyer ?? 0);
      const rev = p.revenus ?? 0;
      if (loyerNum > 0 && rev > 0) {
        tauxEffort = Math.round((loyerNum / rev) * 100);
        attrs.IMMO_TAUX_EFFORT = String(tauxEffort);
        attrs.IMMO_VERDICT =
          tauxEffort <= 33 ? "🟢 Dossier solide"
          : tauxEffort <= 40 ? "🟡 À vérifier"
          : tauxEffort <= 50 ? "🟠 Dossier fragile"
          : "🔴 Dossier risqué";
        attrs.IMMO_STATUT =
          tauxEffort <= 33 ? "dossier-solide"
          : tauxEffort <= 40 ? "dossier-a-verifier"
          : "dossier-fragile";
      }
    }

    // 1) Persist submission to Supabase (source of truth for admin inbox + realtime push)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const donneesCompletes: Record<string, unknown> = {
      typeDemande,
      typeBien: p.typeBien,
      surface: p.surface,
      quartier: p.quartier,
      budget: p.budget,
      loyer: p.loyer,
      titreAnnonce: p.titreAnnonce,
      urlAnnonce: p.urlAnnonce,
      disponibilites: p.disponibilites,
      message: p.message,
      situationPro: p.situationPro,
      typeContrat: p.typeContrat,
      revenus: p.revenus,
      revenusFoyer: p.revenusFoyer,
      garant: p.garant,
      documents: p.documents,
      alerteBien: p.alerteBien,
      tauxEffort,
    };
    const { error: insertErr } = await supabaseAdmin.from("form_submissions").insert({
      form_type: p.formType,
      prenom: p.prenom,
      nom: p.nom || null,
      email: p.email,
      telephone: phone || p.telephone || null,
      reference_annonce: p.referenceAnnonce || null,
      donnees_completes: donneesCompletes as never,
    });
    if (insertErr) console.error("[submissions] insert failed", insertErr.message);

    // 2) Brevo (best-effort — never block the user if Brevo is misconfigured)
    try {
      await createOrUpdateBrevoContact({ email: p.email, attributes: attrs, listIds });
      const prospectName = `${p.prenom} ${p.nom}`.trim();
      await sendBrevoTemplateEmail({
        templateId: cfg.agentTemplate,
        to: [{ email: AGENT_EMAIL, name: "Julien Dupuis" }],
        sender: SENDER,
        replyTo: { email: p.email, name: prospectName || undefined },
        params: attrs as Record<string, unknown>,
      });
      await sendBrevoTemplateEmail({
        templateId: cfg.prospectTemplate,
        to: [{ email: p.email, name: prospectName || undefined }],
        sender: SENDER,
        replyTo: { email: AGENT_EMAIL, name: "Julien Dupuis" },
      });
    } catch (e) {
      console.warn("[brevo] send failed (submission still saved)", e instanceof Error ? e.message : e);
    }

    return { ok: true as const };
  });
