import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const payload = z.object({
  situation_pro: z.string().max(60),
  revenus_label: z.string().max(60),
  garant: z.enum(["oui", "non"]),
  type_recherche: z.enum(["location", "achat"]),
});

/**
 * Public endpoint: creates a synthetic, demo-only CRM lead from the candidate
 * profile form. Only the 4 non-identifying fields are accepted — never a name,
 * email or phone number.
 */
export const createProfileLeadFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => payload.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tag = String(Math.floor(1000 + Math.random() * 9000));
    const { data: row, error } = await supabaseAdmin
      .from("form_submissions")
      .insert({
        form_type: "profil-candidat",
        prenom: "Visiteur profil",
        nom: `#${tag}`,
        email: null,
        telephone: null,
        is_demo: true,
        email_status: "skipped",
        statut: "nouveau",
        crm_stage: "a_qualifier",
        // Fixed demo engagement score — not an automatic eligibility decision.
        lead_score: 70,
        next_action: "Qualifier le profil et proposer des biens compatibles",
        donnees_completes: {
          "Situation professionnelle": data.situation_pro,
          "Tranche de revenus": data.revenus_label,
          Garant: data.garant === "oui" ? "Oui" : "Non",
          Recherche: data.type_recherche === "achat" ? "Achat" : "Location",
          "Score démo": "70 (engagement, non éligibilité)",
        },
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });
