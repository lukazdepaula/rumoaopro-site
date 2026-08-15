import type { Metadata } from "next";
import { AdminCheckoutLinkCard } from "@/components/admin-checkout-link-card";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { checkoutLinks } from "@/lib/checkout/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Links de pagamento"
};

export default async function AdminPaymentLinksPage() {
  await requireAdmin();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://rumoaopro.com"
  ).replace(/\/$/, "");
  const coachingCheckoutUrl = `${siteUrl}${checkoutLinks.onlineCoaching}`;

  return (
    <AdminShell title="Links de pagamento">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal">
              Assessoria recorrente
            </p>
            <h2 className="mt-2 text-xl font-bold text-ink">
              Assessoria Online · 30 dias
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite/70">
              R$ 399 a cada 30 dias pela Stripe. O checkout coleta nome, e-mail,
              WhatsApp, CPF/CNPJ, CEP e endereço completo para o atendimento e a
              emissão da nota fiscal.
            </p>
          </div>
          <span className="rounded-full bg-turf/10 px-3 py-1 text-xs font-bold text-turf">
            Recorrente
          </span>
        </div>
        <div className="mt-5">
          <AdminCheckoutLinkCard checkoutUrl={coachingCheckoutUrl} />
        </div>
        <p className="mt-4 text-xs leading-5 text-graphite/60">
          Este endereço não aparece na navegação pública. Envie somente para
          atletas aprovados para a assessoria.
        </p>
      </section>
    </AdminShell>
  );
}
