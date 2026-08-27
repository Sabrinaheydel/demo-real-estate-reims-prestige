import { createServerFn } from "@tanstack/react-start";

const DEMO_EMAIL = "visiteur@demo.dupuis-immo.test";

/**
 * Public entry point for the read-only demo account.
 * No credential ever reaches the client bundle: the server mints a one-time
 * magic-link token that the browser exchanges for a session.
 * The account only holds the `demo` role, which RLS + server-side checks
 * confine to `is_demo = true` rows.
 */
export const demoSignInFn = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1) Ensure the demo auth user exists
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = list?.users?.find((u) => u.email === DEMO_EMAIL) ?? null;
  if (!user) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      email_confirm: true,
      password: crypto.randomUUID() + crypto.randomUUID(),
      user_metadata: { demo: true },
    });
    if (createErr || !created?.user) throw new Error("Compte démo indisponible");
    user = created.user;
  }

  // 2) Ensure the `demo` role (and nothing else)
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  if (!(roles ?? []).some((r) => r.role === "demo")) {
    await supabaseAdmin
      .from("user_roles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ user_id: user.id, role: "demo" as any });
  }

  // 3) Mint a one-time token for this browser
  const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: DEMO_EMAIL,
  });
  if (linkErr || !link?.properties?.hashed_token) {
    throw new Error("Impossible d'ouvrir la session démo");
  }
  return { email: DEMO_EMAIL, tokenHash: link.properties.hashed_token };
});
