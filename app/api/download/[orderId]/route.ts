import fs from "node:fs";
import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/checkout/db";
import {
  privateFilePath,
  verifySignedDownload
} from "@/lib/checkout/delivery";
import { getProductById } from "@/lib/checkout/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const url = new URL(request.url);
  const fileId = url.searchParams.get("file") || "";
  const expires = url.searchParams.get("expires");
  const signature = url.searchParams.get("sig");

  if (!verifySignedDownload({ orderId, fileId, expires, signature })) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 401 });
  }

  const order = await getOrderById(orderId);
  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const product = getProductById(order.product_id);
  if (!product || product.file_id !== fileId) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 404 });
  }

  const filePath = privateFilePath(product);
  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Arquivo privado ainda não configurado." },
      { status: 404 }
    );
  }

  const file = fs.readFileSync(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": fileId.endsWith(".zip")
        ? "application/zip"
        : "application/pdf",
      "Content-Disposition": `attachment; filename="${fileId}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
