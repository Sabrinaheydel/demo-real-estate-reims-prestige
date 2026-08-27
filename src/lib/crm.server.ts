import { DEMO_BLOCKED } from "./crm.model";

/** Returns the lead if the caller's role may act on it, else throws. */
export async function assertLeadAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  role: "admin" | "demo",
  leadId: string,
): Promise<{ is_demo: boolean }> {
  const { data, error } = await supabaseAdmin
    .from("form_submissions")
    .select("id, is_demo")
    .eq("id", leadId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Lead introuvable");
  if (role === "demo" && data.is_demo !== true) throw new Error(DEMO_BLOCKED);
  return data as { is_demo: boolean };
}
