const DEFAULT_ICON = "/assets/app/admin-icon-192.png";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "Nova atividade no painel." };
  }

  const title = payload.title || "RumoAoPro Admin";
  const options = {
    body: payload.body || "Nova atividade no painel.",
    icon: payload.icon || DEFAULT_ICON,
    badge: payload.badge || DEFAULT_ICON,
    tag: payload.tag || "rumoaopro-admin",
    renotify: true,
    data: { url: payload.url || "/admin" }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedUrl = new URL(
    event.notification.data?.url || "/admin",
    self.location.origin
  );
  const targetUrl =
    requestedUrl.origin === self.location.origin
      ? requestedUrl.href
      : new URL("/admin", self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windows) => {
        const adminWindow = windows.find((client) =>
          client.url.startsWith(`${self.location.origin}/admin`)
        );
        if (adminWindow) {
          await adminWindow.navigate(targetUrl);
          return adminWindow.focus();
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
