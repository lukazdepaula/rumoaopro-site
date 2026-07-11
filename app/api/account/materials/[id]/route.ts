import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/checkout/customer-auth";
import { getMaterialById, userHasAccessToProduct } from "@/lib/checkout/db";
import { resolvePrivateMaterialPath } from "@/lib/checkout/materials";
import {
  fetchSupabaseMaterial,
  isSupabaseMaterialPath
} from "@/lib/checkout/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MaterialRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: MaterialRouteProps) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Login obrigatório." }, { status: 401 });
  }

  const { id } = await params;
  const material = await getMaterialById(id);

  if (!material) {
    return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  }

  if (!(await userHasAccessToProduct(session.user.id, material.product_id))) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  if (material.external_url) {
    return NextResponse.redirect(material.external_url);
  }

  if (isSupabaseMaterialPath(material.file_path_private)) {
    const stored = await fetchSupabaseMaterial(material.file_path_private || "");

    if (!stored) {
      return NextResponse.json(
        {
          error:
            "Arquivo privado ainda não conectado. O acesso ao programa está liberado."
        },
        { status: 404 }
      );
    }

    return new NextResponse(stored.body, {
      headers: {
        "Content-Disposition": `attachment; filename="${stored.filename}"`,
        "Content-Type": stored.contentType
      }
    });
  }

  const filePath = resolvePrivateMaterialPath(material);
  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json(
      {
        error:
          "Arquivo privado ainda não conectado. O acesso ao programa está liberado."
      },
      { status: 404 }
    );
  }

  const file = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
      "Content-Type": "application/octet-stream"
    }
  });
}
