// Admin notification service worker.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = all.find((c) => c.url.includes("/admin"));
      if (existing) {
        await existing.focus();
        try { existing.navigate(url); } catch { /* ignore */ }
        return;
      }
      await self.clients.openWindow(url);
    })()
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* ignore */ }
  const title = data.title || "Nouvelle demande";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag,
      data: { url: data.url || "/admin" },
    })
  );
});
