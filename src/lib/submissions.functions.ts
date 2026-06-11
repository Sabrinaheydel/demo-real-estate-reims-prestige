import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// NOTE: admin auth is still a demo sessionStorage gate; these server fns
// expose submission data without a Supabase-Auth check by design for the demo.
// Wire `requireSupabaseAuth` + has_role('admin') here once real auth lands.

export type FormSubmission = {
  id: string;
  created_at: string;
  form_type: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  reference_annonce: string | null;
  donnees_completes: Record<string, unknown>;
  statut: string;
  traite: boolean;
};

export const listSubmissionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("form_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as FormSubmission[];
});

const ToggleSchema = z.object({
  id: z.string().uuid(),
  traite: z.boolean(),
});

export const setSubmissionTraiteFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ToggleSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("form_submissions")
      .update({ traite: data.traite, statut: data.traite ? "traite" : "nouveau" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
