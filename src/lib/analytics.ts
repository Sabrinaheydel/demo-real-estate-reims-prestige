/** Thin wrapper over the existing GA4 (gtag) setup. No new analytics service. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", event, params);
}
