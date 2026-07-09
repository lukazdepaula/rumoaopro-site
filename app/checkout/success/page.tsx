import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { MockPaymentActions } from "@/components/mock-payment-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrderById } from "@/lib/checkout/db";
import { formatMoney, getProductById } from "@/lib/checkout/products";
import { nav } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pagamento em processamento",
  description:
    "Recebemos o retorno do checkout. A entrega acontece somente após confirmação do webhook."
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
    mock?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const order = params.order_id ? await getOrderById(params.order_id) : null;
  const product = order ? getProductById(order.product_id) : null;
  const showMockActions = order?.gateway === "mock" && order.status === "pending";
  const accessHref =
    order?.status === "paid" && product ? `/my-programs/${product.slug}` : "/my-programs";
  const title =
    order?.status === "paid" ? "Pagamento confirmado" : "Pagamento em confirmação";
  const description = order?.status === "paid"
    ? "Pagamento aprovado. Seu acesso foi liberado e o e-mail de confirmação será enviado automaticamente."
    : showMockActions
      ? "Recebemos o retorno do checkout. No modo mock, use os botões abaixo para simular a confirmação."
      : "Recebemos o retorno do checkout. Por segurança, o produto só é liberado quando o pagamento for confirmado pelo gateway.";

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/programas" ctaLabel="Programas" />
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <CheckCircle2
            aria-hidden="true"
            className="mx-auto h-14 w-14 text-turf"
          />
          <h1 className="mt-6 font-display text-4xl uppercase leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-8 text-white/70">
            {description}
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
          {showMockActions ? <MockPaymentActions orderId={order.id} /> : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
              href={accessHref}
            >
              {order?.status === "paid" ? "Acessar programa" : "Ir para minha conta"}
            </Link>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-bold uppercase text-white"
              href="/programas"
            >
              Voltar aos programas
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
