import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { getProductById } from "@/lib/checkout/products";
import { createSignedMaterialUpload } from "@/lib/checkout/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    productId?: string;
    filename?: string;
  } | null;
  const productId = body?.productId?.trim() || "";
  const filename = body?.filename?.trim() || "material.pdf";
  const product = getProductById(productId);

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const upload = await createSignedMaterialUpload({
    productId: product.id,
    filename
  });

  return NextResponse.json(upload);
}
