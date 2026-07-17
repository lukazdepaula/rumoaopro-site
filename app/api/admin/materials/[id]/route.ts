import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import {
  deleteProgramMaterial,
  getMaterialByIdForAdmin,
  saveProgramMaterial
} from "@/lib/checkout/db";
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

async function materialPathFromForm(
  productId: string,
  formData: FormData,
  fallback: string | null
) {
  const directUploadPath = textValue(formData.get("uploaded_file_path"));

  if (directUploadPath) {
    return {
      filePathPrivate: directUploadPath,
      uploaded: true
    };
  }

  const upload = formData.get("material_file");

  if (upload instanceof File && upload.size > 0) {
    return {
      filePathPrivate: await uploadMaterialFile({ productId, file: upload }),
      uploaded: true
    };
  }

  if (formData.get("clear_file") === "on") {
    return {
      filePathPrivate: null,
      uploaded: false
    };
  }

  if (formData.has("file_path_private")) {
    return {
      filePathPrivate: textValue(formData.get("file_path_private")) || null,
      uploaded: false
    };
  }

  return {
    filePathPrivate: fallback,
    uploaded: false
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const material = await getMaterialByIdForAdmin(id);

  if (!material) {
    return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  }

  const formData = await request.formData();
  const action = textValue(formData.get("_action"));

  if (action === "delete") {
    await deleteProgramMaterial(material.id);
    return NextResponse.redirect(
      new URL(`/admin/products/${material.product_id}/materials?deleted=1`, request.url),
      303
    );
  }

  const { filePathPrivate, uploaded } = await materialPathFromForm(
    material.product_id,
    formData,
    material.file_path_private
  );

  await saveProgramMaterial({
    id: material.id,
    product_id: material.product_id,
    title: textValue(formData.get("title")),
    description: textValue(formData.get("description")),
    type: materialType(textValue(formData.get("type"))),
    sort_order: sortOrder(textValue(formData.get("sort_order"))),
    is_active: formData.get("is_active") === "on",
    file_path_private: filePathPrivate,
    external_url: uploaded ? null : textValue(formData.get("external_url")) || null
  });

  return NextResponse.redirect(
    new URL(`/admin/products/${material.product_id}/materials?updated=1`, request.url),
    303
  );
}
