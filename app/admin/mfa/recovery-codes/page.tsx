import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_MFA_RECOVERY_COOKIE_NAME,
  requireAdmin
} from "@/lib/checkout/admin-auth";
import { readAdminRecoveryDisplayValue } from "@/lib/checkout/admin-mfa";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Códigos de recuperação",
  robots: { index: false, follow: false }
};

export default async function AdminMfaRecoveryCodesPage() {
  await requireAdmin("/admin/mfa/recovery-codes");
  const cookieStore = await cookies();
  const codes = readAdminRecoveryDisplayValue(
    cookieStore.get(ADMIN_MFA_RECOVERY_COOKIE_NAME)?.value
  );
  if (!codes) redirect("/admin/account");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-bold uppercase text-gold">Última etapa</p>
        <h1 className="mt-3 font-display text-3xl uppercase">
          Guarde seus códigos de recuperação
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Cada código funciona uma única vez se você perder o celular. Guarde-os
          em um gerenciador de senhas ou em um local seguro. Eles não serão
          exibidos novamente.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-2 rounded-md border border-white/15 bg-black/25 p-4 sm:grid-cols-2">
          {codes.map((code) => (
            <code className="font-mono text-base font-bold tracking-wider" key={code}>
              {code}
            </code>
          ))}
        </div>
        <form action="/api/admin/mfa/recovery/acknowledge" className="mt-6" method="post">
          <button
            className="focus-ring min-h-12 w-full rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
            type="submit"
          >
            Já guardei os códigos
          </button>
        </form>
      </section>
    </main>
  );
}
