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
  const endpoint = `${BREVO_API_URL}/v3/contacts`;
  const postContact = async (attributes: BrevoAttributes) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: brevoHeaders(),
      body: JSON.stringify({
        email: input.email,
        attributes,
        listIds: input.listIds,
        updateEnabled: true,
      }),
    });
    const text = !res.ok ? await res.text().catch(() => "") : "";
    return { res, text };
  };

  console.log("[brevo:diag] POST contacts", {
    endpoint,
    listIds: input.listIds,
    attributeKeys: Object.keys(input.attributes),
    hasBrevoKey: !!process.env.BREVO_API_KEY,
  });
  let { res, text } = await postContact(input.attributes);
  console.log("[brevo:diag] contacts response", { status: res.status, ok: res.ok, body: text.slice(0, 500) });

  // Brevo refuse si le SMS est déjà associé à un autre contact. On retente sans SMS.
  if (!res.ok && res.status === 400 && text.includes("duplicate_parameter") && "SMS" in input.attributes) {
    const { SMS: _ignored, ...rest } = input.attributes;
    console.log("[brevo:diag] retry contacts without SMS attribute");
    ({ res, text } = await postContact(rest));
    console.log("[brevo:diag] contacts retry response", { status: res.status, ok: res.ok, body: text.slice(0, 500) });
  }

  if (!res.ok && res.status !== 204) {
    // On n'échoue jamais ici : un doublon (email/SMS déjà connu) ne doit pas
    // empêcher l'envoi de la notification à l'agent. On log et on continue.
    console.warn(`[brevo] contact upsert non-bloquant (${res.status}): ${text.slice(0, 300)}`);
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

  const endpoint = `${BREVO_API_URL}/v3/smtp/email`;
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
