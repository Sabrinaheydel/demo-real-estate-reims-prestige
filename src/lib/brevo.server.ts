// Server-only Brevo helpers. The .server.ts suffix prevents this file from
// being bundled into the client. Calls go DIRECTLY to the Brevo API
// (api.brevo.com) using BREVO_API_KEY stored as a server secret.

const BREVO_API_URL = "https://api.brevo.com";

function brevoHeaders(): Record<string, string> {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) throw new Error("BREVO_API_KEY is not configured");
  return {
    "Content-Type": "application/json",
    accept: "application/json",
    "api-key": brevoKey,
  };
}

export type BrevoAttributes = Record<string, string | number | boolean>;

export async function createOrUpdateBrevoContact(input: {
  email: string;
  attributes: BrevoAttributes;
  listIds: number[];
}): Promise<void> {
  const endpoint = `${GATEWAY_URL}/v3/contacts`;
  console.log("[brevo:diag] POST contacts", {
    endpoint,
    listIds: input.listIds,
    listIdsTypes: input.listIds.map((v) => typeof v),
    attributeKeys: Object.keys(input.attributes),
    hasLovableKey: !!process.env.LOVABLE_API_KEY,
    hasBrevoKey: !!process.env.BREVO_API_KEY,
  });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify({
      email: input.email,
      attributes: input.attributes,
      listIds: input.listIds,
      updateEnabled: true,
    }),
  });
  const text = !res.ok ? await res.text().catch(() => "") : "";
  console.log("[brevo:diag] contacts response", { status: res.status, ok: res.ok, body: text.slice(0, 500) });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Brevo contact upsert failed (${res.status}): ${text}`);
  }
}

export async function sendBrevoTemplateEmail(input: {
  templateId: number;
  to: { email: string; name?: string }[];
  params?: Record<string, unknown>;
  sender?: { name: string; email: string };
  replyTo?: { email: string; name?: string };
}): Promise<{ messageId?: string }> {
  const body: Record<string, unknown> = {
    templateId: input.templateId,
    to: input.to,
  };
  if (input.params) body.params = input.params;
  if (input.sender) body.sender = input.sender;
  if (input.replyTo) body.replyTo = input.replyTo;

  const endpoint = `${GATEWAY_URL}/v3/smtp/email`;
  console.log("[brevo:diag] POST smtp/email", {
    endpoint,
    templateId: input.templateId,
    templateIdType: typeof input.templateId,
    toCount: input.to.length,
    sender: input.sender?.email,
    hasParams: !!input.params,
  });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify(body),
  });
  const text = !res.ok ? await res.text().catch(() => "") : "";
  console.log("[brevo:diag] smtp/email response", { status: res.status, ok: res.ok, templateId: input.templateId, body: text.slice(0, 500) });
  if (!res.ok) {
    throw new Error(`Brevo template send failed (${res.status}): ${text}`);
  }
  return (await res.json().catch(() => ({}))) as { messageId?: string };
}

// Normalize FR phone to E.164 (+33...). Returns undefined if too short.
export function normalizePhoneFR(input?: string): string | undefined {
  if (!input) return undefined;
  const cleaned = input.replace(/[^\d+]/g, "");
  if (!cleaned) return undefined;
  if (cleaned.startsWith("+")) return cleaned.length >= 10 ? cleaned : undefined;
  if (cleaned.startsWith("00")) {
    const c = "+" + cleaned.slice(2);
    return c.length >= 10 ? c : undefined;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) return "+33" + cleaned.slice(1);
  if (cleaned.length === 9) return "+33" + cleaned;
  return undefined;
}
