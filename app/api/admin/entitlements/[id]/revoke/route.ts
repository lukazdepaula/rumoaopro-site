import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { revokeProductAccess } from "@/lib/checkout/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RevokeRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RevokeRouteProps) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await revokeProductAccess(id);
  return NextResponse.redirect(`${new URL(request.url).origin}/admin/entitlements`);
}
