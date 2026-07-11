import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { saveProgramMaterial } from "@/lib/checkout/db";
import { getProductById } from "@/lib/checkout/products";
import { uploadMaterialFile } from "@/lib/checkout/storage";
import type { MaterialType } from "@/lib/checkout/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const materialTypes: MaterialType[] = ["pdf", "video", "link", "text", "file"];

function textValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function materialType(value: string): MaterialType {
  return materialTypes.includes(value as MaterialType)
    ? (value as MaterialType)
    : "pdf";
}

function sortOrder(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1;
}

async function materialPathFromForm(productId: string, formData: FormData) {
  const upload = formData.get("material_file");

  if (upload instanceof File && upload.size > 0) {
    return {
      filePathPrivate: await uploadMaterialFile({ productId, file: upload }),
      uploaded: true
    };
  }

  return {
    filePathPrivate: textValue(formData.get("file_path_private")) || null,
    uploaded: false
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const product = getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const formData = await request.formData();
  const { filePathPrivate, uploaded } = await materialPathFromForm(
    product.id,
    formData
  );

  await saveProgramMaterial({
    product_id: product.id,
    title: textValue(formData.get("title")),
    description: textValue(formData.get("description")),
    type: materialType(textValue(formData.get("type"))),
    sort_order: sortOrder(textValue(formData.get("sort_order"))),
    is_active: formData.get("is_active") === "on",
    file_path_private: filePathPrivate,
    external_url: uploaded ? null : textValue(formData.get("external_url")) || null
  });

  return NextResponse.redirect(
    new URL(`/admin/products/${product.id}/materials?created=1`, request.url),
    303
  );
}
