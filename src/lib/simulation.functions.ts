import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const payload = z.object({
  calculator: z.enum(["loan", "rent"]),
  leadScore: z.number().int().min(0).max(100),
  // Only non-personal simulation parameters / results are accepted.
  details: z.record(z.string().max(60), z.union([z.string().max(120), z.number(), z.boolean(), z.null()])),
});

/**
 * Public endpoint: creates a synthetic, demo-only CRM lead from a calculator.
 * No personal data is accepted or stored (no name, email or phone).
 */
export const createSimulationLeadFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => payload.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tag = String(Math.floor(1000 + Math.random() * 9000));
    const { data: row, error } = await supabaseAdmin
      .from("form_submissions")
      .insert({
        form_type: data.calculator === "loan" ? "simulation-pret" : "simulation-loyer",
        prenom: "Visiteur simulation",
        nom: `#${tag}`,
        email: null,
        telephone: null,
        is_demo: true,
        email_status: "skipped",
        statut: "nouveau",
        crm_stage: "a_qualifier",
        lead_score: data.leadScore,
        next_action: "Relancer suite à la simulation",
        donnees_completes: data.details,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });
