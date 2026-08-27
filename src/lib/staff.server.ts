// Server-only authorization helpers. Never imported from client code.
import type { SupabaseClient } from "@supabase/supabase-js";

export type StaffRole = "admin" | "demo";

/**
 * Verifies that the authenticated caller holds a staff role.
 * Uses the request-scoped (RLS-bound) client from `requireSupabaseAuth`,
 * NOT the service-role client, so the check cannot be spoofed.
 */
export async function requireStaff(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
): Promise<StaffRole> {
  for (const role of ["admin", "demo"] as const) {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _role: role as any,
    });
    if (error) throw new Error("Forbidden");
    if (data === true) return role;
  }
  throw new Error("Forbidden: rôle insuffisant");
}

export async function requireAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
): Promise<"admin"> {
  const role = await requireStaff(supabase, userId);
  if (role !== "admin") throw new Error("Forbidden: réservé aux administrateurs");
  return "admin";
}
