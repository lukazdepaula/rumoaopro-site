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

function materialTitleFromName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function materialTitleFromFile(file: File) {
  return materialTitleFromName(file.name);
}

function uploadedFiles(formData: FormData) {
  return formData
    .getAll("material_file")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function directUploadedFiles(formData: FormData) {
  const names = formData.getAll("uploaded_file_name").map(textValue);

  return formData
    .getAll("uploaded_file_path")
    .map(textValue)
    .filter(Boolean)
    .map((path, index) => ({
      name: names[index] || path.split("/").pop() || "",
      path
    }));
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
  const directFiles = directUploadedFiles(formData);
  const files = uploadedFiles(formData);
  const title = textValue(formData.get("title"));
  const description = textValue(formData.get("description"));
  const type = materialType(textValue(formData.get("type")));
  const baseSortOrder = sortOrder(textValue(formData.get("sort_order")));
  const isActive = formData.get("is_active") === "on";
  const externalUrl = textValue(formData.get("external_url")) || null;
  const manualFilePath = textValue(formData.get("file_path_private")) || null;

  if (directFiles.length > 0) {
    await Promise.all(
      directFiles.map(async (file, index) =>
        saveProgramMaterial({
          product_id: product.id,
          title:
            title ||
            materialTitleFromName(file.name) ||
            `Material ${index + 1}`,
          description,
          type,
          sort_order: baseSortOrder + index,
          is_active: isActive,
          file_path_private: file.path,
          external_url: null
        })
      )
    );

    return NextResponse.redirect(
      new URL(`/admin/products/${product.id}/materials?created=1`, request.url),
      303
    );
  }

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file, index) =>
        saveProgramMaterial({
          product_id: product.id,
          title: title || materialTitleFromFile(file) || `Material ${index + 1}`,
          description,
          type,
          sort_order: baseSortOrder + index,
          is_active: isActive,
          file_path_private: await uploadMaterialFile({ productId: product.id, file }),
          external_url: null
        })
      )
    );

    return NextResponse.redirect(
      new URL(`/admin/products/${product.id}/materials?created=1`, request.url),
      303
    );
  }

  if (!title) {
    return NextResponse.json(
      { error: "Informe um título ou suba pelo menos um arquivo." },
      { status: 400 }
    );
  }

  await saveProgramMaterial({
    product_id: product.id,
    title,
    description,
    type,
    sort_order: baseSortOrder,
    is_active: isActive,
    file_path_private: manualFilePath,
    external_url: externalUrl
  });

  return NextResponse.redirect(
    new URL(`/admin/products/${product.id}/materials?created=1`, request.url),
    303
  );
}
