import type { Metadata } from "next";
import { AdminNotificationSettings } from "@/components/admin-notification-settings";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Aplicativo e notificacoes"
};

export default async function AdminNotificationsPage() {
  const session = await requireAdmin("/admin/notifications");

  return (
    <AdminShell title="Aplicativo e notificacoes" eyebrow="Celular">
      <AdminNotificationSettings
        adminEmail={session.email}
        publicKey={process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY?.trim() || ""}
      />
    </AdminShell>
  );
}
