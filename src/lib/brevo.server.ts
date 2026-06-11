// Server-only Brevo helpers. The .server.ts suffix prevents this file from
// being bundled into the client. All calls go through the Lovable connector
// gateway — BREVO_API_KEY and LOVABLE_API_KEY are read inside functions
// (per-request), never at module scope.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";

function brevoHeaders(): Record<string, string> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!brevoKey) throw new Error("BREVO_API_KEY is not configured");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": brevoKey,
  };
}

export type BrevoAttributes = Record<string, string | number | boolean>;

export async function createOrUpdateBrevoContact(input: {
  email: string;
  attributes: BrevoAttributes;
  listIds: number[];
}): Promise<void> {
  const res = await fetch(`${GATEWAY_URL}/v3/contacts`, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify({
      email: input.email,
      attributes: input.attributes,
      listIds: input.listIds,
      updateEnabled: true,
    }),
  });
  // Brevo returns 201 (created) or 204 (updated). Both are success.
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => "");
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

  const res = await fetch(`${GATEWAY_URL}/v3/smtp/email`, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
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
