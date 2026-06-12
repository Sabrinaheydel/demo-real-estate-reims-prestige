import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type EmailStatus = "pending" | "sent" | "failed" | "skipped";

export type FormSubmission = {
  id: string;
  created_at: string;
  form_type: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  reference_annonce: string | null;
  donnees_completes: Record<string, string | number | boolean | null | string[]>;
  statut: string;
  traite: boolean;
  email_status: EmailStatus;
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

const ResendSchema = z.object({ id: z.string().uuid() });

export const resendConfirmationEmailFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResendSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; email_status: EmailStatus }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("form_submissions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message || "Soumission introuvable");
    if (row.form_type !== "candidature-location") {
      throw new Error("Renvoi disponible uniquement pour les candidatures location");
    }
    if (!row.email) throw new Error("Pas d'adresse email sur cette soumission");

    const donnees = (row.donnees_completes ?? {}) as Record<string, unknown>;
    const titre =
      (typeof donnees.titreAnnonce === "string" && donnees.titreAnnonce) ||
      "le bien sélectionné";
    const url = typeof donnees.urlAnnonce === "string" ? donnees.urlAnnonce : undefined;

    const { sendBrevoHtmlEmail, buildRentalConfirmationHtml } = await import("./brevo.server");

    let newStatus: EmailStatus = "failed";
    try {
      await sendBrevoHtmlEmail({
        to: [{ email: row.email, name: `${row.prenom ?? ""} ${row.nom ?? ""}`.trim() || undefined }],
        subject: "Votre dossier a bien été reçu - Dupuis Immobilier",
        htmlContent: buildRentalConfirmationHtml({
          prenom: row.prenom ?? "",
          titreAnnonce: titre,
          siteUrl: url?.startsWith("http") ? new URL(url).origin : undefined,
        }),
        sender: {
          name: "Julien Dupuis — Dupuis Immobilier",
          email: "sabrina@agence360cabinets.fr",
        },
        replyTo: { email: "sabrina@agence360cabinets.fr", name: "Julien Dupuis" },
      });
      newStatus = "sent";
    } catch (e) {
      console.warn("[resend] failed", e instanceof Error ? e.message : e);
    }

    const { error: upErr } = await supabaseAdmin
      .from("form_submissions")
      .update({ email_status: newStatus })
      .eq("id", row.id);
    if (upErr) console.error("[resend] status update failed", upErr.message);

    return { ok: true as const, email_status: newStatus };
  });
