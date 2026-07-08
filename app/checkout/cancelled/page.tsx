import Link from "next/link";
import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrderById } from "@/lib/checkout/db";
import { formatMoney } from "@/lib/checkout/products";
import { nav } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pagamento não concluído",
  description: "O pagamento não foi concluído ou foi recusado."
};

type CheckoutCancelledPageProps = {
  searchParams: Promise<{
    order_id?: string;
  }>;
};

export default async function CheckoutCancelledPage({
  searchParams
}: CheckoutCancelledPageProps) {
  const params = await searchParams;
  const order = params.order_id ? await getOrderById(params.order_id) : null;

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/programas" ctaLabel="Programas" />
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <XCircle aria-hidden="true" className="mx-auto h-14 w-14 text-signal" />
          <h1 className="mt-6 font-display text-4xl uppercase leading-tight sm:text-5xl">
            Pagamento não concluído
          </h1>
          <p className="mt-5 text-base leading-8 text-white/70">
            Esse pedido ficou como recusado, cancelado ou ainda não foi
            confirmado. Nenhuma entrega é liberada enquanto o status não for
            paid.
          </p>
          {order ? (
            <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-4 text-left">
              <p className="text-xs font-bold uppercase text-white/55">Pedido</p>
              <p className="mt-1 break-all text-sm font-semibold text-white">
                {order.id}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase text-white/45">Produto</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {order.product_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-white/45">Status</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {order.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-white/45">Valor</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatMoney(order.amount, order.currency)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
              href="/programas"
            >
              Tentar novamente
            </Link>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-bold uppercase text-white"
              href="/links"
            >
              Falar com suporte
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
