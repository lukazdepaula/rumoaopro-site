import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listMaterialsByProductId } from "@/lib/checkout/db";
import { getProductById } from "@/lib/checkout/products";
import type { MaterialType, ProgramMaterial } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

type ProductMaterialsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string }>;
};

export const metadata: Metadata = {
  title: "Admin - Materiais"
};

const materialTypes: MaterialType[] = ["pdf", "video", "link", "text", "file"];

function statusMessage(searchParams: Awaited<ProductMaterialsPageProps["searchParams"]>) {
  if (searchParams.created) return "Material criado.";
  if (searchParams.updated) return "Material atualizado.";
  if (searchParams.deleted) return "Material excluído.";
  return null;
}

function MaterialForm({ material }: { material: ProgramMaterial }) {
  return (
    <form
      action={`/api/admin/materials/${material.id}`}
      className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4"
      encType="multipart/form-data"
      method="post"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-graphite/55">
            {material.type} · ordem {material.sort_order}
          </p>
          <h2 className="mt-1 text-xl font-bold text-ink">{material.title}</h2>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-bold ${
            material.is_active ? "bg-turf/10 text-turf" : "bg-ink/10 text-graphite"
          }`}
        >
          {material.is_active ? "ativo" : "inativo"}
        </span>
      </div>

      <label className="grid gap-2 text-sm font-bold text-ink">
        Título
        <input
          className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
          defaultValue={material.title}
          name="title"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-ink">
        Descrição
        <textarea
          className="min-h-24 rounded-md border border-ink/15 px-3 py-3 text-sm font-normal"
          defaultValue={material.description}
          name="description"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_0.5fr_0.5fr]">
        <label className="grid gap-2 text-sm font-bold text-ink">
          Tipo
          <select
            className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
            defaultValue={material.type}
            name="type"
          >
            {materialTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink">
          Ordem
          <input
            className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
            defaultValue={material.sort_order}
            min="1"
            name="sort_order"
            type="number"
          />
        </label>
        <label className="flex items-end gap-2 rounded-md border border-ink/15 px-3 py-3 text-sm font-bold text-ink">
          <input
            className="h-4 w-4"
            defaultChecked={material.is_active}
            name="is_active"
            type="checkbox"
          />
          Ativo
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-ink">
        Link externo ou vídeo
        <input
          className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
          defaultValue={material.external_url || ""}
          name="external_url"
          placeholder="https://..."
          type="url"
        />
      </label>

      {material.file_path_private ? (
        <div className="rounded-md border border-ink/10 bg-smoke p-3">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Arquivo conectado
          </p>
          <p className="mt-1 break-all text-xs text-graphite/70">
            {material.file_path_private}
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm font-bold text-ink">
            <input className="h-4 w-4" name="clear_file" type="checkbox" />
            Remover arquivo atual
          </label>
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-bold text-ink">
        Subir novo PDF/arquivo
        <input
          className="rounded-md border border-dashed border-ink/25 bg-smoke px-3 py-3 text-sm font-normal"
          name="material_file"
          type="file"
        />
      </label>

      <details className="rounded-md border border-ink/10 bg-smoke p-3 text-sm">
        <summary className="cursor-pointer font-bold text-ink">
          Configuração avançada
        </summary>
        <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
          Caminho privado manual
          <input
            className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
            defaultValue={material.file_path_private || ""}
            name="file_path_private"
            placeholder="Ex: supabase:program-materials/produto/arquivo.pdf"
          />
        </label>
      </details>

      <div className="flex flex-wrap gap-3">
        <button
          className="min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-white"
          name="_action"
          type="submit"
          value="update"
        >
          Salvar material
        </button>
        <button
          className="min-h-11 rounded-md border border-red-200 px-4 text-sm font-bold text-red-700"
          formNoValidate
          name="_action"
          type="submit"
          value="delete"
        >
          Excluir
        </button>
      </div>
    </form>
  );
}

export default async function ProductMaterialsPage({
  params,
  searchParams
}: ProductMaterialsPageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const materials = await listMaterialsByProductId(product.id, {
    includeInactive: true
  });
  const message = statusMessage(query);

  return (
    <AdminShell eyebrow="Produtos" title={`Materiais: ${product.name}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="text-sm font-bold text-signal underline" href="/admin/products">
          Voltar para produtos
        </Link>
        <Link
          className="text-sm font-bold text-ink underline"
          href={product.sales_page_path}
          target="_blank"
        >
          Abrir página de venda
        </Link>
      </div>

      {message ? (
        <p className="mt-5 rounded-lg border border-turf/20 bg-turf/10 px-4 py-3 text-sm font-bold text-turf">
          {message}
        </p>
      ) : null}

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-4">
        <p className="text-xs font-bold uppercase text-graphite/55">
          {product.language} · {product.delivery_type}
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">{product.slug}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite/75">
          Use esta tela como uma biblioteca do produto. Adicione PDFs, vídeos,
          links ou textos na quantidade que quiser, depois ajuste o campo
          Ordem para definir a sequência que o atleta vê na área do cliente.
          Arquivos enviados aqui ficam privados e só abrem para quem tem acesso
          ativo ao produto.
        </p>
        <p className="mt-2 text-sm font-bold text-ink">
          Dica: pode excluir os materiais padrão e montar sua própria ordem do zero.
        </p>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.42fr]">
        <section className="grid gap-4">
          {materials.map((material) => (
            <MaterialForm key={material.id} material={material} />
          ))}

          {materials.length === 0 ? (
            <p className="rounded-lg border border-ink/10 bg-white p-6 text-sm text-graphite/60">
              Nenhum material cadastrado para este produto.
            </p>
          ) : null}
        </section>

        <aside className="self-start rounded-lg border border-ink/10 bg-white p-4">
          <h2 className="text-lg font-bold text-ink">Adicionar material</h2>
          <p className="mt-2 text-sm leading-6 text-graphite/70">
            Para vários PDFs, selecione todos no campo de arquivo. Se o título
            ficar vazio, o nome de cada arquivo vira o título do material.
          </p>
          <form
            action={`/api/admin/products/${product.id}/materials`}
            className="mt-4 grid gap-4"
            encType="multipart/form-data"
            method="post"
          >
            <label className="grid gap-2 text-sm font-bold text-ink">
              Título
              <input
                className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
                name="title"
                placeholder="Opcional ao subir arquivos"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink">
              Descrição
              <textarea
                className="min-h-24 rounded-md border border-ink/15 px-3 py-3 text-sm font-normal"
                name="description"
                placeholder="Texto curto que aparece para o cliente"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink">
                Tipo
                <select
                  className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
                  defaultValue="pdf"
                  name="type"
                >
                  {materialTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                Ordem
                <input
                  className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
                  defaultValue={materials.length + 1}
                  min="1"
                  name="sort_order"
                  type="number"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-ink/15 px-3 py-3 text-sm font-bold text-ink">
              <input className="h-4 w-4" defaultChecked name="is_active" type="checkbox" />
              Ativo
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink">
              Link externo ou vídeo
              <input
                className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
                name="external_url"
                placeholder="https://..."
                type="url"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink">
              Subir PDF/arquivo
              <input
                className="rounded-md border border-dashed border-ink/25 bg-smoke px-3 py-3 text-sm font-normal"
                multiple
                name="material_file"
                type="file"
              />
            </label>
            <details className="rounded-md border border-ink/10 bg-smoke p-3 text-sm">
              <summary className="cursor-pointer font-bold text-ink">
                Configuração avançada
              </summary>
              <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
                Caminho privado manual
                <input
                  className="min-h-11 rounded-md border border-ink/15 px-3 text-sm font-normal"
                  name="file_path_private"
                  placeholder="Opcional"
                />
              </label>
            </details>
            <button className="min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-white" type="submit">
              Adicionar
            </button>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}
