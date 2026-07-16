import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { getProductById } from "@/lib/checkout/products";
import { getUserById, listEntitlements } from "@/lib/checkout/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Acessos"
};

export default async function AdminEntitlementsPage() {
  await requireAdmin();
  const entitlements = await listEntitlements();
  const rows = await Promise.all(
    entitlements.map(async (entitlement) => ({
      entitlement,
      product: getProductById(entitlement.product_id),
      user: await getUserById(entitlement.user_id)
    }))
  );

  return (
    <AdminShell title="Acessos">
      <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-smoke text-xs uppercase text-graphite/65">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Liberado em</th>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entitlement, product, user }) => {
              return (
                <tr className="border-t border-ink/10" key={entitlement.id}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{user?.name || "-"}</p>
                    <p className="text-xs text-graphite/60">{user?.email || entitlement.user_id}</p>
                  </td>
                  <td className="px-4 py-3 text-graphite/80">
                    {product?.name || entitlement.product_id}
                  </td>
                  <td className="px-4 py-3 text-graphite/80">
                    {entitlement.access_status}
                  </td>
                  <td className="px-4 py-3 text-graphite/70">
                    {new Date(entitlement.granted_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-xs text-graphite/60">
                    {entitlement.order_id || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {entitlement.access_status === "active" ? (
                      <div className="flex flex-wrap gap-2">
                        {entitlement.order_id ? (
                          <form action={`/api/admin/orders/${entitlement.order_id}/access`} method="post">
                            <button className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink" type="submit">
                              Reenviar acesso
                            </button>
                          </form>
                        ) : null}
                        <form action={`/api/admin/entitlements/${entitlement.id}/revoke`} method="post">
                          <button className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="submit">
                            Revogar
                          </button>
                        </form>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
            {entitlements.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-graphite/60" colSpan={6}>
                  Nenhum acesso encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
