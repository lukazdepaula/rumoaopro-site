import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listDiscounts } from "@/lib/checkout/db";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import type { Discount } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Descontos"
};

function productName(productId: string | null) {
  if (!productId) return "Todos os produtos";
  return checkoutProducts.find((product) => product.id === productId)?.name || productId;
}

function discountLabel(discount: Discount) {
  if (discount.type === "percent") return `${discount.value}%`;
  return formatMoney(discount.value, discount.currency || "USD");
}

function dateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function statusClass(discount: Discount) {
  if (!discount.active) return "bg-ink/10 text-graphite";
  if (discount.expires_at && new Date(discount.expires_at).getTime() <= Date.now()) {
    return "bg-red-50 text-red-700";
  }
  return "bg-turf/10 text-turf";
}

export default async function AdminDiscountsPage({
  searchParams
}: {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  let discounts: Discount[] = [];
  let setupError = "";

  try {
    discounts = await listDiscounts();
  } catch (error) {
    setupError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar os descontos.";
  }

  const errorMessage = params.error ? decodeURIComponent(params.error) : "";

  return (
    <AdminShell title="Descontos">
      {params.created || params.updated || params.deleted ? (
        <p className="mb-5 rounded-lg border border-turf/20 bg-turf/10 px-4 py-3 text-sm font-bold text-turf">
          Cupom salvo.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {setupError ? (
        <div className="mb-5 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
          <p className="font-bold">A tabela de descontos ainda não está disponível.</p>
          <p className="mt-1 text-graphite/80">
            Rode o SQL em <span className="font-mono">supabase/discounts.sql</span> no
            Supabase e recarregue esta página.
          </p>
        </div>
      ) : null}

      <form
        action="/api/admin/discounts"
        className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4"
        method="post"
      >
        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-ink">
            Código
            <input
              className="min-h-11 rounded-md border border-ink/15 px-3 uppercase"
              placeholder="Ex: LANCAMENTO10"
              name="code"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Tipo
            <select className="min-h-11 rounded-md border border-ink/15 px-3" name="type">
              <option value="percent">Porcentagem</option>
              <option value="fixed">Valor fixo</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Valor
            <input
              className="min-h-11 rounded-md border border-ink/15 px-3"
              defaultValue="10"
              min="0"
              name="value"
              required
              step="0.01"
              type="number"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Moeda
            <select className="min-h-11 rounded-md border border-ink/15 px-3" name="currency">
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">
            Descrição
            <input
              className="min-h-11 rounded-md border border-ink/15 px-3"
              defaultValue="Teste interno"
              name="description"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Produto
            <select className="min-h-11 rounded-md border border-ink/15 px-3" name="product_id">
              <option value="">Todos os produtos</option>
              {checkoutProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Limite de usos
            <input
              className="min-h-11 rounded-md border border-ink/15 px-3"
              min="1"
              name="max_redemptions"
              placeholder="Sem limite"
              type="number"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2 text-sm font-bold text-ink">
            Começa em
            <input className="min-h-11 rounded-md border border-ink/15 px-3" name="starts_at" type="datetime-local" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Expira em
            <input className="min-h-11 rounded-md border border-ink/15 px-3" name="expires_at" type="datetime-local" />
          </label>
          <label className="flex min-h-11 items-end gap-2 text-sm font-bold text-ink">
            <input className="h-4 w-4" defaultChecked name="active" type="checkbox" />
            Ativo
          </label>
        </div>
        <button className="min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-white md:w-fit" type="submit">
          Criar cupom
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-smoke text-xs uppercase text-graphite/65">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Uso</th>
              <th className="px-4 py-3">Editar</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr className="border-t border-ink/10 align-top" key={discount.id}>
                <td className="px-4 py-3">
                  <p className="font-bold text-ink">{discount.code}</p>
                  <p className="mt-1 text-xs text-graphite/60">{discount.description || "-"}</p>
                </td>
                <td className="px-4 py-3 font-bold text-ink">{discountLabel(discount)}</td>
                <td className="px-4 py-3 text-graphite/80">{productName(discount.product_id)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${statusClass(discount)}`}>
                    {discount.active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {discount.times_redeemed}
                  {discount.max_redemptions ? ` / ${discount.max_redemptions}` : ""}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={`/api/admin/discounts/${discount.id}`}
                    className="grid min-w-[720px] gap-3"
                    method="post"
                  >
                    <div className="grid gap-2 md:grid-cols-5">
                      <input className="min-h-10 rounded-md border border-ink/15 px-3 uppercase" defaultValue={discount.code} name="code" required />
                      <select className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={discount.type} name="type">
                        <option value="percent">Porcentagem</option>
                        <option value="fixed">Valor fixo</option>
                      </select>
                      <input className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={discount.value} min="0" name="value" required step="0.01" type="number" />
                      <select className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={discount.currency || "USD"} name="currency">
                        <option value="USD">USD</option>
                        <option value="BRL">BRL</option>
                      </select>
                      <select className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={discount.product_id || ""} name="product_id">
                        <option value="">Todos</option>
                        {checkoutProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
                      <input className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={discount.description} name="description" placeholder="Descrição" />
                      <input className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={dateTimeLocal(discount.starts_at)} name="starts_at" type="datetime-local" />
                      <input className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={dateTimeLocal(discount.expires_at)} name="expires_at" type="datetime-local" />
                      <input className="min-h-10 rounded-md border border-ink/15 px-3" defaultValue={discount.max_redemptions || ""} min="1" name="max_redemptions" placeholder="Limite" type="number" />
                      <label className="flex min-h-10 items-center gap-2 font-bold text-ink">
                        <input className="h-4 w-4" defaultChecked={discount.active} name="active" type="checkbox" />
                        Ativo
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="min-h-10 rounded-md bg-ink px-3 text-xs font-bold text-white" type="submit">
                        Salvar
                      </button>
                      <button
                        className="min-h-10 rounded-md border border-red-200 px-3 text-xs font-bold text-red-700"
                        name="_action"
                        type="submit"
                        value="delete"
                      >
                        Apagar
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
            {discounts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-graphite/60" colSpan={6}>
                  Nenhum cupom encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
