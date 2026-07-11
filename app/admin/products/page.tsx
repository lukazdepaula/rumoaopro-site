import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listMaterialsByProductId } from "@/lib/checkout/db";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Produtos"
};

export default async function AdminProductsPage() {
  await requireAdmin();
  const rows = await Promise.all(
    checkoutProducts.map(async (product) => ({
      product,
      materials: await listMaterialsByProductId(product.id, {
        includeInactive: true
      })
    }))
  );

  return (
    <AdminShell title="Produtos">
      <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-smoke text-xs uppercase text-graphite/65">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Idioma</th>
              <th className="px-4 py-3">Preço base</th>
              <th className="px-4 py-3">Estimativa BRL</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Venda</th>
              <th className="px-4 py-3">Materiais</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, materials }) => (
              <tr className="border-t border-ink/10" key={product.id}>
                <td className="px-4 py-3 font-bold text-ink">{product.name}</td>
                <td className="px-4 py-3 text-graphite/80">{product.slug}</td>
                <td className="px-4 py-3 text-graphite/80">{product.language}</td>
                <td className="px-4 py-3 text-graphite/80">
                  {formatMoney(product.base_price_usd, "USD")}
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {formatMoney(product.price_brl_estimated, "BRL")}
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {product.active ? "active" : "inactive"}
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {product.sales_page_path}
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink hover:bg-smoke"
                    href={`/admin/products/${product.id}/materials`}
                  >
                    Editar {materials.length}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
