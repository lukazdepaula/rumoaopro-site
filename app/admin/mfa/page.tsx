import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminMfaChallenge } from "@/components/admin-mfa-challenge";
import { requirePendingAdminMfa } from "@/lib/checkout/admin-auth";
import { getAdminAccountByEmail } from "@/lib/checkout/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Verificação em duas etapas",
  robots: { index: false, follow: false }
};

export default async function AdminMfaPage({
  searchParams
}: {
  searchParams: Promise<{ error?: "invalid" | "rate-limit" | "unavailable" }>;
}) {
  const session = await requirePendingAdminMfa();
  const account = await getAdminAccountByEmail(session.email);
  if (!account?.mfa_enabled_at || !account.mfa_secret_encrypted) {
    redirect(session.setupSecret ? "/admin/mfa/setup" : "/admin/login");
  }
  const params = await searchParams;

  return (
    <main className="admin-mfa-background flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <AdminMfaChallenge initialError={params.error} />
    </main>
  );
}
